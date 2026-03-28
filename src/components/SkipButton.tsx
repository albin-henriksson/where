interface SkipButtonProps {
  onClick: () => void;
}

export function SkipButton({ onClick }: SkipButtonProps) {
  return (
    <button
      data-testid="skip-button"
      onClick={onClick}
      className="fixed top-4 right-4 text-gray-300 hover:text-gray-500 text-xs opacity-30 hover:opacity-100 transition-opacity"
      aria-label="Hoppa över kort"
    >
      Hoppa över
    </button>
  );
}
