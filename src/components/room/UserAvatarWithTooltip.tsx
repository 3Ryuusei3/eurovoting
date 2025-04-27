
import { UserAvatar } from '@/components/ui/user-avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  setOpenTooltipId = () => {}
}: UserAvatarWithTooltipProps) {
  const isOpen = openTooltipId === id

  return (
    <Tooltip open={isMobile ? isOpen : undefined}>
      <TooltipTrigger asChild>
        <div
          onClick={() => isMobile && toggleTooltip(id)}
          onBlur={() => isMobile && setOpenTooltipId(null)}
          tabIndex={0}
          className="focus:outline-none"
        >
          <UserAvatar
            name={name}
            color={color}
            textColor={textColor}
            isCurrentUser={isCurrentUser}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  )
}
