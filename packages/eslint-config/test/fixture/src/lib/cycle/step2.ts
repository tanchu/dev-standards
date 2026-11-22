import { step3 } from '@/lib/cycle/step3';

export const step2 = (n: number): number => (n > 0 ? step3(n - 1) : 0);
