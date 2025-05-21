// Simple fake db implementation to match what MemStorage expects
console.log("Using in-memory storage only");

export const db = {
  query: async () => ({ rows: [] })
};