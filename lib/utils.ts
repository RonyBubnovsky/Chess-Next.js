export function minutesToSeconds(minutes: number): number {
    return minutes * 60;
  }
  
  export function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  