type BrandProps = {
  variant?: 'hero' | 'compact';
  component?: 'div' | 'h1';
};

export function Brand({ variant = 'hero', component = 'div' }: BrandProps) {
  const Component = component;
  const compact = variant === 'compact';

  return (
    <Component className="relative z-0 isolate m-0 inline-flex items-center text-white">
      <span
        className={`font-brand tracking-[-0.02em] text-white [text-shadow:0_12px_24px_rgba(0,0,0,0.22)] ${compact ? 'pb-[0.1em] text-[1.2rem] leading-[1.3]' : 'pb-[0.14em] text-[clamp(2.7rem,7vw,5rem)] leading-[1.35] max-sm:text-[clamp(2.35rem,13vw,3.4rem)]'}`}
      >
        Spoons.cheap
      </span>
    </Component>
  );
}
