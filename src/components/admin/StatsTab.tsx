import { useEffect, useState } from 'react';
import { supabase, type DbOrder } from '../../lib/supabase';
import { Label } from './ui';

const DAY = 86_400_000;

export default function StatsTab({ flash }: { flash: (t: string) => void }) {
  const [orders, setOrders] = useState<DbOrder[] | null>(null);

  useEffect(() => {
    supabase!
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          flash('Не удалось загрузить заявки: ' + error.message);
          setOrders([]);
          return;
        }
        setOrders((data as DbOrder[]) || []);
      });
  }, []);

  if (orders === null) return <p className="text-sm text-paper/50">Загружаем…</p>;

  if (orders.length === 0)
    return (
      <div className="border border-white/12 p-6">
        <p className="text-sm text-paper/60 leading-relaxed">
          Заявок пока нет. Как только с сайта придёт первое обращение, здесь появится
          статистика: сколько заявок приходит, что чаще всего спрашивают и сколько висит
          необработанными.
        </p>
      </div>
    );

  const now = Date.now();
  const since = (days: number) => orders.filter((o) => now - +new Date(o.created_at) < days * DAY);
  const byStatus = (s: string) => orders.filter((o) => o.status === s).length;

  // что спрашивают чаще всего — главный сигнал для закупок
  const top = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      const k = o.product?.trim();
      if (k) acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // заявки по дням за две недели
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * DAY);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(d),
      n: orders.filter((o) => o.created_at.slice(0, 10) === key).length,
    };
  });
  const peak = Math.max(1, ...days.map((d) => d.n));

  const tiles = [
    { v: since(1).length, l: 'за сутки' },
    { v: since(7).length, l: 'за неделю' },
    { v: since(30).length, l: 'за месяц' },
    { v: orders.length, l: 'всего' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10">
        {tiles.map((t) => (
          <div key={t.l} className="bg-ink p-5">
            <div className="font-display text-3xl sm:text-4xl font-light">{t.v}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40 mt-2">
              {t.l}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-white/12 p-5">
          <Label>Состояние заявок</Label>
          {[
            { k: 'new', n: byStatus('new'), t: 'Новые, ещё не взяли' },
            { k: 'in_work', n: byStatus('in_work'), t: 'В работе' },
            { k: 'done', n: byStatus('done'), t: 'Завершённые' },
          ].map((s) => (
            <div key={s.k} className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0">
              <span className="text-sm text-paper/75">{s.t}</span>
              <span className="font-mono text-sm">{s.n}</span>
            </div>
          ))}
          {byStatus('new') > 0 && (
            <p className="mt-4 text-[12px] text-signal leading-relaxed">
              Необработанных заявок: {byStatus('new')}. Их видно в боте по кнопке «Клиенты».
            </p>
          )}
        </div>

        <div className="border border-white/12 p-5">
          <Label>Что спрашивают чаще всего</Label>
          {top.length === 0 && (
            <p className="text-sm text-paper/45">
              Пока не из чего считать — заявки приходили без конкретной позиции.
            </p>
          )}
          {top.map(([name, n]) => (
            <div key={name} className="flex items-center gap-3 py-2">
              <span className="text-sm text-paper/75 flex-1 truncate">{name}</span>
              <div className="w-24 h-1.5 bg-white/10">
                <div className="h-full bg-signal" style={{ width: `${(n / top[0][1]) * 100}%` }} />
              </div>
              <span className="font-mono text-xs text-paper/60 w-6 text-right">{n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-white/12 p-5">
        <Label>Заявки по дням, две недели</Label>
        <div className="flex items-end gap-1.5 h-32 mt-4">
          {days.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full bg-paper/80"
                  style={{ height: `${(d.n / peak) * 100}%`, minHeight: d.n ? '3px' : '0' }}
                  title={`${d.label}: ${d.n}`}
                />
              </div>
              <span className="font-mono text-[9px] text-paper/35">{d.label.slice(0, 2)}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[12px] text-paper/40 leading-relaxed max-w-2xl">
        Здесь считаются только обращения с сайта. Сумм сделок нет намеренно: система не знает,
        чем закончился разговор с клиентом, и любые цифры выручки были бы выдумкой.
      </p>
    </div>
  );
}
