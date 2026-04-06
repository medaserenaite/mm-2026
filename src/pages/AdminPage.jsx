import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { CHARACTERS } from '../data/characters.js';

const RANK = ['🥇', '🥈', '🥉'];
const playerNames = CHARACTERS.filter(c => !c.isAdmin).map(c => c.name);

function rankLabel(idx) {
  if (idx === 0) return 'First Mate of Victory';
  if (idx === 1) return 'Second-in-Command of Fortune';
  if (idx === 2) return 'Brave Buccaneer';
  return `#${idx + 1}`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    hour12: true,
  });
}

export default function AdminPage({ onLogout }) {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add winner form
  const [addName, setAddName] = useState('');
  const [addTs, setAddTs] = useState('');
  const [addError, setAddError] = useState(null);
  const [addLoading, setAddLoading] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function fetchCompletions() {
    const { data } = await supabase
      .from('bingo_completions')
      .select('character_name, completed_at')
      .order('completed_at', { ascending: true });
    setCompletions(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCompletions();
    const channel = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bingo_completions' }, () => {
        fetchCompletions();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleAddWinner(e) {
    e.preventDefault();
    if (!addName) return;
    setAddLoading(true);
    setAddError(null);

    const ts = addTs ? new Date(addTs).toISOString() : new Date().toISOString();
    const { error } = await supabase
      .from('bingo_completions')
      .insert({ character_name: addName, completed_at: ts });

    if (error) {
      setAddError(error.code === '23505'
        ? 'That scallywag already claimed victory!'
        : 'Failed to record — check yer connection.');
    } else {
      setAddName('');
      setAddTs('');
    }
    setAddLoading(false);
  }

  async function handleDelete(name) {
    await supabase.from('bingo_completions').delete().eq('character_name', name);
    setDeleteTarget(null);
  }

  async function handleResetAll() {
    await supabase.from('bingo_completions').delete().neq('character_name', '');
    // Also clear all bingo card state from players' localStorage on admin device
    Object.keys(localStorage)
      .filter(k => k.startsWith('bingo_'))
      .forEach(k => localStorage.removeItem(k));
    setShowReset(false);
  }

  const alreadyEntered = new Set(completions.map(c => c.character_name));

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pb-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(120,60,10,0.07)' }} />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(80,10,10,0.08)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 animate-fade-in pt-6">

        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">⚙️</span>
          <span className="animate-flicker" style={{ animationDelay: '0.8s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">Captain's Deck</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
          <p className="text-amber-200/35 text-xs italic mt-2">Admin access — live leaderboard.</p>
        </div>

        {/* Live leaderboard */}
        <div className="card p-5 w-full flex flex-col gap-2">
          <p className="text-amber-200/40 text-[10px] uppercase tracking-widest text-center font-bold mb-1">
            🏆 Hall of Fame
          </p>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="text-2xl animate-spin">⚓</div>
            </div>
          ) : completions.length === 0 ? (
            <p className="text-amber-900/40 text-xs italic text-center py-4">
              No victors yet. The seas are calm, Captain.
            </p>
          ) : (
            completions.map((entry, idx) => (
              <div key={entry.character_name}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{
                  background: idx < 3 ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.02)',
                  border: idx < 3 ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(180,130,40,0.08)',
                }}>
                <span className="text-xl w-7 text-center flex-shrink-0">
                  {idx < 3 ? RANK[idx] : <span className="text-amber-900/40 text-sm font-mono">#{idx+1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-amber-200/85 font-bold text-sm truncate">{entry.character_name}</p>
                  {idx < 3 && (
                    <p className="text-amber-900/45 text-[10px] italic">{rankLabel(idx)}</p>
                  )}
                </div>
                <p className="text-amber-900/45 text-[10px] font-mono flex-shrink-0">{formatTime(entry.completed_at)}</p>

                {/* Delete */}
                {deleteTarget === entry.character_name ? (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleDelete(entry.character_name)}
                      className="text-[10px] px-2 py-1 rounded bg-red-900/30 text-red-400/80 hover:bg-red-900/50 transition-all"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteTarget(null)}
                      className="text-[10px] px-2 py-1 rounded border border-amber-900/20 text-amber-900/40 hover:text-amber-700/60 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteTarget(entry.character_name)}
                    className="text-amber-900/25 hover:text-red-500/60 transition-colors text-sm flex-shrink-0 px-1"
                    title="Remove entry"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add winner manually */}
        <div className="card p-5 w-full flex flex-col gap-4">
          <p className="text-amber-200/40 text-[10px] uppercase tracking-widest text-center font-bold">
            ✍️ Record a Winner Manually
          </p>

          <form onSubmit={handleAddWinner} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-amber-900/50 text-[10px] uppercase tracking-widest">Character</label>
              <select
                value={addName}
                onChange={e => { setAddName(e.target.value); setAddError(null); }}
                required
                className="w-full rounded-xl px-4 py-3 bg-black/30 border border-amber-900/30
                  text-amber-100 text-sm focus:outline-none focus:border-amber-600/50
                  focus:ring-2 focus:ring-amber-700/20 transition-all"
              >
                <option value="" disabled className="bg-zinc-900">— Select character —</option>
                {playerNames.filter(n => !alreadyEntered.has(n)).map(n => (
                  <option key={n} value={n} className="bg-zinc-900">{n}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-amber-900/50 text-[10px] uppercase tracking-widest">
                Timestamp <span className="text-amber-900/30">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={addTs}
                onChange={e => setAddTs(e.target.value)}
                className="w-full rounded-xl px-4 py-3 bg-black/30 border border-amber-900/30
                  text-amber-100 text-sm focus:outline-none focus:border-amber-600/50
                  focus:ring-2 focus:ring-amber-700/20 transition-all"
              />
            </div>

            {addError && (
              <p className="text-red-400/70 text-xs italic text-center">{addError}</p>
            )}

            <button
              type="submit"
              disabled={!addName || addLoading}
              className="btn-primary w-full py-3 text-sm"
            >
              {addLoading ? 'Recording…' : 'Record Victory ⚓'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card p-5 w-full flex flex-col gap-3" style={{ borderColor: 'rgba(220,38,38,0.2)' }}>
          <p className="text-amber-200/35 text-[10px] uppercase tracking-widest text-center font-bold">
            ⚠️ Danger Zone
          </p>

          {!showReset ? (
            <button
              onClick={() => setShowReset(true)}
              className="w-full rounded-xl px-4 py-3 text-sm font-bold transition-all
                border border-red-900/30 text-red-500/60 hover:text-red-400/80
                hover:border-red-700/40 hover:bg-red-900/10"
            >
              Reset All Bingo Data
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-red-400/70 text-xs italic text-center">
                "This deletes ALL bingo completions from the database. No going back, Captain."
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetAll}
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-bold border
                    border-red-700/50 text-red-400/80 bg-red-900/15 hover:bg-red-900/25 transition-all"
                >
                  Aye, Reset!
                </button>
                <button
                  onClick={() => setShowReset(false)}
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-bold border
                    border-amber-900/30 text-amber-900/50 hover:text-amber-700/60 transition-all"
                >
                  Nay, Abort
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="text-amber-900/40 text-xs hover:text-amber-700/60 transition-colors italic"
        >
          ← Sign out
        </button>
      </div>
    </div>
  );
}
