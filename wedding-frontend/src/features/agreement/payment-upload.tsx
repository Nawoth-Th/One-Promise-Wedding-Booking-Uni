"use client"

import { useState } from "react"
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadPaymentProof } from "@/lib/mock-actions"
import { toast } from "sonner"
import { Order } from "@/lib/types"

interface PaymentUploadProps {
  order: Order
}

export function PaymentUpload({ order }: PaymentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  
  // Explicitly check for paymentProof existence and its properties
  const hasProof = !!order.financials.paymentProof?.url
  const status = order.financials.paymentProof?.status || "Pending"
  const proofUrl = order.financials.paymentProof?.url

  async function handleUpload(formData: FormData) {
    setIsUploading(true)
    try {
      const result = await uploadPaymentProof(formData, order._id!)
      if (result.success) {
        toast.success("Payment proof uploaded successfully!")
      } else {
        toast.error(result.error || "Failed to upload proof")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Advance Payment Proof</CardTitle>
          <CardDescription>
            Please transfer the advance payment to the bank account details sent to your email and upload the proof here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {hasProof ? (
             <div className="space-y-4">
                <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                    status === 'Verified' ? 'bg-green-500/10 border-green-500/20 text-green-700' :
                    status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-700' :
                    'bg-yellow-500/10 border-yellow-500/20 text-yellow-700'
                }`}>
                    {status === 'Verified' && <CheckCircle2 className="w-5 h-5" />}
                    {status === 'Rejected' && <XCircle className="w-5 h-5" />}
                    {status === 'Pending' && <Loader2 className="w-5 h-5 animate-spin" />}
                    
                    <span className="font-medium">
                        {status === 'Verified' ? 'Payment Verified' :
                         status === 'Rejected' ? 'Proof Rejected - Please Upload Again' :
                         'Verification Pending'}
                    </span>
                </div>

                <div className="aspect-video w-full relative rounded-md overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proofUrl} alt="Payment Proof" className="object-contain w-full h-full" />
                </div>

                {status === 'Rejected' && (
                     <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-4">Please upload a valid proof.</p>
                        <form action={handleUpload} className="flex flex-col gap-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="proof">Upload Receipt (Image)</Label>
                                <Input id="proof" name="file" type="file" accept="image/*" required />
                            </div>
                            <Button disabled={isUploading}>
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Upload New Proof
                            </Button>
                        </form>
                    </div>
                )}
             </div>
          ) : (
             <form action={handleUpload} className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="proof">Upload Receipt (Image)</Label>
                    <Input id="proof" name="file" type="file" accept="image/*" required />
                </div>
                <Button className="w-full" disabled={isUploading}>
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" /> Upload Proof
                        </>
                    )}
                </Button>
             </form>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
