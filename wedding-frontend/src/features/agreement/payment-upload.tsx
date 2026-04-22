"use client"

import { useState } from "react"
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadPaymentProof } from "@/lib/order-actions"
import { toast } from "sonner"
import { Order } from "@/lib/types"

interface PaymentUploadProps {
  order: Order
}

export function PaymentUpload({ order }: PaymentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  
  // Explicitly check for paymentProof existence and its properties
  const hasProof = !!order.financials.paymentProof?.url
  const status = order.financials.paymentProof?.status || "Pending"
  const proofUrl = order.financials.paymentProof?.url

  async function handleUpload(formData: FormData) {
    const file = formData.get('file') as File
    if (!file || file.size === 0) {
      setShowErrors(true)
      toast.error("Please select a payment receipt image first")
      return
    }

    setIsUploading(true)
    setShowErrors(false)
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

  const isAgreementSigned = ["Signed", "Reviewing", "Completed"].includes(order.agreementStatus || "")
  const canUpload = isAgreementSigned && !isUploading

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <Card className={!isAgreementSigned ? "opacity-60 grayscale-[0.5]" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                <CardTitle>Advance Payment Proof</CardTitle>
                <CardDescription>
                    Please transfer the advance payment to the bank account details sent to your email and upload the proof here.
                </CardDescription>
              </div>
              {!isAgreementSigned && (
                  <div className="bg-amber-100 text-amber-700 p-2 rounded-full h-fit" title="Agreement Signature Required">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
              )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {!isAgreementSigned ? (
              <div className="bg-muted p-6 rounded-lg border border-dashed flex flex-col items-center text-center gap-3">
                  <div className="bg-background p-3 rounded-full border shadow-sm">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                      <h4 className="font-semibold text-sm">Upload Locked</h4>
                      <p className="text-xs text-muted-foreground mt-1 px-4">
                          You must review and sign the digital agreement in the <strong>Agreement</strong> tab before you can upload the payment proof.
                      </p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" disabled>
                      Waiting for Signature
                  </Button>
              </div>
          ) : hasProof ? (
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
                                <Label htmlFor="proof" className={showErrors ? "text-destructive" : ""}>Upload Receipt (Image) *</Label>
                                <Input id="proof" name="file" type="file" accept="image/*" className={showErrors ? "border-destructive ring-destructive" : ""} />
                            </div>
                            <Button disabled={!canUpload}>
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
                    <Label htmlFor="proof" className={showErrors ? "text-destructive" : ""}>Upload Receipt (Image) *</Label>
                    <Input id="proof" name="file" type="file" accept="image/*" className={showErrors ? "border-destructive ring-destructive" : ""} />
                </div>
                <Button className="w-full" disabled={!canUpload}>
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
