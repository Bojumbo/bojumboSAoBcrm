import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ScrollbarSize = 'small' | 'normal';

export type Prefs = {
  reflections: boolean; // glossy highlights
  reduceMotion: boolean; // fewer transitions/animations
  scrollbarSize: ScrollbarSize;
};

const DEFAULT_PREFS: Prefs = {
  reflections: true,
  reduceMotion: false,
  scrollbarSize: 'normal',
};

type Ctx = {
  prefs: Prefs;
  setPrefs: React.Dispatch<React.SetStateAction<Prefs>>;
};

const PrefsContext = createContext<Ctx | undefined>(undefined);

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem('prefs');
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed } as Prefs;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());

  // Persist to storage
  useEffect(() => {
    try { localStorage.setItem('prefs', JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  // Apply to DOM (classes and CSS variables)
  useEffect(() => {
    const body = document.body;
    body.classList.toggle('no-reflections', !prefs.reflections);
    body.classList.toggle('reduced-motion', prefs.reduceMotion);
    const size = prefs.scrollbarSize === 'small' ? '8px' : '10px';
    document.documentElement.style.setProperty('--scrollbar-size', size);
  }, [prefs]);

  const value = useMemo(() => ({ prefs, setPrefs }), [prefs]);
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider');
  return ctx;
}
