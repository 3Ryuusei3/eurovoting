import { getInitial, getContrastTextColor } from '@/utils'

interface UserAvatarProps {
  name: string
  color: string
  textColor?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isCurrentUser?: boolean
  onClick?: () => void
  onBlur?: () => void
  tabIndex?: number
  className?: string
}

export function UserAvatar({
  name,
  color,
  textColor,
  size = 'md',
  isCurrentUser = false,
  onClick,
  onBlur,
  tabIndex,
  className = ''
}: UserAvatarProps) {
  const calculatedTextColor = textColor || getContrastTextColor(color)

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl'
  }

  return (
    <div
      onClick={onClick}
      onBlur={onBlur}
      tabIndex={tabIndex}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center font-medium
        border-2
        ${isCurrentUser ? 'shadow-md' : 'border-transparent'}
        ${onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
        transition
        ${className}
      `}
      style={{
        backgroundColor: color,
        color: calculatedTextColor,
        ...(isCurrentUser ? {
          boxShadow: `0 0 0px 2px ${color}`,
          borderColor: calculatedTextColor
        } : {})
      }}
    >
      {getInitial(name)}
    </div>
  )
}
