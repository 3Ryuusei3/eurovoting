import { useState, useEffect, useMemo } from 'react'

interface UsePaginationProps<T> {
  items: T[]
  initialPageSize?: number
  pageSizeOptions?: number[]
}

export function usePagination<T>({
  items,
  initialPageSize = 10,
  pageSizeOptions = [5, 10]
}: UsePaginationProps<T>) {
  const [pageSize, setPageSize] = useState<number>(initialPageSize)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Reset to first page when page size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  // Get current items for the page
  const currentItems = useMemo(() => {
    if (pageSize === -1) return items
    const startIndex = (currentPage - 1) * pageSize
    return items.slice(startIndex, startIndex + pageSize)
  }, [items, currentPage, pageSize])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value))
  }

  return {
    pageSize,
    currentPage,
    currentItems,
    handlePageChange,
    handlePageSizeChange,
    pageSizeOptions
  }
}
