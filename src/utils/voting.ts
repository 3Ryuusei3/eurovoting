import { Entry } from "@/types/Room"
import { calculateTotalPoints } from "./index"

/**
 * Get button styles for a point based on whether it's selected and its value
 */
export function getVotingButtonStyles(isSelected: boolean, point: number): string {
  if (!isSelected) return ""
  if (point === 12 || point === 10 || point === 8) {
    return `relative bg-white dark:bg-black hover:bg-white dark:hover:bg-black text-black dark:text-white border-black dark:border-white border-1 ${point === 12 ? '' : ''}`
  }
  return "default"
}

/**
 * Sort entries based on the sort method and selected points
 */
export function sortVotingEntries(entries: Entry[], sortMethod: string, selectedPoints: Record<string, Record<string, number>>): Entry[] {
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

/**
 * Calculate the top 10 entries based on points, category average, and running order
 */
export function calculateTopVotedEntries(
  entries: Entry[],
  selectedPoints: Record<string, Record<string, number>>,
  categories: Array<{label: string, value: string}>,
  eurovisionPoints: number[]
) {
  // Create an array of entries with their points and category average
  const entriesWithPoints = entries.map(entry => {
    const mainPoints = selectedPoints[entry.id]?.main || 0

    // Calculate the exact average of category points (not rounded)
    const entryPoints = selectedPoints[entry.id] || {}
    const votedCategories = categories.filter(category => entryPoints[category.value] !== undefined)
    let categoryAvg = 0

    if (votedCategories.length > 0) {
      const totalPoints = votedCategories.reduce((sum, category) => {
        return sum + (entryPoints[category.value] || 0)
      }, 0)
      categoryAvg = totalPoints / votedCategories.length
    }

    return {
      ...entry,
      userPoints: mainPoints,
      categoryAvg,
      finalPoints: 0 // Will be assigned later
    }
  })

  // Filter entries that have points
  const votedEntries = entriesWithPoints.filter(entry => entry.userPoints > 0)

  // Sort by: 1. Points (desc), 2. Category average (desc), 3. Running order (asc)
  const sortedEntries = votedEntries.sort((a, b) => {
    // First sort by main points
    if (b.userPoints !== a.userPoints) {
      return b.userPoints - a.userPoints
    }

    // If points are equal, sort by category average
    if (b.categoryAvg !== a.categoryAvg) {
      return b.categoryAvg - a.categoryAvg
    }

    // If category average is also equal, sort by running order
    return a.running_order - b.running_order
  })

  // Assign Eurovision points to the top 10
  return sortedEntries.slice(0, 10).map((entry, index) => ({
    ...entry,
    finalPoints: eurovisionPoints[index] || 0
  }))
}
