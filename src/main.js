import initSqlJs from "sql.js";

// Инициализация SQLite: указываем, где лежит бинарник
const SQL = await initSqlJs({
  // файл находится в /public, значит доступен по корню сайта
  locateFile: (file) => `${import.meta.env.BASE_URL}${file}`, // даст путь "/sql-wasm.wasm"
});

// 1) Собираем «мини-базу» уровня: таблицы + тестовые данные
const db = new SQL.Database();
const setupSQL = `
CREATE TABLE suspects(id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE calls(id INTEGER PRIMARY KEY, caller_id INT, callee_id INT, minutes INT);

INSERT INTO suspects VALUES
  (1,'Анна','Берлин'),
  (2,'Борис','Москва'),
  (3,'Клара','Париж'),
  (4,'Диего','Мадрид');

INSERT INTO calls VALUES
  (1,1,2,3),
  (2,2,3,12),
  (3,3,4,7),
  (4,2,4,2),
  (5,1,3,9);
`;
db.exec(setupSQL);

// 2) Показываем мини-схему уровня
document.getElementById("schema").textContent = `
TABLE suspects(id, name, city)
TABLE calls(id, caller_id, callee_id, minutes)
Пример: SELECT * FROM suspects;
`;

// 3) Заполняем поле примером запроса
const sqlBox = document.getElementById("sql");
sqlBox.value = "SELECT name, city FROM suspects ORDER BY name;";

const runBtn = document.getElementById("run");
const resultDiv = document.getElementById("result");
const errorDiv = document.getElementById("error");
const statusSpan = document.getElementById("status");

// Хелпер: нарисовать табличку результата
function renderTable(columns, rows) {
  if (!rows.length) return "<div class='muted'>Пусто (0 строк)</div>";
  const thead = `<thead><tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}

// 4) Обработчик кнопки "Run"
runBtn.onclick = () => {
  runBtn.disabled = true;
  statusSpan.textContent = "Выполняю...";
  errorDiv.textContent = "";
  try {
    const query = sqlBox.value;
    const res = db.exec(query); // массив result-set'ов
    if (res.length === 0) {
      resultDiv.innerHTML = "<div class='muted'>Запрос выполнен (без выборки).</div>";
    } else {
      const { columns, values } = res[0];
      resultDiv.innerHTML = renderTable(columns, values);
    }
  } catch (e) {
    errorDiv.textContent = String(e);
  } finally {
    statusSpan.textContent = "";
    runBtn.disabled = false;
  }
};
