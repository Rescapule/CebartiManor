import { updateState } from "./state.js";

const DEFAULT_PLAYER_MEMORIES = [
  "memoryBarFight",
  "memoryWatchman",
  "memorySong",
];

export function ensureDefaultMemories(ctx) {
  const contextState = ctx && typeof ctx === "object" ? ctx.state : null;
  const memories = contextState?.playerMemories;
  if (Array.isArray(memories) && memories.length > 0) {
    return memories;
  }

  const updatedState = updateState({
    playerMemories: DEFAULT_PLAYER_MEMORIES.slice(),
  });

  if (contextState && contextState !== updatedState) {
    contextState.playerMemories = updatedState.playerMemories.slice();
  }

  return updatedState.playerMemories;
}
