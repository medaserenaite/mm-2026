export default function VotingPage({ character, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(120,60,10,0.07)' }} />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'rgba(100,20,20,0.07)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-7 animate-fade-in">

        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">📜</span>
          <span className="animate-flicker" style={{ animationDelay: '0.9s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">Cast Your Vote</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
        </div>

        <div className="card p-10 w-full flex flex-col items-center gap-4">
          <div className="text-5xl">⏳</div>
          <p className="text-amber-200/50 text-center italic text-sm">
            "The voting form is being prepared, sea dog.<br />Check back soon."
          </p>
          {/* Voting form goes here */}
        </div>

        <button
          onClick={onBack}
          className="text-amber-900/40 text-xs hover:text-amber-700/60 transition-colors italic"
        >
          ← Back to the ship
        </button>
      </div>
    </div>
  );
}
