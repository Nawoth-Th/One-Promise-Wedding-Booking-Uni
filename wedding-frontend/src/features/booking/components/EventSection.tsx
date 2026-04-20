/**
 * @file EventSection.tsx
 * @description A reusable UI component for managing individual event modules (Wedding, Engagement, etc.)
 * within the larger booking form.
 * 
 * Features:
 * - Dynamic Package Selection: Displays package options based on the event category.
 * - Combo Package Logic: Automatically synchronizes Wedding/Homecoming selections 
 *   when a combo package is picked.
 * - Real-time Package Details: Shows a live preview of what's included in a selected package.
 * - Addon Management: Multi-select checkbox grid for event-specific extras.
 */

import { UseFormReturn } from "react-hook-form"
import { OrderFormValues } from "../schema"
import { format } from "date-fns"
import { CalendarIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface EventSectionProps {
  form: UseFormReturn<OrderFormValues>
  section: "wedding" | "homecoming" | "engagement" | "preShoot" // The key in the form state
  title: string            // Display name for the section header
  packageOptions: string[]  // List of available packages (from pricing engine)
  addonOptions: string[]    // List of available addons
  getDetails: (category: string, name?: string) => string | string[] | undefined // Utility to fetch package feature list
  categoryName: string      // Mapping key for pricing data
  addonCategoryName: string // Mapping key for addon data
}

/**
 * EventSection Component
 * Renders a card-based UI for a single event type.
 */
export function EventSection({
  form,
  section,
  title,
  packageOptions,
  addonOptions,
  getDetails,
  categoryName,
  addonCategoryName,
}: EventSectionProps) {
  const currentPackage = form.watch(`${section}.packageType`) as string
  const currentAddons = form.watch(`${section}.addons`) || []

  /**
   * Section Reset Logic
   * Feature: Clean Slate. Clears all fields for this specific event type.
   * Logic: Handles combo-package cleanup if Wedding/Homecoming was linked.
   */
  const clearSection = () => {
    // Utility for identifying multi-event bundles
    const isComboPackage = (pkg: string | undefined) => ["Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III"].some(p => p === pkg)

    const clearFields = (sec: any) => {
      form.setValue(`${sec}.date` as any, undefined, { shouldValidate: true })
      form.setValue(`${sec}.packageType` as any, undefined, { shouldValidate: true })
      form.setValue(`${sec}.packageDetails` as any, undefined, { shouldValidate: true })
      form.setValue(`${sec}.addons` as any, [], { shouldValidate: true })
    }

    if (section === "wedding" && isComboPackage(currentPackage)) {
      clearFields("homecoming")
    }
    
    if (section === "homecoming" && isComboPackage(currentPackage)) {
      clearFields("wedding")
    }

    clearFields(section)
  }

  const details = getDetails(categoryName, currentPackage)
  const displayDetails = Array.isArray(details) ? details.join("\n") : details

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          type="button" 
          onClick={clearSection} 
          className="h-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name={`${section}.date`}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">{title} Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      {field.value instanceof Date ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${section}.packageType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value)
                  if (["Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III"].includes(value)) {
                    if (section === "wedding") form.setValue("homecoming.packageType", value)
                    if (section === "homecoming") form.setValue("wedding.packageType", value)
                  }
                }} 
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {packageOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {displayDetails && (
          <div className="p-3 bg-primary/5 rounded border border-primary/20">
            <h5 className="text-[10px] font-bold text-primary uppercase mb-1">Included in Package:</h5>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{displayDetails}</p>
          </div>
        )}

        {currentPackage === "Customized" && (
          <FormField
            control={form.control}
            name={`${section}.packageDetails`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Note</FormLabel>
                <FormControl>
                  {section === "wedding" || section === "homecoming" ? (
                    <Textarea placeholder="Enter custom details..." className="h-20" {...field} value={field.value || ""} />
                  ) : (
                    <Input placeholder="Note..." {...field} value={field.value || ""} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Separator />
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground">Addons</h4>
          <div className="grid grid-cols-2 gap-2">
            {addonOptions.map((opt) => (
              <FormField
                key={opt}
                control={form.control}
                name={`${section}.addons`}
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(opt)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), opt])
                              : field.onChange(field.value?.filter((value: string) => value !== opt))
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal text-sm cursor-pointer">
                        {opt}
                      </FormLabel>
                    </FormItem>
                  )
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
