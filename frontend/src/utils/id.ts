let counter = 0;

/** Short, readable, collision-safe-enough id for mock/local records. */
export function makeId(prefix = "id"): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${Date.now().toString(36)}${counter}${random}`;
}
