import type { AuthUser } from '@/hooks/use-auth'

import { ConnectionsSection } from './connections-section'
import { PasskeySection } from './passkey-section'
import { PasswordSection } from './password-section'
import { TwoFactorSection } from './two-factor-section'

export const SecuritySection = ({ user }: { user: AuthUser }) => {
  return (
    <div className='flex w-full flex-col gap-8 py-3 md:flex-row md:gap-0'>
      <p className='pointer-events-none font-medium text-sm'>Security</p>
      <div className='flex w-full flex-col gap-10 md:items-end'>
        <PasswordSection />
        <TwoFactorSection user={user} />
        <PasskeySection />
        <ConnectionsSection user={user} />
      </div>
    </div>
  )
}
