import { NextRequest, NextResponse } from 'next/server';
import { TabiClient } from 'tabi-sdk';
import { getConfig } from '@/lib/config';

function client() {
  const cfg = getConfig();
  if (!cfg.apiKey) return null;
  return new TabiClient({ apiKey: cfg.apiKey, baseUrl: cfg.baseUrl });
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: NextRequest) {
  const tabi = client();
  if (!tabi) return json({ error: 'TABI_API_KEY not set — copy .env.example to .env' }, 500);

  const body = await req.json();
  const { action, ...params } = body;
  const cfg = getConfig();
  const channelId = params.channelId || cfg.channelId;

  try {
    let result: unknown;

    switch (action) {
      /* ── Channels ── */
      case 'channels.list':
        result = await tabi.channels.list();
        break;
      case 'channels.status':
        result = await tabi.channels.status(channelId);
        break;

      /* ── Messages ── */
      case 'messages.send':
        result = await tabi.messages.send(channelId, {
          to: params.to,
          content: params.content,
          messageType: params.messageType || 'text',
          mediaUrl: params.mediaUrl || undefined,
        });
        break;
      case 'messages.sendLocation':
        result = await tabi.messages.sendLocation(channelId, {
          to: params.to,
          latitude: params.latitude,
          longitude: params.longitude,
        });
        break;
      case 'messages.sendPoll':
        result = await tabi.messages.sendPoll(channelId, {
          to: params.to,
          question: params.question,
          options: params.options,
          maxAnswer: params.maxAnswer ?? 1,
        });
        break;
      case 'messages.sendContact':
        result = await tabi.messages.sendContact(channelId, {
          to: params.to,
          contactName: params.contactName,
          contactPhone: params.contactPhone,
        });
        break;
      case 'messages.react':
        result = await tabi.messages.react(channelId, params.messageId, {
          emoji: params.emoji,
        });
        break;

      /* ── Contacts ── */
      case 'contacts.list':
        result = await tabi.contacts.list({ page: params.page || 1, limit: params.limit || 20 });
        break;
      case 'contacts.create':
        result = await tabi.contacts.create(params.data);
        break;

      /* ── Conversations ── */
      case 'conversations.list':
        result = await tabi.conversations.list({ page: params.page || 1, limit: params.limit || 20 });
        break;

      /* ── Webhooks ── */
      case 'webhooks.list':
        result = await tabi.webhooks.list();
        break;
      case 'webhooks.create':
        result = await tabi.webhooks.create(params.data);
        break;

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }

    return json({ ok: true, data: result });
  } catch (err: any) {
    return json({ ok: false, error: err.message, status: err.status }, err.status || 500);
  }
}

export async function GET() {
  const cfg = getConfig();
  return json({
    configured: !!cfg.apiKey,
    baseUrl: cfg.baseUrl,
    channelId: cfg.channelId || null,
  });
}
