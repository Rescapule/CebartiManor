export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sampleWithoutReplacement(source, count) {
  if (!Array.isArray(source) || source.length === 0 || count <= 0) {
    return [];
  }
  const pool = shuffle(source);
  return pool.slice(0, Math.min(count, pool.length));
}
