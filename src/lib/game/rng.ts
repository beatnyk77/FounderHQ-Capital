function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRandom(seed: number, week: number, salt: string): number {
  const hash = salt.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return mulberry32(seed + week * 997 + hash)();
}

export function createSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}