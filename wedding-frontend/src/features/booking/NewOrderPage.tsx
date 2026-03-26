import { useState, useEffect } from "react"
import OrderForm from "./order-form"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function NewOrderPage() {
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getLatestOrderNumber()
      .then(data => {
        setOrderNumber(data.nextOrderNumber)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch order number:", err)
        setOrderNumber("ERROR")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Order</h1>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
            <OrderForm initialOrderNumber={orderNumber || "OPW-TBD"} />
        </div>
      </div>
    </div>
  )
}
