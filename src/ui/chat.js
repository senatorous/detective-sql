let sendHandler = () => {};

export function renderChat(container, state) {
  container.innerHTML = `
    <div class="messages">
      ${state.messages
        .map((m) => `<div class="msg"><strong>${m.from}:</strong> ${m.text}</div>`)
        .join("")}
    </div>
    <div class="outgoing">
      <input type="text" disabled />
      <button disabled>Send</button>
    </div>
  `;
  const btn = container.querySelector("button");
  const input = container.querySelector("input");
  btn.addEventListener("click", () => sendHandler(input.value));
}

export function setOutgoingMessage(text) {
  const input = document.querySelector(".chat .outgoing input");
  const btn = document.querySelector(".chat .outgoing button");
  if (!input || !btn) return;
  input.value = text;
  const enabled = Boolean(text);
  input.disabled = !enabled;
  btn.disabled = !enabled;
}

export function onSend(fn) {
  sendHandler = fn;
}
