import { usePDF } from "@react-pdf/renderer"
import { OrderPdf } from "@/components/agreement-pdf"
import { Button } from "@/components/ui/button"
import { Order } from "@/lib/types"
import { useEffect, useState } from "react"

interface AgreementDownloadLinkProps {
  order: Order
  packageDetails: Record<string, string[]>
}

export default function AgreementDownloadLink({ order, packageDetails }: AgreementDownloadLinkProps) {
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

  const [instance, updateInstance] = usePDF({ document: <OrderPdf order={order} packageDetails={packageDetails} /> });

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
        <div className="flex gap-4">
             <Button className="h-12 px-8 rounded-full" disabled>
                 Loading PDF...
            </Button>
        </div>
    )
  }

  if (instance.loading) {
      return (
        <div className="flex gap-4">
             <Button className="h-12 px-8 rounded-full" disabled>
                 Generating...
            </Button>
        </div>
      )
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-center items-center w-full">
        <Button variant="outline" className="h-12 px-8 rounded-full border-2 w-full md:w-auto" onClick={() => window.open(instance.url!, '_blank')}>
            Preview Agreement
        </Button>
        <a href={instance.url!} download={dynamicFileName} className="w-full md:w-auto">
            <Button className="h-12 px-8 rounded-full w-full md:w-auto">
                Download Agreement
            </Button>
        </a>
    </div>
  )
}
