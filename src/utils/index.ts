export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function getContrastTextColor(backgroundColor: string): string {
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);

  // (0.299*R + 0.587*G + 0.114*B) / 255
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function getInitial(name: string): string {
  return name.charAt(0).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
}

export function generateRoomCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function getOverlayStyles(point: number, isButton: boolean = false): string {
  if (point === 12) {
    return `absolute inset-0 bg-gradient-to-br from-yellow-300/40 via-yellow-200/30 to-yellow-400/30 dark:from-yellow-300/25 dark:via-yellow-200/25 dark:to-yellow-400/25 pointer-events-none ${isButton ? 'outline-1 rounded-r-sm' : 'rounded-[9px]'}`
  } else if (point === 10) {
    return `absolute inset-0 bg-gradient-to-br from-gray-500/30 via-gray-200/30 to-gray-400/30 dark:from-gray-300/20 dark:via-gray-100/20 dark:to-gray-400/20 pointer-events-none ${isButton ? 'outline-1' : 'rounded-[9px]'}`
  } else if (point === 8) {
    return `absolute inset-0 bg-gradient-to-br from-orange-600/30 via-orange-400/30 to-orange-400/30 dark:from-orange-800/20 dark:via-orange-400/20 dark:to-orange-500/20 pointer-events-none ${isButton ? 'outline-1' : 'rounded-[9px]'}`
  } else {
    return `absolute inset-0 bg-gradient-to-br from-gray-100/10 via-gray-0 to-gray-100/10 dark:from-gray-900/10 dark:via-gray-800/10 dark:to-gray-700/10 pointer-events-none rounded-[9px]`
  }
}

export function getButtonStyles(isSelected: boolean, point: number): string {
  if (!isSelected) return ""
  if (point === 12 || point === 10 || point === 8) {
    return `relative bg-white dark:bg-black hover:bg-white dark:hover:bg-black text-black dark:text-white border-black dark:border-white border-1 ${point === 12 ? 'rounded-r-sm' : ''}`
  }
  return "default"
}

export function getPointTextColor(point: number): string {
  if (point === 12) return 'text-yellow-500'
  if (point === 10) return 'text-gray-500'
  if (point === 8) return 'text-orange-500'
  return ''
}
