import { motion } from 'framer-motion';
import LazyVideo from './LazyVideo';
import { useOrder } from './OrderModal';

// Расплавленный металл в цехе (Pexels) — внутри арки-маски.
// HD вместо UHD: 4K-декодирование заметно дёргало скролл.
const ARCH_VIDEO =
  'https://videos.pexels.com/video-files/5121701/5121701-hd_1920_1080_25fps.mp4';

const STATS = [
  { value: '500+', label: 'Позиций ЛКМ в каталоге' },
  { value: '100%', label: 'Соблюдение сроков поставки' },
  { value: '10+', label: 'Лет в оптовых поставках' },
  { value: '7', label: 'Заводов-производителей' },
  { value: '24 ч', label: 'Отгрузка со склада' },
];

const BRANDS = [
  'MASSCO',
  'АКРУС-АКЗ',
  'М ЛАК',
  'МОРОЗОВСКИЙ ХИМЗАВОД',
  'ПК КУРС',
  'СПЕЦПОЛИМЕР',
  'ХОЛДИНГ ВМП',
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
});

export default function Stats() {
  const { openOrder } = useOrder();
  return (
    <section id="about" className="relative w-full min-h-screen bg-ink grain flex flex-col">
      <div className="flex-1 grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center px-5 sm:px-8 md:px-12 pt-24 md:pt-32 pb-12 sm:pb-16 max-w-[1600px] mx-auto w-full">
        <div>
          <motion.div
            {...fadeUp(0)}
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-paper/45 mb-8"
          >
            / 03 — О компании
          </motion.div>

          <motion.h2
            {...fadeUp(0.1)}
            className="font-display font-medium leading-[1.06] tracking-[-0.02em] text-4xl sm:text-5xl lg:text-6xl max-w-2xl"
          >
            Поставки, которые{' '}
            <span className="font-serif italic font-normal text-paper/90">
              не останавливают стройку
            </span>
          </motion.h2>

          <motion.p
            {...fadeUp(0.2)}
            className="mt-8 text-paper/60 text-sm sm:text-base leading-relaxed max-w-lg"
          >
            Более десяти лет строительные компании и промышленные подрядчики
            закрывают через нас потребность в специализированных защитных
            покрытиях — от антикоррозионных грунтов до полисилоксановых эмалей
            для мостов.
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 sm:gap-x-10 gap-y-10 sm:gap-y-12 mt-12 sm:mt-16">
            {STATS.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(0.15 + i * 0.08)}>
                <div className="font-display text-4xl sm:text-5xl font-light tracking-tight text-paper">
                  {s.value}
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/45 max-w-[180px]">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fadeUp(0.3)}
            className="mt-12 sm:mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
          >
            <p className="text-paper/55 text-sm leading-relaxed max-w-md">
              Специалист отдела продаж — Сергей Маляров.
              <br />
              Пн–Пт, 9:00–18:00 без перерыва.
            </p>
            <button
              onClick={() => openOrder('Заказ звонка')}
              className="shrink-0 self-start sm:self-auto bg-paper text-ink font-mono text-[11px] font-medium uppercase tracking-[0.2em] px-6 py-4 hover:bg-white transition-colors"
            >
              Заказать звонок
            </button>
          </motion.div>
        </div>

        {/* видео в арке */}
        <motion.div
          {...fadeUp(0.25)}
          className="relative justify-self-center lg:justify-self-end w-full max-w-[300px] sm:max-w-[420px] aspect-[3/4] overflow-hidden rounded-t-full"
        >
          <LazyVideo
            src={ARCH_VIDEO}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute bottom-6 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-paper/80">
            Производство · контроль качества
          </div>
        </motion.div>
      </div>

      {/* бегущая строка заводов */}
      <div className="border-t border-white/10 py-5 overflow-hidden">
        <div className="marquee-track flex w-max items-center">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="flex items-center shrink-0">
              <span className="font-mono text-[11px] tracking-[0.3em] text-paper/40 px-10">
                {b}
              </span>
              <span className="w-1 h-1 bg-signal" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
