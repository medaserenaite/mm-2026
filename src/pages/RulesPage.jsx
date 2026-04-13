export default function RulesPage({ onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 pb-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-40 w-[500px] h-[500px] bg-red-700/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5 animate-fade-in pt-6">

        <div className="flex items-center gap-3 text-3xl">
          <span className="animate-flicker">🕯️</span>
          <span className="text-4xl">📋</span>
          <span className="animate-flicker" style={{ animationDelay: '0.8s' }}>🕯️</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-gradient">Game Rules</h1>
          <div className="divider-rune mt-2 text-sm">⚓</div>
        </div>

        {/* Game Rules */}
        <Section label="Rules" emoji="⚓">
          <BulletList>
            <Bullet>No smoking or vaping in the room</Bullet>
            <Bullet>Be respectful of others</Bullet>
            <Bullet>Stay in character throughout the party</Bullet>
            <Bullet>You can lie when questioned</Bullet>
          </BulletList>
        </Section>

        {/* Rounds */}
        <Section label="Rounds" emoji="🗺️">
          <div className="flex flex-col gap-4">
            <Round title="Round 1: Bingo" time="6:15pm">
              <Bullet>Find people matching character traits on your bingo card</Bullet>
              <Bullet>Must ask them a question and have a brief conversation</Bullet>
              <Bullet>First 3 to get BINGO win coins</Bullet>
            </Round>
            <Round title="Round 2: Evidence Hunt" time="6:45pm">
              <Bullet>Details will be announced when round begins</Bullet>
            </Round>
            <Round title="Round 3: Interrogation & Investigation" time="7:30pm">
              <Bullet><span className="text-amber-400/60 italic">Part A:</span> Host selects 4 people for interrogation — answer questions in character</Bullet>
              <Bullet><span className="text-amber-400/60 italic">Part B (7:45pm):</span> Host reveals 4 character rumors</Bullet>
              <Bullet><span className="text-amber-400/60 italic">Part C:</span> Free investigation + Clue Shop opens (buy hints with coins)</Bullet>
            </Round>
            <Round title="Round 4: Final Deliberation" time="8:15pm">
              <Bullet>Discuss theories and make your final accusations</Bullet>
            </Round>
            <Round title="Voting & Reveal" time="8:40pm">
              <Bullet>Vote for who you think is the killer</Bullet>
              <Bullet>Killer revealed and reads confession</Bullet>
            </Round>
          </div>
        </Section>

        {/* Coins */}
        <Section label="Coins" emoji="🪙">
          <BulletList>
            <Bullet>Earn coins by winning rounds and participating</Bullet>
            <Bullet>Spend coins at Clue Shop (Round 3) to buy hints</Bullet>
            <Bullet>Unused coins used as tiebreakers if needed</Bullet>
            <Bullet><span className="text-amber-400/50 italic">Chocolate coins from food are NOT game currency</span></Bullet>
          </BulletList>
        </Section>

        {/* Awards */}
        <Section label="Awards" emoji="🏆">
          <BulletList>
            <Bullet>
              <span>Best Detective</span>
              <span className="block text-amber-400/50 text-xs italic mt-0.5">First correct guess wins — or the murderer wins if no one guesses right</span>
            </Bullet>
            <Bullet>Best Performance</Bullet>
            <Bullet>Most Suspicious (but innocent)</Bullet>
            <Bullet>Best Costume</Bullet>
          </BulletList>
        </Section>

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

function Section({ label, emoji, children }) {
  return (
    <div className="card p-5 w-full flex flex-col gap-3">
      <p className="text-amber-400/60 text-[10px] uppercase tracking-widest font-bold">
        {emoji} {label}
      </p>
      <div className="text-amber-200/80 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Round({ title, time, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-amber-300/90 text-xs font-bold uppercase tracking-wide">{title}</p>
        <span className="text-amber-400/50 text-[10px] shrink-0">{time}</span>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function BulletList({ children }) {
  return <ul className="flex flex-col gap-1.5">{children}</ul>;
}

function Bullet({ children }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-amber-400/50 mt-0.5 shrink-0">·</span>
      <span>{children}</span>
    </div>
  );
}
