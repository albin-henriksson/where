export function EmptyDeck() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 animate-fade-in">
      <div className="w-16 h-24 rounded-2xl border border-dashed border-card-border flex items-center justify-center mb-2">
        <span className="text-2xl opacity-20">∅</span>
      </div>
      <p data-testid="empty-deck" className="text-xl font-bold text-text-dim">
        Inga fler kort!
      </p>
      <p className="text-muted text-xs">Ladda om för att börja om.</p>
    </div>
  );
}
