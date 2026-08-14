import { useEffect } from 'react';

function isIOSWebKit(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function useLandingViewport(active: boolean): void {
  useEffect(() => {
    const ios = isIOSWebKit();
    document.documentElement.classList.toggle('ios-viewport-workaround', ios);
    document.body.classList.toggle('landing-page', active);
    document.body.classList.toggle('ios-landing-page', ios && active);
    document.body.classList.toggle('results-page', !active);

    let centreFrame = 0;
    let settleFrame = 0;
    let restoreFrame = 0;
    let relockTimer = 0;
    let lockedScrollTop = 0;
    let scrollLocked = false;
    let searchFocused = false;

    const preventScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[role="listbox"]')) return;
      event.preventDefault();
    };
    const restoreScroll = () => {
      if (!scrollLocked || searchFocused) return;
      window.cancelAnimationFrame(restoreFrame);
      restoreFrame = window.requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - lockedScrollTop) > 1) {
          window.scrollTo(0, lockedScrollTop);
        }
      });
    };

    const isSearchInput = (target: EventTarget | null) => (
      target instanceof Element && target.matches('input[role="combobox"]')
    );

    const releaseForSearch = (event: FocusEvent) => {
      if (!isSearchInput(event.target)) return;
      searchFocused = true;
    };

    const relockAfterSearch = (event: FocusEvent) => {
      if (!isSearchInput(event.target)) return;
      window.clearTimeout(relockTimer);
      relockTimer = window.setTimeout(() => {
        if (isSearchInput(document.activeElement)) return;
        searchFocused = false;
        lockedScrollTop = (document.documentElement.scrollHeight - window.innerHeight) / 2;
        window.scrollTo(0, lockedScrollTop);
        scrollLocked = true;
      }, 350);
    };

    const centreAndLock = () => {
      centreFrame = window.requestAnimationFrame(() => {
        centreFrame = window.requestAnimationFrame(() => {
          lockedScrollTop = (document.documentElement.scrollHeight - window.innerHeight) / 2;
          window.scrollTo(0, lockedScrollTop);

          settleFrame = window.requestAnimationFrame(() => {
            scrollLocked = true;
            window.addEventListener('scroll', restoreScroll, { passive: true });
            window.addEventListener('touchmove', preventScroll, { passive: false });
            window.addEventListener('wheel', preventScroll, { passive: false });
          });
        });
      });
    };

    if (ios && active) {
      document.addEventListener('focusin', releaseForSearch);
      document.addEventListener('focusout', relockAfterSearch);
      if (document.readyState === 'complete') centreAndLock();
      else window.addEventListener('load', centreAndLock, { once: true });
    } else {
      window.scrollTo({ top: 0 });
    }

    const viewport = window.visualViewport;
    const updateViewport = () => {
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const viewportTop = viewport?.offsetTop ?? 0;
      const browserBottomInset = Math.max(0, window.innerHeight - viewportHeight - viewportTop);

      document.documentElement.style.setProperty('--visual-viewport-height', `${viewportHeight}px`);
      document.documentElement.style.setProperty('--visual-viewport-offset-top', `${viewportTop}px`);
      document.documentElement.style.setProperty('--browser-bottom-inset', `${browserBottomInset}px`);
    };

    updateViewport();
    viewport?.addEventListener('resize', updateViewport);
    viewport?.addEventListener('scroll', updateViewport);

    return () => {
      scrollLocked = false;
      window.cancelAnimationFrame(centreFrame);
      window.cancelAnimationFrame(settleFrame);
      window.cancelAnimationFrame(restoreFrame);
      window.clearTimeout(relockTimer);
      window.removeEventListener('load', centreAndLock);
      window.removeEventListener('scroll', restoreScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('wheel', preventScroll);
      document.removeEventListener('focusin', releaseForSearch);
      document.removeEventListener('focusout', relockAfterSearch);
      document.body.classList.remove('landing-page');
      document.body.classList.remove('ios-landing-page');
      document.body.classList.remove('results-page');
      document.documentElement.classList.remove('ios-viewport-workaround');
      viewport?.removeEventListener('resize', updateViewport);
      viewport?.removeEventListener('scroll', updateViewport);
    };
  }, [active]);
}
