export function renderResult(container, { columns = [], rows = [], error } = {}) {
  if (error) {
    container.innerHTML = `<div class="error">${error}</div>`;
    return;
  }
  if (!columns.length) {
    container.innerHTML = `<div class="empty">Нет данных</div>`;
    return;
  }
  const thead = `<thead class="sql-result-thead"><tr>${columns
    .map((c) => `<th scope="col">${c}</th>`)
    .join("")}</tr></thead>`;
  const tbody = `<tbody class="sql-result-body">${rows
    .map(
      (r) =>
        `<tr class="sql-result-row">${r
          .map((v) => `<td>${v}</td>`)
          .join("")}</tr>`
    )
    .join("")}</tbody>`;
  container.innerHTML = `<table class="sql-result-table">${thead}${tbody}</table>`;
}
