import Link from 'next/link'
import { FaGithub, FaGlobe } from 'react-icons/fa6'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { User } from '@/types'

const UserHoverCard = ({ user }: { user: User }) => {
  return (
    <HoverCard>
      <HoverCardTrigger className="hover:underline">@{user.username}</HoverCardTrigger>
      <UserHoverCardContent user={user} />
    </HoverCard>
  )
}

export const UserHoverCardContent = ({ user }: { user: User }) => {
  const firstName = user.username.substring(1)

  return (
    <HoverCardContent className="flex w-fit items-center gap-x-2">
      <Avatar>
        {user.profileImage ? <AvatarImage src={user.profileImage} /> : <AvatarFallback>{firstName}</AvatarFallback>}
      </Avatar>

      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1">
            <span className="font-bold">{user.username}</span>
            {user.position && <Badge>{user.position}</Badge>}
          </div>

          <div className="flex items-center gap-x-2">
            {user.github && (
              <Link href={user.github}>
                <FaGithub size={24} />
              </Link>
            )}
            {user.blog && (
              <Link href={user.blog}>
                <FaGlobe size={24} />
              </Link>
            )}
          </div>
        </div>

        <p>{user.bio}</p>
      </div>
    </HoverCardContent>
  )
}

export default UserHoverCard
