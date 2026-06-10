# Murmur — voice journal

Speak your day. Murmur records a voice note, transcribes it live in the browser,
and uses Claude to distill it into a journal entry plus individual, checkable tasks.

This is the v2 rewrite of VoiceTaskFlow.

## How it works

1. Tap the orb on **Today** and talk. The Web Speech API transcribes on-device.
2. Tap again to save. The transcript is sent to `/api/entries`, where Claude
   (structured JSON output) extracts a summary, a mood, and a task list.
3. Tasks land as individual rows you can check off, edit, or delete. Open tasks
   from previous days carry over until you finish them.
4. **Journal** shows the full timeline with a day streak and completion stats.

Without an `ANTHROPIC_API_KEY`, a keyword heuristic extracts tasks instead, so
the app works end-to-end with no AI key.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Neon Postgres + Drizzle ORM
- `@anthropic-ai/sdk` with JSON-schema structured outputs
- Web Speech API (no audio leaves the browser; only the text transcript is stored)

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL (+ ANTHROPIC_API_KEY optional)
npm run db:push              # create tables
npm run dev
```

Speech recognition works in Chrome and Safari. Other browsers fall back to typing.
