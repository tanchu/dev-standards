import type { ReactNode } from 'react';

const BOX_CLASS = 'max-w-300 gap-y-15';

export function Good({ children }: { children: ReactNode }) {
  return (
    <div
      className={`
        ${BOX_CLASS}
        fx-reveal text-[14px]
        max-laptop:px-4
      `}
    >
      {children}
    </div>
  );
}
