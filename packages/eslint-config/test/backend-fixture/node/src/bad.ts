import { readFile } from 'fs/promises';

type Status = 'new' | 'paid' | 'sent';

export function label(status: Status) {
  switch (status) {
    case 'new':
      return 'Новый';
    case 'paid':
      return 'Оплачен';
  }
  return '';
}

export async function load(path: string): Promise<string> {
  const port = process.env['PORT'];
  readFile(path, 'utf8');
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    throw `failed: ${String(error)} ${port ?? ''}`;
  }
}
