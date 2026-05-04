#!/usr/bin/env node

/**
 * Seed script for Boxit — populates Supabase with demo data.
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Prerequisites:
 *   - .env file with EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   - Supabase tables already created (run supabaseSQL.txt first)
 *
 * SUPABASE_SERVICE_ROLE_KEY: Supabase Dashboard > Project Settings > API > service_role
 * This key bypasses RLS, which is required for seed operations.
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ---------------------------------------------------------------------------
// Load .env manually (no extra dependency needed)
// ---------------------------------------------------------------------------
const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} else {
  console.error("ERROR: .env file not found.");
  process.exit(1);
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("ERROR: EXPO_PUBLIC_SUPABASE_URL must be set in .env");
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  console.error("       Find it in: Supabase Dashboard > Project Settings > API > service_role");
  process.exit(1);
}

// Service role client — bypasses RLS entirely, required for seed operations.
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Test user credentials
// ---------------------------------------------------------------------------
const TEST_USER = {
  email: "test@boxit.dev",
  password: "BoXiT_2025!",
  full_name: "Marie Dupont",
};

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
const PROJECTS = [
  {
    name: "Demenagement Paris -> Lyon",
    description: "Demenagement de l'appartement parisien vers la nouvelle maison a Lyon, prevu pour juillet 2025.",
  },
  {
    name: "Rangement Garage",
    description: "Tri et rangement du garage : outils, decorations de Noel, archives.",
  },
];

const BOXES_PROJECT_1 = [
  { name: "Cuisine - Vaisselle", room: "Cuisine", color: "#FF6B6B", is_fragile: true, status: "sealed" },
  { name: "Cuisine - Electromenager", room: "Cuisine", color: "#FF6B6B", is_fragile: false, status: "filling" },
  { name: "Salon - Livres", room: "Salon", color: "#4ECDC4", is_fragile: false, status: "sealed" },
  { name: "Salon - Deco", room: "Salon", color: "#4ECDC4", is_fragile: true, status: "filling" },
  { name: "Chambre - Vetements", room: "Chambre", color: "#45B7D1", is_fragile: false, status: "unpacked" },
  { name: "Salle de bain", room: "Salle de bain", color: "#96CEB4", is_fragile: false, status: "sealed" },
];

const BOXES_PROJECT_2 = [
  { name: "Outils", room: "Garage", color: "#DDA15E", is_fragile: false, status: "filling" },
  { name: "Decorations Noel", room: "Garage", color: "#BC6C25", is_fragile: true, status: "sealed" },
];

const ITEMS_BY_BOX = {
  "Cuisine - Vaisselle": [
    { name: "Assiettes plates", quantity: 8, description: "Service bleu en porcelaine" },
    { name: "Assiettes creuses", quantity: 6, description: null },
    { name: "Verres a vin", quantity: 12, description: "Cristal — tres fragile" },
    { name: "Tasses a cafe", quantity: 6, description: "Set Ikea" },
    { name: "Saladier", quantity: 2, description: null },
  ],
  "Cuisine - Electromenager": [
    { name: "Grille-pain", quantity: 1, description: "Marque Russell Hobbs" },
    { name: "Mixeur plongeant", quantity: 1, description: null },
    { name: "Cafetiere", quantity: 1, description: "Nespresso Vertuo" },
  ],
  "Salon - Livres": [
    { name: "Romans", quantity: 25, description: "Etagere du haut" },
    { name: "BD / Mangas", quantity: 15, description: "Collection One Piece + Asterix" },
    { name: "Livres de cuisine", quantity: 8, description: null },
  ],
  "Salon - Deco": [
    { name: "Cadres photo", quantity: 5, description: "Differentes tailles, emballer individuellement" },
    { name: "Bougeoirs", quantity: 3, description: null },
    { name: "Vase en ceramique", quantity: 1, description: "Fait main — fragile" },
  ],
  "Chambre - Vetements": [
    { name: "Pulls hiver", quantity: 10, description: null },
    { name: "Jeans", quantity: 6, description: null },
    { name: "Chaussures", quantity: 4, description: "2 paires de baskets, 1 bottes, 1 escarpins" },
  ],
  "Salle de bain": [
    { name: "Serviettes", quantity: 6, description: "Grandes et petites" },
    { name: "Produits de soin", quantity: 1, description: "Lot : shampoing, gel douche, creme" },
  ],
  "Outils": [
    { name: "Perceuse", quantity: 1, description: "Bosch + coffret de meches" },
    { name: "Boite a vis", quantity: 1, description: null },
    { name: "Marteau", quantity: 1, description: null },
    { name: "Tournevis (set)", quantity: 1, description: "Coffret 12 pieces" },
  ],
  "Decorations Noel": [
    { name: "Guirlandes lumineuses", quantity: 3, description: "LED blanc chaud" },
    { name: "Boules de Noel", quantity: 30, description: "Rouges et dorees — fragile" },
    { name: "Sapin artificiel", quantity: 1, description: "1m80, en 3 parties" },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generateQR() {
  return `BOX-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function log(msg) {
  console.log(`  -> ${msg}`);
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function seed() {
  console.log("\n=== BOXIT SEED ===\n");

  // -----------------------------------------------------------------------
  // 1. Create or retrieve test user via Admin API
  //    auth.admin.createUser() bypasses email confirmation entirely.
  //    The handle_new_user trigger auto-creates the profile row.
  // -----------------------------------------------------------------------
  console.log("1. Creating test user...");

  let userId;

  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
    user_metadata: { full_name: TEST_USER.full_name },
  });

  if (createError) {
    if (createError.message.toLowerCase().includes("already") || createError.message.toLowerCase().includes("exists")) {
      log("User already exists, fetching by email...");
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("ERROR: Cannot list users:", listError.message);
        process.exit(1);
      }
      const existing = listData.users.find((u) => u.email === TEST_USER.email);
      if (!existing) {
        console.error("ERROR: User not found after listing.");
        process.exit(1);
      }
      userId = existing.id;
    } else {
      console.error("ERROR: Cannot create test user:", createError.message);
      process.exit(1);
    }
  } else {
    userId = createData.user.id;
  }

  log(`User ID: ${userId}`);

  // -----------------------------------------------------------------------
  // 2. Upsert profile (the handle_new_user trigger creates it on signup,
  //    but we upsert to ensure full_name is set for existing users).
  // -----------------------------------------------------------------------
  console.log("\n2. Upserting profile...");

  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: userId, full_name: TEST_USER.full_name, email: TEST_USER.email, avatar_url: null },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error("ERROR: Could not upsert profile:", profileError.message);
    process.exit(1);
  }
  log(`Profile: ${TEST_USER.full_name} <${TEST_USER.email}>`);

  // -----------------------------------------------------------------------
  // 3. Clean existing seed data (idempotent re-runs)
  //    Deleting projects cascades to project_members, boxes, and items.
  //    Do NOT delete project_members first — the projects DELETE policy
  //    checks ownership via project_members.
  // -----------------------------------------------------------------------
  console.log("\n3. Cleaning existing data for this user...");

  const { data: existingProjects, error: fetchError } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", userId);

  if (fetchError) {
    console.error("ERROR: Could not fetch existing projects:", fetchError.message);
    process.exit(1);
  }

  if (existingProjects && existingProjects.length > 0) {
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("owner_id", userId);

    if (deleteError) {
      console.error("ERROR: Could not delete existing projects:", deleteError.message);
      process.exit(1);
    }
    log(`${existingProjects.length} existing project(s) deleted (cascade: members, boxes, items).`);
  } else {
    log("No existing data to clean.");
  }

  // -----------------------------------------------------------------------
  // 4. Create projects
  //    The on_project_created trigger automatically adds the owner as a
  //    member with role 'owner' — no manual insertion needed.
  // -----------------------------------------------------------------------
  console.log("\n4. Creating projects...");

  const createdProjects = [];
  for (const proj of PROJECTS) {
    const { data, error } = await supabase
      .from("projects")
      .insert({ name: proj.name, description: proj.description, owner_id: userId })
      .select()
      .single();

    if (error) {
      console.error(`ERROR: Could not create project "${proj.name}":`, error.message);
      process.exit(1);
    }
    createdProjects.push(data);
    log(`Project: "${data.name}" (${data.id})`);
  }

  // -----------------------------------------------------------------------
  // 5. Create boxes
  // -----------------------------------------------------------------------
  console.log("\n5. Creating boxes...");

  const allBoxes = [
    ...BOXES_PROJECT_1.map((b) => ({ ...b, project_id: createdProjects[0].id })),
    ...BOXES_PROJECT_2.map((b) => ({ ...b, project_id: createdProjects[1].id })),
  ];

  const createdBoxes = [];
  for (const box of allBoxes) {
    const { data, error } = await supabase
      .from("boxes")
      .insert({
        project_id: box.project_id,
        qr_code: generateQR(),
        name: box.name,
        room: box.room,
        color: box.color,
        is_fragile: box.is_fragile,
        status: box.status,
      })
      .select()
      .single();

    if (error) {
      console.error(`ERROR: Could not create box "${box.name}":`, error.message);
      process.exit(1);
    }
    createdBoxes.push(data);
    log(`Box: "${data.name}" [${data.status}] (${data.qr_code})`);
  }

  // -----------------------------------------------------------------------
  // 6. Create items
  // -----------------------------------------------------------------------
  console.log("\n6. Creating items...");

  let totalItems = 0;
  for (const box of createdBoxes) {
    const itemDefs = ITEMS_BY_BOX[box.name];
    if (!itemDefs) continue;

    for (const item of itemDefs) {
      const { error } = await supabase.from("items").insert({
        box_id: box.id,
        name: item.name,
        quantity: item.quantity,
        description: item.description,
      });

      if (error) {
        console.error(`ERROR: Could not create item "${item.name}" in "${box.name}":`, error.message);
      } else {
        totalItems++;
      }
    }
    log(`${itemDefs.length} items added to "${box.name}"`);
  }

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log("\n=== SEED COMPLETE ===\n");
  console.log(`    User:     ${TEST_USER.email} / ${TEST_USER.password}`);
  console.log(`    Projects: ${createdProjects.length}`);
  console.log(`    Boxes:    ${createdBoxes.length}`);
  console.log(`    Items:    ${totalItems}`);
  console.log("");
}

seed().catch((err) => {
  console.error("Unexpected error during seed:", err);
  process.exit(1);
});
