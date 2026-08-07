import { useEffect, useState, FormEvent } from 'react';
import { Trash2, Plus, LogOut, Check, Loader2, AlertTriangle } from 'lucide-react';
import { supabase, type DbProduct } from '../../lib/supabase';
import { CATEGORIES } from '../../data/products';

type Row = DbProduct & { dirty?: boolean };

export default function Admin() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [cat, setCat] = useState<string>(CATEGORIES[0].slug);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function load() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category')
      .order('sort');
    if (error) return setMsg('Не удалось загрузить прайс: ' + error.message);
    setRows((data as DbProduct[]) || []);
  }

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg('');
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get('email')),
      password: String(f.get('password')),
    });
    setBusy(false);
    if (error) setMsg('Не удалось войти. Проверьте почту и пароль.');
  }

  async function save(row: Row) {
    if (!supabase) return;
    if (!row.name.trim()) return setMsg('У товара должно быть название');
    setBusy(true);
    const { error } = await supabase
      .from('products')
      .update({
        name: row.name.trim(),
        note: row.note?.trim() || null,
        price: row.price,
      })
      .eq('id', row.id);
    setBusy(false);
    if (error) return setMsg('Ошибка сохранения: ' + error.message);
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, dirty: false } : r)));
    flash('Сохранено');
  }

  async function remove(row: Row) {
    if (!supabase) return;
    if (!confirm(`Удалить «${row.name}»? Отменить будет нельзя.`)) return;
    setBusy(true);
    const { error } = await supabase.from('products').delete().eq('id', row.id);
    setBusy(false);
    if (error) return setMsg('Ошибка удаления: ' + error.message);
    setRows((rs) => rs.filter((r) => r.id !== row.id));
    flash('Товар удалён');
  }

  async function add() {
    if (!supabase) return;
    setBusy(true);
    const maxSort = Math.max(0, ...rows.filter((r) => r.category === cat).map((r) => r.sort));
    const { data, error } = await supabase
      .from('products')
      .insert({ category: cat, name: 'Новый товар', price: 0, sort: maxSort + 1 })
      .select()
      .single();
    setBusy(false);
    if (error) return setMsg('Ошибка добавления: ' + error.message);
    setRows((rs) => [...rs, data as DbProduct]);
    flash('Товар добавлен — впишите название и цену');
  }

  /** Первичное наполнение: переносим прайс из кода в базу. */
  async function seed() {
    if (!supabase) return;
    if (!confirm('Загрузить в базу текущий прайс сайта? Это делается один раз.')) return;
    setBusy(true);
    const payload = CATEGORIES.flatMap((c) =>
      c.products.map((p, i) => ({
        category: c.slug,
        name: p.name,
        note: p.note ?? null,
        price: p.price,
        sort: i,
      }))
    );
    const { error } = await supabase.from('products').insert(payload);
    setBusy(false);
    if (error) return setMsg('Ошибка импорта: ' + error.message);
    await load();
    flash(`Загружено позиций: ${payload.length}`);
  }

  function flash(t: string) {
    setMsg(t);
    setTimeout(() => setMsg((m) => (m === t ? '' : m)), 3000);
  }

  function edit(id: string, patch: Partial<DbProduct>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch, dirty: true } : r)));
  }

  // --- экраны ---

  if (!ready) return <Screen><Loader2 className="w-5 h-5 animate-spin" /></Screen>;

  if (!supabase)
    return (
      <Screen>
        <div className="max-w-md text-center">
          <AlertTriangle className="w-6 h-6 text-signal mx-auto mb-4" />
          <h1 className="font-display text-2xl mb-3">База не подключена</h1>
          <p className="text-sm text-paper/60 leading-relaxed">
            Не заданы переменные <code className="text-paper">VITE_SUPABASE_URL</code> и{' '}
            <code className="text-paper">VITE_SUPABASE_ANON_KEY</code>. Сайт сейчас работает
            на встроенном прайсе.
          </p>
        </div>
      </Screen>
    );

  if (!authed)
    return (
      <Screen>
        <form onSubmit={login} className="w-full max-w-sm">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-paper/45 mb-3">
            ЛКМ ОПТ — управление прайсом
          </div>
          <h1 className="font-display text-3xl font-medium mb-8">Вход</h1>
          <input
            name="email"
            type="email"
            required
            placeholder="Почта"
            className="w-full bg-transparent border-b border-white/20 focus:border-paper outline-none py-3 text-sm mb-5 placeholder:text-paper/40"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Пароль"
            className="w-full bg-transparent border-b border-white/20 focus:border-paper outline-none py-3 text-sm mb-8 placeholder:text-paper/40"
          />
          <button
            disabled={busy}
            className="w-full bg-paper text-ink font-mono text-[11px] uppercase tracking-[0.2em] py-4 hover:bg-white transition-colors disabled:opacity-60"
          >
            {busy ? 'Входим…' : 'Войти'}
          </button>
          {msg && <p className="mt-4 text-[12px] text-signal">{msg}</p>}
        </form>
      </Screen>
    );

  const visible = rows.filter((r) => r.category === cat);

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="border-b border-white/10 px-5 sm:px-8 py-4 flex items-center justify-between sticky top-0 bg-ink z-10">
        <div>
          <div className="font-display font-semibold tracking-[0.3em] text-sm">ЛКМ ОПТ</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40 mt-1">
            Управление прайсом
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60 hover:text-paper"
          >
            На сайт
          </a>
          <button
            onClick={() => supabase!.auth.signOut()}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/60 hover:text-paper"
          >
            <LogOut className="w-3.5 h-3.5" /> Выйти
          </button>
        </div>
      </header>

      <main className="px-5 sm:px-8 py-8 max-w-5xl mx-auto">
        {rows.length === 0 && (
          <div className="border border-white/15 p-6 mb-8">
            <p className="text-sm text-paper/70 mb-4">
              База пустая. Можно перенести в неё прайс, который сейчас показывает сайт, —
              все {CATEGORIES.reduce((n, c) => n + c.products.length, 0)} позиций.
            </p>
            <button
              onClick={seed}
              disabled={busy}
              className="bg-paper text-ink font-mono text-[11px] uppercase tracking-[0.2em] px-6 py-3 hover:bg-white transition-colors disabled:opacity-60"
            >
              Импортировать текущий прайс
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={`font-mono text-[10px] uppercase tracking-[0.18em] px-4 py-2.5 border transition-colors ${
                c.slug === cat
                  ? 'bg-paper text-ink border-paper'
                  : 'border-white/15 text-paper/50 hover:text-paper'
              }`}
            >
              {c.name}
              <span className="ml-2 opacity-60">
                {rows.filter((r) => r.category === c.slug).length}
              </span>
            </button>
          ))}
        </div>

        <div className="hidden sm:grid grid-cols-[1fr_1fr_110px_150px] gap-3 px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/40">
          <span>Название</span>
          <span>Уточнение</span>
          <span>Цена, ₽/кг</span>
          <span />
        </div>

        <div className="border-t border-white/10">
          {visible.map((row) => (
            <div
              key={row.id}
              className="grid sm:grid-cols-[1fr_1fr_110px_150px] gap-3 items-center border-b border-white/10 px-3 py-3"
            >
              <input
                value={row.name}
                onChange={(e) => edit(row.id, { name: e.target.value })}
                className="bg-transparent border border-transparent hover:border-white/15 focus:border-paper outline-none px-2 py-2 text-sm"
              />
              <input
                value={row.note ?? ''}
                placeholder="—"
                onChange={(e) => edit(row.id, { note: e.target.value })}
                className="bg-transparent border border-transparent hover:border-white/15 focus:border-paper outline-none px-2 py-2 text-sm text-paper/70 placeholder:text-paper/25"
              />
              <input
                type="number"
                min={0}
                value={row.price}
                onChange={(e) => edit(row.id, { price: Number(e.target.value) })}
                className="bg-transparent border border-transparent hover:border-white/15 focus:border-paper outline-none px-2 py-2 text-sm font-mono"
              />
              <div className="flex items-center gap-2 justify-end">
                {row.dirty && (
                  <button
                    onClick={() => save(row)}
                    disabled={busy}
                    className="flex items-center gap-1.5 bg-paper text-ink font-mono text-[10px] uppercase tracking-[0.15em] px-3 py-2 hover:bg-white disabled:opacity-60"
                  >
                    <Check className="w-3.5 h-3.5" /> Сохранить
                  </button>
                )}
                <button
                  onClick={() => remove(row)}
                  disabled={busy}
                  aria-label="Удалить"
                  className="p-2 text-paper/40 hover:text-signal transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={add}
          disabled={busy}
          className="mt-6 flex items-center gap-2 border border-white/20 font-mono text-[11px] uppercase tracking-[0.2em] px-5 py-3 hover:border-paper transition-colors disabled:opacity-60"
        >
          <Plus className="w-4 h-4" /> Добавить товар
        </button>

        <p className="mt-8 text-[12px] text-paper/40 leading-relaxed max-w-lg">
          Изменения появляются на сайте сразу после сохранения — посетителю достаточно
          обновить страницу.
        </p>
      </main>

      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-paper text-ink font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-3">
          {msg}
        </div>
      )}
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-5">
      {children}
    </div>
  );
}
