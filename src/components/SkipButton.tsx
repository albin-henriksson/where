interface SkipButtonProps {
  onClick: () => void;
}

export function SkipButton({ onClick }: SkipButtonProps) {
  return (
    <button
      data-testid="skip-button"
      onClick={onClick}
      className="fixed top-4 right-4 text-muted text-[10px] uppercase tracking-widest opacity-0 hover:opacity-60 transition-opacity duration-300"
      aria-label="Hoppa över kort"
    >
      Skip
    </button>
  );
}
