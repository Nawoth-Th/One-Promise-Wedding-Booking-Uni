"use client"

import { PROGRESS_STEPS } from "@/lib/progress-constants"
import { cn } from "@/lib/utils"
// Import icons
import { 
    Camera, 
    HardDrive, 
    Images, 
    Mail, 
    Filter, 
    Palette, 
    Send, 
    BookOpen, 
    Archive,
    Check,
    Clock,
    Loader2,
    FileCheck
} from "lucide-react"

interface ProgressTrackerProps {
    currentStep: number
    paymentStatus?: "Pending" | "Verified" | "Rejected"
}

const STEP_ICONS: Record<number, React.ElementType> = {
    1: FileCheck,
    2: Camera,
    3: HardDrive,
    4: Images,
    5: Mail,
    6: Filter,
    7: Palette,
    8: Send,
    9: BookOpen,
    10: Archive
}

export function ProgressTracker({ currentStep, paymentStatus }: ProgressTrackerProps) {
    const currentStepIndex = PROGRESS_STEPS.findIndex(s => s.id === currentStep)
    let currentStepData = PROGRESS_STEPS.find(s => s.id === currentStep) as any
    const CurrentIcon = STEP_ICONS[currentStep] || Loader2

    // Override Step 1 status if payment is verified
    if (currentStep === 1 && paymentStatus === 'Verified') {
        currentStepData = {
            ...currentStepData!,
            systemStatus: "Payment Verified",
            clientView: "Agreement and Advance Payment Verified.",
            description: "We have received your payment and agreement. We are now preparing for the next stage."
        } as any
    }

    // Calculate progress percentage for the bar

    // Calculate progress percentage for the bar
    // Calculate progress percentage for the bar
    const progressPercentage = Math.min(100, Math.max(0, ((currentStep - 1) / (PROGRESS_STEPS.length - 1)) * 100))

    return (
        <div className="w-full max-w-full mx-auto space-y-12 py-8">
            
            {/* Status Display */}
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-2 shadow-sm ring-1 ring-primary/20 backdrop-blur-sm">
                    <CurrentIcon className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                     <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-muted/50 text-muted-foreground font-medium text-xs uppercase tracking-widest border border-border/50">
                        {currentStepData?.phase || "Project Started"}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground drop-shadow-sm">
                        {currentStepData?.clientView || "Preparing your project..."}
                    </h1>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {currentStepData?.description}
                </p>
            </div>

            {/* Horizontal Progress Bar - Updated Design - Full Width No Scroll */}
            <div className="w-full pb-12 pt-4 px-4 hidden md:block">
                <div className="relative w-full h-16 flex items-center justify-between px-8"> 
                    
                    {/* Bar Background - Moved inside for perfect alignment */}
                    <div className="absolute top-1/2 h-[2px] bg-muted/50 -translate-y-1/2 z-0 left-[3.25rem] right-[3.25rem]">
                        {/* Active Progress Bar */}
                        <div 
                            className="h-full bg-primary transition-all duration-1000 ease-out" 
                            style={{ width: `${((currentStep - 1) / (PROGRESS_STEPS.length - 1)) * 100}%` }}
                        />
                    </div>

                    {/* Nodes */}
                    {PROGRESS_STEPS.map((step, index) => {
                        const isCompleted = step.id < currentStep
                        const isCurrent = step.id === currentStep
                        const isFuture = step.id > currentStep
                        
                        return (
                            <div key={step.id} className="relative flex flex-col items-center justify-center group z-10 p-2">
                                {/* Current Step Indicator (Caret) */}
                                {isCurrent && (
                                    <div className="absolute -top-12 animate-bounce text-primary font-bold text-xl drop-shadow-sm">
                                        ▼
                                    </div>
                                )}

                                {/* Node */}
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-sm border-[3px]",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" : 
                                    isCurrent ? "bg-background border-primary text-primary ring-4 ring-primary/10 scale-110" :
                                    "bg-background border-muted/50 text-muted-foreground"
                                )}>
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" strokeWidth={3} />
                                    ) : (
                                        <span>{step.id}</span>
                                    )}
                                </div>
                                
                                {/* Label */}
                                <div className={cn(
                                    "absolute top-14 w-28 text-center transition-all duration-300",
                                    isCurrent ? "opacity-100 font-bold text-foreground scale-105" : "opacity-70 text-muted-foreground group-hover:opacity-100",
                                    // Removed whitespace-nowrap, allowed wrapping
                                )}>
                                    <div className="text-[10px] uppercase tracking-wider font-medium mb-0.5">{step.phase}</div>
                                    <div className="text-xs leading-tight text-balance px-1">{step.title}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Detailed Current Step Card */}
            <div className="bg-background/60 backdrop-blur-xl border border-primary/10 rounded-3xl p-6 md:p-8 shadow-2xl shadow-primary/5 max-w-2xl mx-auto flex items-start gap-6 animate-in zoom-in-95 duration-500 delay-200 ring-1 ring-white/20">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10 shadow-inner">
                    <Clock className="w-7 h-7 text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        {currentStepData?.systemStatus}
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </span>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                        {currentStepData?.description || "We are currently working on this stage. You will be notified when we move to the next phase."}
                    </p>
                </div>
            </div>

            {/* Mobile View - Vertical Stack */}
            <div className="md:hidden space-y-4 px-4">
                <div className="bg-muted/30 p-4 rounded-lg text-center text-sm text-muted-foreground">
                    Rotate your device or view on desktop to see the full timeline.
                </div>
            </div>

        </div>
    )
}
