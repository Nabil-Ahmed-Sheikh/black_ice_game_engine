/** Shared mutable game state across scenes. Reset via `resetState()`. */
export const state = {
  score: 0,
  level: 1,
  keysCollected: 0,
  keysRequired: 0,
  playerHP: 5,
  playerMaxHP: 5,
};

export function resetState() {
  state.score = 0;
  state.level = 1;
  state.keysCollected = 0;
  state.keysRequired = 0;
  state.playerHP = 5;
  state.playerMaxHP = 5;
}
