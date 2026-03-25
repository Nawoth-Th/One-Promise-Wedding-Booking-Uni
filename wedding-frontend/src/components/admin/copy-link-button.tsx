"use client"

import { Button } from "@/components/ui/button"
import { Link2, Check, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ensurePortalToken } from "@/lib/mock-actions"

export function CopyLinkButton({ portalToken: initialToken, orderId }: { portalToken?: string, orderId?: string }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCopy = async () => {
    let token = initialToken

    if (!token && orderId) {
        setLoading(true)
        token = await ensurePortalToken(orderId)
        setLoading(false)
    }

    if (!token) {
        toast.error("Could not generate portal link")
        return
    }
    const url = `${window.location.origin}/portal/${token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Portal link copied")
    
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} title="Copy Portal Link" disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (copied ? <Check className="h-4 w-4 text-green-500 mr-2" /> : <Link2 className="h-4 w-4 mr-2" />)}
      {copied ? "Copied" : "Copy Link"}
    </Button>
  )
}

