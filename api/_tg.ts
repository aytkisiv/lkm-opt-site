// Общее для обработчиков бота.

export const SITE = 'https://lkm-opt-site.vercel.app';

export const CATS = [
  { slug: 'gruntemal', name: 'Грунт-эмаль' },
  { slug: 'grunt', name: 'Грунт' },
  { slug: 'emal', name: 'Эмаль' },
  { slug: 'mastika', name: 'Мастика' },
];

export const BTN = {
  price: '📋 Прайс',
  search: '🔍 Найти товар',
  site: '🌐 Сайт',
  admin: '⚙️ Админка',
};

/** Закреплённая клавиатура под полем ввода. */
export const KEYBOARD = {
  keyboard: [
    [{ text: BTN.price }, { text: BTN.search }],
    [{ text: BTN.site }, { text: BTN.admin }],
  ],
  resize_keyboard: true,
  is_persistent: true,
};

export const token = () => process.env.TELEGRAM_BOT_TOKEN || '';

export const allowedChats = () =>
  (process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export async function tg(method: string, body: unknown) {
  const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) console.error('TG', method, await r.text());
  return r;
}

/**
 * Секрет для проверки, что запрос действительно от Telegram.
 * Считается из токена бота — отдельную переменную заводить не нужно.
 */
export async function webhookSecret() {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('lkm:' + token()));
  return Array.from(new Uint8Array(buf))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export type Item = { name: string; note: string | null; price: number; category: string };

export async function fetchProducts(): Promise<Item[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const r = await fetch(
    `${url}/rest/v1/products?select=name,note,price,category&order=category,sort`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!r.ok) return [];
  return (await r.json()) as Item[];
}
