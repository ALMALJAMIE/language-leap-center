"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* ---------- Text to speech (Web Speech API) ---------- */

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const prefs = [
    (v: SpeechSynthesisVoice) => /en-US/i.test(v.lang) && /natural|neural|online/i.test(v.name),
    (v: SpeechSynthesisVoice) => /en-GB/i.test(v.lang) && /natural|neural|online/i.test(v.name),
    (v: SpeechSynthesisVoice) => /en-US/i.test(v.lang) && /google|samantha|aria|jenny/i.test(v.name),
    (v: SpeechSynthesisVoice) => /en-US/i.test(v.lang),
    (v: SpeechSynthesisVoice) => /^en/i.test(v.lang),
  ];
  for (const p of prefs) {
    const v = voices.find(p);
    if (v) return (cachedVoice = v);
  }
  return null;
}

export function speak(text: string, opts: { slow?: boolean; onEnd?: () => void } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.lang = v?.lang ?? "en-US";
  u.rate = opts.slow ? 0.6 : 0.95;
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  synth.speak(u);
}

export function useVoicesReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const done = () => {
      cachedVoice = null;
      setReady(window.speechSynthesis.getVoices().length > 0);
    };
    done();
    window.speechSynthesis.addEventListener("voiceschanged", done);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", done);
  }, []);
  return ready;
}

/* ---------- Speech recognition for speaking exercises ---------- */

type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition() {
  const supported = useSyncExternalStore(
    () => () => {},
    () => !!getRecognitionCtor(),
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);

  useEffect(() => {
    return () => recRef.current?.abort();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    recRef.current?.abort();
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    rec.onerror = (e) => {
      setError(e.error === "not-allowed" ? "Please allow microphone access." : "We couldn't hear you. Please try again.");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setTranscript("");
    setError(null);
    setListening(true);
    rec.start();
  }, []);

  const stop = useCallback(() => recRef.current?.stop(), []);

  return { supported, listening, transcript, error, start, stop };
}
