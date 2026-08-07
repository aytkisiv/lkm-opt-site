import { useEffect } from 'react';
import Lenis from 'lenis';

/** Инерционный скролл + плавные переходы по якорям. */
export function useLenis() {
  useEffect(() => {
    // Браузер восстанавливает позицию скролла при перезагрузке — тогда секции
    // выше экрана никогда не попадают в зону видимости и их анимации появления
    // не срабатывают. Плюс сайт всегда должен открываться с интро сверху.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // autoRaf по умолчанию false — без него Lenis перехватит прокрутку и никуда
    // не поедет. Пусть крутит себя сам, свой цикл держим только под страховку.
    const lenis = new Lenis({ lerp: 0.09, autoRaf: true });

    // Страховка для анимаций появления: при быстрой прокрутке или переходе по
    // якорю секция может проскочить мимо наблюдателя и навсегда остаться
    // невидимой. Всё, что уже выше линии взгляда, показываем принудительно.
    const reveal = () => {
      const vh = window.innerHeight;
      document
        .querySelectorAll<HTMLElement>('main [style*="opacity: 0"]:not([data-static])')
        .forEach((el) => {
          if (el.getBoundingClientRect().bottom < vh * 0.85) {
            el.style.opacity = '1';
            el.style.transform = 'none';
          }
        });
    };

    // Lenis 1.3 крутит собственный rAF-цикл, вручную его дёргать не нужно.
    let raf = 0;
    let frame = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (++frame % 10 === 0) reveal();
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const el = document.querySelector(a.getAttribute('href')!);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { duration: 1.4 });
    };
    document.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);
}
