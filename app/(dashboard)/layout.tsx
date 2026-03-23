import { AuthProvider } from '@/lib/auth-context'

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
