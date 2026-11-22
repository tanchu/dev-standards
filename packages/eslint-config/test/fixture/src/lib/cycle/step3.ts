import { step4 } from '@/lib/cycle/step4';

export const step3 = (n: number): number => (n > 0 ? step4(n - 1) : 0);
