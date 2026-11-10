import { Fragment, useState } from 'react'
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'
import appCss from '../styles.css?url'

import { navigationForCapabilities } from '../auth/capabilities'
import { portalLogoutAction } from '../auth/logout'
import { getPortalShell } from '../auth/shell'
import { Button } from '../components/ui/button'
import type { QueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Clock,
  Book,
  Mail,
  Calendar,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Users,
  Tent,
  History,
  Settings,
  ShoppingCart
} from 'lucide-react'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'USSTM Portal',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
        type: 'image/x-icon',
      },
      {
        rel: 'shortcut icon',
        href: '/favicon.ico',
        type: 'image/x-icon',
      },
    ],
  }),
  component: PortalLayout,
  loader: () => getPortalShell(),
  notFoundComponent: NotFound,
  pendingComponent: Pending,
  errorComponent: UnexpectedError,
  shellComponent: RootDocument,
})

function NavIcon({ label, className }: { label: string; className?: string }) {
  switch (label) {
    case 'Dashboard':
      return <LayoutDashboard className={className} />
    case 'Office Hours':
      return <Clock className={className} />
    case 'Resources':
      return <Book className={className} />
    case 'Manage Resources':
      return <Settings className={className} />
    case 'Contact':
      return <Mail className={className} />
    case 'Events':
      return <Calendar className={className} />
    case 'Account':
      return <User className={className} />
    case 'Pickup':
      return <ShoppingCart className={className} />
    case 'Members':
    case 'Board members':
      return <Users className={className} />
    case 'Clubs':
    case 'Club Access':
      return <Tent className={className} />
    case 'Audit History':
      return <History className={className} />
    case 'Board Member':
    default:
      return <Shield className={className} />
  }
}

function PortalLayout() {
  const shell = Route.useLoaderData()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (shell.kind === 'anonymous' || shell.kind === 'denied') return <Outlet />

  const navigation = navigationForCapabilities(shell.capabilities)
  const mainNav = navigation.filter(
    (n) => n.label !== 'Account' && n.label !== 'Sign Out',
  )
  const firstAdminIndex = mainNav.findIndex((n) => n.section === 'admin')

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col md:flex-row antialiased">
      {/* Mobile Top Navigation (Hidden on Desktop) */}
      <nav className="md:hidden flex justify-between items-center px-4 h-16 w-full bg-card text-primary border-b border-border sticky top-0 z-50">
        <div className="font-bold text-xl text-primary flex items-center gap-2">
          <img
            src="/logo.png"
            alt="USSTM Logo"
            className="w-6 h-6 object-contain"
          />
          USSTM Portal
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-muted-foreground hover:text-primary transition-colors"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-card border-b border-border shadow-lg z-50 flex flex-col p-4 gap-1">
          {mainNav.map((item, index) => (
            <Fragment key={item.to + (item.hash || '')}>
              {index === firstAdminIndex && (
                <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t border-border mt-2">
                  Admin
                </div>
              )}
              <Link
                activeProps={{
                  className:
                    'border-l-4 border-primary bg-primary/10 text-primary font-semibold',
                }}
                inactiveProps={{
                  className:
                    'border-l-4 border-transparent text-muted-foreground hover:bg-secondary',
                }}
                className="flex items-center gap-3 px-4 py-2 transition-all duration-200 active:scale-95 rounded-r cursor-pointer"
                hash={item.hash}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <NavIcon label={item.label} className="w-5 h-5" />
                {item.label}
              </Link>
            </Fragment>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
            <Link
              to="/account"
              activeProps={{
                className:
                  'border-l-4 border-primary bg-primary/10 text-primary font-semibold',
              }}
              inactiveProps={{
                className:
                  'border-l-4 border-transparent text-muted-foreground hover:bg-secondary',
              }}
              className="flex items-center gap-3 px-4 py-2 transition-all duration-200 active:scale-95 rounded-r cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              Account
            </Link>
            <form action={portalLogoutAction} method="post" onSubmit={() => setIsMobileMenuOpen(false)}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2 border-l-4 border-transparent text-muted-foreground hover:bg-secondary transition-all duration-200 active:scale-95 rounded-r cursor-pointer text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </form>
            <div className="pt-2 pb-1 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <span>© 2026 USSTM</span>
              <span>·</span>
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Privacy
              </Link>
              <span>·</span>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col h-screen py-6 gap-2 bg-card text-primary text-sm border-r border-border shadow-sm fixed left-0 top-0 w-72 z-40">
        {/* Header */}
        <div className="px-6 pb-6 border-b border-border mb-4 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="USSTM Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight">
              USSTM Portal
            </h1>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 flex flex-col gap-1">
          {mainNav.map((item, index) => (
            <Fragment key={item.to + (item.hash || '')}>
              {index === firstAdminIndex && (
                <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t border-border mt-2">
                  Admin
                </div>
              )}
              <Link
                activeProps={{
                  className:
                    'border-l-4 border-primary bg-primary/10 text-primary font-semibold',
                }}
                inactiveProps={{
                  className:
                    'border-l-4 border-transparent text-muted-foreground hover:bg-secondary',
                }}
                className="flex items-center gap-3 px-4 py-2 transition-all duration-200 active:scale-95 rounded-r cursor-pointer"
                hash={item.hash}
                to={item.to}
              >
                <NavIcon label={item.label} className="w-5 h-5" />
                {item.label}
              </Link>
            </Fragment>
          ))}
        </nav>

        {/* Footer Navigation Links */}
        <div className="px-4 border-t border-border pt-4 flex flex-col gap-1 mt-auto">
          <Link
            to="/account"
            activeProps={{
              className:
                'border-l-4 border-primary bg-primary/10 text-primary font-semibold',
            }}
            inactiveProps={{
              className:
                'border-l-4 border-transparent text-muted-foreground hover:bg-secondary',
            }}
            className="flex items-center gap-3 px-4 py-2 transition-all duration-200 active:scale-95 rounded-r cursor-pointer"
          >
            <User className="w-5 h-5" />
            Account
          </Link>
          <form action={portalLogoutAction} method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2 border-l-4 border-transparent text-muted-foreground hover:bg-secondary transition-all duration-200 active:scale-95 rounded-r cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
          <div className="pt-3 pb-1 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
            <span>© 2026 USSTM</span>
            <span>·</span>
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <span>·</span>
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 w-full mx-auto flex flex-col gap-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}

function Pending() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-muted-foreground">
      Loading portal…
    </main>
  )
}

function NotFound() {
  return (
    <main className="mx-auto max-w-5xl space-y-3 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        This portal destination does not exist.
      </p>
      <Button asChild>
        <Link to="/">Return to Dashboard</Link>
      </Button>
    </main>
  )
}

function UnexpectedError({ error }: { error: unknown }) {
  const requestId = requestIdFromError(error)
  return (
    <main className="mx-auto max-w-5xl space-y-3 px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">
        Please try again. If the problem continues, contact USSTM.
      </p>
      <p className="font-mono text-sm text-muted-foreground">
        Request ID: {requestId}
      </p>
    </main>
  )
}

function requestIdFromError(error: unknown) {
  if (error instanceof Error) {
    const match = /Request ID: ([\w-]+)/.exec(error.message)
    if (match) return match[1]
  }
  return 'unavailable'
}
