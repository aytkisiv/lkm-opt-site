import { createContext, useContext, useEffect, useState, ReactNode, FormEvent } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';

type OrderContextValue = {
  openOrder: (product?: string) => void;
};

const OrderContext = createContext<OrderContextValue>({ openOrder: () => {} });

export const useOrder = () => useContext(OrderContext);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<string | undefined>();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const sent = status === 'sent';

  const openOrder = (p?: string) => {
    setProduct(p);
    setStatus('idle');
    setOpen(true);
  };
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus('sending');
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          comment: data.get('comment'),
          hp: data.get('hp'),
        }),
      });
      if (res.ok) {
        setStatus('sent');
        return;
      }
      // показываем настоящую причину, а не общее «не удалось»
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErrorMsg(body.error || '');
      setStatus('error');
    } catch {
      setErrorMsg('');
      setStatus('error');
    }
  };

  return (
    <OrderContext.Provider value={{ openOrder }}>
      {children}

      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* затемнение */}
        <div className="absolute inset-0 bg-black/75" onClick={close} />

        {/* окно */}
        <div
          className={`relative w-full max-w-md bg-ink border border-white/15 transition-transform duration-300 ${
            open ? 'translate-y-0' : 'translate-y-6'
          }`}
        >
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/10">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-paper/60">
              Заказ
            </span>
            <button
              onClick={close}
              aria-label="Закрыть"
              className="flex items-center justify-center w-8 h-8 border border-white/15 text-paper/70 hover:text-paper hover:border-white/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {sent ? (
            <div className="px-6 sm:px-8 py-12 text-center">
              <div className="mx-auto mb-6 flex items-center justify-center w-12 h-12 border border-paper/30 rounded-full">
                <Check className="w-5 h-5 text-paper" />
              </div>
              <div className="font-display text-2xl font-medium mb-3">
                Заявка отправлена
              </div>
              <p className="text-sm text-paper/60 leading-relaxed max-w-xs mx-auto">
                Менеджер свяжется с вами в рабочее время. Если вопрос срочный —
                звоните:{' '}
                <a href="tel:+73432903323" className="text-paper underline underline-offset-4">
                  8 (343) 290-33-23
                </a>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7">
              {product && (
                <div className="mb-6 px-4 py-3 border border-white/10 bg-white/[0.04]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/45 mb-1">
                    Позиция
                  </div>
                  <div className="text-sm font-medium text-paper">{product}</div>
                </div>
              )}

              <div className="flex flex-col gap-5">
                <input
                  name="name"
                  required
                  placeholder="Ваше имя"
                  className="bg-transparent border-b border-white/20 focus:border-paper outline-none py-3 text-sm text-paper placeholder:text-paper/40 transition-colors"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="bg-transparent border-b border-white/20 focus:border-paper outline-none py-3 text-sm text-paper placeholder:text-paper/40 transition-colors"
                />
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Ваш телефон"
                  className="bg-transparent border-b border-white/20 focus:border-paper outline-none py-3 text-sm text-paper placeholder:text-paper/40 transition-colors"
                />
                <textarea
                  name="comment"
                  rows={3}
                  placeholder="Комментарий"
                  className="bg-transparent border-b border-white/20 focus:border-paper outline-none py-3 text-sm text-paper placeholder:text-paper/40 transition-colors resize-none"
                />
                {/* Ловушка для спам-ботов. Имя нарочно бессмысленное: поле вроде
                    "website" менеджеры паролей на телефонах заполняют сами, и
                    живая заявка молча улетала бы в корзину. */}
                <input
                  name="hp"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute opacity-0 pointer-events-none h-0 w-0"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="group mt-8 w-full flex items-center justify-between bg-paper text-ink font-mono text-[11px] font-medium uppercase tracking-[0.2em] px-6 py-4 hover:bg-white transition-colors disabled:opacity-60"
              >
                {status === 'sending' ? 'Отправляем…' : 'Отправить'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {status === 'error' && (
                <p className="mt-4 text-[12px] text-signal leading-relaxed">
                  {errorMsg || 'Не удалось отправить заявку'}. Или позвоните:{' '}
                  <a href="tel:+73432903323" className="underline underline-offset-4">
                    8 (343) 290-33-23
                  </a>
                </p>
              )}

              <p className="mt-4 text-[11px] text-paper/40 leading-relaxed">
                Нажимая «Отправить», вы соглашаетесь с политикой конфиденциальности.
              </p>
            </form>
          )}
        </div>
      </div>
    </OrderContext.Provider>
  );
}
