let sendHandler = () => {};

const INCOMING_MESSAGE_SOUND_SRC = "/audio/ding_1,5_sec.mp3";

function playIncomingMessageSound() {
  try {
    const audio = new Audio(INCOMING_MESSAGE_SOUND_SRC);
    audio.play().catch(() => {});
  } catch (err) {
    // Игнорируем ошибки воспроизведения, чтобы не мешать интерфейсу.
  }
}

export function renderChat(container, state) {
  container.innerHTML = `
    <div class="messages">
      ${state.messages
        .map(
          (m) => `
        <div class="msg ${m.from === 'Вы' ? 'out' : 'in'} ${
          m.from === 'Шеф'
            ? 'chef'
            : m.from === 'Детектив Смит'
            ? 'smith'
            : m.from === 'Неизвестный'
            ? 'unknown'
            : ''
        } ${m.rendered ? '' : 'new'}">
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
  state.messages.forEach((message) => {
    if (!message.rendered) {
      if (message.from !== "Вы") {
        playIncomingMessageSound();
      }
      message.rendered = true;
    }
  });
  const btn = container.querySelector("button");
  const input = container.querySelector("input");
  btn.addEventListener("click", () => sendHandler(input.value));
  const messages = container.querySelector('.messages');
  if (messages) {
    messages.scrollTop = messages.scrollHeight;
  }
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
