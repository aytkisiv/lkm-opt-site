import {
  BTN,
  CATS,
  KEYBOARD,
  SITE,
  allowedChats,
  esc,
  fetchProducts,
  tg,
  webhookSecret,
  type Item,
} from './_tg';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  // Telegram шлёт секрет заголовком — так посторонний не сможет дёргать бота
  const secret = await webhookSecret();
  if (req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return new Response('forbidden', { status: 403 });
  }

  const update = (await req.json().catch(() => ({}))) as any;

  if (update.callback_query) await onCallback(update.callback_query);
  else if (update.message?.text) await onMessage(update.message);

  // Telegram всегда ждёт 200, иначе будет слать обновление повторно
  return new Response('ok');
}

function allowed(chatId: number | string) {
  const list = allowedChats();
  return list.length === 0 || list.includes(String(chatId));
}

async function onMessage(msg: any) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  if (!allowed(chatId)) {
    await tg('sendMessage', {
      chat_id: chatId,
      text: 'Этот бот только для сотрудников ЛКМ ОПТ.',
    });
    return;
  }

  if (text === '/start' || text === '/menu') return sendMenu(chatId, msg.from?.first_name);
  if (text === BTN.price || text === '/price') return sendCategories(chatId);
  if (text === BTN.search || text === '/search')
    return void tg('sendMessage', {
      chat_id: chatId,
      text: 'Напишите название или его часть — найду позицию и цену.\n\nНапример: <code>армокот</code>',
      parse_mode: 'HTML',
    });
  if (text === BTN.site)
    return void tg('sendMessage', { chat_id: chatId, text: SITE, reply_markup: KEYBOARD });
  if (text === BTN.admin)
    return void tg('sendMessage', {
      chat_id: chatId,
      text: `Управление прайсом: ${SITE}/admin`,
      reply_markup: KEYBOARD,
    });

  if (text.startsWith('/')) return sendMenu(chatId, msg.from?.first_name);

  return search(chatId, text);
}

async function sendMenu(chatId: number, name?: string) {
  await tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text:
      `<b>ЛКМ ОПТ — бот отдела продаж</b>\n\n` +
      (name ? `Здравствуйте, ${esc(name)}!\n\n` : '') +
      `Сюда падают заявки с сайта. Ещё умею:\n\n` +
      `📋 <b>Прайс</b> — цены по категориям\n` +
      `🔍 <b>Найти товар</b> — просто напишите название\n` +
      `⚙️ <b>Админка</b> — изменить цены и состав прайса\n\n` +
      `Кнопки закреплены внизу экрана.`,
    reply_markup: KEYBOARD,
  });
}

async function sendCategories(chatId: number) {
  await tg('sendMessage', {
    chat_id: chatId,
    text: 'Выберите категорию:',
    reply_markup: {
      inline_keyboard: CATS.map((c) => [{ text: c.name, callback_data: 'cat:' + c.slug }]),
    },
  });
}

function fmt(items: Item[]) {
  return items
    .map((p) => `• <b>${esc(p.name)}</b> — ${p.price} ₽/кг${p.note ? `\n  <i>${esc(p.note)}</i>` : ''}`)
    .join('\n');
}

async function search(chatId: number, query: string) {
  const q = query.toLowerCase();
  const all = await fetchProducts();
  if (all.length === 0) {
    await tg('sendMessage', { chat_id: chatId, text: 'Не удалось получить прайс. Попробуйте позже.' });
    return;
  }
  const found = all.filter(
    (p) => p.name.toLowerCase().includes(q) || (p.note || '').toLowerCase().includes(q)
  );
  if (found.length === 0) {
    await tg('sendMessage', {
      chat_id: chatId,
      parse_mode: 'HTML',
      text: `По запросу «${esc(query)}» ничего не нашлось.\n\nПопробуйте часть названия — например, <code>виникор</code>.`,
    });
    return;
  }
  await tg('sendMessage', {
    chat_id: chatId,
    parse_mode: 'HTML',
    text: `<b>Найдено: ${found.length}</b>\n\n${fmt(found.slice(0, 25))}`,
  });
}

async function onCallback(cb: any) {
  const chatId = cb.message?.chat?.id;
  const data: string = cb.data || '';

  if (!allowed(chatId)) {
    await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Нет доступа' });
    return;
  }

  if (data.startsWith('cat:')) {
    const slug = data.slice(4);
    const cat = CATS.find((c) => c.slug === slug);
    const items = (await fetchProducts()).filter((p) => p.category === slug);
    await tg('answerCallbackQuery', { callback_query_id: cb.id });
    await tg('sendMessage', {
      chat_id: chatId,
      parse_mode: 'HTML',
      text: items.length
        ? `<b>${cat?.name} — ${items.length} позиций</b>\n\n${fmt(items)}`
        : `В категории «${cat?.name}» пока нет позиций.`,
    });
    return;
  }

  // «Взял в работу» на заявке: отмечаем прямо в сообщении
  if (data === 'take') {
    const who = [cb.from?.first_name, cb.from?.last_name].filter(Boolean).join(' ') || 'менеджер';
    const rows: any[][] = cb.message?.reply_markup?.inline_keyboard || [];
    const kept = rows.filter((row) => !row.some((b: any) => b.callback_data === 'take'));
    kept.push([{ text: `✅ В работе: ${who}`, callback_data: 'noop' }]);
    await tg('answerCallbackQuery', { callback_query_id: cb.id, text: 'Отмечено' });
    await tg('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: cb.message.message_id,
      reply_markup: { inline_keyboard: kept },
    });
    return;
  }

  await tg('answerCallbackQuery', { callback_query_id: cb.id });
}
