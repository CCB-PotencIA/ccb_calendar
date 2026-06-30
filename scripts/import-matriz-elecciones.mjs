// One-off import script for "Matriz Interna de Elecciones de Junta Directiva y Revisor Fiscal 2026".
// Stage 1 (default): DRY RUN — parses the CSV and prints the result, writes NOTHING to the DB.
// Stage 2: pass --apply to actually insert into Supabase.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const csvPathArg = process.argv.find((a) => a.startsWith("--csv="));
const CSV_PATH = csvPathArg ? csvPathArg.slice("--csv=".length) : null;
const APPLY = process.argv.includes("--apply");
const PROJECT_LABEL = "Matriz Interna de Elecciones de Junta Directiva y Revisor Fiscal 2026";

const DEPARTMENTS = [
  "Secretaría General",
  "Conexiones",
  "Control Interno",
  "Comunicaciones",
  "Financiera",
  "Administrativa",
  "Compras",
  "VP Registro y TD",
];

const FOLLOWUP_CHECKPOINTS = [
  { label: "Seguimiento 02 julio", date: "2026-07-02" },
  { label: "Seguimiento 06 agosto", date: "2026-08-06" },
  { label: "Seguimiento 03 septiembre", date: "2026-09-03" },
  { label: "Seguimiento 01 octubre", date: "2026-10-01" },
  { label: "Seguimiento 05 noviembre", date: "2026-11-05" },
  { label: "Seguimiento 26 noviembre", date: "2026-11-26" },
  { label: "Seguimiento 01 diciembre", date: "2026-12-01" },
];

const ELECTION_DAY_FALLBACK = "2026-12-03";

// ---------- CSV parsing (semicolon-delimited, quote-aware, embedded newlines) ----------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ";") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // skip
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// ---------- department normalization ----------
function stripAccents(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normalize(s) {
  return stripAccents(s.toLowerCase()).trim();
}

function matchDepartment(token) {
  const n = normalize(token);
  if (!n) return null;
  if (n.includes("secretaria general")) return "Secretaría General";
  if (n.includes("conexion")) return "Conexiones";
  if (n.includes("control interno")) return "Control Interno";
  if (n.includes("comunicacion")) return "Comunicaciones";
  if (n.includes("financiera")) return "Financiera";
  if (n.includes("administrativa")) return "Administrativa";
  if (n.includes("compras")) return "Compras";
  if (n.includes("regist")) return "VP Registro y TD"; // catches "Registos"/"Registros" typos
  return null;
}

// returns { departments: string[], tags: string[] }
function splitDepartmentsAndTags(...rawFields) {
  const departments = new Set();
  const tags = new Set();
  for (const raw of rawFields) {
    if (!raw) continue;
    const tokens = raw
      .split("/")
      .map((t) => t.trim())
      .filter(Boolean);
    for (const token of tokens) {
      const dept = matchDepartment(token);
      if (dept) {
        departments.add(dept);
      } else {
        tags.add(token);
      }
    }
  }
  return { departments: [...departments], tags: [...tags] };
}

// ---------- date parsing ----------
const MONTHS = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

function inferYear(text) {
  const m = text.match(/20\d{2}/);
  return m ? m[0] : "2026";
}

// Parses a single "X de MES" / "X MES" fragment near a given month-name match.
function extractSingleDate(text) {
  const year = inferYear(text);
  // "<day> de <month>" or "<day> <month>" (month optionally followed by accent-stripped text)
  const monthPattern = Object.keys(MONTHS).join("|");
  const re = new RegExp(`(\\d{1,2})\\s*(?:de\\s+)?(${monthPattern})`, "i");
  const m = normalize(text).match(re);
  if (!m) return null;
  const day = m[1].padStart(2, "0");
  const month = String(MONTHS[m[2]]).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Returns { date: 'YYYY-MM-DD'|null, flagged: boolean, reason?: string }
function parseDeadlineText(raw) {
  if (!raw) return { date: null, flagged: false };
  const text = raw.trim();
  const n = normalize(text);
  if (n === "n/a" || n === "") return { date: null, flagged: false };

  // Recurring multi-line list -> take the LAST line.
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    const last = extractSingleDate(lines[lines.length - 1]);
    if (last) return { date: last, flagged: false };
  }

  // Range: "Del X al Y de MES" / "Entre el X y el Y de MES" / "X al Y de MES" -> take the LAST date mention.
  if (/\bdel\b|\bentre\b|\bal\b|\by el\b/.test(n)) {
    const monthPattern = Object.keys(MONTHS).join("|");
    const re = new RegExp(`(\\d{1,2})\\s*(?:de\\s+)?(${monthPattern})`, "gi");
    const matches = [...n.matchAll(re)];
    if (matches.length > 0) {
      const m = matches[matches.length - 1];
      const year = inferYear(text);
      const day = m[1].padStart(2, "0");
      const month = String(MONTHS[m[2]]).padStart(2, "0");
      return { date: `${year}-${month}-${day}`, flagged: false };
    }
  }

  // Single mention: "A más tardar el X de MES", "Hasta el X de MES", bare "X de MES"
  const single = extractSingleDate(text);
  if (single) return { date: single, flagged: false };

  // Unparseable — flag for manual review.
  return { date: null, flagged: true, reason: `No se pudo extraer fecha de: "${raw}"` };
}

// ---------- main transform ----------
function deriveStatus(percentage) {
  if (percentage >= 100) return "completed";
  if (percentage > 0) return "in_progress";
  return "pending";
}

function deriveDescription({ notes, rawPlazoLegal, rawPlazoInterno, recurringList, fallbackReason }) {
  const parts = [];
  if (notes) parts.push(notes);
  if (recurringList) parts.push(`Fechas: ${recurringList.replace(/\n/g, ", ")}`);
  if (fallbackReason) parts.push(`[Revisar] Plazo original sin fecha clara: "${fallbackReason}"`);
  return parts.join("\n\n") || null;
}

function transformRow(cols) {
  const [
    idRaw, actividades, origen, responsable, vpUnidad,
    plazoLegalRaw, plazoInternoRaw, notas, _estado, porcentajeRaw,
  ] = cols;

  const id = idRaw.trim();
  if (!id || !/^\d+$/.test(id)) return null; // skip header/metadata/blank rows

  const title = actividades.trim();
  const percentage = parseInt((porcentajeRaw || "0").replace("%", "").trim(), 10) || 0;

  const { departments, tags } = splitDepartmentsAndTags(vpUnidad, responsable);
  let departmentsFinal = departments;
  let departmentDefaulted = false;
  if (departmentsFinal.length === 0) {
    departmentsFinal = ["Secretaría General"];
    departmentDefaulted = true;
  }

  const legalParsed = parseDeadlineText(plazoLegalRaw);
  let internoParsed = parseDeadlineText(plazoInternoRaw);
  let internoFallbackApplied = false;
  let internoFlagged = internoParsed.flagged;
  let internoFlagReason = internoParsed.reason;

  // Recurring-list raw text preserved for description, if PLAZO INTERNO had multiple lines.
  const internoLines = (plazoInternoRaw || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const recurringList = internoLines.length > 1 ? plazoInternoRaw.trim() : null;

  if (!internoParsed.date && legalParsed.date) {
    // agreed fallback rule: plazo_interno N/A -> copy from plazo_legal
    internoParsed = { date: legalParsed.date, flagged: false };
    internoFallbackApplied = true;
  }

  let plazoInternoFinal = internoParsed.date;
  let dateDefaulted = false;
  if (!plazoInternoFinal) {
    plazoInternoFinal = ELECTION_DAY_FALLBACK;
    dateDefaulted = true;
    internoFlagged = true;
    internoFlagReason = internoFlagReason || `plazo_legal y plazo_interno sin fecha clara (texto: "${plazoInternoRaw}")`;
  }

  return {
    source_ref: `${PROJECT_LABEL} #${id}`,
    title,
    origen: origen.trim() || null,
    description: deriveDescription({
      notes: notas?.trim() || null,
      recurringList,
      fallbackReason: internoFlagged ? internoFlagReason : null,
    }),
    departments: departmentsFinal,
    responsible_tags: tags,
    plazo_legal: legalParsed.date,
    plazo_interno: plazoInternoFinal,
    progress: percentage,
    status: deriveStatus(percentage),
    priority: normalize(origen) === "legal" ? "high" : "medium",
    followups: FOLLOWUP_CHECKPOINTS.map((f) => ({ ...f })),
    _flags: {
      departmentDefaulted,
      internoFallbackApplied,
      dateDefaulted,
      legalFlagged: legalParsed.flagged,
    },
  };
}

async function applyImport(tasks) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: depts, error: deptError } = await supabase
    .from("departments")
    .select("id, name");
  if (deptError) throw deptError;
  const deptIdByName = new Map(depts.map((d) => [d.name, d.id]));

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "potencia@camarabaq.org.co")
    .single();
  if (profileError || !profile) throw profileError ?? new Error("Admin profile not found");
  const createdBy = profile.id;

  let inserted = 0;
  for (const t of tasks) {
    const primaryDeptName = t.departments[0];
    const primaryDeptId = deptIdByName.get(primaryDeptName);
    if (!primaryDeptId) throw new Error(`Unknown department: ${primaryDeptName}`);

    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title: t.title,
        origen: t.origen,
        description: t.description,
        department_id: primaryDeptId,
        created_by: createdBy,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        plazo_legal: t.plazo_legal,
        plazo_interno: t.plazo_interno,
        responsible_tags: t.responsible_tags,
        source_ref: t.source_ref,
      })
      .select("id")
      .single();
    if (taskError || !task) throw taskError ?? new Error("Insert failed");

    const deptRows = t.departments
      .map((name) => deptIdByName.get(name))
      .filter(Boolean)
      .map((department_id) => ({ task_id: task.id, department_id }));
    if (deptRows.length > 0) {
      const { error: tdError } = await supabase.from("task_departments").insert(deptRows);
      if (tdError) throw tdError;
    }

    const followupRows = t.followups.map((f) => ({
      task_id: task.id,
      label: f.label,
      followup_date: f.date,
    }));
    const { error: fError } = await supabase.from("task_followups").insert(followupRows);
    if (fError) throw fError;

    inserted++;
    console.log(`  [${inserted}/${tasks.length}] ${t.source_ref} -> ${task.id}`);
  }
  console.log(`\nListo: ${inserted} tareas insertadas.`);
}

async function main() {
  if (!CSV_PATH) {
    console.error("Usage: node scripts/import-matriz-elecciones.mjs --csv=<path> [--apply] [--limit=N] [--all]");
    process.exit(1);
  }
  const raw = readFileSync(CSV_PATH, "utf8");
  const rows = parseCsv(raw);
  let tasks = rows.map(transformRow).filter(Boolean);

  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  if (limitArg) {
    tasks = tasks.slice(0, parseInt(limitArg.split("=")[1], 10));
  }

  if (APPLY) {
    await applyImport(tasks);
    return;
  }

  const flaggedRows = tasks.filter(
    (t) => t._flags.departmentDefaulted || t._flags.dateDefaulted || t._flags.legalFlagged
  );

  console.log(`Total filas parseadas: ${tasks.length}`);
  console.log(`Filas con departamento por defecto (Secretaría General): ${tasks.filter((t) => t._flags.departmentDefaulted).length}`);
  console.log(`Filas con fecha por defecto (día de elecciones): ${tasks.filter((t) => t._flags.dateDefaulted).length}`);
  console.log(`Filas con plazo_legal no parseable: ${tasks.filter((t) => t._flags.legalFlagged).length}`);
  console.log("");
  if (process.argv.includes("--all")) {
    console.log("=== TODAS LAS FILAS ===");
    console.log(JSON.stringify(tasks, null, 2));
  } else {
    console.log("=== MUESTRA (primeras 5) ===");
    console.log(JSON.stringify(tasks.slice(0, 5), null, 2));
  }
  console.log("");
  console.log(`=== FILAS MARCADAS PARA REVISIÓN (${flaggedRows.length}) ===`);
  console.log(JSON.stringify(flaggedRows, null, 2));

  console.log("\n(DRY RUN — no se escribió nada en la base. Corre con --apply para insertar.)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
