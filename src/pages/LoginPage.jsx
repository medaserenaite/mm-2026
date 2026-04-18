import { useState, useRef } from 'react';
import { CHARACTERS } from '../data/characters.js';

const players = CHARACTERS.filter(c => !c.isAdmin).sort((a, b) => a.name.split(' ')[0].localeCompare(b.name.split(' ')[0]));
const admins  = CHARACTERS.filter(c => c.isAdmin);

export default function LoginPage({ onLogin }) {
  const [selectedChar, setSelectedChar] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);
  const codeRef = useRef(null);

  const character = CHARACTERS.find(c => c.name === selectedChar);

  function handleCharChange(e) {
    setSelectedChar(e.target.value);
    setCode('');
    setError(null);
    setTimeout(() => codeRef.current?.focus(), 50);
  }

  function handleCodeChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(val);
    setError(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!character || code.length !== 4) return;

    if (code === character.code) {
      sessionStorage.setItem('mm_character', character.name);
      onLogin(character.name);
    } else {
      setError("That code doesn't match. Check your character card.");
      setShake(true);
      setCode('');
      setTimeout(() => {
        setShake(false);
        codeRef.current?.focus();
      }, 600);
    }
  }

  const canSubmit = character && code.length === 4;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Atmospheric background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-red-700/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-7 animate-fade-in">

        {/* Header icons */}
        <div className="flex items-center gap-4 text-4xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-5xl">🏴‍☠️</span>
          <span className="animate-flicker" style={{ animationDelay: '1.1s' }}>🕯️</span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-[60px] font-black text-gradient leading-tight" style={{ fontFamily: 'Pirata One' }}>
            Pop DeKegg's Tavern
          </h1>
          <p className="text-amber-400/50 text-sm italic mt-1">Ye Olde Buccaneer's Rest</p>
          <div className="divider-rune mt-2 text-sm">⚓</div>
          <p className="text-amber-200/40 text-sm mt-3 italic">
            "State thy name and secret seal to board the ship."
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          className={`card p-8 w-full flex flex-col gap-5 ${shake ? 'shake' : ''}`}
        >
          {/* Character select */}
          <div className="flex flex-col gap-2">
            <label className="text-amber-200/50 text-xs uppercase tracking-widest font-bold text-center">
              ☠ Choose Your Character
            </label>
            <select
              value={selectedChar}
              onChange={handleCharChange}
              className="w-full rounded-xl px-5 py-4 bg-black/30 border border-amber-900/30
                text-amber-100 text-sm focus:outline-none focus:border-amber-600/50
                focus:ring-2 focus:ring-amber-700/20 transition-all duration-200
                cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-900 text-amber-900/60">
                — Select your character —
              </option>
              {players.map(c => (
                <option key={c.name} value={c.name} className="bg-zinc-900 text-amber-100">
                  {c.name}
                </option>
              ))}
              <option disabled className="bg-zinc-900 text-amber-900/30">──────────────</option>
              {admins.map(c => (
                <option key={c.name} value={c.name} className="bg-zinc-900 text-amber-900/60">
                  ⚙ {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Code input — slides in when character is selected */}
          {selectedChar && (
            <div className="flex flex-col gap-2 animate-slide-down">
              <label className="text-amber-200/50 text-xs uppercase tracking-widest font-bold text-center">
                🗝️ 4-Digit Code
              </label>
              <input
                ref={codeRef}
                type="password"
                inputMode="numeric"
                placeholder="· · · ·"
                value={code}
                onChange={handleCodeChange}
                maxLength={4}
                className={`
                  w-full rounded-xl px-5 py-4
                  text-amber-100 text-3xl text-center tracking-[0.5em] font-bold
                  placeholder:text-amber-900/30 placeholder:tracking-normal placeholder:text-xl placeholder:font-normal
                  focus:outline-none transition-all duration-200
                  bg-black/30 border
                  ${error
                    ? 'border-red-700/60 focus:ring-2 focus:ring-red-700/40'
                    : 'border-amber-900/30 focus:border-amber-600/50 focus:ring-2 focus:ring-amber-700/20'
                  }
                `}
              />
            </div>
          )}

          {error && (
            <p className="text-red-400/80 text-sm text-center italic -mt-1">{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary w-full text-base mt-1"
            disabled={!canSubmit}
          >
            Board the Ship ⚓
          </button>
        </form>

        <p className="text-amber-400/60 text-xs italic text-center">
          Your code is printed on your character card.
        </p>
      </div>
    </div>
  );
}
