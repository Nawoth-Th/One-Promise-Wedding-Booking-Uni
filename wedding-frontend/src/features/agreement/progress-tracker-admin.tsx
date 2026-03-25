"use client"

import { useState } from "react"
import { Order } from "@/lib/types"
import { PROGRESS_STEPS } from "@/lib/progress-constants"
import { updateOrderProgress } from "@/lib/mock-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressTrackerAdminProps {
    orderId: string
    portalToken?: string
    currentStep: number // 1-9
    lastUpdated?: Date
    onUpdate?: (stepId: number) => void
}

export function ProgressTrackerAdmin({ orderId, portalToken, currentStep, lastUpdated, onUpdate }: ProgressTrackerAdminProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [generatedToken, setGeneratedToken] = useState<string | undefined>(portalToken)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateToken = async () => {
        setIsGenerating(true)
        const { ensurePortalToken } = await import("@/lib/mock-actions")
        const result = await ensurePortalToken(orderId)
        if (result) {
            setGeneratedToken(result)
            toast.success("Portal link generated")
        } else {
            toast.error("Failed to generate link")
        }
        setIsGenerating(false)
    }

    const copyLink = () => {
        if (!generatedToken) return
        const url = `${window.location.origin}/portal/${generatedToken}`
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard")
    }

    const handleStepUpdate = async (stepId: number) => {
        setIsLoading(true)
        const result = await updateOrderProgress(orderId, stepId)
        
        if (result.success) {
            toast.success("Progress updated successfully")
            if (onUpdate) onUpdate(stepId)
        } else {
            toast.error("Failed to update progress")
        }
        setIsLoading(false)
    }

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>Post-Event Progress</CardTitle>
                <CardDescription>
                    Update the current status of the order. This will be visible to the client.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Link Section */}
                <div className="bg-muted/50 p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                        <h4 className="font-semibold text-sm">Client Portal Link</h4>
                        <p className="text-xs text-muted-foreground">Share this unified link with the client to let them track progress, sign agreements, and manage payments.</p>
                    </div>
                    
                    {generatedToken ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <code className="flex-1 sm:flex-none text-xs bg-background px-3 py-2 rounded border font-mono">
                                .../portal/{generatedToken.substring(0, 8)}...
                            </code>
                            <Button size="sm" variant="secondary" onClick={copyLink}>
                                Copy Link
                            </Button>
                        </div>
                    ) : (
                        <Button size="sm" onClick={handleGenerateToken} disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Link"}
                        </Button>
                    )}
                </div>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
                    {PROGRESS_STEPS.map((step, index) => {
                        const isCompleted = step.id < (currentStep || 0)
                        const isCurrent = step.id === (currentStep || 0)
                        const isPending = step.id > (currentStep || 0)

                        return (
                            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Icon */}
                                <div className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition-all duration-300 z-10",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                    isCurrent ? "bg-background border-primary text-primary ring-4 ring-primary/20" :
                                    "bg-background border-muted text-muted-foreground"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> :
                                     isCurrent ? <Clock className="w-6 h-6 animate-pulse" /> : 
                                     <Circle className="w-6 h-6" />}
                                </div>
                                
                                {/* Content Card */}
                                <div className={cn(
                                    "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card transition-all duration-300 hover:shadow-md",
                                    isCurrent ? "border-primary/50 shadow-md ring-1 ring-primary/10" : "border-muted"
                                )}>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                                                {step.phase}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-mono">Step {step.id}</span>
                                        </div>
                                        <h3 className={cn("font-bold text-lg", isCurrent && "text-primary")}>
                                            {step.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <span className="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground/80 border">System: {step.systemStatus}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2 border-l-2 border-primary/20 pl-2 italic">
                                            Client sees: "{step.clientView}"
                                        </p>
                                        
                                        {!isCurrent && !isCompleted && (
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="mt-3 w-full border-primary/20 hover:bg-primary/5 hover:text-primary"
                                                onClick={() => handleStepUpdate(step.id)}
                                                disabled={isLoading}
                                            >
                                                Mark as Current Step
                                            </Button>
                                        )}
                                        {isCompleted && (
                                             <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="mt-3 w-full text-muted-foreground hover:text-foreground"
                                                onClick={() => handleStepUpdate(step.id)}
                                                disabled={isLoading}
                                            >
                                                Revert to here
                                            </Button>
                                        )}
                                         {isCurrent && (
                                            <div className="mt-3 text-xs text-center text-primary font-medium animate-pulse">
                                                Current Stage
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
