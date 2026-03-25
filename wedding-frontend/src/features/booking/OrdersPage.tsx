import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, CalendarRange } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import type { Order } from "@/lib/types"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await api.getOrders()
        setOrders(data)
      } catch (err) {
        console.error("Failed to fetch orders:", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [])

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading orders...</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Orders</h1>
            <p className="text-muted-foreground mt-1">Manage your photography bookings and agreements</p>
        </div>
        <Button asChild className="h-10 px-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <Link to="/admin/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="w-[150px] font-semibold">Order #</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Main Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Payment Slip</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarRange className="h-8 w-8 opacity-20" />
                      <p>No orders found. Create your first one!</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: Order) => (
                  <TableRow key={order._id} className="group hover:bg-muted/30 transition-colors border-b border-border/40 relative">
                    <TableCell className="font-medium text-primary/90 relative z-10">
                       <Link to={`/admin/orders/${order._id}`} className="hover:underline underline-offset-4 decoration-primary/50">
                          {order.orderNumber}
                       </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                          <span className="font-medium">{order.clientInfo.name}</span>
                          <span className="text-xs text-muted-foreground font-light tracking-wide">{order.clientInfo.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.eventDetails.mainDate
                        ? <span className="text-sm">{format(new Date(order.eventDetails.mainDate), "MMM d, yyyy")}</span>
                        : <span className="text-muted-foreground italic text-xs">Not set</span>}
                    </TableCell>
                    <TableCell>
                       <Badge variant="secondary" className={`
                          capitalize font-normal px-2.5 py-0.5 rounded-full border
                          ${order.status === 'Confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                          ${order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                          ${order.status === 'Completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                          ${order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                       `}>
                          {order.status}
                       </Badge>
                    </TableCell>
                    <TableCell>
                        {order.financials.paymentProof ? (
                            <Badge variant="outline" className={`
                                capitalize font-normal px-2.5 py-0.5 rounded-full border
                                ${order.financials.paymentProof.status === 'Verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                                ${order.financials.paymentProof.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                                ${order.financials.paymentProof.status === 'Rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                            `}>
                                {order.financials.paymentProof.status}
                            </Badge>
                        ) : (
                            <span className="text-xs text-muted-foreground italic">No Slip</span>
                        )}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground text-right font-semibold">
                      {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(order.financials.totalAmount)}
                    </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                      </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
