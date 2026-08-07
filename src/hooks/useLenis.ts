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

    const lenis = new Lenis({ lerp: 0.09 });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
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
