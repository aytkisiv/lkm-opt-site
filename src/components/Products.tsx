import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { useOrder } from './OrderModal';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
});

export default function Products() {
  const CATEGORIES = useCatalog();
  const [active, setActive] = useState(0);
  const { openOrder } = useOrder();
  const cat = CATEGORIES[active];
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // плавающее фото категории напротив строки под курсором
  const movePreview = (e: React.MouseEvent) => {
    const list = listRef.current;
    const prev = previewRef.current;
    if (!list || !prev) return;
    const rect = list.getBoundingClientRect();
    const y = Math.min(Math.max(e.clientY - rect.top - 70, 0), rect.height - 140);
    prev.style.transform = `translateY(${y}px)`;
    prev.style.opacity = '1';
  };
  const hidePreview = () => {
    if (previewRef.current) previewRef.current.style.opacity = '0';
  };

  return (
    <section id="products" className="relative w-full bg-ink grain">
      <div className="px-5 sm:px-8 md:px-12 pt-24 md:pt-32 pb-20 md:pb-28 max-w-[1600px] mx-auto">
        <motion.div
          {...fadeUp(0)}
          className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-paper/45 mb-6"
        >
          / 02 — Все позиции
        </motion.div>

        <motion.div
          {...fadeUp(0.05)}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14"
        >
          <h2 className="font-display font-medium leading-[1.06] tracking-[-0.02em] text-4xl sm:text-5xl lg:text-6xl">
            Прайс на материалы
          </h2>
          <p className="text-paper/55 text-sm leading-relaxed max-w-sm">
            Цены указаны за 1 кг при оптовом заказе. Финальную стоимость под
            объём вашего объекта уточняйте у менеджера.
          </p>
        </motion.div>

        {/* табы категорий */}
        <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-2 mb-8 sm:mb-10">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActive(i)}
              className={`font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] px-4 sm:px-5 py-2.5 border transition-colors ${
                i === active
                  ? 'bg-paper text-ink border-paper'
                  : 'border-white/15 text-paper/50 hover:text-paper hover:border-white/40'
              }`}
            >
              {c.name}
              <span className="ml-2 opacity-50">{c.products.length}</span>
            </button>
          ))}
        </motion.div>

        {/* таблица позиций */}
        <motion.div
          {...fadeUp(0.15)}
          ref={listRef}
          className="relative border-t border-white/10"
          onMouseMove={movePreview}
          onMouseLeave={hidePreview}
        >
          {/* превью категории, следует за курсором по вертикали */}
          <div
            ref={previewRef}
            data-static
            className="hidden lg:block absolute right-[220px] top-0 z-10 w-[210px] h-[140px] pointer-events-none overflow-hidden border border-white/15"
            style={{
              opacity: 0,
              transition: 'transform 450ms cubic-bezier(0.22,1,0.36,1), opacity 300ms',
            }}
          >
            <img src={cat.photo} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent font-mono text-[9px] uppercase tracking-[0.2em] text-paper/80">
              {cat.name}
            </div>
          </div>
          {cat.products.map((p, i) => (
            <div
              key={p.name}
              className="group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[56px_1fr_auto_auto] items-center gap-x-4 sm:gap-x-8 border-b border-white/10 py-4 sm:py-5 hover:bg-white/[0.03] transition-colors cursor-pointer"
              onClick={() => openOrder(p.name)}
            >
              <span className="font-mono text-[10px] sm:text-[11px] text-paper/35 pl-1">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-medium text-paper group-hover:text-white transition-colors">
                  {p.name}
                </div>
                {p.note && (
                  <div className="mt-0.5 text-[11px] sm:text-xs text-paper/45 truncate">
                    {p.note}
                  </div>
                )}
              </div>
              <span className="hidden sm:block font-mono text-sm text-paper/70 whitespace-nowrap">
                {p.price} ₽/кг
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openOrder(p.name);
                }}
                className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-paper/60 group-hover:text-paper border border-white/15 group-hover:border-paper/60 px-3 sm:px-5 py-2 sm:py-2.5 transition-colors whitespace-nowrap"
              >
                <span className="sm:hidden font-mono normal-case tracking-normal">{p.price} ₽</span>
                <span className="hidden sm:inline">Заказать</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </motion.div>

        <motion.p
          {...fadeUp(0.1)}
          className="mt-6 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-paper/40"
        >
          Нет нужной позиции? Привезём под заказ —{' '}
          <button
            onClick={() => openOrder()}
            className="text-signal hover:text-paper transition-colors underline underline-offset-4"
          >
            оставьте заявку
          </button>
        </motion.p>
      </div>
    </section>
  );
}
