import { useEffect, useRef } from 'react';

type Props = {
  src: string;
  className?: string;
};

/**
 * Фоновое видео, которое ставится на паузу вне вьюпорта —
 * иначе декодирование двух роликов одновременно дёргает скролл.
 */
export default function LazyVideo({ src, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
