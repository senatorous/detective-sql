import { initDb, executeQuery, getDb } from './db.js';
import { getState, addMessage, setOpenTables } from './state.js';
import { renderChat } from './ui/chat.js';
import { renderEditor } from './ui/editor.js';
import { renderResult } from './ui/result.js';
import { renderSchema } from './ui/schema.js';
import { validate } from './engine/validator.js';
import setupSQL from './setup.sql?raw';

await initDb(setupSQL);

const state = getState();

// начальный сценарий диалога
addMessage('Шеф', 'Где тебя черти носят? Заканчивай со своей удаленкой, бегом в участок, у нас общий сбор, всем надо перепрошить ноуты');
addMessage('Детектив Смит', 'Не вздумай ехать в участок');
addMessage('Детектив Смит', 'Здесь какая-то хрень, люди из центра, у всех забирают ноуты. Этот урод говорит, что для перепрошивки. Я думаю, они хотят отрубить нам какие-то доступы, уж больно все суетятся.');
addMessage('Детектив Смит', 'Мой уже забрали, ты один остался, удаленщик хренов. Сиди на месте, мне кажется я знаю в чем дело');
addMessage('Детектив Смит', 'У тебя есть доступ к таблице дел за сегодня. Есть что-то жесткое? Просто селектни все');

const chatEl = document.getElementById('chat');
renderChat(chatEl, state);

const editorEl = document.getElementById('editor');
const resultEl = document.getElementById('result');

renderEditor(editorEl, {
  onRun: (query) => {
    const res = executeQuery(query);
    if (res.ok) {
      renderResult(resultEl, { columns: res.columns, rows: res.rows });
      const check = validate(state.currentStep, res);
      // TODO: использовать check.matched для перехода по сюжету
    } else {
      renderResult(resultEl, { error: res.error });
    }
  },
});

// подсказка первого запроса
editorEl.querySelector('textarea').value = 'SELECT * FROM Cases;';

renderResult(resultEl, {});

// показать схему БД
const db = getDb();
const tableList = db.exec('PRAGMA table_list;');
const tables = [];
if (tableList.length) {
  tableList[0].values.forEach((row) => {
    const name = row[1];
    const info = db.exec(`PRAGMA table_info(${name});`);
    const columns = info[0].values.map((c) => c[1]);
    tables.push({ name, columns });
  });
}
setOpenTables(tables);
const schemaEl = document.getElementById('schema');
renderSchema(schemaEl, state.openTables);
