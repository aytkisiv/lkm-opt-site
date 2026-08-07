import { useEffect, useState } from 'react';

/** Интро-шторка: счётчик 0→100, буквы логотипа, уход вверх. */
export default function Intro() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const DUR = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DUR);
      // замедление к концу, как загрузка
      setCount(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setDone(true);
        setTimeout(() => setGone(true), 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (gone) return null;

  const letters = 'ЛКМ ОПТ'.split('');

  return (
    <div
      className="fixed inset-0 z-[200] bg-ink flex items-center justify-center transition-transform duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
      style={{ transform: done ? 'translateY(-100%)' : 'translateY(0)' }}
    >
      <div className="font-display font-semibold tracking-[0.3em] text-3xl sm:text-5xl text-paper flex">
        {letters.map((ch, i) => (
          <span
            key={i}
            className="inline-block"
            style={{
              opacity: 0,
              animation: `introLetter 500ms ${120 + i * 70}ms cubic-bezier(0.22,1,0.36,1) forwards`,
            }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </div>

      {/* линия прогресса */}
      <div
        className="absolute left-0 bottom-0 h-px bg-signal transition-none"
        style={{ width: `${count}%` }}
      />
      <div className="absolute left-5 sm:left-12 bottom-6 font-mono text-[11px] tracking-[0.25em] text-paper/50">
        ЗАЩИТНЫЕ ПОКРЫТИЯ / {String(count).padStart(3, '0')}%
      </div>

      <style>{`
        @keyframes introLetter {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
