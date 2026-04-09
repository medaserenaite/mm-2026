import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

const RANK = ['🥇', '🥈', '🥉'];

function rankLabel(idx) {
  if (idx === 0) return 'First Mate of Victory';
  if (idx === 1) return 'Second-in-Command of Fortune';
  if (idx === 2) return 'Brave Buccaneer';
  return `Rank #${idx + 1}`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    hour12: true,
  });
}

export default function LeaderboardPage({ character, onBack }) {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);

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
      .channel('leaderboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bingo_completions' }, () => {
        fetchCompletions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const myIndex = completions.findIndex(c => c.character_name === character);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pb-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-red-700/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 animate-fade-in pt-6">

        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">🏆</span>
          <span className="animate-flicker" style={{ animationDelay: '0.8s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">The Spoils</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
          <p className="text-amber-200/35 text-xs italic mt-2">
            "Those who plundered the seas of bingo first…"
          </p>
        </div>

        {/* Player's own position callout */}
        {myIndex >= 0 && (
          <div className="card p-4 w-full text-center"
            style={{ borderColor: 'rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.07)' }}>
            <p className="text-amber-400/60 text-[10px] uppercase tracking-widest mb-1">Yer position</p>
            <p className="text-amber-300 font-black text-xl">
              {myIndex < 3 ? RANK[myIndex] : `#${myIndex + 1}`}{' '}
              {myIndex < 3 ? rankLabel(myIndex) : 'Sea Dog'}
            </p>
            <p className="text-amber-200/40 text-xs font-mono mt-1">{formatTime(completions[myIndex].completed_at)}</p>
          </div>
        )}

        {/* Leaderboard list */}
        <div className="card p-5 w-full flex flex-col gap-2">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="text-3xl animate-spin">⚓</div>
              <p className="text-amber-900/50 text-xs italic">Scanning the horizon…</p>
            </div>
          ) : completions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="text-3xl">🌊</div>
              <p className="text-amber-200/40 text-sm italic">
                "No victors yet, sea dog. The treasure still awaits its first claimant…"
              </p>
            </div>
          ) : (
            <>
              <p className="text-amber-200/40 text-[10px] uppercase tracking-widest text-center mb-2">
                ☠ {completions.length} {completions.length === 1 ? 'Plunderer' : 'Plunderers'} so far ☠
              </p>
              {completions.map((entry, idx) => {
                const isMe = entry.character_name === character;
                return (
                  <div
                    key={entry.character_name}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
                    style={{
                      background: isMe
                        ? 'rgba(251,191,36,0.12)'
                        : idx < 3
                          ? 'rgba(255,255,255,0.03)'
                          : 'transparent',
                      border: isMe
                        ? '1px solid rgba(251,191,36,0.35)'
                        : '1px solid transparent',
                      boxShadow: isMe ? '0 0 16px rgba(251,191,36,0.12)' : 'none',
                    }}
                  >
                    {/* Rank badge */}
                    <span className="text-xl w-7 text-center flex-shrink-0">
                      {idx < 3 ? RANK[idx] : <span className="text-amber-400/60 text-sm font-mono">#{idx+1}</span>}
                    </span>

                    {/* Name & label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className={`text-sm font-bold truncate ${isMe ? 'text-amber-300' : 'text-amber-200/80'}`}>
                          {entry.character_name}
                        </p>
                        {isMe && (
                          <span className="text-[9px] bg-amber-700/30 text-amber-400/80 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      {idx < 3 && (
                        <p className="text-amber-900/50 text-[10px] italic">{rankLabel(idx)}</p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p className={`text-[10px] font-mono flex-shrink-0 ${isMe ? 'text-amber-400/70' : 'text-amber-400/60'}`}>
                      {formatTime(entry.completed_at)}
                    </p>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <p className="text-amber-900/30 text-[10px] italic text-center">
          Updates live as more sea dogs claim victory
        </p>

        <button
          onClick={onBack}
          className="text-amber-400/60 text-xs hover:text-amber-700/60 transition-colors italic"
        >
          ← Back to the ship
        </button>
      </div>
    </div>
  );
}
