export interface Config {
  port: number;
}

export function readConfig(): Config {
  const raw = process.env['PORT'];
  const port = raw === undefined ? 3000 : Number(raw);
  if (!Number.isInteger(port)) {
    throw new Error(`PORT must be an integer, got ${raw ?? ''}`);
  }
  return { port };
}
