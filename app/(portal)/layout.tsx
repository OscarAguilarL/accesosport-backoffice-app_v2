import { AuthProvider } from '@/lib/auth-context'
import { PortalLayout } from '@/components/portal/portal-layout'

export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <PortalLayout>{children}</PortalLayout>
    </AuthProvider>
  )
}
