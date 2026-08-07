import { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { useOrder } from './OrderModal';

const links = [
  { href: '#catalog', label: 'Каталог' },
  { href: '#products', label: 'Прайс' },
  { href: '#about', label: 'О компании' },
  { href: '#partners', label: 'Партнёры' },
];

export default function Navbar() {
  const { openOrder } = useOrder();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      let current = '';
      for (const l of links) {
        const el = document.querySelector(l.href);
        if (el && (el as HTMLElement).getBoundingClientRect().top <= 120) current = l.href;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-500 ${
        scrolled
          ? 'border-white/10 bg-ink/90 backdrop-blur-sm'
          : 'border-white/10 bg-gradient-to-b from-black/60 to-transparent'
      }`}
    >
      <div className="flex items-stretch justify-between px-5 sm:px-8 md:px-12">
        <a href="#top" className="flex items-center py-4 sm:py-5">
          <span className="font-display text-lg sm:text-xl font-semibold tracking-[0.35em] text-paper">
            ЛКМ&nbsp;ОПТ
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`relative font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${
                active === l.href ? 'text-paper' : 'text-paper/70 hover:text-paper'
              }`}
            >
              {l.label}
              <span
                className={`absolute -bottom-1.5 left-0 h-px bg-signal transition-all duration-300 ${
                  active === l.href ? 'w-full' : 'w-0'
                }`}
              />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="tel:+73432903323"
            aria-label="Позвонить"
            className="hidden lg:block font-mono text-[11px] tracking-[0.15em] text-paper/70 hover:text-paper transition-colors"
          >
            8 (343) 290-33-23
          </a>
          <a
            href="tel:+73432903323"
            aria-label="Позвонить"
            className="lg:hidden flex items-center text-paper/80 hover:text-paper transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
          <button
            onClick={() => openOrder('Прайс-лист')}
            className="flex items-center self-stretch bg-paper text-ink font-mono text-[11px] font-medium uppercase tracking-[0.15em] px-4 sm:px-6 hover:bg-white transition-colors"
          >
            <span className="hidden sm:inline">Получить прайс</span>
            <span className="sm:hidden">Прайс</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
