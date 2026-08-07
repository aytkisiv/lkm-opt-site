import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LazyVideo from './LazyVideo';

// Промышленная покраска металла распылителем (Pexels, свободная лицензия).
// Заменяется на сгенерированный ролик: положите файл в /public и поменяйте ссылку.
const HERO_VIDEO =
  'https://videos.pexels.com/video-files/11887089/11887089-hd_1920_1080_25fps.mp4';

const appear = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero() {
  return (
    <section id="top" className="relative w-full h-[100svh] overflow-hidden grain">
      <LazyVideo
        src={HERO_VIDEO}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* затемнение для читаемости */}
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50" />

      {/* верхний правый абзац — на мобилке прячем, он мешает заголовку */}
      <motion.p
        {...appear(0.3)}
        className="hidden sm:block absolute top-28 right-8 md:right-12 z-10 max-w-sm text-right text-sm md:text-[15px] leading-relaxed text-paper/75"
      >
        Оптовые поставки промышленных лакокрасочных материалов: грунт-эмали,
        грунты, эмали и мастики со склада в Екатеринбурге.{' '}
        <span className="text-paper font-semibold">
          Мы приближаем ваш объект к сдаче.
        </span>
      </motion.p>

      {/* нижний блок */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 sm:px-8 md:px-12 pb-6 sm:pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8">
          <motion.h1
            {...appear(0.5)}
            className="font-display font-medium leading-[1.04] tracking-[-0.02em] text-[2.2rem] sm:text-6xl lg:text-[5rem] max-w-4xl"
          >
            Покрытия, которые
            <br />
            работают десятилетиями
          </motion.h1>

          <motion.a
            {...appear(0.7)}
            href="#catalog"
            className="group flex items-center justify-between gap-10 bg-black/70 border border-white/15 px-6 sm:px-7 py-4 sm:py-5 font-mono text-xs uppercase tracking-[0.2em] text-paper hover:bg-black/90 transition-colors shrink-0 w-full sm:w-auto"
          >
            Смотреть каталог
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
          </motion.a>
        </div>

        {/* техническая строка */}
        <motion.div
          {...appear(0.9)}
          className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-white/15 flex flex-wrap gap-x-6 sm:gap-x-10 gap-y-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-paper/50"
        >
          <span>Екатеринбург</span>
          <span className="hidden sm:inline">Поставки по РФ</span>
          <span>ПН–ПТ / 9:00–18:00</span>
          <span className="hidden md:inline">Работаем с 2015</span>
          <span className="text-signal">LKM-OPT2024@MAIL.RU</span>
        </motion.div>
      </div>
    </section>
  );
}
