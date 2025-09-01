let sendHandler = () => {};

export function renderChat(container, state) {
  container.innerHTML = `
    <div class="messages">
      ${state.messages
        .map(
          (m) => `
        <div class="msg ${m.from === 'Вы' ? 'out' : 'in'}">
          ${m.from === 'Вы' ? '' : `<div class="sender">${m.from}</div>`}
          <div class="bubble">${m.text}</div>
        </div>
      `
        )
        .join("")}
    </div>
    <div class="outgoing">
      <input type="text" disabled />
      <button disabled>&uarr;</button>
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
