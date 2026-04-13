export default function CharacterPage({ character, onBack }) {
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
          <span className="text-4xl">🪪</span>
          <span className="animate-flicker" style={{ animationDelay: '0.8s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">Character</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
          <p className="text-amber-200/40 text-xs uppercase tracking-widest mt-2">{character}</p>
        </div>

        <div className="card p-8 w-full flex flex-col items-center gap-3 text-center">
          <div className="text-4xl">🌊</div>
          <p className="text-amber-200/40 text-sm italic">
            "Coming soon, sea dog."
          </p>
        </div>

        <button
          onClick={onBack}
          className="text-amber-400/60 text-xs hover:text-amber-400/80 transition-colors italic"
        >
          ← Back to the ship
        </button>
      </div>
    </div>
  );
}
