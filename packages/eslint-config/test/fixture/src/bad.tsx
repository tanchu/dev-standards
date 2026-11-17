import type React from 'react';

const BOX_CLASS = 'gap-y-[60px] max-w-[1200px]';

export function Bad({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${BOX_CLASS} text-[13px] max-[959px]:px-4 fx-reveal bg-[#384c3c]`}>
      <img src="/a.png" />
      {children}
    </div>
  );
}
