import initSqlJs from "sql.js";

let db;

export async function initDb(setupSQL) {
  const SQL = await initSqlJs({
    locateFile: (f) => `${import.meta.env.BASE_URL}${f}`,
  });
  db = new SQL.Database();
  db.exec(setupSQL);
}

export function getDb() {
  return db;
}

export function executeQuery(query) {
  const statements = query
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  if (
    statements.length === 0 ||
    statements.some((stmt) => !/^(select|with)\b/i.test(stmt))
  ) {
    return { ok: false, error: "You have no permission" };
  }

  try {
    const res = db.exec(query);
    if (res.length === 0) {
      return { ok: true, columns: [], rows: [] };
    }
    const { columns, values } = res[0];
    // Ограничиваем вывод результата максимум 5 строками без изменения исходного запроса
    return { ok: true, columns, rows: values.slice(0, 5) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
