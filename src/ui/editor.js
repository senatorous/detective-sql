export function renderEditor(container, { onRun, disabled = false }) {
  container.innerHTML = `
    <textarea></textarea>
    <button>Run</button>
  `;
  const textarea = container.querySelector("textarea");
  const btn = container.querySelector("button");
  btn.disabled = disabled;
  btn.addEventListener("click", () => onRun(textarea.value));
  textarea.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (!btn.disabled) {
        onRun(textarea.value);
      }
    }
  });
  return {
    setDisabled(value) {
      btn.disabled = value;
    },
  };
}
