
import { UserAvatar } from '@/components/ui/user-avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface UserAvatarWithTooltipProps {
  name: string
  color: string
  textColor?: string
  isCurrentUser?: boolean
  isMobile?: boolean
  id?: string
  openTooltipId?: string | null
  toggleTooltip?: (id: string) => void
  setOpenTooltipId?: (id: string | null) => void
  isAdmin?: boolean
  onAdminClick?: (id: string) => void
}

export function UserAvatarWithTooltip({
  name,
  color,
  textColor,
  isCurrentUser = false,
  isMobile = false,
  id = '',
  openTooltipId = null,
  toggleTooltip = () => {},
  setOpenTooltipId = () => {},
  isAdmin = false,
  onAdminClick = () => {}
}: UserAvatarWithTooltipProps) {
  const isOpen = openTooltipId === id

  const handleClick = () => {
    if (isAdmin && id) {
      onAdminClick(id)
    } else if (isMobile) {
      toggleTooltip(id)
    }
  }

  return (
    <Tooltip open={isMobile ? isOpen : undefined}>
      <TooltipTrigger asChild>
        <div
          onClick={handleClick}
          onBlur={() => isMobile && setOpenTooltipId(null)}
          tabIndex={0}
          className={`focus:outline-none ${isAdmin ? 'cursor-pointer' : ''}`}
        >
          <UserAvatar
            name={name}
            color={color}
            textColor={textColor}
            isCurrentUser={isCurrentUser}
            className={isAdmin ? 'hover:opacity-80' : ''}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  )
}
