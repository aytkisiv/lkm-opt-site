import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { useOrder } from './OrderModal';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
});

export default function Footer() {
  const { openOrder } = useOrder();

  return (
    <footer id="contacts" className="relative w-full bg-ink grain border-t border-white/10">
      <div className="px-5 sm:px-8 md:px-12 pt-20 md:pt-28 max-w-[1600px] mx-auto">
        {/* большой призыв */}
        <motion.div {...fadeUp(0)} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-16 md:pb-20 border-b border-white/10">
          <h2 className="font-display font-medium leading-[1.05] tracking-[-0.02em] text-4xl sm:text-6xl lg:text-7xl max-w-3xl">
            Обсудим{' '}
            <span className="font-serif italic font-normal text-paper/90">ваш объект?</span>
          </h2>
          <button
            onClick={() => openOrder()}
            className="group flex items-center justify-between gap-10 bg-paper text-ink px-7 py-5 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors shrink-0 w-full sm:w-auto"
          >
            Оставить заявку
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </motion.div>

        {/* контакты и навигация */}
        <motion.div {...fadeUp(0.1)} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12 md:py-16">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40 mb-4">Телефоны</div>
            <a href="tel:+73432903323" className="block text-sm text-paper/80 hover:text-paper transition-colors mb-2">
              8 (343) 290-33-23
            </a>
            <a href="tel:+79920033013" className="block text-sm text-paper/80 hover:text-paper transition-colors">
              +7 (992) 003-30-13
            </a>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40 mb-4">Почта и мессенджеры</div>
            <a href="mailto:lkm-opt2024@mail.ru" className="block text-sm text-paper/80 hover:text-paper transition-colors mb-2">
              lkm-opt2024@mail.ru
            </a>
            <a
              href="https://wa.me/79920033013"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-paper/80 hover:text-paper transition-colors"
            >
              WhatsApp
              <ArrowUpRight className="w-3.5 h-3.5 text-signal" />
            </a>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40 mb-4">Офис</div>
            <p className="text-sm text-paper/80 leading-relaxed">
              Екатеринбург
              <br />
              Пн–Пт, 9:00–18:00 без перерыва
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40 mb-4">Разделы</div>
            {[
              { href: '#catalog', label: 'Каталог' },
              { href: '#products', label: 'Прайс' },
              { href: '#about', label: 'О компании' },
              { href: '#partners', label: 'Партнёры' },
            ].map((l) => (
              <a key={l.href} href={l.href} className="block text-sm text-paper/80 hover:text-paper transition-colors mb-2">
                {l.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* нижняя строка */}
      <div className="border-t border-white/10">
        <div className="px-5 sm:px-8 md:px-12 py-5 max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40">
            © ООО «ЛКМОПТ», 2015–{new Date().getFullYear()}
          </span>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40 hover:text-paper/80 transition-colors"
          >
            Политика конфиденциальности
          </a>
          <a
            href="#top"
            className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40 hover:text-paper transition-colors"
          >
            Наверх
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
