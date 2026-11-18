import { Button } from '@/components/button';

export const format = (value: string) => `${value}${String(Button.name)}`;

export const loadCard = () => import('../app/shop/_components/card');
