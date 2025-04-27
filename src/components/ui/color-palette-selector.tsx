import { extendedColorPalette } from '@/constants'
import { getContrastTextColor } from '@/utils'

interface ColorPaletteSelectorProps {
  selectedColor: string
  onColorSelect: (color: string) => void
  showPreview?: boolean
  previewText?: string
}

export function ColorPaletteSelector({
  selectedColor,
  onColorSelect,
}: ColorPaletteSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {extendedColorPalette.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 border-2 ${selectedColor === color ? 'shadow-md' : 'border-transparent'}`}
            style={{
              backgroundColor: color,
              ...(selectedColor === color ? { boxShadow: `0 0 0px 2px ${color}`, borderColor: getContrastTextColor(selectedColor) } : {})
            }}
            onClick={() => onColorSelect(color)}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
    </div>
  )
}
