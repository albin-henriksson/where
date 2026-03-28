interface SkipButtonProps {
  onClick: () => void;
}

export function SkipButton({ onClick }: SkipButtonProps) {
  return (
    <button
      data-testid="skip-button"
      onClick={onClick}
      className="fixed top-4 right-4 text-muted text-xs opacity-20 hover:opacity-70 transition-opacity"
      aria-label="Hoppa över kort"
    >
      Hoppa över ›
    </button>
  );
}
