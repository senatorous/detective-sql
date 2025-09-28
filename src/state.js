const state = {
  currentStep: 0,
  messages: [],
  openTables: [],
};

export function addMessage(from, text) {
  state.messages.push({ from, text, rendered: false });
}

export function setOpenTables(tables) {
  state.openTables = tables;
}

export function getState() {
  return state;
}
