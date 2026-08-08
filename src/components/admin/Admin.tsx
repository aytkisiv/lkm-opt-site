import { useCallback, useEffect, useState, FormEvent } from 'react';
import { LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { supabase, type DbCategory } from '../../lib/supabase';
import { CATEGORIES } from '../../data/products';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import StatsTab from './StatsTab';

type Tab = 'products' | 'categories' | 'stats';

const TABS: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Товары' },
  { id: 'categories', label: 'Группы' },
  { id: 'stats', label: 'Сводка' },
];

export default function Admin() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>('products');
  const [cats, setCats] = useState<DbCategory[]>([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const flash = useCallback((t: string) => {
    setMsg(t);
    setTimeout(() => setMsg((m) => (m === t ? '' : m)), 3500);
  }, []);

  /** Группы из базы; пока их там нет — показываем встроенные с пометкой sort: -1. */
  const loadCats = useCallback(async () => {
    const { data } = await supabase!.from('categories').select('*').order('sort');
    setCats(
      data?.length
        ? (data as DbCategory[])
        : CATEGORIES.map((c) => ({
            slug: c.slug,
            name: c.name,
            descr: c.desc,
            photo: c.photo,
            sort: -1,
          }))
    );
  }, []);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authed) loadCats();
  }, [authed, loadCats]);

  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMsg('');
    const { error } = await supabase!.auth.signInWithPassword({
      email: String(f.get('email')),
      password: String(f.get('password')),
    });
    setBusy(false);
    if (error) setMsg('Не удалось войти. Проверьте почту и пароль.');
  }

  if (!ready)
    return (
      <Screen>
        <Loader2 className="w-5 h-5 animate-spin" />
      </Screen>
    );

  if (!supabase)
    return (
      <Screen>
        <div className="max-w-md text-center">
          <AlertTriangle className="w-6 h-6 text-signal mx-auto mb-4" />
          <h1 className="font-display text-2xl mb-3">База не подключена</h1>
          <p className="text-sm text-paper/60 leading-relaxed">
            Не заданы переменные <code className="text-paper">VITE_SUPABASE_URL</code> и{' '}
            <code className="text-paper">VITE_SUPABASE_ANON_KEY</code>. Сайт работает на
            встроенном прайсе.
          </p>
        </div>
      </Screen>
    );

  if (!authed)
    return (
      <Screen>
        <form onSubmit={login} className="w-full max-w-sm">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-paper/45 mb-3">
            ЛКМ ОПТ — панель управления
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

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="border-b border-white/10 px-5 sm:px-8 py-4 flex items-center justify-between sticky top-0 bg-ink z-10">
        <div>
          <div className="font-display font-semibold tracking-[0.3em] text-sm">ЛКМ ОПТ</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/40 mt-1">
            Панель управления
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

      <nav className="border-b border-white/10 px-5 sm:px-8 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-mono text-[11px] uppercase tracking-[0.2em] px-4 py-4 border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-signal text-paper'
                : 'border-transparent text-paper/45 hover:text-paper'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="px-5 sm:px-8 py-8 max-w-5xl mx-auto">
        {tab === 'products' && <ProductsTab cats={cats} flash={flash} />}
        {tab === 'categories' && <CategoriesTab cats={cats} reload={loadCats} flash={flash} />}
        {tab === 'stats' && <StatsTab flash={flash} />}
      </main>

      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-paper text-ink font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-3 max-w-[90vw] text-center">
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
