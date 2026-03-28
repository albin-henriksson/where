export function EmptyDeck() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <p data-testid="empty-deck" className="text-2xl font-bold text-gray-400">
        Inga fler kort!
      </p>
      <p className="text-gray-400">Ladda om sidan för att börja om.</p>
    </div>
  );
}
