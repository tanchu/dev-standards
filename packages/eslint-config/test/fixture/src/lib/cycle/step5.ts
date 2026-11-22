import { step6 } from '@/lib/cycle/step6';

export const step5 = (n: number): number => (n > 0 ? step6(n - 1) : 0);
