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
const chatEl = document.getElementById('chat');
const schemaEl = document.getElementById('schema');
renderChat(chatEl, state);

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
    }, i * 5000);
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
  // открыть новые таблицы
  if (stepInfo.addTables.length) {
    visibleTables.push(...stepInfo.addTables);
    setOpenTables(allTables.filter((t) => visibleTables.includes(t.name)));
    renderSchema(schemaEl, state.openTables);
  }
  // показать последующие сообщения
  stepInfo.messages.forEach((m, i) => {
    setTimeout(() => {
      addMessage(m.from, m.text);
      renderChat(chatEl, state);
    }, (i + 1) * 5000);
  });
  state.currentStep += 1;
});

const editorEl = document.getElementById('editor');
const resultEl = document.getElementById('result');

renderEditor(editorEl, {
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
setOpenTables(allTables.filter((t) => visibleTables.includes(t.name)));
renderSchema(schemaEl, state.openTables);
