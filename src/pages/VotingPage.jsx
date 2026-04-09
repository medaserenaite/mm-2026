import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { CHARACTERS } from '../data/characters.js';

const playerNames = CHARACTERS.filter(c => !c.isAdmin).map(c => c.name);

const CATEGORIES = [
  {
    key: 'villain_guess',
    label: 'Best Detective',
    pirateLabel: '🔍 Name the Scoundrel',
    description: 'Who do ye reckon committed the foul deed?',
    type: 'select',
  },
  {
    key: 'best_costume',
    label: 'Best Costume',
    pirateLabel: '👗 Finest Plumage',
    description: 'Who wore the most magnificent garb aboard the ship?',
    type: 'select',
  },
  {
    key: 'best_performer',
    label: 'Best Performer',
    pirateLabel: '🎭 Best Actor Among Scallywags',
    description: 'Who played their character most convincingly tonight?',
    type: 'select',
  },
  {
    key: 'most_likely',
    label: 'Most Likely to Commit a Crime',
    pirateLabel: '☠️ Most Likely to Walk the Plank',
    description: 'Who among the crew seems the most suspicious — guilty or not?',
    type: 'select',
  },
];

function SelectField({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      required
      className="w-full rounded-xl px-4 py-3 bg-black/30 border border-amber-900/30
        text-amber-100 text-sm focus:outline-none focus:border-amber-600/50
        focus:ring-2 focus:ring-amber-700/20 transition-all cursor-pointer"
    >
      <option value="" disabled className="bg-zinc-900 text-amber-900/50">
        — Choose a pirate —
      </option>
      {playerNames.map(n => (
        <option key={n} value={n} className="bg-zinc-900 text-amber-100">{n}</option>
      ))}
    </select>
  );
}

export default function VotingPage({ character, onBack }) {
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState(null);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [totalVotes, setTotalVotes] = useState(null);

  const [form, setForm] = useState({
    villain_guess: '',
    best_costume: '',
    best_performer: '',
    most_likely: '',
  });

  useEffect(() => {
    async function load() {
      const [{ data: mine }, { count }] = await Promise.all([
        supabase.from('votes').select('*').eq('voter_name', character).maybeSingle(),
        supabase.from('votes').select('*', { count: 'exact', head: true }),
      ]);
      if (mine) {
        setExisting(mine);
        setForm({
          villain_guess: mine.villain_guess ?? '',
          best_costume:  mine.best_costume  ?? '',
          best_performer: mine.best_performer ?? '',
          most_likely:   mine.most_likely   ?? '',
        });
      }
      setTotalVotes(count ?? 0);
      setLoading(false);
    }
    load();
  }, [character]);

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase
      .from('votes')
      .upsert({
        voter_name:     character,
        villain_guess:  form.villain_guess,
        best_costume:   form.best_costume,
        best_performer: form.best_performer,
        most_likely:    form.most_likely,
      }, { onConflict: 'voter_name' });

    if (err) {
      setError("Blimey! Something went wrong. Try again, sea dog.");
      setSubmitting(false);
      return;
    }

    setExisting({ ...form, voter_name: character });
    setEditing(false);
    setSubmitted(true);
    setTotalVotes(v => existing ? v : (v ?? 0) + 1);
    setSubmitting(false);
  }

  const canSubmit = form.villain_guess.trim() && form.best_costume && form.best_performer && form.most_likely;

  // ── Background wrapper ──
  const bg = (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-red-700/15 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {bg}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="text-3xl animate-spin">⚓</div>
          <p className="text-amber-900/50 text-xs italic">Loading the ballot…</p>
        </div>
      </div>
    );
  }

  // ── Already voted + not editing ──
  if (existing && !editing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start p-4 pb-12 relative overflow-hidden">
        {bg}
        <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 animate-fade-in pt-6">

          <div className="flex items-center gap-3 text-3xl">
            <span className="animate-flicker">🕯️</span>
            <span className="text-4xl">📜</span>
            <span className="animate-flicker" style={{ animationDelay: '0.9s' }}>🕯️</span>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-black text-gradient">Cast Yer Vote</h1>
            <div className="divider-rune mt-2 text-sm">⚓</div>
          </div>

          {/* Success banner */}
          <div className="card p-5 w-full flex flex-col items-center gap-2 text-center"
            style={{ borderColor: 'rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.06)' }}>
            <div className="text-3xl">{submitted ? '🎉' : '✅'}</div>
            <p className="text-amber-300 font-black text-base">
              {submitted ? "Yer vote be cast, sea dog!" : "Ye've already voted!"}
            </p>
            <p className="text-amber-200/45 text-xs italic">
              "Yer voice has been heard across the seven seas."
            </p>
          </div>

          {/* Vote summary */}
          <div className="card p-5 w-full flex flex-col gap-3">
            <p className="text-amber-200/40 text-[10px] uppercase tracking-widest text-center font-bold mb-1">
              Yer Selections
            </p>
            {CATEGORIES.map(cat => (
              <div key={cat.key} className="flex flex-col gap-0.5">
                <p className="text-amber-900/50 text-[10px] uppercase tracking-widest">{cat.label}</p>
                <p className="text-amber-200/75 text-sm italic">
                  {existing[cat.key]}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setEditing(true)}
            className="btn-secondary w-full py-3 text-sm"
          >
            ✏️ Change yer vote
          </button>

          <button onClick={onBack} className="text-amber-400/60 text-xs hover:text-amber-700/60 transition-colors italic">
            ← Back to the ship
          </button>
        </div>
      </div>
    );
  }

  // ── Voting form ──
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pb-12 relative overflow-hidden">
      {bg}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 animate-fade-in pt-6">

        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">📜</span>
          <span className="animate-flicker" style={{ animationDelay: '0.9s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">Cast Yer Vote</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
          <p className="text-amber-200/35 text-xs italic mt-2">
            "Speak yer truth, sea dog. Yer vote shapes history."
          </p>
        </div>

        {totalVotes !== null && (
          <p className="text-amber-400/60 text-xs italic">
            {totalVotes === 0
              ? "Be the first to cast yer vote!"
              : `${totalVotes} ${totalVotes === 1 ? 'pirate has' : 'pirates have'} already voted`
            }
          </p>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

          {CATEGORIES.map(cat => (
            <div key={cat.key} className="card p-5 flex flex-col gap-3">
              <div>
                <p className="text-amber-300/80 text-sm font-bold font-serif">{cat.pirateLabel}</p>
                <p className="text-amber-200/40 text-[10px] uppercase tracking-widest mt-0.5">{cat.label}</p>
                <p className="text-amber-200/45 text-xs italic mt-1">{cat.description}</p>
              </div>

              <SelectField
                value={form[cat.key]}
                onChange={val => setField(cat.key, val)}
              />
            </div>
          ))}

          {error && (
            <p className="text-red-400/70 text-sm italic text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="btn-primary w-full py-4 text-base"
          >
            {submitting
              ? 'Casting yer vote…'
              : editing
                ? 'Update Yer Vote ⚓'
                : 'Cast Yer Vote ⚓'
            }
          </button>

          {editing && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-amber-400/60 text-xs hover:text-amber-700/60 transition-colors italic text-center"
            >
              Cancel — keep me original vote
            </button>
          )}
        </form>

        <button onClick={onBack} className="text-amber-400/60 text-xs hover:text-amber-700/60 transition-colors italic">
          ← Back to the ship
        </button>
      </div>
    </div>
  );
}
