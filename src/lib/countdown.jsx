import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';

// ─── Hook: fetch + watch an unlock time from the settings table ───────────────

export function useUnlockTime(key) {
  const [unlockTime, setUnlockTime] = useState(undefined); // undefined = loading

  async function fetchTime() {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    setUnlockTime(data?.value ? new Date(data.value) : null);
  }

  useEffect(() => {
    fetchTime();
    const channel = supabase
      .channel(`settings_${key}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'settings', filter: `key=eq.${key}`,
      }, fetchTime)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [key]);

  return { unlockTime, loading: unlockTime === undefined };
}

// ─── Hook: countdown to a target date ────────────────────────────────────────

export function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() =>
    targetDate ? Math.max(0, targetDate - Date.now()) : 0
  );

  useEffect(() => {
    if (!targetDate || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(Math.max(0, targetDate - Date.now())), 1000);
    return () => clearInterval(id);
  }, [targetDate, timeLeft]);

  const s = Math.floor(timeLeft / 1000);
  return {
    timeLeft,
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

// ─── Component: single countdown pad ─────────────────────────────────────────

export function Pad({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="card px-4 py-3 text-3xl font-black text-amber-300 font-mono min-w-[3.5rem] text-center">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-amber-400/50 text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}
