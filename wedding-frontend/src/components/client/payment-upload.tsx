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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get("file") as File
    
    if (file && file.size > 0) {
      const validTypes = ["image/png", "image/jpeg", "application/pdf"]
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Only PNG, JPG, and PDF are allowed.")
        return
      }
    } else {
      toast.error("Please select a file to upload.")
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadPaymentProof(formData, order._id!)
      if (result.success) {
        toast.success("Payment proof uploaded successfully!")
        window.location.reload() 
      } else {
        toast.error(result.error || "Failed to upload proof")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  if (hasProof && status === 'Pending') {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 text-center">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-800">Thank You!</h2>
                <p className="text-green-700/80">
                    Your payment slip has been uploaded successfully.
                </p>
            </div>
            <div className="bg-white/50 border border-green-500/20 p-4 rounded-lg flex items-center gap-3 justify-center text-green-700">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Waiting for confirmation...</span>
            </div>
            <p className="text-sm text-muted-foreground">
                Our team will verify your payment within 24 hours. You will receive an email once it's confirmed.
            </p>
            {proofUrl && (
                <div className="pt-4 border-t border-green-500/10">
                    <p className="text-xs text-muted-foreground mb-2 italic">Uploaded Receipt:</p>
                    <img src={proofUrl} alt="Uploaded Proof" className="max-h-32 mx-auto rounded border" />
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
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
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="proof">Upload Receipt (PNG, JPG, PDF)</Label>
                                <Input id="proof" name="file" type="file" accept=".png,.jpg,.jpeg,.pdf" required />
                            </div>
                            <Button type="submit" disabled={isUploading}>
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Upload New Proof
                            </Button>
                        </form>
                    </div>
                )}
             </div>
          ) : (
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="proof">Upload Receipt (PNG, JPG, PDF)</Label>
                    <Input id="proof" name="file" type="file" accept=".png,.jpg,.jpeg,.pdf" required />
                </div>
                <Button type="submit" className="w-full" disabled={isUploading}>
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
