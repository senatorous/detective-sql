export function renderSchema(container, tables) {
  container.innerHTML = tables
    .map(
      (t) =>
        `<div class="table"><strong>${t.name}</strong><ul>${t.columns
          .map((c) => `<li>${c}</li>`)
          .join("")}</ul></div>`
    )
    .join("");
}
