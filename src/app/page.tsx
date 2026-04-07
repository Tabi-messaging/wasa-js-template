'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Tab = 'send' | 'media' | 'poll' | 'location' | 'contact' | 'contacts' | 'conversations' | 'channels';

const TABS: { id: Tab; label: string }[] = [
  { id: 'send', label: 'Send Text' },
  { id: 'media', label: 'Send Media' },
  { id: 'poll', label: 'Send Poll' },
  { id: 'location', label: 'Send Location' },
  { id: 'contact', label: 'Send Contact' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'channels', label: 'Channels' },
];

async function api(body: Record<string, unknown>) {
  const res = await fetch('/api/tabi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {children}
    </label>
  );
}

const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800';
const btn = 'rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50';
const btnSec = 'rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

export default function Home() {
  const [tab, setTab] = useState<Tab>('send');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [channelId, setChannelId] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/tabi').then(r => r.json()).then(d => {
      setConfigured(d.configured);
      if (d.channelId) setChannelId(d.channelId);
    });
  }, []);

  const run = useCallback(async (body: Record<string, unknown>) => {
    setLoading(true);
    setResult('');
    try {
      const r = await api({ ...body, channelId });
      setResult(JSON.stringify(r, null, 2));
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  if (configured === null) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>;
  }

  if (!configured) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold">Setup required</h1>
          <p className="mt-3 text-sm text-slate-500">
            Copy <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">.env.example</code> to{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">.env</code> and fill in your credentials:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`TABI_API_KEY=tk_your_key
TABI_BASE_URL=https://api.c36.online/api/v1
TABI_CHANNEL_ID=your-channel-id`}
          </pre>
          <p className="mt-4 text-xs text-slate-400">Then restart the dev server.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h1 className="text-lg font-bold tracking-tight text-indigo-600">Wasa</h1>
          <p className="text-[11px] text-slate-400">tabi-sdk template</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setResult(''); }}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <Field label="Channel ID">
            <input className={input} value={channelId} onChange={e => setChannelId(e.target.value)} placeholder="uuid..." />
          </Field>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">{TABS.find(t => t.id === tab)?.label}</h2>
        </header>

        <div className="flex flex-1 gap-6 overflow-y-auto p-6">
          {/* Form panel */}
          <div className="w-full max-w-md space-y-4">
            {tab === 'send' && <SendText run={run} loading={loading} />}
            {tab === 'media' && <SendMedia run={run} loading={loading} setResult={setResult} setLoading={setLoading} channelId={channelId} />}
            {tab === 'poll' && <SendPoll run={run} loading={loading} />}
            {tab === 'location' && <SendLocation run={run} loading={loading} />}
            {tab === 'contact' && <SendContactCard run={run} loading={loading} />}
            {tab === 'contacts' && <Contacts run={run} loading={loading} />}
            {tab === 'conversations' && <Conversations run={run} loading={loading} />}
            {tab === 'channels' && <Channels run={run} loading={loading} />}
          </div>

          {/* Result panel */}
          <div className="flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Response</p>
            <pre className="min-h-[200px] overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-emerald-300">
              {loading ? 'Sending...' : result || 'No response yet.'}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ────────── Tab Components ────────── */

function SendText({ run, loading }: { run: (b: Record<string, unknown>) => Promise<void>; loading: boolean }) {
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); run({ action: 'messages.send', to, content }); }} className="space-y-4">
      <Field label="Recipient (with country code)"><input className={input} value={to} onChange={e => setTo(e.target.value)} placeholder="2348012345678" required /></Field>
      <Field label="Message"><textarea className={input + ' min-h-[100px]'} value={content} onChange={e => setContent(e.target.value)} placeholder="Hello from Wasa!" required /></Field>
      <button type="submit" className={btn} disabled={loading}>Send Text Message</button>
    </form>
  );
}

function SendMedia({
  run, loading, setResult, setLoading, channelId,
}: {
  run: (b: Record<string, unknown>) => Promise<void>;
  loading: boolean;
  setResult: (s: string) => void;
  setLoading: (b: boolean) => void;
  channelId: string;
}) {
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  const [messageType, setType] = useState('image');
  const [mediaUrl, setUrl] = useState('');
  const [useFile, setUseFile] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      let finalUrl = mediaUrl;

      if (useFile) {
        const file = fileRef.current?.files?.[0];
        if (!file) { setResult('Please select a file.'); setLoading(false); return; }
        setResult('Uploading file...');
        finalUrl = await uploadFile(file);
        setResult('File uploaded — sending message...');
      }

      const r = await api({
        action: 'messages.send',
        channelId,
        to,
        content: content || file_caption(messageType),
        messageType,
        mediaUrl: finalUrl,
      });
      setResult(JSON.stringify(r, null, 2));
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Recipient"><input className={input} value={to} onChange={e => setTo(e.target.value)} placeholder="2348012345678" required /></Field>
      <Field label="Media type">
        <select className={input} value={messageType} onChange={e => setType(e.target.value)}>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="document">Document</option>
        </select>
      </Field>

      <div className="flex gap-2">
        <button type="button" onClick={() => setUseFile(true)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${useFile ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Upload file</button>
        <button type="button" onClick={() => setUseFile(false)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${!useFile ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>Paste URL</button>
      </div>

      {useFile ? (
        <Field label="Choose file (max 16 MB)">
          <input ref={fileRef} type="file" accept={acceptFor(messageType)} className={input} required />
          <p className="mt-1 text-xs text-slate-400">Images up to 5 MB, videos up to 16 MB, documents up to 16 MB</p>
        </Field>
      ) : (
        <Field label="Media URL (must be publicly accessible)">
          <input className={input} value={mediaUrl} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/photo.jpg" required />
        </Field>
      )}

      <Field label="Caption / text"><input className={input} value={content} onChange={e => setContent(e.target.value)} placeholder="Check this out!" /></Field>
      <button type="submit" className={btn} disabled={loading}>Send Media</button>
    </form>
  );
}

function acceptFor(type: string) {
  switch (type) {
    case 'image': return 'image/*';
    case 'video': return 'video/*';
    case 'audio': return 'audio/*';
    default: return '*/*';
  }
}

function file_caption(type: string) {
  return `Sent via Wasa (${type})`;
}

function SendPoll({ run, loading }: { run: (b: Record<string, unknown>) => Promise<void>; loading: boolean }) {
  const [to, setTo] = useState('');
  const [question, setQuestion] = useState('');
  const [optionsText, setOpts] = useState('Option 1\nOption 2\nOption 3');
  const [maxAnswer, setMax] = useState(1);
  return (
    <form onSubmit={e => {
      e.preventDefault();
      const options = optionsText.split('\n').map(o => o.trim()).filter(Boolean);
      run({ action: 'messages.sendPoll', to, question, options, maxAnswer });
    }} className="space-y-4">
      <Field label="Recipient"><input className={input} value={to} onChange={e => setTo(e.target.value)} placeholder="2348012345678" required /></Field>
      <Field label="Poll question"><input className={input} value={question} onChange={e => setQuestion(e.target.value)} placeholder="What's your favourite?" required /></Field>
      <Field label="Options (one per line)"><textarea className={input + ' min-h-[100px]'} value={optionsText} onChange={e => setOpts(e.target.value)} required /></Field>
      <Field label="Max selectable answers"><input className={input} type="number" min={1} value={maxAnswer} onChange={e => setMax(+e.target.value)} /></Field>
      <button type="submit" className={btn} disabled={loading}>Send Poll</button>
    </form>
  );
}

function SendLocation({ run, loading }: { run: (b: Record<string, unknown>) => Promise<void>; loading: boolean }) {
  const [to, setTo] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); run({ action: 'messages.sendLocation', to, latitude: lat, longitude: lng }); }} className="space-y-4">
      <Field label="Recipient"><input className={input} value={to} onChange={e => setTo(e.target.value)} placeholder="2348012345678" required /></Field>
      <Field label="Latitude"><input className={input} type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} placeholder="6.5244" required /></Field>
      <Field label="Longitude"><input className={input} type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} placeholder="3.3792" required /></Field>
      <button type="submit" className={btn} disabled={loading}>Send Location</button>
    </form>
  );
}

function SendContactCard({ run, loading }: { run: (b: Record<string, unknown>) => Promise<void>; loading: boolean }) {
  const [to, setTo] = useState('');
  const [contactName, setName] = useState('');
  const [contactPhone, setPhone] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); run({ action: 'messages.sendContact', to, contactName, contactPhone }); }} className="space-y-4">
      <Field label="Recipient"><input className={input} value={to} onChange={e => setTo(e.target.value)} placeholder="2348012345678" required /></Field>
      <Field label="Contact name"><input className={input} value={contactName} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required /></Field>
      <Field label="Contact phone"><input className={input} value={contactPhone} onChange={e => setPhone(e.target.value)} placeholder="2348099999999" required /></Field>
      <button type="submit" className={btn} disabled={loading}>Send Contact Card</button>
    </form>
  );
}

function Contacts({ run, loading }: { run: (b: Record<string, unknown>) => Promise<void>; loading: boolean }) {
  return (
    <div className="space-y-4">
      <button className={btn} onClick={() => run({ action: 'contacts.list' })} disabled={loading}>List Contacts</button>
      <p className="text-xs text-slate-400">Or create one:</p>
      <CreateContact run={run} loading={loading} />
    </div>
  );
}

function CreateContact({ run, loading }: { run: (b: Record<string, unknown>) => Promise<void>; loading: boolean }) {
  const [phone, setPhone] = useState('');
  const [firstName, setFirst] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); run({ action: 'contacts.create', data: { phone, firstName } }); }} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <Field label="Phone"><input className={input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="2348012345678" required /></Field>
      <Field label="First name"><input className={input} value={firstName} onChange={e => setFirst(e.target.value)} placeholder="John" required /></Field>
      <button type="submit" className={btnSec} disabled={loading}>Create Contact</button>
    </form>
  );
}

function Conversations({ run, loading }: { run: (b: Record<string, unknown>) => Promise<void>; loading: boolean }) {
  return <button className={btn} onClick={() => run({ action: 'conversations.list' })} disabled={loading}>List Conversations</button>;
}

function Channels({ run, loading }: { run: (b: Record<string, unknown>) => Promise<void>; loading: boolean }) {
  return (
    <div className="space-y-3">
      <button className={btn} onClick={() => run({ action: 'channels.list' })} disabled={loading}>List Channels</button>
      <button className={btnSec} onClick={() => run({ action: 'channels.status' })} disabled={loading}>Channel Status</button>
    </div>
  );
}
