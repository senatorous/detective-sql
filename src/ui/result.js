export function renderResult(container, { columns = [], rows = [], error } = {}) {
  if (error) {
    container.innerHTML = `<div class="error">${error}</div>`;
    return;
  }
  if (!columns.length) {
    container.innerHTML = `<div class="empty">Нет данных</div>`;
    return;
  }
  const thead = `<thead><tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${rows
    .map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
  container.innerHTML = `<table>${thead}${tbody}</table>`;
}
