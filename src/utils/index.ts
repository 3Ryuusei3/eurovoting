import { Entry } from "@/types/Room";

export function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Calculate relative luminance according to WCAG 2.0
export function getLuminance(color: string): number {
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;

  // Calculate luminance using the formula from WCAG 2.0
  const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// Calculate contrast ratio between two colors according to WCAG 2.0
export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);

  // Ensure the lighter color is always in the numerator
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if the contrast is sufficient according to WCAG guidelines
export function hasGoodContrast(backgroundColor: string, textColor: string): { isGood: boolean; ratio: number } {
  const ratio = getContrastRatio(backgroundColor, textColor);
  // WCAG 2.0 level AA requires a contrast ratio of at least 4.5:1 for normal text
  // and 3:1 for large text. We'll use 3:1 as our minimum threshold.
  return { isGood: ratio >= 3, ratio };
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
  if (isButton && point === 12) {
    return `absolute inset-0 bg-gradient-to-br from-yellow-300/40 via-yellow-200/30 to-yellow-400/30 dark:from-yellow-300/25 dark:via-yellow-200/25 dark:to-yellow-400/25 pointer-events-none ${isButton ? 'outline-1 rounded-r-sm' : 'rounded-[9px]'}`
  } else if (isButton && point === 10) {
    return `absolute inset-0 bg-gradient-to-br from-gray-600/30 via-gray-300/30 to-gray-500/30 dark:from-gray-300/20 dark:via-white-100/20 dark:to-gray-400/20 pointer-events-none ${isButton ? 'outline-1' : 'rounded-[9px]'}`
  } else if (isButton && point === 8) {
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
  if (point === 10) return 'text-gray-400'
  if (point === 8) return 'text-orange-500'
  return ''
}

export function calculateTotalPoints(selectedPoints: Record<string, Record<string, number>>, entryId: number): number {
  const entryPoints = selectedPoints[entryId]
  if (!entryPoints) return 0

  return entryPoints.main || 0
}

export function calculateCategoryPoints(selectedPoints: Record<string, Record<string, number>>, entryId: number, categories: Array<{label: string, value: string}>): number {
  const entryPoints = selectedPoints[entryId]
  if (!entryPoints) return 0

  const votedCategories = categories.filter(category => entryPoints[category.value] !== undefined)
  if (votedCategories.length === 0) return 0

  const totalPoints = votedCategories.reduce((sum, category) => {
    return sum + (entryPoints[category.value] || 0)
  }, 0)

  return Math.round(totalPoints / votedCategories.length)
}

// Round to the nearest valid score (1, 2, 3, 4, 5, 6, 7, 8, 10, 12)
export function roundToValidScore(score: number): number {
  const validScores = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12]

  // If score is already a valid score, return it
  if (validScores.includes(score)) return score

  // Find the closest valid score
  return validScores.reduce((prev, curr) => {
    const prevDiff = Math.abs(prev - score)
    const currDiff = Math.abs(curr - score)

    if (prevDiff === currDiff) {
      // If the difference is the same, prefer the higher score
      return Math.max(prev, curr)
    }

    return currDiff < prevDiff ? curr : prev
  })
}

export function hasCategoryVotes(selectedPoints: Record<string, Record<string, number>>, entryId: number, categories: Array<{label: string, value: string}>): boolean {
  const entryPoints = selectedPoints[entryId]
  if (!entryPoints) return false

  return categories.some(category => entryPoints[category.value] !== undefined)
}

export function sortEntries(entries: Entry[], sortMethod: string, selectedPoints: Record<string, Record<string, number>>): Entry[] {
  return [...entries].sort((a, b) => {
    if (sortMethod === 'running_order') {
      return a.running_order - b.running_order
    } else {
      const pointsA = calculateTotalPoints(selectedPoints, a.id)
      const pointsB = calculateTotalPoints(selectedPoints, b.id)
      if (pointsA === pointsB) {
        return a.running_order - b.running_order
      }
      return pointsB - pointsA
    }
  })
}
