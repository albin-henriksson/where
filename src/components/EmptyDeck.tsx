export function EmptyDeck() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-20 h-28 rounded-2xl border-2 border-dashed border-card-border flex items-center justify-center mb-2">
        <span className="text-3xl opacity-30">🃏</span>
      </div>
      <p data-testid="empty-deck" className="text-2xl font-bold text-text-dim">
        Inga fler kort!
      </p>
      <p className="text-muted text-sm">Ladda om sidan för att börja om.</p>
    </div>
  );
}
