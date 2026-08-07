import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { useOrder } from './OrderModal';

export default function Catalog() {
  const CATEGORIES = useCatalog();
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const { openOrder } = useOrder();
  const cat = CATEGORIES[active];

  useEffect(() => {
    CATEGORIES.forEach((c) => {
      const img = new Image();
      img.src = c.photo;
    });
  }, []);

  const navigate = (dir: 1 | -1) => {
    if (animating) return;
    setAnimating(true);
    setActive((p) => (p + dir + CATEGORIES.length) % CATEGORIES.length);
    setTimeout(() => setAnimating(false), 650);
  };

  return (
    <section
      id="catalog"
      className="relative w-full min-h-[100svh] lg:h-screen overflow-hidden grain bg-ink"
    >
      {/* фото-фоны с кроссфейдом */}
      {CATEGORIES.map((c, i) => (
        <img
          key={c.name}
          src={c.photo}
          alt=""
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[650ms]"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/25 to-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/55" />

      {/* призрачный номер категории */}
      <div className="absolute right-3 sm:right-10 top-20 z-[5] pointer-events-none select-none font-display font-light leading-none text-paper/10 text-[7rem] sm:text-[16rem]">
        0{active + 1}
      </div>

      <div className="relative z-10 min-h-[100svh] lg:h-screen flex flex-col px-5 sm:px-8 md:px-12 pt-20 sm:pt-24 pb-6 sm:pb-8">
        <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-paper/50">
          / 01 — Каталог · 0{active + 1} из 0{CATEGORIES.length}
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-10">
            <div className="max-w-xl">
              <h2
                key={cat.name}
                className="font-display font-medium leading-none tracking-[-0.02em] text-4xl sm:text-7xl lg:text-[6rem]"
                style={{ animation: 'fadeSlide 650ms cubic-bezier(0.22,1,0.36,1)' }}
              >
                {cat.name}
              </h2>
              <p
                key={cat.name + '-d'}
                className="mt-4 sm:mt-6 text-paper/70 text-sm sm:text-base leading-relaxed max-w-md"
                style={{ animation: 'fadeSlide 700ms cubic-bezier(0.22,1,0.36,1)' }}
              >
                {cat.desc}
              </p>

              <div className="flex items-center gap-px mt-6 sm:mt-10">
                <button
                  onClick={() => navigate(-1)}
                  aria-label="Предыдущая категория"
                  className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-black/60 border border-white/15 text-paper hover:bg-black/85 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(1)}
                  aria-label="Следующая категория"
                  className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-paper text-ink hover:bg-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="ml-4 sm:ml-6 hidden md:flex gap-2">
                  {CATEGORIES.map((c, i) => (
                    <button
                      key={c.name}
                      onClick={() => !animating && setActive(i)}
                      className={`font-mono text-[10px] uppercase tracking-[0.18em] px-4 py-2 border transition-colors ${
                        i === active
                          ? 'border-paper text-paper'
                          : 'border-white/15 text-paper/45 hover:text-paper/80'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* позиции и цены */}
            <div
              key={cat.name + '-p'}
              className="w-full lg:w-[380px] bg-black/70 border border-white/10"
              style={{ animation: 'fadeSlide 750ms cubic-bezier(0.22,1,0.36,1)' }}
            >
              <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.25em] text-paper/50">
                Популярные позиции
              </div>
              {cat.products.slice(0, 3).map((p) => (
                <button
                  key={p.name}
                  onClick={() => openOrder(p.name)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-sm text-paper/85">{p.name}</span>
                  <span className="font-mono text-xs text-paper/60">{p.price} ₽/кг</span>
                </button>
              ))}
              <a
                href="#products"
                className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ink bg-paper hover:bg-white transition-colors"
              >
                Все позиции · {cat.products.length}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
