/**
 * @file FinancialOverview.tsx
 * @description Component for displaying and managing the financial summary of a booking.
 * It aggregates the base package price, addon costs from all events, transport fees,
 * and applied discounts to calculate the final contract value.
 * 
 * Features:
 * - Reactive Totals: Updates automatically as inputs are changed.
 * - General Addons: Managing cross-event addons (e.g., "Full Team Travel").
 * - Specialized Input UI: Formatted currency inputs with 'LKR' prefix.
 */

import { UseFormReturn } from "react-hook-form"
import { OrderFormValues } from "../schema"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

interface FinancialOverviewProps {
  form: UseFormReturn<OrderFormValues>
  addonsCost: number         // The combined cost of all event-specific addons
  generalAddonsList: string[] // List of globally available addons
}

/**
 * FinancialOverview Component
 * Renders the breakdown of costs and the final total amount.
 */
export function FinancialOverview({ form, addonsCost, generalAddonsList }: FinancialOverviewProps) {
  const packageBasePrice = form.watch("financials.packagePrice")
  const transportCost = form.watch("financials.transportCost")
  const discount = form.watch("financials.discount")
  const totalAmount = form.watch("financials.totalAmount")

  return (
    <div className="space-y-6">
      <div className="p-6 bg-muted/30 rounded-xl border-t-4 border-t-primary shadow-sm">
        <h3 className="font-bold text-lg mb-6 flex items-center">
            Financial Overview
        </h3>
        
        <div className="space-y-6">
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">General Add-ons</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {generalAddonsList.map((opt) => (
                        <FormField
                            key={opt}
                            control={form.control}
                            name="generalAddons"
                            render={({ field }) => (
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
                                    <FormLabel className="font-normal text-sm cursor-pointer">{opt}</FormLabel>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="financials.packagePrice"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Base Package Price</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">LKR</span>
                                    <Input type="number" className="pl-12 font-semibold" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-muted-foreground">Add-ons Cost</label>
                    <div className="h-10 border rounded-md bg-muted/40 flex items-center px-3 font-semibold text-sm">
                        LKR {addonsCost.toLocaleString()}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="financials.transportCost"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Transport Costs</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">LKR</span>
                                    <Input type="number" className="pl-12" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="financials.discount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Discount / Adjustments</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">LKR</span>
                                    <Input type="number" className="pl-12 text-destructive font-semibold" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Feature: Total Calculation Summary Display */}
                <div className="md:col-span-2 p-4 bg-primary/10 rounded-lg flex flex-col justify-center border border-primary/20">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-primary uppercase">Total Contract Value</span>
                        {/* Logic: Formatting numbers for readability with commas */}
                        <span className="text-2xl font-black text-primary">LKR {totalAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 italic">
                        The current balance will be automatically set to the total amount.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
