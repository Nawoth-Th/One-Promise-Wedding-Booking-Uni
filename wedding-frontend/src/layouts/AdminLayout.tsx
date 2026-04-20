import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/admin/mobile-nav'

export default function AdminLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="flex h-14 items-center justify-between rounded-full border border-border/40 bg-background/60 px-8 backdrop-blur-md shadow-md w-full max-w-[1440px] supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4 md:gap-8">
                <MobileNav />
                <Link to="/admin" className="flex items-center space-x-2">
                <img src="/icon.png" alt="Logo" width={32} height={32} className="rounded-full" />
                <span className="font-bold text-lg tracking-tight text-foreground antialiased uppercase whitespace-nowrap">
                    ONE PROMISE WEDDINGS
                </span>
                </Link>
                <nav className="hidden md:flex items-center space-x-1">
                    <Link
                        to="/admin"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                    >
                        Orders
                    </Link>
                    <Link
                        to="/admin/reports"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                    >
                        Reports
                    </Link>
                    <Link
                        to="/admin/agreements"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                    >
                        Agreements
                    </Link>
                    <Link
                        to="/admin/pricing"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                    >
                        Pricing
                    </Link>
                    <Link
                        to="/admin/events"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                    >
                        Events
                    </Link>
                    <Link
                        to="/admin/team"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                    >
                        Team
                    </Link>
                    <Link
                        to="/admin/locations"
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
                    >
                        Locations
                    </Link>

                </nav>
            </div>
          
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="sm" className="hidden md:flex bg-transparent border-primary/50 text-foreground hover:bg-primary hover:text-primary-foreground rounded-lg transition-all duration-300">
                    <Link to="/admin/orders/new">New Order</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:block text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => navigate('/login')}
                >
                  Logout
                </Button>
            </div>
        </div>
      </header>
      <main className="flex-1 p-6 pt-28 bg-muted/10">
        <Outlet />
      </main>
    </div>
  )
}
