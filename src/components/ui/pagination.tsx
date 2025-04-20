import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  totalItems: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  onPageSizeChange: (value: string) => void
  pageSizeOptions?: number[]
  showAllOption?: boolean
}

export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25],
  showAllOption = true,
}: PaginationProps) {
  const totalPages = React.useMemo(() => {
    if (pageSize <= 0) return 1
    return Math.ceil(totalItems / pageSize)
  }, [totalItems, pageSize])

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="page-size">Mostrar:</Label>
        <Select
          value={pageSize.toString()}
          onValueChange={onPageSizeChange}
        >
          <SelectTrigger id="page-size" className="w-[140px]">
            <SelectValue placeholder="10 por página" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size} por página
              </SelectItem>
            ))}
            {showAllOption && (
              <SelectItem value="-1">Todos</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-3 text-sm">
            {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
