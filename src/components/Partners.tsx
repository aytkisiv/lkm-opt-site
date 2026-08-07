import { motion } from 'framer-motion';
import { PARTNERS } from '../data/products';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
});

export default function Partners() {
  return (
    <section id="partners" className="relative w-full bg-ink grain border-t border-white/10">
      <div className="px-5 sm:px-8 md:px-12 pt-20 md:pt-28 pb-20 md:pb-28 max-w-[1600px] mx-auto">
        <motion.div
          {...fadeUp(0)}
          className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-paper/45 mb-6"
        >
          / 04 — Нам доверяют
        </motion.div>

        <motion.h2
          {...fadeUp(0.05)}
          className="font-display font-medium leading-[1.06] tracking-[-0.02em] text-4xl sm:text-5xl lg:text-6xl max-w-3xl mb-12 sm:mb-16"
        >
          Наши материалы работают на объектах{' '}
          <span className="font-serif italic font-normal text-paper/90">
            крупнейших компаний
          </span>
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-l border-white/10">
          {PARTNERS.map((p, i) => (
            <motion.div
              key={p.name}
              {...fadeUp(0.05 + (i % 5) * 0.05)}
              className="group relative flex items-center justify-center h-28 sm:h-36 border-b border-r border-white/10 px-6"
            >
              <img
                src={p.logo}
                alt={p.name}
                loading="lazy"
                className="max-h-10 sm:max-h-12 max-w-[70%] object-contain transition-all duration-300 opacity-55 group-hover:opacity-100"
                style={{ filter: 'grayscale(1) invert(1) brightness(1.4)' }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'none')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.filter = 'grayscale(1) invert(1) brightness(1.4)')
                }
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
