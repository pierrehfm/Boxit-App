#!/usr/bin/env python3
"""
Boxit-App Security Audit Script
================================
Audit manuel de sécurité type pentest — sans Semgrep ni Burp Suite.
Analyse statique du code source pour détecter les vulnérabilités OWASP.

Usage: python3 audit_boxit.py [--verbose] [--json]
"""

import os
import re
import json
import sys
from pathlib import Path
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Optional


class Severity(Enum):
    CRITICAL = "CRITIQUE"
    HIGH = "HAUTE"
    MEDIUM = "MOYENNE"
    LOW = "BASSE"
    INFO = "INFO"


class Category(Enum):
    IDOR = "IDOR (Insecure Direct Object Reference)"
    INJECTION = "Injection (SQL/XSS/Pattern)"
    BROKEN_AUTH = "Broken Authentication"
    BROKEN_ACCESS = "Broken Access Control"
    MASS_ASSIGNMENT = "Mass Assignment"
    SECURITY_MISCONFIG = "Security Misconfiguration"
    DATA_EXPOSURE = "Sensitive Data Exposure"
    RATE_LIMITING = "Insufficient Rate Limiting"
    BUSINESS_LOGIC = "Business Logic Flaw"
    CRYPTO = "Insecure Cryptographic Storage"
    PRIVACY = "Privacy / RGPD"
    SUPPLY_CHAIN = "Supply Chain Risk"


@dataclass
class Finding:
    id: str
    title: str
    severity: Severity
    category: Category
    file: str
    line: Optional[int]
    description: str
    exploitation: str
    recommendation: str
    owasp_ref: str = ""
    cvss_estimate: float = 0.0


@dataclass
class AuditReport:
    app_name: str = "Boxit"
    audit_date: str = "2026-05-06"
    auditor: str = "Automated Pentest Script + Manual Review"
    findings: list = field(default_factory=list)
    summary: dict = field(default_factory=dict)


def scan_file(filepath: Path) -> str:
    try:
        return filepath.read_text(encoding="utf-8")
    except (UnicodeDecodeError, FileNotFoundError):
        return ""


def check_idor_vulnerabilities(base_path: Path) -> list[Finding]:
    findings = []
    api_file = base_path / "lib" / "api.ts"
    content = scan_file(api_file)

    idor_patterns = [
        (r"\.eq\('id',\s*(\w+)\)", "Accès par ID sans vérification d'ownership"),
        (r"\.eq\('box_id',\s*(\w+)\)", "Accès box par ID sans vérification"),
        (r"\.eq\('project_id',\s*(\w+)\)", "Accès projet par ID sans vérification"),
        (r"\.eq\('qr_code',\s*(\w+)\)", "Accès par QR code sans authentification vérifiée"),
    ]

    functions_without_auth_check = []
    func_pattern = re.compile(r"(\w+):\s*async\s*\([^)]*\)\s*=>", re.MULTILINE)

    for match in func_pattern.finditer(content):
        func_name = match.group(1)
        func_start = match.start()
        func_end = content.find("\n    },", func_start)
        if func_end == -1:
            func_end = len(content)
        func_body = content[func_start:func_end]

        if "auth.getUser()" not in func_body and func_name not in ["getUserProjects"]:
            functions_without_auth_check.append(func_name)

    if functions_without_auth_check:
        findings.append(Finding(
            id="IDOR-001",
            title="Fonctions API sans vérification d'identité explicite",
            severity=Severity.HIGH,
            category=Category.IDOR,
            file="lib/api.ts",
            line=None,
            description=f"Les fonctions suivantes n'appellent pas auth.getUser() : {', '.join(functions_without_auth_check)}",
            exploitation="Un attaquant peut appeler ces fonctions avec un UUID arbitraire pour accéder aux ressources d'autres utilisateurs (si RLS mal configuré)",
            recommendation="Vérifier auth.getUser() dans chaque fonction, ou s'assurer que les RLS Supabase couvrent tous les cas",
            owasp_ref="A01:2021 Broken Access Control",
            cvss_estimate=7.5,
        ))

    for pattern, desc in idor_patterns:
        matches = list(re.finditer(pattern, content))
        if matches:
            for m in matches:
                line_num = content[:m.start()].count('\n') + 1
                findings.append(Finding(
                    id=f"IDOR-{line_num:03d}",
                    title=f"Accès direct par identifiant: {desc}",
                    severity=Severity.MEDIUM,
                    category=Category.IDOR,
                    file="lib/api.ts",
                    line=line_num,
                    description=f"Pattern détecté: {m.group(0)} — accès direct sans double vérification côté client",
                    exploitation="Bruteforce/enumeration d'UUID pour accéder aux données d'autres utilisateurs",
                    recommendation="Ajouter un filtre par user_id ou vérifier l'appartenance au projet",
                    owasp_ref="A01:2021",
                    cvss_estimate=5.5,
                ))

    return findings


def check_injection_vulnerabilities(base_path: Path) -> list[Finding]:
    findings = []
    api_file = base_path / "lib" / "api.ts"
    content = scan_file(api_file)

    ilike_pattern = re.compile(r"\.ilike\([^,]+,\s*`%\$\{(\w+)\}%`\)")
    for match in ilike_pattern.finditer(content):
        line_num = content[:match.start()].count('\n') + 1
        findings.append(Finding(
            id=f"INJ-{line_num:03d}",
            title="ILIKE Wildcard Injection",
            severity=Severity.LOW,
            category=Category.INJECTION,
            file="lib/api.ts",
            line=line_num,
            description=f"Le paramètre '{match.group(1)}' est interpolé dans un pattern ILIKE sans échappement des caractères % et _",
            exploitation="Un utilisateur peut entrer '%' pour lister toutes les entrées ou '_' pour du pattern matching avancé",
            recommendation="Échapper les caractères spéciaux ILIKE: query.replace(/[%_\\\\]/g, '\\\\$&')",
            owasp_ref="A03:2021 Injection",
            cvss_estimate=3.5,
        ))

    return findings


def check_mass_assignment(base_path: Path) -> list[Finding]:
    findings = []
    api_file = base_path / "lib" / "api.ts"
    content = scan_file(api_file)

    partial_insert = re.compile(r"\.insert\((\w+)\)")
    for match in partial_insert.finditer(content):
        var_name = match.group(1)
        if var_name == "box":
            line_num = content[:match.start()].count('\n') + 1
            findings.append(Finding(
                id="MASS-001",
                title="Mass Assignment via Partial<Box> dans createBox",
                severity=Severity.HIGH,
                category=Category.MASS_ASSIGNMENT,
                file="lib/api.ts",
                line=line_num,
                description="L'objet box (Partial<Box>) est passé directement à .insert() sans whitelist de champs",
                exploitation="Un attaquant peut injecter id, project_id, created_at, status via manipulation du payload HTTP",
                recommendation="Créer un objet sanitisé avec uniquement les champs autorisés: { project_id, name, qr_code, room, color, is_fragile }",
                owasp_ref="A04:2021 Insecure Design / API6:2023",
                cvss_estimate=7.0,
            ))

    return findings


def check_auth_vulnerabilities(base_path: Path) -> list[Finding]:
    findings = []

    supabase_file = base_path / "lib" / "supabase.ts"
    content = scan_file(supabase_file)

    if "AsyncStorage" in content:
        findings.append(Finding(
            id="AUTH-001",
            title="Tokens JWT stockés en clair via AsyncStorage",
            severity=Severity.CRITICAL,
            category=Category.CRYPTO,
            file="lib/supabase.ts",
            line=10,
            description="AsyncStorage stocke les données en clair (SharedPreferences Android / plist iOS). Les tokens JWT (access + refresh) sont accessibles sur un appareil rooté/jailbreaké",
            exploitation="Extraction des tokens via adb backup, accès root, ou malware avec accès filesystem",
            recommendation="Migrer vers expo-secure-store qui utilise Keychain (iOS) et EncryptedSharedPreferences (Android)",
            owasp_ref="M9 Insecure Data Storage (OWASP Mobile)",
            cvss_estimate=8.0,
        ))

    auth_context = base_path / "context" / "AuthContext.tsx"
    auth_content = scan_file(auth_context)

    if "getSession()" in auth_content and "getUser()" not in auth_content:
        findings.append(Finding(
            id="AUTH-002",
            title="Session vérifiée via getSession() au lieu de getUser()",
            severity=Severity.HIGH,
            category=Category.BROKEN_AUTH,
            file="context/AuthContext.tsx",
            line=31,
            description="getSession() lit le token depuis le storage local sans le valider auprès du serveur. Un token révoqué reste 'valide' côté client",
            exploitation="Un token volé ou révoqué continue de fonctionner jusqu'à son expiration naturelle (1h par défaut)",
            recommendation="Utiliser supabase.auth.getUser() pour la vérification initiale (appel serveur)",
            owasp_ref="A07:2021 Identification and Authentication Failures",
            cvss_estimate=6.5,
        ))

    return findings


def check_route_guards(base_path: Path) -> list[Finding]:
    findings = []
    layout_file = base_path / "app" / "_layout.tsx"
    content = scan_file(layout_file)

    if "useEffect" in content and "router.replace" in content:
        findings.append(Finding(
            id="NAV-001",
            title="Race condition dans le route guard (useEffect asynchrone)",
            severity=Severity.HIGH,
            category=Category.BROKEN_ACCESS,
            file="app/_layout.tsx",
            line=39,
            description="Le guard utilise useEffect qui s'exécute après le premier rendu. Les composants protégés se montent et lancent des requêtes API avant la redirection",
            exploitation="Deep link (boxit://box-detail?boxId=xxx) → le composant se monte, fetch les données, puis seulement redirige vers /start",
            recommendation="Retourner null ou un splash screen si !user && !isPublicRoute, avant le rendu du Stack",
            owasp_ref="A01:2021 Broken Access Control",
            cvss_estimate=6.0,
        ))

    if 'scheme": "boxit"' in scan_file(base_path / "app.json") or '"scheme": "boxit"' in scan_file(base_path / "app.json"):
        findings.append(Finding(
            id="NAV-002",
            title="Deep linking sans validation — accès direct aux routes protégées",
            severity=Severity.HIGH,
            category=Category.BROKEN_ACCESS,
            file="app.json",
            line=8,
            description="Le scheme 'boxit://' permet d'ouvrir n'importe quelle route de l'app via un lien externe",
            exploitation="Envoi d'un lien boxit://collaborators?projectId=xxx → accès à l'écran avant redirection",
            recommendation="Implémenter un AuthGuard par route qui bloque le rendu si non authentifié",
            owasp_ref="A01:2021",
            cvss_estimate=6.5,
        ))

    return findings


def check_data_exposure(base_path: Path) -> list[Finding]:
    findings = []
    api_file = base_path / "lib" / "api.ts"
    content = scan_file(api_file)

    if "throw new Error(\"Utilisateur introuvable\")" in content:
        findings.append(Finding(
            id="DATA-001",
            title="Oracle d'énumération d'emails via addProjectMember",
            severity=Severity.HIGH,
            category=Category.DATA_EXPOSURE,
            file="lib/api.ts",
            line=303,
            description="Le message 'Utilisateur introuvable' vs 'Déjà membre' permet de déterminer si un email est inscrit sur la plateforme",
            exploitation="Bruteforce d'emails pour constituer une base d'utilisateurs existants → phishing ciblé",
            recommendation="Retourner un message générique identique quel que soit le résultat",
            owasp_ref="A01:2021 / CWE-204",
            cvss_estimate=5.5,
        ))

    if "throw error" in content:
        count = content.count("throw error")
        findings.append(Finding(
            id="DATA-002",
            title=f"Propagation brute d'erreurs PostgREST ({count} occurrences)",
            severity=Severity.MEDIUM,
            category=Category.DATA_EXPOSURE,
            file="lib/api.ts",
            line=None,
            description=f"'throw error' est utilisé {count} fois, propageant les objets PostgrestError (code, message, details, hint) vers l'UI",
            exploitation="Provoquer des erreurs intentionnellement pour obtenir la structure de la DB (noms de tables, colonnes, contraintes)",
            recommendation="Créer un wrapper qui mappe les codes d'erreur vers des messages génériques",
            owasp_ref="A05:2021 Security Misconfiguration",
            cvss_estimate=4.5,
        ))

    return findings


def check_rate_limiting(base_path: Path) -> list[Finding]:
    findings = []
    api_file = base_path / "lib" / "api.ts"
    content = scan_file(api_file)

    create_functions = re.findall(r"(create\w+|add\w+):", content)
    if create_functions:
        findings.append(Finding(
            id="RATE-001",
            title="Absence de rate limiting sur les endpoints de création",
            severity=Severity.HIGH,
            category=Category.RATE_LIMITING,
            file="lib/api.ts",
            line=None,
            description=f"Les fonctions {', '.join(create_functions)} n'ont aucun rate limiting côté client ni protection contre le spam",
            exploitation="Script automatisé créant des milliers de projets/boxes/items → exhaustion du quota Supabase (500MB gratuit)",
            recommendation="Ajouter un debounce/throttle côté client + contraintes de quota côté serveur (triggers PostgreSQL)",
            owasp_ref="API4:2023 Unrestricted Resource Consumption",
            cvss_estimate=7.0,
        ))

    return findings


def check_business_logic(base_path: Path) -> list[Finding]:
    findings = []
    api_file = base_path / "lib" / "api.ts"
    content = scan_file(api_file)

    if "updateBoxStatus" in content:
        func_start = content.find("updateBoxStatus")
        func_end = content.find("\n    },", func_start)
        func_body = content[func_start:func_end] if func_end != -1 else ""

        if "select('status')" not in func_body:
            findings.append(Finding(
                id="BIZ-001",
                title="Transitions d'état non validées (filling/sealed/unpacked)",
                severity=Severity.HIGH,
                category=Category.BUSINESS_LOGIC,
                file="lib/api.ts",
                line=content[:func_start].count('\n') + 1,
                description="updateBoxStatus permet n'importe quelle transition sans vérifier l'état actuel (ex: unpacked → filling)",
                exploitation="Remettre un carton scellé en 'filling' pour modifier son contenu, corrompre l'inventaire",
                recommendation="Implémenter une state machine avec transitions valides + trigger PostgreSQL",
                owasp_ref="A04:2021 Insecure Design",
                cvss_estimate=6.0,
            ))

    if "createItem" in content:
        func_start = content.find("createItem")
        func_end = content.find("\n    },", func_start)
        func_body = content[func_start:func_end] if func_end != -1 else ""

        if "status" not in func_body and "sealed" not in func_body:
            findings.append(Finding(
                id="BIZ-002",
                title="Ajout d'items possible sur un carton scellé",
                severity=Severity.HIGH,
                category=Category.BUSINESS_LOGIC,
                file="lib/api.ts",
                line=content[:func_start].count('\n') + 1,
                description="createItem ne vérifie pas le statut du carton cible — un item peut être ajouté à un carton 'sealed'",
                exploitation="Modifier le contenu déclaré d'un carton scellé (impact assurance, intégrité inventaire)",
                recommendation="Vérifier box.status === 'filling' avant insertion + trigger BEFORE INSERT sur items",
                owasp_ref="A04:2021",
                cvss_estimate=6.5,
            ))

    return findings


def check_qr_security(base_path: Path) -> list[Finding]:
    findings = []

    scan_file_path = base_path / "app" / "(tabs)" / "scan.tsx"
    content = scan_file(scan_file_path)

    if content and "handleBarcodeScanned" in content:
        if "regex" not in content.lower() and "validate" not in content.lower() and "BOXIT" not in content:
            findings.append(Finding(
                id="QR-001",
                title="Contenu QR code scanné non validé",
                severity=Severity.MEDIUM,
                category=Category.INJECTION,
                file="app/(tabs)/scan.tsx",
                line=43,
                description="Le contenu du QR code est passé directement à l'API sans validation de format (longueur, pattern, namespace)",
                exploitation="Scanner un QR malveillant contenant un payload très long (DoS) ou un format inattendu",
                recommendation="Valider avec un regex: /^BOXIT-[0-9a-f-]{36}$/ et rejeter tout autre format",
                owasp_ref="A03:2021 Injection",
                cvss_estimate=4.5,
            ))

    new_box = base_path / "app" / "new-box.tsx"
    nb_content = scan_file(new_box)
    if "Date.now()" in nb_content and "Math.random()" in nb_content:
        findings.append(Finding(
            id="QR-002",
            title="Génération de QR code prévisible (timestamp + random faible)",
            severity=Severity.MEDIUM,
            category=Category.CRYPTO,
            file="app/new-box.tsx",
            line=54,
            description="Le QR code fallback utilise GEN-{Date.now()}-{Math.random()*1000} — seulement ~1000 valeurs possibles par milliseconde",
            exploitation="Bruteforce du QR code en connaissant l'heure approximative de création",
            recommendation="Utiliser expo-crypto randomUUID() ou un UUID v4 cryptographique",
            owasp_ref="A02:2021 Cryptographic Failures",
            cvss_estimate=5.0,
        ))

    return findings


def check_privacy_rgpd(base_path: Path) -> list[Finding]:
    findings = []

    settings_file = base_path / "app" / "settings.tsx"
    content = scan_file(settings_file)

    if "Supprimer mon compte" in content and "onPress" not in content.split("Supprimer mon compte")[0][-200:]:
        findings.append(Finding(
            id="RGPD-001",
            title="Bouton 'Supprimer mon compte' non fonctionnel (Droit à l'oubli)",
            severity=Severity.CRITICAL,
            category=Category.PRIVACY,
            file="app/settings.tsx",
            line=133,
            description="Le bouton de suppression de compte existe dans l'UI mais n'a aucun handler onPress. L'utilisateur ne peut pas exercer son droit RGPD Art. 17",
            exploitation="Non-conformité RGPD — risque d'amende CNIL et rejet Apple/Google Store",
            recommendation="Implémenter une Edge Function de suppression cascade avec période de grâce de 30 jours",
            owasp_ref="RGPD Art. 17",
            cvss_estimate=8.0,
        ))

    signup_file = base_path / "app" / "signup.tsx"
    signup_content = scan_file(signup_file)
    if "signUp" in signup_content and "checkbox" not in signup_content.lower() and "consent" not in signup_content.lower():
        findings.append(Finding(
            id="RGPD-002",
            title="Inscription sans consentement explicite (CGU/Privacy Policy)",
            severity=Severity.HIGH,
            category=Category.PRIVACY,
            file="app/signup.tsx",
            line=30,
            description="L'écran d'inscription ne demande aucun consentement explicite pour le traitement des données",
            exploitation="Non-conformité RGPD Art. 6, 7, 13 — base légale invalide pour le traitement",
            recommendation="Ajouter une checkbox obligatoire + lien vers Privacy Policy",
            owasp_ref="RGPD Art. 6, 7",
            cvss_estimate=7.0,
        ))

    return findings


def check_network_security(base_path: Path) -> list[Finding]:
    findings = []

    app_json = base_path / "app.json"
    content = scan_file(app_json)

    if "ssl" not in content.lower() and "pinning" not in content.lower():
        findings.append(Finding(
            id="NET-001",
            title="Absence de Certificate Pinning (SSL Pinning)",
            severity=Severity.HIGH,
            category=Category.SECURITY_MISCONFIG,
            file="app.json",
            line=None,
            description="Aucun certificate pinning n'est configuré. Le trafic HTTPS peut être intercepté avec un proxy et un CA custom installé",
            exploitation="MITM sur WiFi public: interception des credentials de login, tokens JWT, et toutes les données",
            recommendation="Implémenter SSL pinning via react-native-ssl-pinning ou config plugin natif",
            owasp_ref="M5 Insecure Communication (OWASP Mobile)",
            cvss_estimate=7.0,
        ))

    return findings


def check_dependencies(base_path: Path) -> list[Finding]:
    findings = []
    pkg_file = base_path / "package.json"
    content = scan_file(pkg_file)

    if not content:
        return findings

    try:
        pkg = json.loads(content)
    except json.JSONDecodeError:
        return findings

    deps = pkg.get("dependencies", {})
    unpinned = [name for name, version in deps.items() if version.startswith("^")]

    if len(unpinned) > 5:
        findings.append(Finding(
            id="DEP-001",
            title=f"Supply chain: {len(unpinned)} dépendances non épinglées (^)",
            severity=Severity.MEDIUM,
            category=Category.SUPPLY_CHAIN,
            file="package.json",
            line=None,
            description=f"Dépendances avec ^ (semver ouvert): {', '.join(unpinned[:10])}{'...' if len(unpinned) > 10 else ''}",
            exploitation="Une mise à jour malveillante d'une dépendance est automatiquement installée (supply chain attack)",
            recommendation="Épingler les versions critiques, utiliser npm ci avec lockfile, ajouter npm audit en CI",
            owasp_ref="A06:2021 Vulnerable and Outdated Components",
            cvss_estimate=5.0,
        ))

    if "expo-secure-store" not in content:
        findings.append(Finding(
            id="DEP-002",
            title="expo-secure-store absent des dépendances",
            severity=Severity.HIGH,
            category=Category.CRYPTO,
            file="package.json",
            line=None,
            description="L'app utilise AsyncStorage (non chiffré) pour les tokens car expo-secure-store n'est pas installé",
            exploitation="Vol de session via accès physique à l'appareil ou backup non chiffré",
            recommendation="npm install expo-secure-store && migrer le storage adapter Supabase",
            owasp_ref="M9 Insecure Data Storage",
            cvss_estimate=7.5,
        ))

    return findings


def generate_report(base_path: Path, verbose: bool = False, output_json: bool = False) -> AuditReport:
    report = AuditReport()

    checks = [
        ("IDOR", check_idor_vulnerabilities),
        ("Injection", check_injection_vulnerabilities),
        ("Mass Assignment", check_mass_assignment),
        ("Authentication", check_auth_vulnerabilities),
        ("Route Guards", check_route_guards),
        ("Data Exposure", check_data_exposure),
        ("Rate Limiting", check_rate_limiting),
        ("Business Logic", check_business_logic),
        ("QR Security", check_qr_security),
        ("Privacy/RGPD", check_privacy_rgpd),
        ("Network Security", check_network_security),
        ("Dependencies", check_dependencies),
    ]

    print("=" * 70)
    print("  BOXIT-APP — AUDIT DE SÉCURITÉ (Pentest Manuel)")
    print("=" * 70)
    print(f"  Date: {report.audit_date}")
    print(f"  Cible: {base_path}")
    print("=" * 70)
    print()

    for check_name, check_func in checks:
        print(f"[*] Analyse: {check_name}...")
        findings = check_func(base_path)
        report.findings.extend(findings)
        if verbose and findings:
            for f in findings:
                print(f"    [{f.severity.value}] {f.id}: {f.title}")
        elif findings:
            print(f"    → {len(findings)} vulnérabilité(s) détectée(s)")
        else:
            print(f"    → OK (aucune faille détectée)")

    # Summary
    severity_counts = {}
    for f in report.findings:
        severity_counts[f.severity.value] = severity_counts.get(f.severity.value, 0) + 1

    report.summary = {
        "total_findings": len(report.findings),
        "by_severity": severity_counts,
        "risk_score": calculate_risk_score(report.findings),
    }

    print()
    print("=" * 70)
    print("  RÉSUMÉ")
    print("=" * 70)
    print(f"  Total vulnérabilités: {report.summary['total_findings']}")
    print(f"  Score de risque: {report.summary['risk_score']}/10")
    print()
    print("  Par sévérité:")
    for sev in [Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW, Severity.INFO]:
        count = severity_counts.get(sev.value, 0)
        if count:
            marker = "🔴" if sev == Severity.CRITICAL else "🟠" if sev == Severity.HIGH else "🟡" if sev == Severity.MEDIUM else "🟢"
            print(f"    {marker} {sev.value}: {count}")
    print()
    print("=" * 70)
    print("  TOP 5 FAILLES CRITIQUES")
    print("=" * 70)

    sorted_findings = sorted(report.findings, key=lambda f: f.cvss_estimate, reverse=True)
    for i, f in enumerate(sorted_findings[:5], 1):
        print(f"\n  {i}. [{f.severity.value}] {f.title}")
        print(f"     Fichier: {f.file}" + (f" (ligne {f.line})" if f.line else ""))
        print(f"     CVSS: {f.cvss_estimate}")
        print(f"     → {f.recommendation[:80]}...")

    print()
    print("=" * 70)
    print("  RECOMMANDATIONS PRIORITAIRES")
    print("=" * 70)
    print("""
  P0 (Immédiat):
    1. Migrer AsyncStorage → expo-secure-store pour les tokens JWT
    2. Implémenter la suppression de compte (RGPD Art. 17)
    3. Corriger le Mass Assignment dans createBox (whitelist de champs)

  P1 (Court terme):
    1. Ajouter un consentement CGU/Privacy à l'inscription
    2. Corriger l'oracle d'emails (addProjectMember)
    3. Implémenter le SSL Certificate Pinning
    4. Valider les transitions d'état des cartons

  P2 (Moyen terme):
    1. Rate limiting côté client + serveur
    2. Monitoring d'erreurs (Sentry)
    3. Validation/sanitization complète des entrées
    4. Audit trail des actions sensibles
    5. Sécuriser le bucket Storage (privé + signed URLs)
""")

    if output_json:
        json_output = {
            "app_name": report.app_name,
            "audit_date": report.audit_date,
            "summary": report.summary,
            "findings": [
                {
                    "id": f.id,
                    "title": f.title,
                    "severity": f.severity.value,
                    "category": f.category.value,
                    "file": f.file,
                    "line": f.line,
                    "description": f.description,
                    "exploitation": f.exploitation,
                    "recommendation": f.recommendation,
                    "owasp_ref": f.owasp_ref,
                    "cvss_estimate": f.cvss_estimate,
                }
                for f in report.findings
            ],
        }
        output_path = base_path / "security-audit" / "report.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(json_output, indent=2, ensure_ascii=False))
        print(f"\n  [✓] Rapport JSON exporté: {output_path}")

    return report


def calculate_risk_score(findings: list[Finding]) -> float:
    if not findings:
        return 0.0

    weights = {
        Severity.CRITICAL: 10,
        Severity.HIGH: 7,
        Severity.MEDIUM: 4,
        Severity.LOW: 2,
        Severity.INFO: 0,
    }

    total_weight = sum(weights[f.severity] for f in findings)
    max_possible = len(findings) * 10
    score = (total_weight / max_possible) * 10 if max_possible > 0 else 0

    return round(min(score, 10.0), 1)


def main():
    verbose = "--verbose" in sys.argv or "-v" in sys.argv
    output_json = "--json" in sys.argv

    script_dir = Path(__file__).parent
    base_path = script_dir.parent

    if not (base_path / "lib" / "api.ts").exists():
        print(f"[!] Fichier lib/api.ts introuvable dans {base_path}")
        print("[!] Assurez-vous d'exécuter le script depuis le dossier security-audit/")
        sys.exit(1)

    report = generate_report(base_path, verbose=verbose, output_json=output_json)

    critical_count = sum(1 for f in report.findings if f.severity == Severity.CRITICAL)
    if critical_count > 0:
        print(f"\n  ⚠️  {critical_count} FAILLE(S) CRITIQUE(S) DÉTECTÉE(S)")
        print("  → Correction requise AVANT mise en production\n")
        sys.exit(2)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
