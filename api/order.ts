export const config = { runtime: 'edge' };

type Payload = {
  product?: string;
  name?: string;
  email?: string;
  phone?: string;
  comment?: string;
  website?: string; // honeypot: люди его не видят, боты заполняют
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const line = (icon: string, label: string, value?: string) =>
  value && value.trim() ? `${icon} <b>${label}:</b> ${esc(value.trim())}\n` : '';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) {
    return json({ error: 'Telegram is not configured' }, 500);
  }

  let data: Payload;
  try {
    data = (await req.json()) as Payload;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  // ловушка для ботов: заполнено — молча делаем вид, что всё хорошо
  if (data.website) return json({ ok: true });

  const name = (data.name || '').trim();
  const phone = (data.phone || '').trim();
  if (name.length < 2 || phone.replace(/\D/g, '').length < 10) {
    return json({ error: 'Укажите имя и телефон' }, 400);
  }

  const time = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Asia/Yekaterinburg',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const text =
    `🔔 <b>Новая заявка с сайта</b>\n\n` +
    line('📦', 'Позиция', data.product) +
    line('👤', 'Имя', name) +
    line('📞', 'Телефон', phone) +
    line('✉️', 'Email', data.email) +
    line('💬', 'Комментарий', data.comment) +
    `\n🕐 ${time} (Екатеринбург)`;

  // кнопки: написать в WhatsApp и скопировать номер одним касанием
  const digits = phone.replace(/\D/g, '').replace(/^8/, '7');
  const keyboard: unknown[][] = [];
  if (digits.length >= 11) {
    keyboard.push([{ text: '💬 Написать в WhatsApp', url: `https://wa.me/${digits}` }]);
  }
  keyboard.push([{ text: '📋 Скопировать телефон', copy_text: { text: phone } }]);

  const results = await Promise.all(
    chatIds.map(async (chat_id) => {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: keyboard },
          disable_web_page_preview: true,
        }),
      });
      const body = (await r.json().catch(() => ({}))) as { description?: string };
      if (!r.ok) console.error('Telegram error:', r.status, body.description);
      return { ok: r.ok, description: body.description };
    })
  );

  if (!results.some((r) => r.ok)) {
    return json(
      {
        error: 'Не удалось отправить заявку',
        // подсказка для настройки; убрать, когда бот заработает
        telegram: results.map((r) => r.description).filter(Boolean),
      },
      502
    );
  }
  return json({ ok: true });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
