# Wasa — JavaScript / Next.js Template

A beautiful, ready-to-run boilerplate that showcases every feature of the
[**tabi-sdk**](https://www.npmjs.com/package/tabi-sdk) for WhatsApp messaging.

Clone it, add your credentials, and start sending messages in under 2 minutes.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![tabi-sdk](https://img.shields.io/badge/tabi--sdk-latest-indigo)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

| Feature | Description |
|---------|-------------|
| **Send Text** | Send text messages to any WhatsApp number |
| **Send Media** | Send images, videos, audio, and documents with captions |
| **Send Poll** | Create single/multi-select polls |
| **Send Location** | Share location pins |
| **Send Contact** | Share contact cards |
| **Contacts** | List & create contacts in your workspace |
| **Conversations** | Browse active conversations |
| **Channels** | View channel list & live status |

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/Tabi-messaging/wasa-js-template.git
cd wasa-js-template
```

### 2. Install

```bash
npm install
```

### 3. Configure

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```dotenv
TABI_API_KEY=tk_your_api_key_here
TABI_BASE_URL=https://api.c36.online/api/v1
TABI_CHANNEL_ID=your-channel-id-here
```

**Where to get these values:**

| Variable | Where to find it |
|----------|-----------------|
| `TABI_API_KEY` | Dashboard → Developer → API Keys → Create token |
| `TABI_BASE_URL` | Your Tabi API endpoint (default: `https://api.c36.online/api/v1`) |
| `TABI_CHANNEL_ID` | Dashboard → Channels → click a channel → copy the ID from the URL |

### 4. Run

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) and you're ready to go.

---

## Project Structure

```
wasa-js-template/
├── src/
│   ├── app/
│   │   ├── api/tabi/route.ts   # Server-side SDK proxy
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard UI
│   │   └── globals.css
│   └── lib/
│       └── config.ts           # Reads .env values
├── .env.example
├── package.json
└── README.md
```

The SDK runs **server-side** inside the Next.js API route — your API key is
never exposed to the browser.

---

## How It Works

1. The browser UI (`page.tsx`) sends requests to `/api/tabi` with an `action`
   field.
2. The API route (`route.ts`) creates a `TabiClient` from `tabi-sdk` using your
   `.env` credentials.
3. The matching SDK method is called and the JSON response is returned to the UI.

### Example — Sending a text message

```typescript
import { TabiClient } from 'tabi-sdk';

const tabi = new TabiClient({
  apiKey: 'tk_your_key',
  baseUrl: 'https://api.c36.online/api/v1',
});

const result = await tabi.messages.send('channel-id', {
  to: '2348012345678',
  content: 'Hello from Wasa!',
});
console.log(result);
```

---

## Phone Number Format

Always use full international format **without** the `+` sign:

| Country | Format | Example |
|---------|--------|---------|
| Nigeria | `234XXXXXXXXXX` | `2348012345678` |
| US / Canada | `1XXXXXXXXXX` | `12025551234` |
| UK | `44XXXXXXXXXX` | `447911123456` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Setup required" screen | Make sure `.env` exists and `TABI_API_KEY` is set, then restart `npm run dev` |
| 403 errors | Verify your API key is valid and the channel belongs to your workspace |
| Messages not delivered | Check that the channel is connected and the risk engine status in your dashboard |

---

## Learn More

- [tabi-sdk on npm](https://www.npmjs.com/package/tabi-sdk)
- [tabi/sdk on Packagist (PHP)](https://packagist.org/packages/tabi/sdk)

---

## License

MIT
