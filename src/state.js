const state = {
  currentStep: 0,
  messages: [],
  openTables: [],
};

export function addMessage(from, text) {
  state.messages.push({ from, text });
}

export function setOpenTables(tables) {
  state.openTables = tables;
}

export function getState() {
  return state;
}
