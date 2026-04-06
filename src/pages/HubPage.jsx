export default function HubPage({ character, onNavigate, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-60 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'rgba(120,60,10,0.06)' }} />
        <div className="absolute bottom-1/4 -right-60 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'rgba(100,20,20,0.06)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">🏴‍☠️</span>
          <span className="animate-flicker" style={{ animationDelay: '0.8s' }}>🕯️</span>
        </div>

        {/* Welcome */}
        <div className="text-center">
          <p className="text-amber-200/40 text-xs uppercase tracking-widest mb-2">You have boarded as</p>
          <h1 className="text-2xl font-black text-gradient leading-tight">
            {character}
          </h1>
          <div className="divider-rune mt-3 text-sm">⚓</div>
          <p className="text-amber-200/35 text-sm mt-3 italic">
            "Choose your fate, sailor."
          </p>
        </div>

        {/* Action cards */}
        <div className="card p-8 w-full flex flex-col gap-4">
          <p className="text-amber-200/40 text-xs uppercase tracking-widest text-center font-bold mb-2">
            ☠ Activities
          </p>

          <button
            onClick={() => onNavigate('bingo')}
            className="btn-primary w-full text-base py-5 flex-col gap-1"
          >
            <span className="text-2xl">🎲</span>
            <span>Bingo Game</span>
          </button>

          <button
            onClick={() => onNavigate('voting')}
            className="btn-secondary w-full text-base py-5 flex-col gap-1"
          >
            <span className="text-2xl">📜</span>
            <span>Cast Your Vote</span>
          </button>
        </div>

        {/* Sign out */}
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
