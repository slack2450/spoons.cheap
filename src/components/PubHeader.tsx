import { Brand } from './Brand';

export function PubHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="flex h-[calc(86px+env(safe-area-inset-top))] w-full items-center justify-between px-[max(20px,calc((100%_-_1180px)/2))] pt-[env(safe-area-inset-top)] max-sm:h-[calc(64px+env(safe-area-inset-top))]">
      <Brand variant="compact" />
      <button
        type="button"
        onClick={onClose}
        className="grid size-[42px] cursor-pointer place-items-center rounded-full border border-white/15 bg-white/8 pb-1 text-[1.75rem] leading-none font-light text-white transition hover:scale-[1.04] hover:bg-white/15 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-lime max-sm:size-10"
        aria-label="Close pub and choose another"
      >
        ×
      </button>
    </header>
  );
}
