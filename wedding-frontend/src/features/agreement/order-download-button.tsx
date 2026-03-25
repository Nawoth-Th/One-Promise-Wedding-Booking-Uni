import { PDFDownloadLink } from "@react-pdf/renderer"
import { OrderPdf } from "./agreement-pdf"
import { Button } from "@/components/ui/button"
import { Order } from "@/lib/types"
import { Download, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function OrderDownloadButton({ order }: { order: Order }) {
  const [isClient, setIsClient] = useState(false)

  // Generate dynamic filename
  const getEventName = () => {
    const events = []
    if (order.wedding?.date || order.wedding?.packageType) events.push("Wedding")
    if (order.homecoming?.date || order.homecoming?.packageType) events.push("Homecoming")
    if (order.engagement?.date || order.engagement?.packageType) events.push("Engagement")
    if (order.preShoot?.date || order.preShoot?.packageType) events.push("Pre-shoot")
    
    if (events.length === 0) return "Event"
    return events.join(" & ")
  }

  const getCoupleName = () => {
    const bride = order.agreementDetails?.coupleName?.bride
    const groom = order.agreementDetails?.coupleName?.groom
    if (bride && groom) return `${groom} & ${bride}`
    if (bride) return bride
    if (groom) return groom
    return order.clientInfo.name
  }

  const dynamicFileName = `${order.orderNumber} - ${getEventName()} of ${getCoupleName()} _ Terms of Service.pdf`


  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
        <Button disabled>
             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             Loading PDF...
        </Button>
    )
  }

  return (
    <PDFDownloadLink document={<OrderPdf order={order} />} fileName={dynamicFileName}>
      {({ loading }) => (
        <Button disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PDF
        </Button>
      )}
    </PDFDownloadLink>
  )
}
