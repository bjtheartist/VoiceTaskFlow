"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Minimal Web Speech API typings (not in lib.dom everywhere)
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

type Phase = "idle" | "recording" | "processing";

export default function Recorder() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [typing, setTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");
  const stoppingRef = useRef(false);

  useEffect(() => {
    setSupported(getRecognition() !== null);
  }, []);

  function startRecording() {
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    setError(null);
    finalRef.current = "";
    setFinalText("");
    setInterimText("");
    stoppingRef.current = false;

    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalRef.current += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setFinalText(finalRef.current);
      setInterimText(interim);
    };

    rec.onerror = (event) => {
      if (event.error === "no-speech") return;
      setError(
        event.error === "not-allowed"
          ? "Microphone access was blocked. Allow it in your browser settings."
          : `Speech recognition error: ${event.error}`
      );
      setPhase("idle");
    };

    // Chrome ends recognition after silence; restart unless the user stopped.
    rec.onend = () => {
      if (!stoppingRef.current) {
        try {
          rec.start();
        } catch {
          /* already restarted */
        }
      }
    };

    recRef.current = rec;
    rec.start();
    setPhase("recording");
  }

  async function stopAndSave() {
    stoppingRef.current = true;
    recRef.current?.stop();
    setInterimText("");

    const transcript = (finalRef.current + " " + interimText).trim();
    if (!transcript) {
      setPhase("idle");
      return;
    }
    await submit(transcript);
  }

  async function submit(transcript: string) {
    setPhase("processing");
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          date: new Intl.DateTimeFormat("en-CA").format(new Date()),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save note");
      }
      setFinalText("");
      setTypedText("");
      setTyping(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setPhase("idle");
    }
  }

  const liveText = (finalText + interimText).trim();

  return (
    <section className="flex flex-col items-center pt-10 pb-6">
      {/* Orb */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        {phase === "recording" && (
          <>
            <span className="pulse-ring absolute inset-3 rounded-full border border-ember-400/50" />
            <span className="pulse-ring-delay absolute inset-3 rounded-full border border-ember-400/30" />
          </>
        )}
        <button
          onClick={phase === "recording" ? stopAndSave : startRecording}
          disabled={phase === "processing" || !supported}
          aria-label={phase === "recording" ? "Stop and save" : "Start recording"}
          className={`relative h-24 w-24 rounded-full transition-all duration-300 disabled:opacity-60
            ${
              phase === "recording"
                ? "orb-recording bg-[radial-gradient(circle_at_35%_30%,#f5c46a,#d98f24_70%)] shadow-[0_0_50px_rgba(234,168,63,0.45)]"
                : "bg-[radial-gradient(circle_at_35%_30%,#2c3140,#171a22_75%)] shadow-[0_0_30px_rgba(234,168,63,0.12)] hover:shadow-[0_0_45px_rgba(234,168,63,0.3)] border border-ink-600"
            }`}
        >
          <span className="flex items-center justify-center">
            {phase === "processing" ? (
              <svg className="h-7 w-7 animate-spin text-ember-300" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : phase === "recording" ? (
              <span className="block h-6 w-6 rounded-[4px] bg-ink-950" />
            ) : (
              <svg className="h-8 w-8 text-ember-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
                <path d="M18 11a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.94V21h2v-2.06A8 8 0 0 0 20 11h-2z" />
              </svg>
            )}
          </span>
        </button>
      </div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-400">
        {phase === "recording"
          ? "listening — tap to save"
          : phase === "processing"
          ? "distilling your note"
          : "tap to speak your day"}
      </p>

      {/* Live transcript */}
      {liveText && phase !== "idle" && (
        <blockquote className="mt-6 max-w-lg text-center font-body text-lg italic leading-relaxed text-cream-200">
          “{liveText}
          {interimText && <span className="text-ink-400">…</span>}”
        </blockquote>
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-red-400/90">{error}</p>
      )}

      {/* Typed fallback */}
      {!supported && !typing && (
        <p className="mt-4 text-center text-sm text-ink-300">
          This browser doesn&apos;t support speech recognition (try Chrome or Safari).
        </p>
      )}
      {typing ? (
        <form
          className="mt-6 w-full max-w-lg"
          onSubmit={(e) => {
            e.preventDefault();
            if (typedText.trim()) submit(typedText.trim());
          }}
        >
          <textarea
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            rows={4}
            autoFocus
            placeholder="Write your note — Verbatim will pull out the tasks…"
            className="w-full rounded-xl border border-ink-600 bg-ink-900 p-4 font-body text-base text-cream-100 placeholder:text-ink-400 focus:border-ember-400/60 focus:outline-none"
          />
          <div className="mt-2 flex justify-end gap-3 font-mono text-[12px] uppercase tracking-[0.15em]">
            <button type="button" onClick={() => setTyping(false)} className="text-ink-400 hover:text-cream-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={phase === "processing" || !typedText.trim()}
              className="text-ember-400 hover:text-ember-300 disabled:opacity-50"
            >
              Save note
            </button>
          </div>
        </form>
      ) : (
        phase === "idle" && (
          <button
            onClick={() => setTyping(true)}
            className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 underline-offset-4 hover:text-cream-200 hover:underline"
          >
            or type instead
          </button>
        )
      )}
    </section>
  );
}
