export interface Heart {
  x: number;
  y: number;
  baseColor: string;
  currentColor: string;
  outlineColor: string;
  baseScale: number;
  scale: number;
  brightness: number;
  secondaryBrightness: number;
}

export interface LightSource {
  x: number;
  y: number;
  color: string;
  radius: number;
  intensity: number;
  velocityX: number;
  velocityY: number;
  targetX: number;
  targetY: number;
}

export const HEART_PATH = "M26 7.78c0 9.36-12.09 14.56-13.65 19.16-.17.49-.6.33-.73.13C9.67 24.1 0 22.14 0 12.59c0-7.4 5.15-9.7 6.99-9.7 2.28 0 4.19 1.34 4.73 2.58C13.71 2.05 17 0 19.79 0S26 2.53 26 7.78z";
