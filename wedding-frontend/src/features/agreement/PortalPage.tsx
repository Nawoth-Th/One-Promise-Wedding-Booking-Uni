import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { PortalView } from "./portal-view"
import { api } from "@/lib/api"
import type { Order } from "@/lib/types"

export default function PortalPage() {
  const { token } = useParams<{ token: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [packageDetails, setPackageDetails] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!token) return
      try {
        const [orderData, pricingData] = await Promise.all([
          api.getOrderByToken('portal', token),
          api.getPricingItems()
        ])
        setOrder(orderData)
        
        const map: Record<string, string[]> = {}
        pricingData.forEach(p => {
          map[p._id!] = p.details || []
        })
        setPackageDetails(map)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [token])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading portal...</p></div>
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Portal not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PortalView order={order} packageDetails={packageDetails} />
    </div>
  )
}
