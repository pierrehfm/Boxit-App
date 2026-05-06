# Security Audit — Boxit-App

Script de pentest statique manuel pour l'application Boxit (React Native + Supabase).

## Prérequis

- Python 3.10+
- Aucune dépendance externe requise (stdlib uniquement)

## Lancer l'audit

```bash
cd security-audit/
python3 audit_boxit.py
```

### Options

| Flag | Description |
|------|-------------|
| `--verbose` / `-v` | Affiche chaque faille en temps réel pendant l'analyse |
| `--json` | Exporte le rapport détaillé en `report.json` |

### Exemples

```bash
# Audit simple
python3 audit_boxit.py

# Audit détaillé avec export JSON
python3 audit_boxit.py --verbose --json

# Vérifier uniquement le code retour (CI/CD)
python3 audit_boxit.py && echo "OK" || echo "FAILLES CRITIQUES"
```

## Codes de sortie

| Code | Signification |
|------|---------------|
| `0` | Aucune faille critique |
| `2` | Failles critiques détectées — correction requise avant prod |

## Ce que le script analyse

| Catégorie | Vecteurs vérifiés |
|-----------|-------------------|
| IDOR | Accès par ID sans vérification d'ownership |
| Injection | ILIKE wildcards non échappés |
| Mass Assignment | `Partial<T>` passé directement à `.insert()` |
| Auth | AsyncStorage, getSession vs getUser |
| Route Guards | Race conditions, deep linking |
| Data Exposure | Erreurs PostgREST brutes, oracle d'email |
| Rate Limiting | Absence de quotas sur les créations |
| Business Logic | Transitions d'état, intégrité des scellés |
| QR Code | Format prévisible, validation absente |
| RGPD | Suppression compte, consentement |
| Network | SSL pinning |
| Supply Chain | Dépendances non épinglées |

## Reproduire le pentest complet

### 1. Créer le worktree (isoler de main)

```bash
git worktree add ../Boxit-App-audit audit-security
cd ../Boxit-App-audit
```

### 2. Lancer l'audit automatisé

```bash
python3 security-audit/audit_boxit.py --verbose --json
```

### 3. Consulter les résultats

- **Rapport Markdown** : `security-audit/AUDIT_SECURITE.md`
- **Rapport JSON** : `security-audit/report.json`
- **Sortie terminal** : résumé avec top 5 et recommandations

### 4. Vérification manuelle complémentaire

Pour un audit plus approfondi, vérifier manuellement :

```bash
# Chercher les console.log en production
grep -r "console\." app/ --include="*.tsx" --include="*.ts" | wc -l

# Chercher les throw error bruts
grep -n "throw error" lib/api.ts

# Vérifier les handlers manquants sur les boutons
grep -n "TouchableOpacity" app/settings.tsx | grep -v "onPress"

# Vérifier les variables d'env exposées
grep -rn "EXPO_PUBLIC" lib/

# Chercher les validations d'input manquantes
grep -n "insert(" lib/api.ts
```

### 5. Tester les RLS Supabase (boîte noire)

```bash
# Avec un token d'un user A, tenter d'accéder aux données de user B
curl -X GET "https://<SUPABASE_URL>/rest/v1/boxes?id=eq.<UUID_BOX_USER_B>" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <TOKEN_USER_A>"

# Tester le mass assignment
curl -X POST "https://<SUPABASE_URL>/rest/v1/boxes" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"project_id":"<OTHER_USER_PROJECT>","name":"test","qr_code":"test","id":"controlled-uuid","status":"unpacked"}'

# Tester l'oracle d'email
curl -X GET "https://<SUPABASE_URL>/rest/v1/profiles?email=eq.target@example.com&select=id" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <TOKEN>"
```

## Structure des fichiers

```
security-audit/
├── README.md              ← Ce fichier
├── AUDIT_SECURITE.md      ← Rapport complet (30 failles documentées)
├── audit_boxit.py         ← Script d'audit exécutable
└── report.json            ← Export JSON (généré par --json)
```

## Méthodologie

- Revue de code statique manuelle (pas de Semgrep/Burp Suite)
- 20 agents d'analyse parallèles couvrant chaque vecteur OWASP
- Références : OWASP Top 10 (2021), OWASP Mobile Top 10 (2024), OWASP API Security Top 10 (2023)
- Scope : code client uniquement (les RLS Supabase sont le backend de sécurité)
