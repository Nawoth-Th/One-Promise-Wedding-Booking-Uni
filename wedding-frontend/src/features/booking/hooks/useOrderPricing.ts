/**
 * @file useOrderPricing.ts
 * @description Custom React Hook for managing the Financial Calculation Engine.
 * This hook centralizes the logic for calculating package prices, addon costs,
 * transport fees, and discounts in real-time as the user fills out the booking form.
 * 
 * Logic Strategy:
 * - Reactive State: Uses 'watch' from react-hook-form to trigger recalculations.
 * - Dynamic Pricing: Fetches the latest pricing data from the backend.
 * - Combo Handling: Implements custom logic for multi-event package bundles.
 */

import { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { OrderFormValues } from "../schema"
import { PricingItem } from "@/lib/types"
import { getPricingItems } from "@/lib/order-actions"

/**
 * useOrderPricing Hook
 * @param form - The react-hook-form instance shared across the booking modules.
 */
export function useOrderPricing(form: UseFormReturn<OrderFormValues>) {
  // State for raw pricing data from database
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([])
  
  // Accumulated costs derived from selections
  const [addonsCost, setAddonsCost] = useState(0)
  const [basePackageCost, setBasePackageCost] = useState(0)

  // Load pricing rules
  useEffect(() => {
    getPricingItems().then(setPricingItems)
  }, [])

  // Derived Lists
  const getPackageOptions = (category: string) => [...pricingItems.filter(i => i.category === category).map(i => i.name), "Customized"]
  const getAddonOptions = (category: string) => pricingItems.filter(i => i.category === category).map(i => i.name)

  const weddingPackages = getPackageOptions("Wedding Packages")
  const weddingAddons = getAddonOptions("Wedding Add-ons")
  
  const homecomingPackages = getPackageOptions("Homecoming Packages")
  const homecomingAddons = getAddonOptions("Homecoming Add-ons")
  
  const engagementPackages = getPackageOptions("Engagement Packages")
  const engagementAddons = getAddonOptions("Engagement Add-ons")
  
  const preshootPackages = getPackageOptions("Pre-shoot Packages")
  const preshootAddons = getAddonOptions("Pre-shoot Add-ons")
  
  const generalAddonsList = getAddonOptions("General Add-ons")

  // Dynamic Form Observers (Reactivity)
  // These variables 'watch' specific form fields and trigger the calculation useEffect.
  const wPackage = form.watch("wedding.packageType")
  const wAddons = form.watch("wedding.addons")
  const hPackage = form.watch("homecoming.packageType")
  const hAddons = form.watch("homecoming.addons")
  const ePackage = form.watch("engagement.packageType")
  const eAddons = form.watch("engagement.addons")
  const pPackage = form.watch("preShoot.packageType")
  const pAddons = form.watch("preShoot.addons")
  const gAddons = form.watch("generalAddons")

  // Calculate Costs
  useEffect(() => {
    if (pricingItems.length === 0) return

    let pCost = 0
    let aCost = 0
    let isCustom = false

    const getPrice = (cat: string, name: string | undefined) => {
        if (!name) return 0
        const item = pricingItems.find(i => i.category === cat && i.name === name)
        return item ? item.price : 0
    }

    if (wPackage === "Customized") isCustom = true
    else pCost += getPrice("Wedding Packages", wPackage)
    wAddons?.forEach((a: string) => aCost += getPrice("Wedding Add-ons", a))

    if (hPackage === "Customized") isCustom = true
    else {
        const isCombo = ["Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III"].some(p => p === hPackage)
        if (!isCombo || hPackage !== wPackage) {
            pCost += getPrice("Homecoming Packages", hPackage)
        }
    }
    hAddons?.forEach((a: string) => aCost += getPrice("Homecoming Add-ons", a))

    if (ePackage === "Customized") isCustom = true
    else pCost += getPrice("Engagement Packages", ePackage)
    eAddons?.forEach((a: string) => aCost += getPrice("Engagement Add-ons", a))

    if (pPackage === "Customized") isCustom = true
    else pCost += getPrice("Pre-shoot Packages", pPackage)
    pAddons?.forEach((a: string) => aCost += getPrice("Pre-shoot Add-ons", a))

    gAddons?.forEach((a: string) => aCost += getPrice("General Add-ons", a))

    setAddonsCost(aCost)
    
    // Feature: Auto-Sync financials with the main form state
    if (!isCustom) {
        setBasePackageCost(pCost)
        form.setValue("financials.packagePrice", pCost) 
    }

  }, [wPackage, wAddons, hPackage, hAddons, ePackage, eAddons, pPackage, pAddons, gAddons, pricingItems, form])

  // Final Total Calculation Logic
  const packageBasePrice = form.watch("financials.packagePrice")
  const transportCost = form.watch("financials.transportCost")
  const discount = form.watch("financials.discount")

  useEffect(() => {
    // Formula: Total = Base + Addons + Transport - Discount
    const total = Number(packageBasePrice || 0) + Number(addonsCost || 0) + Number(transportCost || 0) - Number(discount || 0)
    form.setValue("financials.totalAmount", total)
    form.setValue("financials.balance", total) // Initial balance matches total until payments are logged
  }, [packageBasePrice, addonsCost, transportCost, discount, form])

  const getDetails = (category: string, name?: string) => {
    if (!name || name === "Customized") return undefined
    return pricingItems.find(i => i.category === category && i.name === name)?.details
  }

  return {
    pricingItems,
    addonsCost,
    basePackageCost,
    weddingPackages,
    weddingAddons,
    homecomingPackages,
    homecomingAddons,
    engagementPackages,
    engagementAddons,
    preshootPackages,
    preshootAddons,
    generalAddonsList,
    getDetails
  }
}
