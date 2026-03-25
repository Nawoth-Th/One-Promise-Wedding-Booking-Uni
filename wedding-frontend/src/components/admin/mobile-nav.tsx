import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Menu, X, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const links = [
    { href: "/admin", label: "Orders" },
    { href: "/admin/agreements", label: "Agreements" },
    { href: "/admin/pricing", label: "Pricing" },
    { href: "/admin/events", label: "Events" },
    { href: "/admin/team", label: "Team" },
    { href: "/admin/locations", label: "Locations" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-6">
        <div className="flex flex-col gap-6">
          <Link
            to="/admin"
            className="flex items-center space-x-2"
            onClick={() => setOpen(false)}
          >
            <img src="/icon.png" alt="Logo" width={28} height={28} className="rounded-full" />
            <span className="font-bold text-base tracking-tight uppercase">
              OPW
            </span>
          </Link>

          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t pt-4 flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                setOpen(false)
                navigate("/admin/orders/new")
              }}
            >
              <Plus className="w-4 h-4" />
              New Order
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={() => {
                setOpen(false)
                navigate("/login")
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
