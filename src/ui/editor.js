export function renderEditor(container, { onRun }) {
  container.innerHTML = `
    <textarea></textarea>
    <button>Run</button>
  `;
  const textarea = container.querySelector("textarea");
  const btn = container.querySelector("button");
  btn.addEventListener("click", () => onRun(textarea.value));
  textarea.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      onRun(textarea.value);
    }
  });
}
