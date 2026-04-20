/**
 * @file order-form.tsx
 * @description Main Orchestrator Component for the Booking Creation Workflow.
 * This component follows the "Smart Component / Container" pattern, managing the
 * overall form state, API interaction, and coordination between modular sub-sections.
 * 
 * Features:
 * - Centralized state management via react-hook-form.
 * - Integration with Zod for robust data validation.
 * - Real-time financial calculations via the useOrderPricing hook.
 * - Modular design using atomic sub-components (ClientInfo, EventSection, etc.).
 * - Automated redirection and toast notifications upon success.
 */

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createOrder } from "@/lib/order-actions"

// Refactored Components & Logic
import { orderSchema, OrderFormValues } from "./schema"
import { useOrderPricing } from "./hooks/useOrderPricing"
import { ClientInfoSection } from "./components/ClientInfoSection"
import { EventSection } from "./components/EventSection"
import { FinancialOverview } from "./components/FinancialOverview"
import { LocationManager } from "./components/LocationManager"
import { Textarea } from "@/components/ui/textarea"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

interface OrderFormProps {
  initialOrderNumber: string // The next sequential numeric ID provided by the parent or backend.
}

/**
 * OrderForm Component
 * The main entry point for creating a new wedding booking.
 */
export default function OrderForm({ initialOrderNumber }: OrderFormProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [libraryLocations, setLibraryLocations] = useState<any[]>([])

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  // Feature: Reactive Form State initialization
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema) as any,
    defaultValues: {
      orderNumber: initialOrderNumber,
      clientInfo: { title: "Mr", name: "", phone: "", email: "" },
      wedding: { addons: [] },
      homecoming: { addons: [] },
      engagement: { addons: [] },
      preShoot: { addons: [] },
      generalAddons: [],
      financials: { packagePrice: 0, transportCost: 0, discount: 0, totalAmount: 0, balance: 0 },
      locations: [],
      notes: "",
    },
  })

  // Customs Hooks
  const pricing = useOrderPricing(form)

  useEffect(() => {
    fetch(`${API_URL}/locations`)
      .then(res => res.json())
      .then(setLibraryLocations)
      .catch(err => console.error("Failed to fetch library locations:", err))
  }, [API_URL])

  /**
   * Selection Handling Logic
   * Merges various sub-section data into a single   * pay-load for the backend.
   */
  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors:", errors)
    
    // Feature: Informative error summary toast
    const errorCount = Object.keys(errors).length
    if (errorCount > 0) {
      toast({
        title: "Missing Information",
        description: "Please check the highlighted red fields. Some required details are missing.",
        variant: "destructive"
      })
    }
  }

  async function onSubmit(data: OrderFormValues) {
    setIsSubmitting(true)
    try {
      // Transformation: Aligning form structure with Backend Model expectation
      const orderData: any = {
        ...data,
        eventDetails: {
            // Logic: Fallback mechanism for selecting the 'main' event date
            mainDate: data.wedding?.date || data.homecoming?.date || data.engagement?.date || new Date(),
            locations: data.locations,
            notes: data.notes
        },
        status: "Pending"
      }
      
      const res = await createOrder(orderData)
      
      if (res.success) {
        // UI Feedback: Informing the user of success via Toast notification
        toast({ title: "Order created successfully", description: `Order ID: ${res.orderId}` })
        navigate(`/admin/orders/${res.orderId}`)
      } else {
        toast({ title: "Failed to create order", variant: "destructive" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "Something went wrong", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8 pb-20">
        <ClientInfoSection form={form} />
        
        <Separator />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <EventSection 
                form={form}
                section="wedding"
                title="Wedding"
                packageOptions={pricing.weddingPackages}
                addonOptions={pricing.weddingAddons}
                getDetails={pricing.getDetails}
                categoryName="Wedding Packages"
                addonCategoryName="Wedding Add-ons"
            />

            <EventSection 
                form={form}
                section="homecoming"
                title="Homecoming"
                packageOptions={pricing.homecomingPackages}
                addonOptions={pricing.homecomingAddons}
                getDetails={pricing.getDetails}
                categoryName="Homecoming Packages"
                addonCategoryName="Homecoming Add-ons"
            />

            <EventSection 
                form={form}
                section="engagement"
                title="Engagement"
                packageOptions={pricing.engagementPackages}
                addonOptions={pricing.engagementAddons}
                getDetails={pricing.getDetails}
                categoryName="Engagement Packages"
                addonCategoryName="Engagement Add-ons"
            />

            <EventSection 
                form={form}
                section="preShoot"
                title="Pre-shoot"
                packageOptions={pricing.preshootPackages}
                addonOptions={pricing.preshootAddons}
                getDetails={pricing.getDetails}
                categoryName="Pre-shoot Packages"
                addonCategoryName="Pre-shoot Add-ons"
            />
        </div>

        <LocationManager form={form} libraryLocations={libraryLocations} />
        
        <Separator />

        <FinancialOverview 
            form={form} 
            addonsCost={pricing.addonsCost} 
            generalAddonsList={pricing.generalAddonsList} 
        />

        <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Internal Order Notes</FormLabel>
                <FormControl>
                    <Textarea placeholder="Any special instructions for the team..." className="h-32 shadow-inner" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <div className="fixed bottom-6 right-6 flex gap-4">
             <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-40 shadow-lg">
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                    </>
                ) : (
                    "Create Order"
                )}
            </Button>
        </div>
      </form>
    </Form>
  )
}
