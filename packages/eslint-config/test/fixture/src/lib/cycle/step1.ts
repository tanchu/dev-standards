import { step2 } from '@/lib/cycle/step2';

export const step1 = (n: number): number => (n > 0 ? step2(n - 1) : 0);
