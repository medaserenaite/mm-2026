import { useState, useEffect } from 'react';
import { BINGO_PROMPTS } from '../data/characters.js';
import { supabase } from '../lib/supabase.js';
import { useUnlocked } from '../lib/countdown.jsx';

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

const ALL_CHARACTERS = BINGO_PROMPTS.map(p => p.character).sort();

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
          className="text-amber-400/60 text-xs hover:text-amber-700/60 transition-colors italic"
        >
          Stay on me card
        </button>
      </div>
    </div>
  );
}

function IdentifyModal({ item, onCorrect, onClose }) {
  const [selected, setSelected] = useState('');
  const [wrong, setWrong] = useState(false);

  function handleSubmit() {
    if (selected === item.character) {
      onCorrect();
    } else {
      setWrong(true);
      setSelected('');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}>
      <div className="card p-7 w-full max-w-sm flex flex-col items-center gap-5 animate-fade-in">
        <div className="text-4xl">🔍</div>
        <div className="text-center">
          <p className="text-amber-400/50 text-[10px] uppercase tracking-widest mb-1">Who fits this clue?</p>
          <p className="text-amber-200/90 text-base font-bold leading-snug"
            dangerouslySetInnerHTML={{ __html: item.prompt }} />
        </div>

        {wrong && (
          <div className="w-full rounded-xl px-4 py-2.5 text-center"
            style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }}>
            <p className="text-red-400/80 text-xs font-bold">That's not the right scallywag! Try again.</p>
          </div>
        )}

        <select
          value={selected}
          onChange={e => { setSelected(e.target.value); setWrong(false); }}
          className="w-full rounded-xl px-4 py-3 bg-black/30 border border-amber-900/30
            text-amber-100 text-sm focus:outline-none focus:border-amber-600/50
            focus:ring-2 focus:ring-amber-700/20 transition-all cursor-pointer"
        >
          <option value="" disabled className="bg-zinc-900 text-amber-900/50">— Select a character —</option>
          {ALL_CHARACTERS.map(c => (
            <option key={c} value={c} className="bg-zinc-900 text-amber-100">{c}</option>
          ))}
        </select>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="btn-primary w-full py-3 text-sm"
          >
            Confirm ⚓
          </button>
          <button
            onClick={onClose}
            className="text-amber-400/60 text-xs hover:text-amber-400/80 transition-colors italic text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BingoPage({ character, onBack, onComplete }) {
  const { unlocked, loading: unlockLoading } = useUnlocked('bingo_unlocked');

  const storageKey = `bingo_${character}`;

  const [card] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      // Validate that saved card has objects (not old string format)
      if (saved?.card?.length === 16 && typeof saved.card[0] === 'object') return saved.card;
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
  const [pendingCell, setPendingCell] = useState(null); // index awaiting identification

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ card, marks, completedAt }));
  }, [storageKey, card, marks, completedAt]);

  function handleCellClick(idx) {
    if (completedAt) return;
    if (marks[idx]) {
      // Already marked — allow unmark directly
      setMarks(prev => prev.map((v, i) => i === idx ? false : v));
      return;
    }
    // Unmarked — require identification before marking
    setPendingCell(idx);
  }

  function handleIdentifyCorrect() {
    const next = marks.map((v, i) => i === pendingCell ? true : v);
    setMarks(next);
    setPendingCell(null);
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
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-red-700/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-2"
        style={{ background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(180,130,40,0.15)' }}>
        <button onClick={onBack} className="btn-secondary w-full max-w-lg mx-auto block py-2.5 text-sm">← Back to the ship</button>
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-5 animate-fade-in pt-20">

        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">🎲</span>
          <span className="animate-flicker" style={{ animationDelay: '0.9s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">Bingo</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
        </div>

        {unlockLoading ? (
          // ── Loading ──
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="text-3xl animate-spin">⚓</div>
            <p className="text-amber-400/60 text-xs italic">Checking the captain's orders…</p>
          </div>
        ) : !unlocked ? (
          // ── Locked ──
          <div className="card p-8 w-full flex flex-col items-center gap-4 text-center">
            <div className="text-5xl">🔒</div>
            <p className="text-amber-200/60 text-sm font-semibold uppercase tracking-widest">
              The chest is sealed
            </p>
            <p className="text-amber-200/35 text-xs italic">
              "The captain hasn't given the order yet. Stand by, sea dog."
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
                {card.map((item, idx) => {
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
                      `}
                        dangerouslySetInnerHTML={{ __html: item.prompt }}
                      />
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
              className="text-amber-400/60 text-xs hover:text-amber-700/60 transition-colors italic"
            >
              View Leaderboard →
            </button>
          </>
        )}

        <button
          onClick={onBack}
          className="btn-secondary w-full py-2.5 text-sm"
        >
          ← Back to the ship
        </button>
      </div>

      {pendingCell !== null && (
        <IdentifyModal
          item={card[pendingCell]}
          onCorrect={handleIdentifyCorrect}
          onClose={() => setPendingCell(null)}
        />
      )}
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
