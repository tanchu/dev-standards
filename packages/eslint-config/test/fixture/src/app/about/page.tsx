import { Button } from '@/components/button';
import { SharedNote } from '../_components/shared-note';
import { Card } from '../shop/_components/card';
import { aboutTitle } from './_components/content.en';
import { Hero } from './_components/hero';

export { Price } from '@/app/shop/_components/card';

export default function AboutPage() {
  return (
    <main>
      <Hero title={aboutTitle} />
      <Card />
      <SharedNote />
      <Button />
    </main>
  );
}
