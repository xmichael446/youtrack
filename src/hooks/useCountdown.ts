import { useState, useEffect } from 'react';

function formatCountdown(targetIso: string): string {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function getMsRemaining(targetIso: string): number {
  return Math.max(0, new Date(targetIso).getTime() - Date.now());
}

export function useCountdown(targetIso: string | null): string {
  const [display, setDisplay] = useState('--');
  useEffect(() => {
    if (!targetIso) return;
    const tick = () => setDisplay(formatCountdown(targetIso));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return display;
}

export type TimerUrgency = 'normal' | 'warning' | 'critical';

export function useTimerUrgency(targetIso: string | null): TimerUrgency {
  const [urgency, setUrgency] = useState<TimerUrgency>('normal');
  useEffect(() => {
    if (!targetIso) return;
    const tick = () => {
      const ms = getMsRemaining(targetIso);
      if (ms <= 60_000) setUrgency('critical');
      else if (ms <= 300_000) setUrgency('warning');
      else setUrgency('normal');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return urgency;
}
