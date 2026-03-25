import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { OrderDetailsView } from "@/features/events/order-details-view"
import { api } from "@/lib/api"
import type { Order } from "@/lib/types"

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrder() {
      if (!id) return
      try {
        const data = await api.getOrderById(id)
        setOrder(data)
      } catch (err: any) {
        setError(err.message || "Failed to load order")
      } finally {
        setIsLoading(false)
      }
    }
    loadOrder()
  }, [id])

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground text-lg">Loading order details...</p></div>
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive text-lg">{error || "Order not found."}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <OrderDetailsView order={order} />
    </div>
  )
}
