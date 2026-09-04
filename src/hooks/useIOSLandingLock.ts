import { useEffect } from 'react';
import { landingScrollTop } from './viewport';

function isSearchInput(target: EventTarget | null): boolean {
  return target instanceof Element && target.matches('input[role="combobox"]');
}

export function useIOSLandingLock(ios: boolean, active: boolean): void {
  useEffect(() => {
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

    const releaseForSearch = (event: FocusEvent) => {
      if (isSearchInput(event.target)) searchFocused = true;
    };

    const relockAfterSearch = (event: FocusEvent) => {
      if (!isSearchInput(event.target)) return;
      window.clearTimeout(relockTimer);
      relockTimer = window.setTimeout(() => {
        if (isSearchInput(document.activeElement)) return;
        searchFocused = false;
        lockedScrollTop = landingScrollTop(
          document.documentElement.scrollHeight,
          window.innerHeight,
        );
        window.scrollTo(0, lockedScrollTop);
        scrollLocked = true;
      }, 350);
    };

    const centreAndLock = () => {
      centreFrame = window.requestAnimationFrame(() => {
        centreFrame = window.requestAnimationFrame(() => {
          lockedScrollTop = landingScrollTop(
            document.documentElement.scrollHeight,
            window.innerHeight,
          );
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
    };
  }, [active, ios]);
}
