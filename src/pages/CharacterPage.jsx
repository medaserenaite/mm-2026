import { CHARACTERS } from '../data/characters.js';

function Section({ label, emoji, children, highlight }) {
  return (
    <div
      className="card p-5 w-full flex flex-col gap-2"
      style={highlight ? { borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.04)' } : {}}
    >
      <p className="text-amber-400/60 text-[10px] uppercase tracking-widest font-bold">
        {emoji} {label}
      </p>
      <p className="text-amber-200/80 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export default function CharacterPage({ character, onBack }) {
  const profile = CHARACTERS.find(c => c.name === character);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pb-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-red-700/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-2"
        style={{ background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(180,130,40,0.15)' }}>
        <button onClick={onBack} className="btn-secondary w-full max-w-md mx-auto block py-2.5 text-sm">← Back to the ship</button>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5 animate-fade-in pt-20">

        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">🪪</span>
          <span className="animate-flicker" style={{ animationDelay: '0.8s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">My Character</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
        </div>

        {profile ? (
          <>
            {/* Identity card */}
            <div className="card p-5 w-full flex flex-col gap-1"
              style={{ borderColor: 'rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.06)' }}>
              <p className="text-amber-400/50 text-[10px] uppercase tracking-widest">Playing as</p>
              <h2 className="text-xl font-black text-gradient leading-tight">{character}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[10px] bg-amber-700/25 text-amber-400/80 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {profile.role}
                </span>
                <span className="text-amber-400/40 text-[10px]">· played by {profile.player}</span>
              </div>
            </div>

            <Section label="Who You Are" emoji="☠">
              {profile.description}
            </Section>

            <Section label="Your Motive" emoji="🗡️" highlight>
              {profile.motive}
            </Section>

            <Section label="What Others Are Saying" emoji="👁️">
              {profile.rumor}
            </Section>
          </>
        ) : (
          <div className="card p-8 w-full flex flex-col items-center gap-3 text-center">
            <div className="text-4xl">🌊</div>
            <p className="text-amber-200/40 text-sm italic">
              "No character sheet found for this scallywag."
            </p>
          </div>
        )}

        <button
          onClick={onBack}
          className="btn-secondary w-full py-2.5 text-sm"
        >
          ← Back to the ship
        </button>
      </div>
    </div>
  );
}
