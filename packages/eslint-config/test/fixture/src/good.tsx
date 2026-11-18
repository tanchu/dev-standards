import type { ReactNode } from 'react';

const BOX_CLASS = 'max-w-300 gap-y-15';

export function Good({ children }: { children: ReactNode }) {
  return (
    <div
      className={`
        ${BOX_CLASS}
        fx-reveal w-[1.5px] rounded-[18px] py-[clamp(1.25rem,2vw,2rem)]
        text-small
        max-laptop:px-4
      `}
    >
      {children}
    </div>
  );
}
