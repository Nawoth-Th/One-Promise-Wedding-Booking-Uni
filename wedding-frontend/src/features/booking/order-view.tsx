"use client"

import { Order } from "@/lib/types"
import { OrderPdf } from "@/features/agreement/agreement-pdf"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"
import OrderDownloadButton from "@/features/agreement/order-download-button"
import { useState } from "react"
import { verifyPayment } from "@/lib/order-actions"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Loader2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import { CopyLinkButton } from "@/components/admin/copy-link-button"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OrderViewProps {
  order: Order
}

export default function OrderView({ order: initialOrder }: OrderViewProps) {
  const [order, setOrder] = useState(initialOrder)
  const [isVerifying, setIsVerifying] = useState(false)
  const [advanceAmount, setAdvanceAmount] = useState<string>("")

  const handleVerify = async (status: "Verified" | "Rejected") => {
    // Feature: Amount Validation
    if (status === "Verified" && (!advanceAmount || isNaN(Number(advanceAmount)) || Number(advanceAmount) <= 0)) {
        toast.error("Please enter a valid advance amount to verify.");
        return;
    }

    setIsVerifying(true)
    try {
      const amount = Number(advanceAmount) || 0
      const res = await verifyPayment(order._id!, status, amount)
      if (res.success) {
        toast.success(`Payment marked as ${status}`)
        setOrder({
          ...order,
          financials: {
            ...order.financials,
            balance: status === "Verified" ? Math.max(0, order.financials.balance - amount) : order.financials.balance,
            paymentProof: {
              ...order.financials.paymentProof!,
              status
            }
          }
        })
        setAdvanceAmount("") // Reset on success
      } else {
        toast.error("Failed to update status")
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setIsVerifying(false)
    }
  }

  const paymentProof = order.financials.paymentProof
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order Details: {order.orderNumber}</h2>
        <div className="flex items-center gap-2">
            <CopyLinkButton portalToken={order.portalToken || order.agreementToken} />
            <OrderDownloadButton order={order} />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-semibold text-muted-foreground mr-2">Name:</span> {order.clientInfo.name}</div>
            <div><span className="font-semibold text-muted-foreground mr-2">Phone:</span> {order.clientInfo.phone}</div>
            <div><span className="font-semibold text-muted-foreground mr-2">Email:</span> {order.clientInfo.email}</div>
          </CardContent>
        </Card>

        {order.wedding && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Wedding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               {order.wedding.date && (
                  <div><span className="font-semibold text-muted-foreground mr-2">Date:</span> {format(new Date(order.wedding.date), "PPP")}</div>
               )}
               <div>
                   <span className="font-semibold text-muted-foreground mr-2">Package:</span> 
                   {order.wedding.packageType}
                   {order.wedding.packageType === "Customized" && order.wedding.packageDetails && (
                       <span className="block text-sm text-yellow-600 mt-1 pl-4 border-l-2 border-yellow-200">{order.wedding.packageDetails}</span>
                   )}
               </div>
               {order.wedding.addons && order.wedding.addons.length > 0 && (
                   <div className="mt-2">
                       <span className="font-semibold text-muted-foreground">Addons:</span>
                       <ul className="list-disc list-inside text-sm mt-1 ml-2">
                           {order.wedding.addons.map((addon, i) => <li key={i}>{addon}</li>)}
                       </ul>
                   </div>
               )}
            </CardContent>
          </Card>
        )}

        {order.homecoming && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle>Homecoming</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               {order.homecoming.date && (
                  <div><span className="font-semibold text-muted-foreground mr-2">Date:</span> {format(new Date(order.homecoming.date), "PPP")}</div>
               )}
               <div>
                   <span className="font-semibold text-muted-foreground mr-2">Package:</span> 
                   {order.homecoming.packageType}
                   {order.homecoming.packageType === "Customized" && order.homecoming.packageDetails && (
                       <span className="block text-sm text-yellow-600 mt-1 pl-4 border-l-2 border-yellow-200">{order.homecoming.packageDetails}</span>
                   )}
               </div>
               {order.homecoming.addons && order.homecoming.addons.length > 0 && (
                   <div className="mt-2">
                       <span className="font-semibold text-muted-foreground">Addons:</span>
                       <ul className="list-disc list-inside text-sm mt-1 ml-2">
                           {order.homecoming.addons.map((addon, i) => <li key={i}>{addon}</li>)}
                       </ul>
                   </div>
               )}
            </CardContent>
          </Card>
        )}
        
        {order.engagement && (order.engagement.date || order.engagement.packageType) && (
            <Card className="border-l-4 border-l-primary">
                <CardHeader>
                <CardTitle>Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                 {order.engagement.date && (
                    <div><span className="font-semibold text-muted-foreground mr-2">Date:</span> {format(new Date(order.engagement.date), "PPP")}</div>
                 )}
                 <div>
                    <span className="font-semibold text-muted-foreground mr-2">Package:</span> 
                    {order.engagement.packageType}
                    {order.engagement.packageType === "Customized" && order.engagement.packageDetails && (
                       <span className="block text-sm text-yellow-600 mt-1 pl-4 border-l-2 border-yellow-200">{order.engagement.packageDetails}</span>
                   )}
                 </div>
                  {order.engagement.addons && order.engagement.addons.length > 0 && (
                   <div className="mt-2">
                       <span className="font-semibold text-muted-foreground">Addons:</span>
                       <ul className="list-disc list-inside text-sm mt-1 ml-2">
                           {order.engagement.addons.map((addon, i) => <li key={i}>{addon}</li>)}
                       </ul>
                   </div>
               )}
                </CardContent>
            </Card>
        )}
        
        {order.preShoot && (order.preShoot.date || order.preShoot.packageType) && (
            <Card className="border-l-4 border-l-primary">
                <CardHeader>
                <CardTitle>Pre-shoot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                 {order.preShoot.date && (
                    <div><span className="font-semibold text-muted-foreground mr-2">Date:</span> {format(new Date(order.preShoot.date), "PPP")}</div>
                 )}
                 <div>
                    <span className="font-semibold text-muted-foreground mr-2">Package:</span> 
                    {order.preShoot.packageType}
                     {order.preShoot.packageType === "Customized" && order.preShoot.packageDetails && (
                       <span className="block text-sm text-yellow-600 mt-1 pl-4 border-l-2 border-yellow-200">{order.preShoot.packageDetails}</span>
                   )}
                 </div>
                  {order.preShoot.addons && order.preShoot.addons.length > 0 && (
                   <div className="mt-2">
                       <span className="font-semibold text-muted-foreground">Addons:</span>
                       <ul className="list-disc list-inside text-sm mt-1 ml-2">
                           {order.preShoot.addons.map((addon, i) => <li key={i}>{addon}</li>)}
                       </ul>
                   </div>
               )}
                </CardContent>
            </Card>
        )}

         {order.generalAddons && order.generalAddons.length > 0 && (
            <Card className="border-l-4 border-l-primary">
                <CardHeader>
                <CardTitle>General Addons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ul className="list-disc list-inside text-sm ml-2">
                        {order.generalAddons.map((addon, i) => <li key={i}>{addon}</li>)}
                    </ul>
                </CardContent>
            </Card>
        )}

        {(order.eventDetails?.locations || order.eventDetails?.notes) && (
            <Card className="border-l-4 border-l-primary md:col-span-2">
                <CardHeader>
                <CardTitle>Additional Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {order.eventDetails.locations && (
                        <div>
                             <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-1">Locations</h4>
                             {Array.isArray(order.eventDetails.locations) ? (
                                <ul className="list-disc list-inside text-sm pl-2">
                                    {order.eventDetails.locations.map((loc, i) => {
                                        if (typeof loc === 'string') {
                                            return <li key={i}>{loc}</li>;
                                        }
                                        return (
                                            <li key={i} className="flex items-center gap-2">
                                                {loc.forEvent && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{loc.forEvent}</span>}
                                                <span>{loc.name}</span>
                                                {loc.url && (
                                                    <a href={loc.url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs flex items-center">
                                                        (View Map)
                                                    </a>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                             ) : (
                                <p className="whitespace-pre-wrap text-sm">{order.eventDetails.locations}</p>
                             )}
                        </div>
                    )}
                    {order.eventDetails.notes && (
                        <div>
                             <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-1">Notes</h4>
                             <p className="whitespace-pre-wrap text-sm">{order.eventDetails.notes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        <Card className="bg-muted/10 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle>Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-muted-foreground">Package Price:</span> 
                <span>LKR {order.financials.packagePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2 pt-2">
                <span className="font-semibold text-muted-foreground">Transport Cost:</span> 
                <span>LKR {order.financials.transportCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2 pt-2">
                <span className="font-semibold">Total:</span> 
                <span>LKR {order.financials.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2">
                <span className="font-bold text-lg text-primary">Balance Due:</span> 
                <span className="font-bold text-lg text-primary">LKR {order.financials.balance.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {paymentProof && (
            <Card className={`border-l-4 ${
                paymentProof.status === 'Verified' ? 'border-l-green-500 bg-green-500/5' :
                paymentProof.status === 'Rejected' ? 'border-l-red-500 bg-red-500/5' :
                'border-l-yellow-500 bg-yellow-500/5'
            } md:col-span-2`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Payment Verification</CardTitle>
                        <CardDescription>Review the uploaded payment slip and update status</CardDescription>
                    </div>
                     <Badge variant="outline" className={`
                        capitalize px-3 py-1 rounded-full text-xs font-bold
                        ${paymentProof.status === 'Verified' ? 'bg-green-100 text-green-700 border-green-300' :
                          paymentProof.status === 'Rejected' ? 'bg-red-100 !text-red-600 border-red-300' :
                          'bg-yellow-100 text-yellow-800 border-yellow-400'}
                    `}>
                        {paymentProof.status || 'Pending'}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-muted-foreground font-medium">Uploaded At</p>
                                    <p className="font-semibold">{paymentProof.uploadedAt ? format(new Date(paymentProof.uploadedAt), "PPP p") : 'N/A'}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-muted-foreground font-medium">Auto Status</p>
                                    <p className="font-semibold text-primary">MANUAL REVIEW</p>
                                </div>
                            </div>
                            
                            {/* Feature: Advance Amount Input */}
                            {paymentProof.status === 'Pending' && (
                                <div className="space-y-2 pt-4 border-t">
                                    <Label htmlFor="advanceAmount" className="text-sm font-semibold">Verify Advance Amount (LKR)</Label>
                                    <Input 
                                        id="advanceAmount"
                                        type="number"
                                        min="0"
                                        placeholder="Enter the amount shown on slip..."
                                        value={advanceAmount}
                                        onChange={(e) => setAdvanceAmount(e.target.value)}
                                        className="bg-background border-primary/20 focus:border-primary"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">
                                        This amount will be automatically deducted from the Balance Due upon verification.
                                    </p>
                                </div>
                            )}

                            {/* Feature: Verification Summary */}
                            {paymentProof.status !== 'Pending' && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                                    paymentProof.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' :
                                    'bg-red-50 text-red-600 border-red-200'
                                }`}>
                                    {paymentProof.status === 'Verified' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    <div className="text-sm">
                                        <p className="font-bold uppercase tracking-tight">Payment {paymentProof.status}</p>
                                        <p className="text-[11px] opacity-80">
                                            {paymentProof.status === 'Verified' ? 
                                                'The balance has been adjusted and the studio schedule updated.' : 
                                                'The client has been notified to re-upload a valid proof.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-4 border-t">
                                <Button 
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-30" 
                                    onClick={() => handleVerify("Verified")}
                                    disabled={isVerifying || paymentProof.status !== 'Pending'}
                                >
                                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    Verify Payment
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="flex-1 border-red-500 !text-red-600 hover:bg-red-50 font-extrabold disabled:opacity-30"
                                    onClick={() => handleVerify("Rejected")}
                                    disabled={isVerifying || paymentProof.status !== 'Pending'}
                                >
                                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                    Reject Proof
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="relative group overflow-hidden rounded-lg border bg-white aspect-[4/3] flex items-center justify-center">
                                {paymentProof.url ? (
                                    <>
                                        <img src={paymentProof.url} alt="Payment Receipt" className="object-contain w-full h-full max-h-[300px]" />
                                        <a 
                                            href={paymentProof.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2"
                                        >
                                            <Eye className="w-5 h-5" />
                                            View Full Image
                                        </a>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground italic text-sm">No image available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  )
}
