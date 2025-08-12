# Talk to the OM – Detailed Implementation Plan

## Goal
Add a “Talk to the OM” capability on the OM Dashboard that:
- Uses Google’s Gemini 2.5 Flash via the new Google Gen AI SDK (`@google/genai`).
- Answers strictly from the single OM markdown document (`docs/Downtown_Highrise_OM.md`).
- Encourages concise, bulleted output where applicable.
- Provides a white card below the existing AI Insights bar that opens an overlay toolbar at the top-right.
- Keeps the overlay open until manually closed and persists open/closed state across OM subpages.
- Renders the LLM response as Markdown.

This plan is designed to be directly actionable by another engineer/model.

---

## Architecture & Tech Choices

- Runtime: Next.js (App Router) + React 19.
- Model: `gemini-2.5-flash` (Developer API / AI Studio key) via `@google/genai`.
  - Optionally switch to Vertex AI auth later; also compatible with `gemini-2.5-flash-lite` for cheaper/faster usage if acceptable.
- Context: Entire `docs/Downtown_Highrise_OM.md` file inlined into the prompt per request (simple and reliable for size at hand).
- Security: Keep API key server-side; do not call model from client.
- UI: New `TalkToOMCard` component and a persistent `OMQueryOverlay` overlay component.
- State persistence: `sessionStorage` + global `window` event to coordinate opening across OM subpages.
- Rendering: Markdown via `react-markdown` with `remark-gfm`.

---

## Files to Add / Modify

- Add: `src/app/api/om-qa/route.ts` (POST endpoint – server-side model call)
- Add: `src/components/om/TalkToOMCard.tsx` (launch entrypoint white card)
- Add: `src/components/om/OMQueryOverlay.tsx` (top-right overlay for question+answer)
- Modify: `src/components/om/DashboardShell.tsx` (mount the overlay globally + persist state)
- Modify: `src/app/project/om/[id]/dashboard/page.tsx` (render card below AI Insights; open overlay via event)
- Docs: this file

---

## Dependencies & Setup

1) Install the Google Gen AI SDK (JS/TS) and Markdown renderer

```bash
npm i @google/genai react-markdown remark-gfm
```

2) Environment variables

Create or update `.env.local` at project root:

```bash
GEMINI_API_KEY=YOUR_API_KEY_FROM_AI_STUDIO
```

Notes:
- Keep `GEMINI_API_KEY` server-side. Never expose it in client code.
- If switching to Vertex AI later, you can initialize the SDK with `{ vertexai: true, project, location }` or with environment variables (`GOOGLE_GENAI_USE_VERTEXAI=true`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`).

---

## API Route: `POST /api/om-qa`

- Purpose: Accepts a single `question` string. Reads `docs/Downtown_Highrise_OM.md` on server, constructs a strict prompt, calls `gemini-2.5-flash`, and returns Markdown text.
- Behavior constraints:
  - “Only answer using the OM document’s content.”
  - If the answer is not in the OM, respond exactly: `I don't know based on the OM document.`
  - Encourage concise, bulleted output when listing.
- Performance: Add `thinkingConfig: { thinkingBudget: 0 }` for lower latency and cost.

Create `src/app/api/om-qa/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 });
    }

    const omPath = path.join(process.cwd(), 'docs', 'Downtown_Highrise_OM.md');
    const omText = await fs.readFile(omPath, 'utf-8');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = [
      'You are answering questions strictly based on the provided Offering Memorandum (OM) content.',
      'Rules:',
      '(1) Only use facts present in the OM text.',
      "(2) If the OM does not contain the answer, reply exactly: I don't know based on the OM document.",
      '(3) Keep responses concise. Use bullet points where listing or summarizing.',
      '(4) Quote figures verbatim.'
    ].join(' ');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                `OM Document (verbatim):\n${omText}\n\n` +
                `User Question:\n${question}\n\n` +
                `Answer using only the OM. If not in the OM, say exactly: "I don't know based on the OM document."`
            }
          ]
        }
      ],
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 },
        // Optional caps for ultra-concise output:
        // maxOutputTokens: 512,
      }
    });

    const answer = (response.text || '').trim();
    return NextResponse.json({ answer });
  } catch (e: any) {
    console.error('om-qa error:', e);
    return NextResponse.json({ error: 'Failed to get answer' }, { status: 500 });
  }
}
```

Notes:
- This reads the OM file on each request. For serverless constraints, consider caching in memory on first use.
- If your platform restricts FS reads at runtime, consider embedding OM content at build time (see Alternatives section).

---

## UI: `TalkToOMCard` (white card)

- Style: white background, border, rounded corners, light shadow; consistent with existing design.
- Location: below the AI Insights bar on the OM Dashboard page.
- Behavior: on click, opens the overlay via a global `window` event. We persist overlay open state by project in `sessionStorage`.

Create `src/components/om/TalkToOMCard.tsx`:

```tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { MessageSquare } from 'lucide-react';

export const TalkToOMCard: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Talk to the OM</h3>
            <p className="text-sm text-gray-600">
              Ask a question and get answers strictly from the Offering Memorandum.
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onOpen}>Open</Button>
      </div>
    </div>
  );
};
```

---

## UI: `OMQueryOverlay` (top-right overlay + Markdown rendering)

- Displays a toolbar with input and submit button.
- Renders the answer card using Markdown (`react-markdown` + `remark-gfm`).
- Stays open until closed; we mount it once in `DashboardShell` so it persists across OM subpages.

Create `src/components/om/OMQueryOverlay.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const OMQueryOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  const ask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setErr(null);
    setAnswer(null);
    try {
      const res = await fetch('/api/om-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setAnswer(data.answer || '');
    } catch (e: any) {
      setErr(e.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-24 right-6 z-[60] w-[min(420px,calc(100vw-2rem))]" role="dialog" aria-modal="true">
      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800">Ask the OM</h4>
          <button aria-label="Close" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={ask} className="flex items-center space-x-2">
          <Input
            placeholder="Ask a question about the OM..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            fullWidth
          />
          <Button type="submit" size="sm" isLoading={loading} rightIcon={<Send className="h-4 w-4" />}>Ask</Button>
        </form>
        {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      </div>

      {/* Answer card */}
      {answer && (
        <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-[60vh] overflow-auto">
          <p className="text-xs text-gray-500 mb-2">Answer (from OM):</p>
          <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm text-gray-800">
            {answer}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};
```

---

## Persisting Across Subpages – mount overlay in `DashboardShell`

- Mount the overlay once in `src/components/om/DashboardShell.tsx` so it exists across OM subpages.
- Persist open state per project using `sessionStorage` and listen for a custom `window` event to open from any subpage.

Modify `src/components/om/DashboardShell.tsx`:

1) Imports:

```ts
import React, { useEffect, useState } from 'react';
import { OMQueryOverlay } from '@/components/om/OMQueryOverlay';
```

2) Inside component:

```ts
const [showOmOverlay, setShowOmOverlay] = useState(false);

useEffect(() => {
  const key = `capmatch_omOverlayOpen_${projectId}`;

  // Initialize from sessionStorage
  const initOpen = typeof window !== 'undefined' && sessionStorage.getItem(key) === 'true';
  setShowOmOverlay(!!initOpen);

  // Listener to open overlay from anywhere
  const onOpen = (e: Event) => {
    const detail = (e as CustomEvent)?.detail;
    if (!detail?.projectId || detail.projectId === projectId) {
      sessionStorage.setItem(key, 'true');
      setShowOmOverlay(true);
    }
  };
  window.addEventListener('capmatch_open_om_overlay', onOpen as EventListener);
  return () => window.removeEventListener('capmatch_open_om_overlay', onOpen as EventListener);
}, [projectId]);

const closeOverlay = () => {
  const key = `capmatch_omOverlayOpen_${projectId}`;
  sessionStorage.setItem(key, 'false');
  setShowOmOverlay(false);
};
```

3) Near end of JSX return (top-level wrapper of `DashboardShell`):

```tsx
<OMQueryOverlay open={showOmOverlay} onClose={closeOverlay} />
```

Notes:
- This ensures the overlay remains open/closed across OM subpages.
- If desired, persist last `question`/`answer` similarly (not required per spec).

---

## Wire Card below AI Insights on OM Dashboard

- Add the white card just below `AIInsightsBar` in `src/app/project/om/[id]/dashboard/page.tsx`.
- Clicking the card should dispatch the global event and set the session storage flag for the current project.

Modify `src/app/project/om/[id]/dashboard/page.tsx`:

1) Imports (add):

```ts
import { TalkToOMCard } from '@/components/om/TalkToOMCard';
```

2) Helper to open overlay (inside component; after we have `projectId`):

```ts
const openOmOverlay = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`capmatch_omOverlayOpen_${projectId}`, 'true');
    window.dispatchEvent(new CustomEvent('capmatch_open_om_overlay', { detail: { projectId } }));
  }
};
```

3) Render the card below `AIInsightsBar`:

```tsx
<div className="max-w-7xl mx-auto">
  <AIInsightsBar scenario={scenario} />
  <TalkToOMCard onOpen={openOmOverlay} />
  <QuadrantGrid quadrants={quadrants} />
</div>
```

---

## OM Prompting Details

- We inline the full OM markdown file into the prompt in the `contents` section (server-side only).
- System instruction:
  - “Only use facts present in the OM text.”
  - “If unknown, respond exactly: `I don't know based on the OM document.`”
  - “Use concise bullets where it helps.”
  - “Quote figures verbatim.”
- We set `thinkingConfig: { thinkingBudget: 0 }` to speed up and reduce costs with `gemini-2.5-flash`.

Optional additions:
- `generationConfig.maxOutputTokens` to cap length (e.g., 512).
- Post-processing (future): verify that any numbers in the response appear in OM (basic guard) and warn/trim otherwise.

---

## Security & Robustness

- Never expose API key in client code.
- Add simple input validation on API route (already checks for string question).
- Optional (recommended):
  - Rate limiting on `/api/om-qa` to prevent abuse.
  - In-memory cache for OM content (avoid FS read per request).
  - Avoid reading OM file at runtime if deployment platform restricts FS: embed OM text at build time or ship it in `public/` and fetch from server.

---

## Alternatives for OM Content Delivery

- Current: Read `docs/Downtown_Highrise_OM.md` at request time.
- Alternative A: Read once and cache in memory (singleton/global var) for the server runtime.
- Alternative B: Move to `public/om/Downtown_Highrise_OM.md` and read it with `fs` or `fetch` from server.
- Alternative C: Embed the OM content as a string export (e.g., `src/lib/omText.ts`) and import into the route (no FS at runtime).

---

## Accessibility & UX Polish

- Overlay `role="dialog"` and `aria-modal="true"`.
- Add Escape-to-close (optional) in overlay.
- Add copy-to-clipboard button for the answer (optional).
- Consider mobile: current width is responsive. A bottom sheet on small screens could improve usability (optional).

---

## Optional Enhancements

- Streaming: switch to `generateContentStream` and stream chunks to the overlay for lower perceived latency.
- Model choice: switch to `gemini-2.5-flash-lite` for cheaper/faster if quality is acceptable.
- Vertex AI mode: flip to `{ vertexai: true, project, location }` in client init and configure service account auth.
- Observability: log minimal metadata (no secrets or OM content) for success/error counts.

---

## Testing Plan

- Unit/Smoke:
  - API route returns 400 on missing/invalid `question`.
  - With a valid question, returns 200 and non-empty `answer`.
  - Returns fallback error JSON and 500 on missing key.
- Functional:
  - Card appears below AI Insights.
  - Clicking card opens overlay; overlay persists open across OM subpages.
  - Submit question → rendered Markdown appears in answer card.
  - If question cannot be answered from OM, the reply is exactly: `I don't know based on the OM document.`
  - Close button sets state to closed; moving to another subpage keeps it closed.
- Visual:
  - Card and overlay match design language (white card, rounded corners, border, light shadow).

---

## Full Example: Minimal End-to-End Usage in Client (for reference)

```tsx
// Example handler: submit question from overlay
const ask = async () => {
  const res = await fetch('/api/om-qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'What is the total capitalization?' }),
  });
  const data = await res.json();
  console.log('Answer:', data.answer);
};
```

---

## Checklist

- [ ] Install `@google/genai`, `react-markdown`, `remark-gfm`.
- [ ] Add `.env.local` with `GEMINI_API_KEY`.
- [ ] Create `src/app/api/om-qa/route.ts` with strict prompt and OM file read.
- [ ] Add `src/components/om/TalkToOMCard.tsx` (white card entrypoint).
- [ ] Add `src/components/om/OMQueryOverlay.tsx` with Markdown rendering.
- [ ] Modify `src/components/om/DashboardShell.tsx` to mount overlay & persist open state.
- [ ] Modify `src/app/project/om/[id]/dashboard/page.tsx` to render card and dispatch overlay open event.
- [ ] Manual test: ask several questions, verify bullet formatting & strictness.
- [ ] Optional: rate limiting, caching OM content, streaming, Vertex mode.

---

## Notes for Handoff

- If the deployment environment restricts file reads at runtime (e.g., some serverless hosts), choose Alternative B or C for OM content.
- Keep the API route server-only; do not move model calls to the client.
- The overlay mount in `DashboardShell` is essential for cross-subpage persistence.
- For extreme strictness, add post-processing validation of numeric facts against OM text. 