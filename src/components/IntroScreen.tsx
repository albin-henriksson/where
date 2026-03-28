interface IntroScreenProps {
  onContinue: () => void;
  onDontShowAgain: () => void;
}

export function IntroScreen({ onContinue, onDontShowAgain }: IntroScreenProps) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-surface px-6 animate-fade-in">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <h1 className="text-5xl font-black text-white tracking-tight">where</h1>

        <div className="w-full bg-card border border-card-border rounded-2xl p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white text-center">Hur man spelar</h2>

          <div className="flex flex-col gap-3 text-sm text-text-dim">
            <div className="flex gap-3">
              <span className="text-white font-bold min-w-[1.5rem]">1.</span>
              <p>En person läser ledtrådar högt från kortet — de ser svaret, andra gissar.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-white font-bold min-w-[1.5rem]">2.</span>
              <p>Varje kort har <span className="text-white">5 ledtrådar</span> som blir lättare och lättare. Första ledtråden ger <span className="text-white">5 poäng</span>, sista ger <span className="text-white">1 poäng</span>.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-white font-bold min-w-[1.5rem]">3.</span>
              <p>Den tredje ledtråden är alltid en <span className="text-white">bild</span> — en visuell hint!</p>
            </div>
            <div className="flex gap-3">
              <span className="text-white font-bold min-w-[1.5rem]">4.</span>
              <p>I <span className="text-white">multiplayer</span> buzza in för att svara — men fel svar låser ut dig för det kortet!</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            data-testid="intro-continue"
            onClick={onContinue}
            className="w-full py-4 px-6 bg-white text-black rounded-2xl text-lg font-semibold active:scale-95 transition-all"
          >
            Spela
          </button>
          <button
            data-testid="intro-dont-show"
            onClick={onDontShowAgain}
            className="w-full py-2 text-muted text-xs hover:text-text-dim transition-colors"
          >
            Visa inte igen
          </button>
        </div>
      </div>
    </div>
  );
}
