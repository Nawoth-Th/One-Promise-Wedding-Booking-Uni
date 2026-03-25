"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientAgreementForm } from "./client-agreement-form"
import { ProgressTracker } from "./progress-tracker"
import { PaymentUpload } from "./payment-upload"
import { Order } from "@/lib/types"
import { FileText, Activity, CreditCard, User, Hash } from "lucide-react"

interface PortalViewProps {
  order: Order
  packageDetails: Record<string, string[]>
}

export function PortalView({ order, packageDetails }: PortalViewProps) {
  const [activeTab, setActiveTab] = useState("track")

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-8 border-b space-y-4 md:space-y-0 text-center md:text-left">
          <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">Client Portal</h1>
              <p className="text-muted-foreground mt-1">Manage your order, agreements, and track progress.</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
               <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4 text-primary" />
                  {order.clientInfo.title ? `${order.clientInfo.title}. ` : ""}{order.clientInfo.name}
               </div>
               <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Hash className="w-3 h-3" />
                  {order.orderNumber}
               </div>
          </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-12">
            <TabsTrigger value="agreement" className="text-md gap-2">
                <FileText className="w-4 h-4" /> Agreement
            </TabsTrigger>
            <TabsTrigger value="track" className="text-md gap-2">
                <Activity className="w-4 h-4" /> Track Status
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-md gap-2">
                <CreditCard className="w-4 h-4" /> Payments
            </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="agreement" className="focus-visible:outline-none focus-visible:ring-0">
          <ClientAgreementForm 
            order={order} 
            packageDetails={packageDetails} 
            onSwitchToPayment={() => setActiveTab('payment')}
          />
        </TabsContent>
        
        <TabsContent value="track" className="focus-visible:outline-none focus-visible:ring-0">
          <ProgressTracker 
            currentStep={order.progress?.currentStep || 1} 
            paymentStatus={order.financials.paymentProof?.status}
          />
        </TabsContent>
        
        <TabsContent value="payment" className="focus-visible:outline-none focus-visible:ring-0">
           <PaymentUpload order={order} />
        </TabsContent>
      </Tabs>
      
       <div className="text-center text-sm text-muted-foreground mt-12 pt-8 border-t">
          <p>Having questions? Contact us at <a href="mailto:support@onepromise.lk" className="text-primary hover:underline">support@onepromise.lk</a></p>
      </div>
    </div>
  )
}
