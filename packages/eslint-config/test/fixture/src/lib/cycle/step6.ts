import { step1 } from '@/lib/cycle/step1';

export const step6 = (n: number): number => (n > 0 ? step1(n - 1) : 0);
