import { readFile } from 'node:fs/promises';
import { readConfig } from './config/env.ts';

export async function loadGreeting(path: string): Promise<string> {
  const { port } = readConfig();
  try {
    const text = await readFile(path, 'utf8');
    return `${text.trim()} on ${String(port)}`;
  } catch (error) {
    throw new Error(`Cannot read ${path}`, { cause: error });
  }
}
