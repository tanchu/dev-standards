export type HeadingKind = 'section' | 'card';

const HEADING_KIND_CLASSES: Record<HeadingKind, string> = {
  section: 'font-heading text-[40px] leading-[1.1]',
  card: 'font-heading text-2xl',
};

export function headingStyles(kind: HeadingKind): string {
  return HEADING_KIND_CLASSES[kind];
}
