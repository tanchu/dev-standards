import { step5 } from '@/lib/cycle/step5';

export const step4 = (n: number): number => (n > 0 ? step5(n - 1) : 0);
