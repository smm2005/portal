import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Clock,
  Book,
  Mail,
  Calendar,
  Shield,
  User,
  Users,
  Tent,
  History,
  ArrowRight,
  LayoutDashboard,
  ShoppingCart
} from 'lucide-react'

import { navigationForCapabilities } from '../auth/capabilities'
import { getPortalShell } from '../auth/shell'
import { AccessDenied, SignIn } from '../components/auth-state'

export const Route = createFileRoute('/')({
  component: Home,
  loader: () => getPortalShell(),
})

function NavIcon({ label, className }: { label: string; className?: string }) {
  switch (label) {
    case 'Dashboard':
      return <LayoutDashboard className={className} />
    case 'Office Hours':
      return <Clock className={className} />
    case 'Resources':
      return <Book className={className} />
    case 'Contact':
      return <Mail className={className} />
    case 'Events':
      return <Calendar className={className} />
    case 'Pickup':
      return <ShoppingCart className={className} />
    case 'Account':
      return <User className={className} />
    case 'Members':
    case 'Board Members':
      return <Users className={className} />
    case 'Clubs':
    case 'Club Access':
      return <Tent className={className} />
    case 'Audit history':
      return <History className={className} />
    case 'Board Member':
    default:
      return <Shield className={className} />
  }
}

function Home() {
  const identity = Route.useLoaderData()

  if (identity.kind === 'anonymous') {
    return <SignIn />
  }

  if (identity.kind === 'denied') {
    return <AccessDenied />
  }

  const navigation = navigationForCapabilities(identity.capabilities).filter(
    (item) => item.to !== '/',
  )

  return (
    <>
      {/* Page Header */}
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
          Welcome
          {identity.kind === 'member'
            ? `, ${identity.account.displayName}`
            : ''}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Access essential tools, manage activities, and connect with the
          Science Society network from your centralized portal.
        </p>
      </header>

      {/* Module Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigation.map((item) => (
          <Link
            className="group block p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-lg hover:bg-secondary/30 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
            hash={item.hash}
            key={`${item.to}-${item.hash ?? ''}`}
            to={item.to}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
            <div className="mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <NavIcon label={item.label} className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {item.label}
            </h3>
            <p className="text-sm text-muted-foreground flex-1">
              {item.description}
            </p>
            <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
              Access Module <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </section>
    </>
  )
}
