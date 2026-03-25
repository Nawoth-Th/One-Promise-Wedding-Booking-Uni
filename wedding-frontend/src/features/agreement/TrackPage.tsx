import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ProgressTracker } from "./progress-tracker"
import { api } from "@/lib/api"
import type { Order } from "@/lib/types"
import { ArrowLeft } from "lucide-react"

export default function TrackPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      try {
        const data = await api.getOrderByToken('tracking', id)
        setOrder(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading tracker...</p></div>
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Order not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
         <div className="w-full max-w-[95vw] xl:max-w-[1600px] space-y-8">
            <div className="flex items-center justify-between">
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Order #{order.orderNumber}</div>
                    <div className="font-semibold">{order.clientInfo.name}</div>
                </div>
            </div>

            <ProgressTracker currentStep={order.progress?.currentStep || 1} />

            <div className="text-center text-sm text-muted-foreground mt-12">
                <p>Having questions? Contact us at <a href="mailto:support@onepromise.lk" className="text-primary hover:underline">support@onepromise.lk</a></p>
            </div>
        </div>
    </div>
  )
}
