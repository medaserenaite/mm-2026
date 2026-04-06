import { useState, useEffect } from 'react';
import { BINGO_PROMPTS, BINGO_UNLOCK_TIME } from '../data/characters.js';
import { supabase } from '../lib/supabase.js';

// ─── Seeded card generation ───────────────────────────────────────────────────

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function seededShuffle(arr, seed) {
  const out = [...arr];
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function generateCard(characterName) {
  return seededShuffle(BINGO_PROMPTS, hashString(characterName)).slice(0, 16);
}

// ─── Bingo logic ──────────────────────────────────────────────────────────────

function checkBingo(marks) {
  for (let r = 0; r < 4; r++) {
    if ([0,1,2,3].every(c => marks[r*4+c])) return true;
  }
  for (let c = 0; c < 4; c++) {
    if ([0,1,2,3].every(r => marks[r*4+c])) return true;
  }
  if ([0,5,10,15].every(i => marks[i])) return true;
  if ([3,6,9,12].every(i => marks[i])) return true;
  return false;
}

function getWinningCells(marks) {
  const winning = new Set();
  for (let r = 0; r < 4; r++) {
    const cells = [r*4, r*4+1, r*4+2, r*4+3];
    if (cells.every(i => marks[i])) cells.forEach(i => winning.add(i));
  }
  for (let c = 0; c < 4; c++) {
    const cells = [c, 4+c, 8+c, 12+c];
    if (cells.every(i => marks[i])) cells.forEach(i => winning.add(i));
  }
  const d1 = [0,5,10,15];
  if (d1.every(i => marks[i])) d1.forEach(i => winning.add(i));
  const d2 = [3,6,9,12];
  if (d2.every(i => marks[i])) d2.forEach(i => winning.add(i));
  return winning;
}

// ─── Countdown ───────────────────────────────────────────────────────────────

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, targetDate - Date.now()));
  useEffect(() => {
    if (timeLeft <= 0) return;
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

function Pad({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="card px-4 py-3 text-3xl font-black text-amber-300 font-mono min-w-[3.5rem] text-center">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-amber-400/50 text-xs uppercase tracking-widest">{label}</span>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function ConfirmModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="card p-8 w-full max-w-sm flex flex-col items-center gap-6 animate-fade-in">
        <div className="text-6xl animate-bounce">🏴‍☠️</div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-gradient mb-2">BINGO!</h2>
          <p className="text-amber-200/70 text-sm italic leading-relaxed">
            "Blimey! 'Ave ye truly struck gold, ye cunning sea dog? Confirm yer victory before ye crow!"
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary w-full py-4 text-base"
          >
            {loading ? 'Recording yer victory…' : "Aye, 'tis BINGO! ⚓"}
          </button>
          {!loading && (
            <button
              onClick={onCancel}
              className="text-amber-900/50 text-sm hover:text-amber-700/70 transition-colors italic text-center"
            >
              Wait… I miscounted, ye fool
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ character, timestamp, onViewLeaderboard, onClose }) {
  const formatted = new Date(timestamp).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)' }}>
      <div className="card p-8 w-full max-w-sm flex flex-col items-center gap-5 animate-fade-in text-center">

        <div className="flex gap-2 text-4xl">
          <span>🎉</span><span>🏆</span><span>🎉</span>
        </div>

        <div>
          <h2 className="text-3xl font-black text-gradient mb-1">BINGO!</h2>
          <p className="text-amber-400/80 text-xs uppercase tracking-widest font-bold">
            Victory be yers, {character}!
          </p>
        </div>

        <div className="divider-rune text-sm w-full">⚓</div>

        <p className="text-amber-200/75 text-sm italic leading-relaxed">
          "Shiver me timbers! Ye've found the treasure no other scallywag could claim!
          Yer cunning rivals the seven seas themselves, ye magnificent buccaneer!"
        </p>

        <div className="card p-4 w-full" style={{ borderColor: 'rgba(251,191,36,0.3)' }}>
          <p className="text-amber-900/50 text-xs uppercase tracking-widest mb-1">Victory Recorded At</p>
          <p className="text-amber-300 font-bold text-lg font-mono">{formatted}</p>
        </div>

        <div className="divider-rune text-sm w-full">⚓</div>

        <p className="text-amber-200/60 text-sm italic leading-relaxed">
          "Now go forth, ye champion of the high seas —{' '}
          <span className="text-amber-300 font-semibold">please enjoy the rest of the night</span>,
          ye swashbuckling legend! The rum flows free for the victorious!"
        </p>

        <button onClick={onViewLeaderboard} className="btn-primary w-full py-4 text-base mt-1">
          See the Leaderboard 🏆
        </button>
        <button
          onClick={onClose}
          className="text-amber-900/40 text-xs hover:text-amber-700/60 transition-colors italic"
        >
          Stay on me card
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BingoPage({ character, onBack, onComplete }) {
  const { timeLeft, days, hours, minutes, seconds } = useCountdown(BINGO_UNLOCK_TIME);
  const isUnlocked = timeLeft <= 0;

  const storageKey = `bingo_${character}`;

  const [card] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.card?.length === 16) return saved.card;
    } catch {}
    return generateCard(character);
  });

  const [marks, setMarks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(saved?.marks) && saved.marks.length === 16) return saved.marks;
    } catch {}
    return Array(16).fill(false);
  });

  const [completedAt, setCompletedAt] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return saved?.completedAt ?? null;
    } catch {}
    return null;
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ card, marks, completedAt }));
  }, [storageKey, card, marks, completedAt]);

  function handleCellClick(idx) {
    if (completedAt) return;
    const next = marks.map((v, i) => i === idx ? !v : v);
    setMarks(next);
    if (checkBingo(next)) {
      setShowConfirm(true);
    }
  }

  async function handleConfirm() {
    setSubmitting(true);
    const ts = new Date().toISOString();

    const { error } = await supabase
      .from('bingo_completions')
      .insert({ character_name: character, completed_at: ts });

    // Ignore duplicate error — they may have already submitted
    if (error && error.code !== '23505') {
      console.error('Supabase error:', error);
    }

    // Fetch the actual stored timestamp (in case of duplicate, use existing)
    const { data } = await supabase
      .from('bingo_completions')
      .select('completed_at')
      .eq('character_name', character)
      .single();

    const finalTs = data?.completed_at ?? ts;
    setCompletedAt(finalTs);
    setSubmitting(false);
    setShowConfirm(false);
    setShowSuccess(true);
  }

  function handleCancel() {
    setShowConfirm(false);
  }

  const winningCells = completedAt ? getWinningCells(marks) : new Set();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pb-10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(120,60,10,0.07)' }} />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(100,20,20,0.07)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-5 animate-fade-in pt-6">

        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">🎲</span>
          <span className="animate-flicker" style={{ animationDelay: '0.9s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">Bingo</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
        </div>

        {!isUnlocked ? (
          // ── Locked state ──
          <div className="card p-8 w-full flex flex-col items-center gap-6">
            <div className="text-5xl">🔒</div>
            <div className="text-center">
              <p className="text-amber-200/60 text-sm font-semibold uppercase tracking-widest mb-1">
                The chest is sealed
              </p>
              <p className="text-amber-200/35 text-xs italic">
                Unlocks April 18 at 6:00 PM Central
              </p>
            </div>
            <div className="flex items-end gap-3">
              <Pad value={days} label="Days" />
              <span className="text-amber-400/60 text-2xl font-bold pb-5">:</span>
              <Pad value={hours} label="Hours" />
              <span className="text-amber-400/60 text-2xl font-bold pb-5">:</span>
              <Pad value={minutes} label="Min" />
              <span className="text-amber-400/60 text-2xl font-bold pb-5">:</span>
              <Pad value={seconds} label="Sec" />
            </div>
            <p className="text-amber-400/40 text-xs italic text-center">
              "Patience, sea dog. The tide turns when it turns."
            </p>
          </div>
        ) : (
          // ── Unlocked bingo card ──
          <>
            {completedAt && (
              <div className="card p-4 w-full flex flex-col items-center gap-1 text-center"
                style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.06)' }}>
                <div className="text-2xl">🏆</div>
                <p className="text-amber-300 font-black text-lg font-serif">BINGO COMPLETE!</p>
                <p className="text-amber-200/50 text-xs italic">
                  Claimed at {new Date(completedAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true,
                  })}
                </p>
                <button
                  onClick={onComplete}
                  className="text-amber-600/70 text-xs italic mt-1 hover:text-amber-500 transition-colors"
                >
                  View the Leaderboard →
                </button>
              </div>
            )}

            <div className="card p-3 w-full">
              <p className="text-amber-200/35 text-[10px] uppercase tracking-widest text-center mb-3">
                ☠ Mark each pirate ye find tonight ☠
              </p>

              {/* 4×4 grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {card.map((prompt, idx) => {
                  const isMarked = marks[idx];
                  const isWinning = winningCells.has(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleCellClick(idx)}
                      disabled={!!completedAt}
                      className={`
                        relative rounded-lg p-1.5 text-center transition-all duration-200
                        flex flex-col items-center justify-center min-h-[72px]
                        border select-none
                        ${completedAt ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                        ${isWinning
                          ? 'border-amber-400/60'
                          : isMarked
                            ? 'border-amber-700/40'
                            : 'border-amber-900/20 hover:border-amber-700/30'
                        }
                      `}
                      style={{
                        background: isWinning
                          ? 'rgba(251,191,36,0.18)'
                          : isMarked
                            ? 'rgba(180,83,9,0.22)'
                            : 'rgba(255,255,255,0.025)',
                        boxShadow: isWinning
                          ? '0 0 12px rgba(251,191,36,0.25)'
                          : 'none',
                      }}
                    >
                      {isMarked && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-amber-400/25 text-4xl font-black leading-none">✕</span>
                        </div>
                      )}
                      <span className={`
                        relative z-10 text-[13px] leading-tight font-medium
                        ${isWinning
                          ? 'text-amber-300'
                          : isMarked
                            ? 'text-amber-200/70'
                            : 'text-amber-200/50'
                        }
                      `}>
                        {prompt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!completedAt && (
                <p className="text-amber-900/30 text-[9px] italic text-center mt-3">
                  Tap a square to mark it · Get 4 in a row to win
                </p>
              )}
            </div>

            {/* Leaderboard link */}
            <button
              onClick={onComplete}
              className="text-amber-900/40 text-xs hover:text-amber-700/60 transition-colors italic"
            >
              View Leaderboard →
            </button>
          </>
        )}

        <button
          onClick={onBack}
          className="text-amber-900/40 text-xs hover:text-amber-700/60 transition-colors italic"
        >
          ← Back to the ship
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={submitting}
        />
      )}
      {showSuccess && completedAt && (
        <SuccessModal
          character={character}
          timestamp={completedAt}
          onViewLeaderboard={onComplete}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}
