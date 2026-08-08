import type { ReactNode } from 'react';

export const input =
  'bg-transparent border border-transparent hover:border-white/15 focus:border-paper outline-none px-2 py-2 text-sm w-full';

export const btnLight =
  'bg-paper text-ink font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2.5 hover:bg-white transition-colors disabled:opacity-60';

export const btnGhost =
  'border border-white/20 font-mono text-[10px] uppercase tracking-[0.15em] px-4 py-2.5 hover:border-paper transition-colors disabled:opacity-60';

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40 mb-2">
      {children}
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="border border-white/12 p-5">{children}</div>;
}
