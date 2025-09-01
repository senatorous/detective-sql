// Показываем схемы таблиц как раскрывающиеся списки,
// чтобы занимать меньше места и явно указывать, что список можно раскрыть
export function renderSchema(container, tables) {
  container.innerHTML = tables
    .map(
      (t) =>
        `<details class="table"><summary>${t.name}</summary><ul>${t.columns
          .map((c) => `<li>${c}</li>`)
          .join("")}</ul></details>`
    )
    .join("");
}
