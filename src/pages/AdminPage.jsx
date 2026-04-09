import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { CHARACTERS } from '../data/characters.js';
import { useUnlockTime } from '../lib/countdown.jsx';

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

// ─── Vote tally helper ────────────────────────────────────────────────────────

function tally(votes, field) {
  const counts = {};
  votes.forEach(v => {
    const val = v[field];
    if (val) counts[val] = (counts[val] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TallySection({ title, pirateTitle, emoji, rows, total }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-amber-200/50 text-xs font-bold uppercase tracking-widest">{emoji} {title}</p>
        <p className="text-amber-400/60 text-xs italic pl-1">No votes yet</p>
      </div>
    );
  }
  const max = rows[0].count;
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-amber-200/50 text-xs font-bold uppercase tracking-widest">{emoji} {title}</p>
        <p className="text-amber-400/60 text-[10px] italic">{pirateTitle}</p>
      </div>
      {rows.map(({ name, count }, idx) => (
        <div key={name} className="flex items-center gap-2">
          <span className="text-base w-6 text-center flex-shrink-0">
            {idx < 3 ? RANK[idx] : <span className="text-amber-900/30 text-xs font-mono">#{idx+1}</span>}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-amber-200/80 text-xs font-semibold truncate">{name}</p>
              <p className="text-amber-900/50 text-[10px] font-mono ml-2 flex-shrink-0">
                {count}/{total}
              </p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(180,130,40,0.12)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(count / max) * 100}%`,
                  background: idx === 0
                    ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                    : 'rgba(180,130,40,0.4)',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Bingo Tab ────────────────────────────────────────────────────────────────

function BingoTab() {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
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
      .channel('admin_bingo_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bingo_completions' }, () => fetchCompletions())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function handleAddWinner(e) {
    e.preventDefault();
    if (!addName) return;
    setAddLoading(true);
    setAddError(null);
    const ts = addTs ? new Date(addTs).toISOString() : new Date().toISOString();
    const { error } = await supabase.from('bingo_completions').insert({ character_name: addName, completed_at: ts });
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
    Object.keys(localStorage).filter(k => k.startsWith('bingo_')).forEach(k => localStorage.removeItem(k));
    setShowReset(false);
  }

  const alreadyEntered = new Set(completions.map(c => c.character_name));

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Hall of Fame */}
      <div className="card p-5 flex flex-col gap-2">
        <p className="text-amber-200/40 text-[10px] uppercase tracking-widest text-center font-bold mb-1">
          🏆 Hall of Fame
        </p>
        {loading ? (
          <div className="flex justify-center py-6"><div className="text-2xl animate-spin">⚓</div></div>
        ) : completions.length === 0 ? (
          <p className="text-amber-400/60 text-xs italic text-center py-4">No victors yet.</p>
        ) : (
          completions.map((entry, idx) => (
            <div key={entry.character_name}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background: idx < 3 ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.02)',
                border: idx < 3 ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(180,130,40,0.08)',
              }}>
              <span className="text-xl w-7 text-center flex-shrink-0">
                {idx < 3 ? RANK[idx] : <span className="text-amber-400/60 text-sm font-mono">#{idx+1}</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-amber-200/85 font-bold text-sm truncate">{entry.character_name}</p>
                {idx < 3 && <p className="text-amber-900/45 text-[10px] italic">{rankLabel(idx)}</p>}
              </div>
              <p className="text-amber-900/45 text-[10px] font-mono flex-shrink-0">{formatTime(entry.completed_at)}</p>
              {deleteTarget === entry.character_name ? (
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleDelete(entry.character_name)}
                    className="text-[10px] px-2 py-1 rounded bg-red-900/30 text-red-400/80 hover:bg-red-900/50 transition-all">
                    Confirm
                  </button>
                  <button onClick={() => setDeleteTarget(null)}
                    className="text-[10px] px-2 py-1 rounded border border-amber-900/20 text-amber-400/60 hover:text-amber-700/60 transition-all">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeleteTarget(entry.character_name)}
                  className="text-amber-900/25 hover:text-red-500/60 transition-colors text-sm flex-shrink-0 px-1"
                  title="Remove entry">✕</button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add winner */}
      <div className="card p-5 flex flex-col gap-3">
        <p className="text-amber-200/40 text-[10px] uppercase tracking-widest text-center font-bold">
          ✍️ Record a Winner Manually
        </p>
        <form onSubmit={handleAddWinner} className="flex flex-col gap-3">
          <select value={addName} onChange={e => { setAddName(e.target.value); setAddError(null); }} required
            className="w-full rounded-xl px-4 py-3 bg-black/30 border border-amber-900/30
              text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 focus:ring-2 focus:ring-amber-700/20 transition-all">
            <option value="" disabled className="bg-zinc-900">— Select character —</option>
            {playerNames.filter(n => !alreadyEntered.has(n)).map(n => (
              <option key={n} value={n} className="bg-zinc-900">{n}</option>
            ))}
          </select>
          <input type="datetime-local" value={addTs} onChange={e => setAddTs(e.target.value)}
            className="w-full rounded-xl px-4 py-3 bg-black/30 border border-amber-900/30
              text-amber-100 text-sm focus:outline-none focus:border-amber-600/50 focus:ring-2 focus:ring-amber-700/20 transition-all" />
          {addError && <p className="text-red-400/70 text-xs italic text-center">{addError}</p>}
          <button type="submit" disabled={!addName || addLoading} className="btn-primary w-full py-3 text-sm">
            {addLoading ? 'Recording…' : 'Record Victory ⚓'}
          </button>
        </form>
      </div>

      {/* Reset */}
      <div className="card p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(220,38,38,0.2)' }}>
        <p className="text-amber-200/35 text-[10px] uppercase tracking-widest text-center font-bold">⚠️ Danger Zone</p>
        {!showReset ? (
          <button onClick={() => setShowReset(true)}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold border border-red-900/30
              text-red-500/60 hover:text-red-400/80 hover:border-red-700/40 hover:bg-red-900/10 transition-all">
            Reset All Bingo Data
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-red-400/70 text-xs italic text-center">
              "This deletes ALL bingo completions. No going back, Captain."
            </p>
            <div className="flex gap-2">
              <button onClick={handleResetAll}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold border border-red-700/50 text-red-400/80 bg-red-900/15 hover:bg-red-900/25 transition-all">
                Aye, Reset!
              </button>
              <button onClick={() => setShowReset(false)}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold border border-amber-900/30 text-amber-900/50 hover:text-amber-700/60 transition-all">
                Nay, Abort
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Votes Tab ────────────────────────────────────────────────────────────────

function VotesTab() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showResetVotes, setShowResetVotes] = useState(false);

  async function fetchVotes() {
    const { data } = await supabase
      .from('votes')
      .select('*')
      .order('submitted_at', { ascending: true });
    setVotes(data ?? []);
    setLoading(false);
  }

  async function handleResetVotes() {
    await supabase.from('votes').delete().neq('voter_name', '');
    setShowResetVotes(false);
  }

  useEffect(() => {
    fetchVotes();
    const channel = supabase
      .channel('admin_votes_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => fetchVotes())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const total = votes.length;
  const costumeTally   = tally(votes, 'best_costume');
  const performerTally = tally(votes, 'best_performer');
  const mostLikelyTally = tally(votes, 'most_likely');

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Vote count */}
      <div className="card p-4 text-center">
        {loading ? (
          <div className="text-2xl animate-spin">⚓</div>
        ) : (
          <>
            <p className="text-amber-300 font-black text-3xl">{total}</p>
            <p className="text-amber-900/50 text-xs uppercase tracking-widest mt-1">
              {total === 1 ? 'Pirate has voted' : 'Pirates have voted'}
            </p>
          </>
        )}
      </div>

      {/* Tallies */}
      {!loading && total > 0 && (
        <div className="card p-5 flex flex-col gap-6">
          <TallySection title="Best Costume"   pirateTitle="Finest Plumage"                  emoji="🦜" rows={costumeTally}    total={total} />
          <div className="border-t border-amber-900/15" />
          <TallySection title="Best Performer" pirateTitle="Best Actor Among Scallywags"     emoji="🎭" rows={performerTally}  total={total} />
          <div className="border-t border-amber-900/15" />
          <TallySection title="Most Likely to Commit a Crime" pirateTitle="Most Likely to Walk the Plank" emoji="☠️" rows={mostLikelyTally} total={total} />
        </div>
      )}

      {/* Best Detective — show all villain guesses */}
      <div className="card p-5 flex flex-col gap-3">
        <div>
          <p className="text-amber-200/50 text-xs font-bold uppercase tracking-widest">🔍 Best Detective</p>
          <p className="text-amber-400/60 text-[10px] italic">All villain &amp; motive guesses — sorted by submission time</p>
        </div>

        {loading ? (
          <p className="text-amber-400/60 text-xs italic text-center py-2">Loading…</p>
        ) : votes.length === 0 ? (
          <p className="text-amber-400/60 text-xs italic pl-1">No guesses yet</p>
        ) : (
          votes.map((v, idx) => (
            <div key={v.voter_name}
              className="rounded-xl border border-amber-900/15 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-amber-400/60 text-[10px] font-mono flex-shrink-0">#{idx + 1}</span>
                  <p className="text-amber-200/75 text-sm font-semibold truncate">{v.voter_name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <p className="text-amber-400/60 text-[10px] font-mono">{formatTime(v.submitted_at)}</p>
                  <span className="text-amber-400/60 text-xs">{expanded === idx ? '▲' : '▼'}</span>
                </div>
              </button>
              {expanded === idx && (
                <div className="px-3 pb-3 border-t border-amber-900/10">
                  <p className="text-amber-200/60 text-sm font-semibold mt-2">
                    {v.villain_guess}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reset votes */}
      <div className="card p-4 flex flex-col gap-3" style={{ borderColor: 'rgba(220,38,38,0.2)' }}>
        <p className="text-amber-200/35 text-[10px] uppercase tracking-widest text-center font-bold">⚠️ Danger Zone</p>
        {!showResetVotes ? (
          <button onClick={() => setShowResetVotes(true)}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold border border-red-900/30
              text-red-500/60 hover:text-red-400/80 hover:border-red-700/40 hover:bg-red-900/10 transition-all">
            Clear All Votes
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-red-400/70 text-xs italic text-center">
              "This deletes ALL votes from the database. No going back, Captain."
            </p>
            <div className="flex gap-2">
              <button onClick={handleResetVotes}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold border border-red-700/50 text-red-400/80 bg-red-900/15 hover:bg-red-900/25 transition-all">
                Aye, Clear!
              </button>
              <button onClick={() => setShowResetVotes(false)}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold border border-amber-900/30 text-amber-900/50 hover:text-amber-700/60 transition-all">
                Nay, Abort
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Timers Tab ───────────────────────────────────────────────────────────────

function TimerCard({ settingKey, title, emoji, description }) {
  const { unlockTime } = useUnlockTime(settingKey);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Pre-fill input with current value when loaded
  useEffect(() => {
    if (unlockTime) {
      // Convert to local datetime-local format
      const local = new Date(unlockTime.getTime() - unlockTime.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setInput(local);
    }
  }, [unlockTime?.toISOString()]);

  async function handleSave(e) {
    e.preventDefault();
    if (!input) return;
    setSaving(true);
    const iso = new Date(input).toISOString();
    await supabase.from('settings').upsert({ key: settingKey, value: iso }, { onConflict: 'key' });
    setSaving(false);
  }

  async function handleClear() {
    setSaving(true);
    await supabase.from('settings').delete().eq('key', settingKey);
    setInput('');
    setSaving(false);
  }

  const isSet = unlockTime !== null && unlockTime !== undefined;
  const isLoading = unlockTime === undefined;
  const isPast = isSet && unlockTime <= new Date();

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div>
        <p className="text-amber-200/60 text-xs font-bold uppercase tracking-widest">{emoji} {title}</p>
        <p className="text-amber-400/60 text-[10px] italic mt-0.5">{description}</p>
      </div>

      {/* Current status */}
      <div className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{
          background: isLoading ? 'rgba(255,255,255,0.02)' :
            !isSet ? 'rgba(220,38,38,0.06)' :
            isPast ? 'rgba(34,197,94,0.06)' : 'rgba(251,191,36,0.06)',
          border: isLoading ? '1px solid rgba(180,130,40,0.1)' :
            !isSet ? '1px solid rgba(220,38,38,0.2)' :
            isPast ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(251,191,36,0.2)',
        }}>
        <span className="text-xl flex-shrink-0">
          {isLoading ? '⏳' : !isSet ? '🔒' : isPast ? '🔓' : '⏳'}
        </span>
        <div className="min-w-0">
          <p className={`text-xs font-bold ${!isSet ? 'text-red-400/70' : isPast ? 'text-green-400/80' : 'text-amber-300/80'}`}>
            {isLoading ? 'Loading…' : !isSet ? 'Locked — no time set' : isPast ? 'Unlocked' : 'Counting down'}
          </p>
          {isSet && (
            <p className="text-amber-400/50 text-[10px] font-mono mt-0.5">
              {unlockTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
            </p>
          )}
        </div>
      </div>

      {/* Set time form */}
      <form onSubmit={handleSave} className="flex flex-col gap-2">
        <input
          type="datetime-local"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full rounded-xl px-4 py-3 bg-black/30 border border-amber-900/30
            text-amber-100 text-sm focus:outline-none focus:border-amber-600/50
            focus:ring-2 focus:ring-amber-700/20 transition-all"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!input || saving}
            className="btn-primary flex-1 py-3 text-sm"
          >
            {saving ? 'Saving…' : isSet ? 'Update Time ⚓' : 'Set Time ⚓'}
          </button>
          {isSet && (
            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="rounded-xl px-4 py-3 text-sm font-bold border border-red-900/30
                text-red-500/60 hover:text-red-400/80 hover:border-red-700/40 hover:bg-red-900/10 transition-all"
            >
              🔒 Lock
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function TimersTab() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <TimerCard
        settingKey="bingo_unlock_time"
        title="Bingo Countdown"
        emoji="🎲"
        description="When set, players see a countdown. When time passes, the bingo card unlocks."
      />
      <TimerCard
        settingKey="voting_unlock_time"
        title="Voting Countdown"
        emoji="📜"
        description="When set, players see a countdown. When time passes, the voting form unlocks."
      />
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage({ onLogout }) {
  const [tab, setTab] = useState('bingo');

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pb-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-red-700/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5 animate-fade-in pt-6">

        {/* Header */}
        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">⚙️</span>
          <span className="animate-flicker" style={{ animationDelay: '0.8s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">Captain's Deck</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
        </div>

        {/* Tab switcher */}
        <div className="flex w-full rounded-xl overflow-hidden border border-amber-900/25"
          style={{ background: 'rgba(0,0,0,0.3)' }}>
          {[
            { key: 'bingo',  label: '🎲 Bingo' },
            { key: 'votes',  label: '📜 Votes' },
            { key: 'timers', label: '⏱ Timers' },
          ].map((t, i, arr) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-3 text-sm font-bold transition-all duration-200"
              style={{
                background: tab === t.key ? 'rgba(180,83,9,0.35)' : 'transparent',
                color: tab === t.key ? '#fbbf24' : 'rgba(180,130,40,0.45)',
                borderRight: i < arr.length - 1 ? '1px solid rgba(180,130,40,0.2)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'bingo' ? <BingoTab /> : tab === 'votes' ? <VotesTab /> : <TimersTab />}

        <button
          onClick={onLogout}
          className="text-amber-400/60 text-xs hover:text-amber-700/60 transition-colors italic mt-2"
        >
          ← Sign out
        </button>
      </div>
    </div>
  );
}
