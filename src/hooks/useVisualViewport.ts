import { useEffect } from 'react';
import { viewportMeasurements } from './viewport';

export function useVisualViewport(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    const updateViewport = () => {
      const measurements = viewportMeasurements(window.innerHeight, viewport);
      document.documentElement.style.setProperty(
        '--visual-viewport-height',
        `${measurements.height}px`,
      );
      document.documentElement.style.setProperty(
        '--visual-viewport-offset-top',
        `${measurements.offsetTop}px`,
      );
      document.documentElement.style.setProperty(
        '--browser-bottom-inset',
        `${measurements.bottomInset}px`,
      );
    };

    updateViewport();
    viewport?.addEventListener('resize', updateViewport);
    viewport?.addEventListener('scroll', updateViewport);

    return () => {
      viewport?.removeEventListener('resize', updateViewport);
      viewport?.removeEventListener('scroll', updateViewport);
    };
  }, []);
}
