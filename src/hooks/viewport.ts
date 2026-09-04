export interface NavigatorDetails {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
}

export interface ViewportDetails {
  height: number;
  offsetTop: number;
}

export interface ViewportMeasurements {
  height: number;
  offsetTop: number;
  bottomInset: number;
}

export function isIOSWebKit(details: NavigatorDetails): boolean {
  return /iPad|iPhone|iPod/.test(details.userAgent)
    || (details.platform === 'MacIntel' && details.maxTouchPoints > 1);
}

export function landingScrollTop(scrollHeight: number, innerHeight: number): number {
  return (scrollHeight - innerHeight) / 2;
}

export function viewportMeasurements(
  innerHeight: number,
  viewport?: ViewportDetails | null,
): ViewportMeasurements {
  const height = viewport?.height ?? innerHeight;
  const offsetTop = viewport?.offsetTop ?? 0;

  return {
    height,
    offsetTop,
    bottomInset: Math.max(0, innerHeight - height - offsetTop),
  };
}
