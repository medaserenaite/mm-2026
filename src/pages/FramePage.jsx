export default function FramePage({ onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#080808]"
      onClick={onBack}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-red-700/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* Outer frame border */}
      <div className="relative z-10 p-[3px] rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #b45309, #fbbf24, #78350f, #fbbf24, #b45309)' }}>

        {/* Inner frame */}
        <div className="relative rounded-2xl px-16 py-12 flex flex-col items-center gap-6"
          style={{
            background: '#080808',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8), 0 0 80px rgba(180,83,9,0.25)',
          }}>

          {/* Corner ornaments */}
          <span className="absolute top-4 left-5 text-amber-600/50 text-2xl leading-none select-none">✦</span>
          <span className="absolute top-4 right-5 text-amber-600/50 text-2xl leading-none select-none">✦</span>
          <span className="absolute bottom-4 left-5 text-amber-600/50 text-2xl leading-none select-none">✦</span>
          <span className="absolute bottom-4 right-5 text-amber-600/50 text-2xl leading-none select-none">✦</span>

          {/* Top decoration */}
          <div className="flex items-center gap-4">
            <span className="animate-flicker text-3xl">🕯️</span>
            <span className="text-4xl">💀</span>
            <span className="text-5xl">🏴‍☠️</span>
            <span className="text-4xl">💀</span>
            <span className="animate-flicker text-3xl" style={{ animationDelay: '0.9s' }}>🕯️</span>
          </div>

          {/* Top rule */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(180,130,40,0.5))' }} />
            <span className="text-amber-600/60 text-xs tracking-widest">⚓ ☠ ⚓</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(180,130,40,0.5))' }} />
          </div>

          {/* Year tag */}
          <p className="text-amber-500/60 text-xs uppercase tracking-[0.4em] -mb-4">
            Anno Domini 2026
          </p>

          {/* Main title */}
          <h1
            className="text-gradient text-center leading-tight"
            style={{ fontFamily: 'Pirata One', fontSize: 'clamp(3rem, 8vw, 6rem)' }}
          >
            Murder Mystery
          </h1>

          {/* Year */}
          <div className="w-full flex items-center gap-3 -mt-4">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(180,130,40,0.3))' }} />
            <span
              className="text-gradient text-center"
              style={{ fontFamily: 'Pirata One', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              2026
            </span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(180,130,40,0.3))' }} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(180,130,40,0.4))' }} />
            <span className="text-amber-600/50 text-base tracking-widest">— ⚓ —</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(180,130,40,0.4))' }} />
          </div>

          {/* Subtitle */}
          <p className="text-amber-200/50 text-xs uppercase tracking-[0.35em] -mb-2">
            Presents
          </p>
          <h2
            className="text-amber-300/90 text-center leading-tight"
            style={{ fontFamily: 'Pirata One', fontSize: 'clamp(1.6rem, 4vw, 2.8rem)' }}
          >
            Pop DeKegg's Tavern
          </h2>

          {/* Bottom rule */}
          <div className="w-full flex items-center gap-3 mt-2">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(180,130,40,0.5))' }} />
            <span className="text-amber-600/60 text-xs tracking-widest">⚓ ☠ ⚓</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(180,130,40,0.5))' }} />
          </div>

          {/* Bottom decoration */}
          <div className="flex items-center gap-4">
            <span className="text-3xl">⚔️</span>
            <span className="text-amber-600/50 text-2xl">☠</span>
            <span className="text-3xl">⚔️</span>
          </div>

        </div>
      </div>

      {/* Tap to exit hint */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-amber-900/30 text-[10px] italic pointer-events-none">
        tap anywhere to go back
      </p>
    </div>
  );
}
