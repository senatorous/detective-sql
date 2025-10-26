import { initDb, executeQuery, getDb } from './db.js';
import { getState, addMessage, setOpenTables } from './state.js';
import { renderChat, setOutgoingMessage, onSend } from './ui/chat.js';
import { renderEditor } from './ui/editor.js';
import { renderResult } from './ui/result.js';
import { renderSchema } from './ui/schema.js';
import { validate, steps } from './engine/validator.js';
import setupSQL from './setup.sql?raw';

await initDb(setupSQL);

const state = getState();
const INCOMING_MESSAGE_DELAY_MS = 7000;
const chatEl = document.getElementById('chat');
const schemaEl = document.getElementById('schema');
const startButton = document.getElementById('start-button');
const startText = document.getElementById('start-text');
const sirenOverlay = document.getElementById('siren-overlay');
const endScreen = document.getElementById('end-screen');
const policeSirenAudio =
  typeof Audio !== 'undefined'
    ? new Audio(`${import.meta.env.BASE_URL}audio/police_sirene_10_sec.mp3`)
    : null;
if (policeSirenAudio) {
  policeSirenAudio.preload = 'auto';
}
let finalSequenceStarted = false;
if (startButton && startText) {
  startText.style.width = `${startButton.offsetWidth * 3}px`;
}
renderChat(chatEl, state);

let editorControls;

function startFinalSequence() {
  if (finalSequenceStarted) return;
  finalSequenceStarted = true;
  if (sirenOverlay) {
    sirenOverlay.classList.add('active');
  }
  if (policeSirenAudio) {
    policeSirenAudio.currentTime = 0;
    const playPromise = policeSirenAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((error) => {
        console.warn('Не удалось воспроизвести аудио сирены полиции', error);
      });
    }
  }
  setTimeout(() => {
    if (sirenOverlay) {
      sirenOverlay.classList.remove('active');
    }
    if (policeSirenAudio) {
      policeSirenAudio.pause();
      policeSirenAudio.currentTime = 0;
    }
    if (endScreen) {
      endScreen.classList.remove('hidden');
    }
  }, 10000);
}

function startFirstCycle() {
  const messages = [
    { from: 'Шеф', text: 'Где тебя черти носят? Заканчивай со своей удаленкой, бегом в участок, у нас общий сбор, всем надо перепрошить ноуты' },
    { from: 'Детектив Смит', text: 'Не вздумай ехать в участок' },
    { from: 'Детектив Смит', text: 'Здесь какая-то хрень, люди из центра, у всех забирают ноуты. Этот урод говорит, что для перепрошивки. Я думаю, они хотят отрубить нам какие-то доступы, уж больно все суетятся.' },
    { from: 'Детектив Смит', text: 'Мой уже забрали, ты один остался, удаленщик хренов. Сиди на месте, мне кажется я знаю в чем дело' },
    { from: 'Детектив Смит', text: 'У тебя есть доступ к таблице дел за сегодня. Есть что-то жесткое? Просто селектни все' },
  ];
  messages.forEach((m, i) => {
    setTimeout(() => {
      addMessage(m.from, m.text);
      renderChat(chatEl, state);
      if (i === messages.length - 1) {
        editorControls?.setDisabled(false);
      }
    }, i * INCOMING_MESSAGE_DELAY_MS);
  });
}

document.getElementById('start-button').addEventListener('click', () => {
  document.getElementById('start-screen').classList.add('hidden');
  startFirstCycle();
});

const allTables = [];
const visibleTables = ['Cases'];

onSend((text) => {
  addMessage('Вы', text);
  renderChat(chatEl, state);
  setOutgoingMessage('');
  const stepInfo = steps[state.currentStep];
  const lastSmithIdx = stepInfo.messages
    .map((m) => m.from)
    .lastIndexOf('Детектив Смит');
  // показать последующие сообщения
  stepInfo.messages.forEach((m, i) => {
    setTimeout(() => {
      addMessage(m.from, m.text);
      renderChat(chatEl, state);
      if (!finalSequenceStarted && m.from === 'Неизвестный' && m.text.includes('Доигрался?')) {
        startFinalSequence();
      }
      if (i === lastSmithIdx && stepInfo.addTables.length) {
        visibleTables.push(...stepInfo.addTables);
        setOpenTables(
          visibleTables
            .map((name) => allTables.find((t) => t.name === name))
            .filter(Boolean)
        );
        renderSchema(schemaEl, state.openTables);
      }
    }, (i + 1) * INCOMING_MESSAGE_DELAY_MS);
  });
  state.currentStep += 1;
});

const editorEl = document.getElementById('editor');
const resultEl = document.getElementById('result');

editorControls = renderEditor(editorEl, {
  disabled: true,
  onRun: (query) => {
    const res = executeQuery(query);
    if (res.ok) {
      renderResult(resultEl, { columns: res.columns, rows: res.rows });
      const check = validate(state.currentStep, res);
      if (check.matched) {
        const stepInfo = steps[state.currentStep];
        setOutgoingMessage(stepInfo.outgoing);
      }
    } else {
      renderResult(resultEl, { error: res.error });
    }
  },
});

// подсказка первого запроса
editorEl.querySelector('textarea').value = 'SELECT * FROM Cases;';

renderResult(resultEl, {});

// показать схему БД (изначально только Cases)
const db = getDb();
const tableList = db.exec('PRAGMA table_list;');
if (tableList.length) {
  tableList[0].values.forEach((row) => {
    const name = row[1];
    const info = db.exec(`PRAGMA table_info(${name});`);
    const columns = info[0].values.map((c) => c[1]);
    allTables.push({ name, columns });
  });
}
setOpenTables(
  visibleTables
    .map((name) => allTables.find((t) => t.name === name))
    .filter(Boolean)
);
renderSchema(schemaEl, state.openTables);
