export function withTimeout<T>(p: Promise<T>, ms = 1000): Promise<T> {
  let t: NodeJS.Timeout;
  return Promise.race([
    p,
    new Promise<never>((_, rej) => { 
      t = setTimeout(() => rej(new Error('timeout')), ms); 
    }),
  ]).finally(() => clearTimeout(t));
}