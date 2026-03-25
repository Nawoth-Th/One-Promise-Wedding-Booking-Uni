import { Link } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Copy, Check } from "lucide-react"
import { format } from "date-fns"
import { api } from "@/lib/api"
import type { Order } from "@/lib/types"
import { CopyLinkButton } from "@/components/admin/copy-link-button"
import { useState, useEffect } from "react"



export default function AgreementsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getOrders()
        setOrders(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) return <div className="flex h-64 items-center justify-center">Loading agreements...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Agreements</h1>
            <p className="text-muted-foreground mt-1">Track agreement signatures and statuses</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-[150px] font-semibold">Order #</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Event Date</TableHead>
              <TableHead className="font-semibold">Agreement Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <p>No orders found.</p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id} className="group hover:bg-muted/30 transition-colors border-b border-border/40">
                  <TableCell className="font-medium text-primary/90">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium">{order.clientInfo.name}</span>
                        <span className="text-xs text-muted-foreground">{order.clientInfo.phone}</span>
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
                        ${!order.agreementStatus || order.agreementStatus === 'Not Sent' ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' : ''}
                        ${order.agreementStatus === 'Sent' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                        ${order.agreementStatus === 'Signed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                        ${order.agreementStatus === 'Reviewing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                     `}>
                        {order.agreementStatus || "Not Sent"}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <CopyLinkButton portalToken={order.portalToken} />
                        
                        {(order.agreementStatus === 'Signed' || order.agreementStatus === 'Completed') && (
                            <Button variant="ghost" size="icon" asChild className="hover:bg-primary/10 hover:text-primary transition-colors">
                                <Link to={`/portal/${order.portalToken}`} target="_blank">
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">View Portal</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
