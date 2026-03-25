"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Loader2, Trash2, MapPin, Search, Globe, Plus, ExternalLink } from "lucide-react"

import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import { SRI_LANKA_PROVINCES } from "@/lib/sri-lanka"


import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
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
import { useToast } from "@/hooks/use-toast"
import { Order, TeamMember, PricingItem } from "@/lib/types"
import { createOrder, getPricingItems } from "@/lib/mock-actions"

const orderSchema = z.object({
  orderNumber: z.string(),
  clientInfo: z.object({
    title: z.string().min(1, "Title is required"),
    name: z.string()
      .min(2, "Client name must be at least 2 characters")
      .regex(/^[A-Za-z\s.]+$/, "Name can only contain letters, spaces, and dots"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\d+$/, "Phone number must contain only digits"),
  }),
  // Wedding
  wedding: z.object({
    date: z.date().optional(),
    packageType: z.string().optional(),
    packageDetails: z.string().optional(),
    addons: z.array(z.string()).default([]),
  }).optional().superRefine((data, ctx) => {
    if (!data) return
    if (data.packageType && !data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date is required when a package is selected",
        path: ["date"],
      })
    }
    if (data.date && !data.packageType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package is required when a date is selected",
        path: ["packageType"],
      })
    }
  }),
  // Homecoming
  homecoming: z.object({
    date: z.date().optional(),
    packageType: z.string().optional(),
    packageDetails: z.string().optional(),
    addons: z.array(z.string()).default([]),
  }).optional().superRefine((data, ctx) => {
    if (!data) return
    if (data.packageType && !data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date is required when a package is selected",
        path: ["date"],
      })
    }
    if (data.date && !data.packageType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package is required when a date is selected",
        path: ["packageType"],
      })
    }
  }),
  // Engagement
  engagement: z.object({
    date: z.date().optional(),
    packageType: z.string().optional(),
    packageDetails: z.string().optional(),
    addons: z.array(z.string()).default([]),
  }).optional().superRefine((data, ctx) => {
    if (!data) return
    if (data.packageType && !data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date is required when a package is selected",
        path: ["date"],
      })
    }
    if (data.date && !data.packageType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package is required when a date is selected",
        path: ["packageType"],
      })
    }
  }),
  // Pre-shoot
  preShoot: z.object({
    date: z.date().optional(),
    packageType: z.string().optional(),
    packageDetails: z.string().optional(),
    addons: z.array(z.string()).default([]),
  }).optional().superRefine((data, ctx) => {
    if (!data) return
    if (data.packageType && !data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date is required when a package is selected",
        path: ["date"],
      })
    }
    if (data.date && !data.packageType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package is required when a date is selected",
        path: ["packageType"],
      })
    }
  }),
  
  // General Addons
  generalAddons: z.array(z.string()).default([]),
  
  // Financials
  financials: z.object({
    packagePrice: z.coerce.number().min(0).default(0),
    transportCost: z.coerce.number().min(0).default(0),
    discount: z.coerce.number().min(0).default(0),
    totalAmount: z.coerce.number().min(0).default(0),
    balance: z.coerce.number().min(0).default(0),
  }),
  locations: z.array(z.object({
    name: z.string().min(1, "Location name is required"),
    url: z.string()
      .url("Invalid URL")
      .regex(/google\.com\/maps|goo\.gl\/maps/, "Must be a valid Google Maps link")
      .optional().or(z.literal("")),
    forEvent: z.string().optional(),
    mode: z.enum(["library", "manual"]).default("manual"),
    province: z.string().optional(),
    district: z.string().optional(),
  })).default([]),

  notes: z.string().optional(),
})

type OrderFormValues = z.infer<typeof orderSchema>

interface OrderFormProps {
  initialOrderNumber: string
}

export default function OrderForm({ initialOrderNumber }: OrderFormProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations",
  })


  // Location Library Data
  const [libraryLocations, setLibraryLocations] = useState<any[]>([])
  // @ts-ignore
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    fetch(`${API_URL}/locations`)
      .then(res => res.json())
      .then(setLibraryLocations)
      .catch(err => console.error("Failed to fetch library locations:", err))
  }, [])


  // Pricing Logic
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([])
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

  // Watch form values for auto-calculation
  const wPackage = form.watch("wedding.packageType") as any
  const wAddons = form.watch("wedding.addons")
  const hPackage = form.watch("homecoming.packageType") as any
  const hAddons = form.watch("homecoming.addons")
  const ePackage = form.watch("engagement.packageType") as any
  const eAddons = form.watch("engagement.addons")
  const pPackage = form.watch("preShoot.packageType") as any
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
    
    if (!isCustom) {
        setBasePackageCost(pCost)
        form.setValue("financials.packagePrice", pCost) 
    }

  }, [wPackage, wAddons, hPackage, hAddons, ePackage, eAddons, pPackage, pAddons, gAddons, pricingItems, form])

  const packageBasePrice = form.watch("financials.packagePrice")
  const transportCost = form.watch("financials.transportCost")
  const discount = form.watch("financials.discount")

  useEffect(() => {
    const total = Number(packageBasePrice || 0) + Number(addonsCost || 0) + Number(transportCost || 0) - Number(discount || 0)
    form.setValue("financials.totalAmount", total)
    form.setValue("financials.balance", total)
  }, [packageBasePrice, addonsCost, transportCost, discount, form])

  const wedPackage = form.watch("wedding.packageType") as any
  const hcPackage = form.watch("homecoming.packageType") as any
  const engPackage = form.watch("engagement.packageType") as any
  const prePackage = form.watch("preShoot.packageType") as any

  const getDetails = (category: string, name?: string) => {
    if (!name || name === "Customized") return undefined
    return pricingItems.find(i => i.category === category && i.name === name)?.details
  }

  const clearSection = (section: "wedding" | "homecoming" | "engagement" | "preShoot") => {
    const currentWeddingPackage = form.getValues("wedding.packageType")
    const currentHomecomingPackage = form.getValues("homecoming.packageType")
    const isComboPackage = (pkg: string | undefined) => ["Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III"].some(p => p === pkg)

    const clearFields = (sec: any) => {
        form.setValue(`${sec}.date` as any, undefined, { shouldValidate: true })
        form.setValue(`${sec}.packageType` as any, undefined, { shouldValidate: true })
        form.setValue(`${sec}.packageDetails` as any, undefined, { shouldValidate: true })
        form.setValue(`${sec}.addons` as any, [], { shouldValidate: true })
    }

    if (section === "wedding" && isComboPackage(currentWeddingPackage)) {
        clearFields("homecoming")
    }
    
    if (section === "homecoming" && isComboPackage(currentHomecomingPackage)) {
         clearFields("wedding")
    }

    clearFields(section)
  }

  async function onSubmit(data: OrderFormValues) {
    setIsSubmitting(true)
    try {
      const orderData: any = {
        ...data,
        eventDetails: {
            mainDate: data.wedding?.date || data.homecoming?.date || data.engagement?.date || new Date(),
            locations: data.locations,
            notes: data.notes
        },
        status: "Pending"
      }
      
      const res = await createOrder(orderData)
      
      if (res.success) {
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

  // --- Helper Components ---
  const DatePickerField = ({ control, name, label }: { control: any, name: any, label: string }) => (
      <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">{label}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      {field.value instanceof Date ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
  )

  const CheckboxGroup = ({ name, options, label }: { name: any, options: string[], label?: string }) => (
    <div className="space-y-3">
        {label && <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>}
        <div className="grid grid-cols-2 gap-2">
            {options.map((opt) => (
                 <FormField
                  key={opt}
                  control={form.control}
                  name={name}
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
  )

  const PackageDetailsDisplay = ({ details }: { details?: string | string[] }) => {
    if (!details) return null
    const displayValue = Array.isArray(details) ? details.join("\n") : details
    
    return (
        <div className="p-3 bg-primary/5 rounded border border-primary/20">
            <h5 className="text-[10px] font-bold text-primary uppercase mb-1">Included in Package:</h5>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{displayValue}</p>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Header Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/20 rounded-lg">
            <FormField
              control={form.control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Number</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-background font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="hidden md:block"></div>
             
            <div className="grid grid-cols-4 gap-4">
                 <FormField
                  control={form.control}
                  name="clientInfo.title"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Title</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "Mr"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Mr">Mr</SelectItem>
                          <SelectItem value="Ms">Ms</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientInfo.name"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Client Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field} 
                          onKeyDown={(e) => {
                            if (!/^[A-Za-z\s.]$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="clientInfo.phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                        <Input 
                          placeholder="077..." 
                          {...field} 
                          onKeyDown={(e) => {
                            if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
                              e.preventDefault();
                            }
                          }}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="clientInfo.email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Wedding Section */}
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold">Wedding</CardTitle>
                    <Button variant="ghost" size="sm" type="button" onClick={() => clearSection('wedding')} className="h-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <DatePickerField control={form.control} name="wedding.date" label="Wedding Date" />
                    
                    <FormField
                        control={form.control}
                        name="wedding.packageType"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Package</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value)
                                if (["Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III"].includes(value)) {
                                    form.setValue("homecoming.packageType", value)
                                }
                            }} value={field.value || ''}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a package" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {weddingPackages.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    
                    <PackageDetailsDisplay details={getDetails("Wedding Packages", wedPackage)} />
                    
                    {wedPackage === "Customized" && (
                         <FormField
                            control={form.control}
                            name="wedding.packageDetails"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Custom Package Note</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter custom details..." className="h-20" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    )}

                    <Separator />
                    <CheckboxGroup name="wedding.addons" options={weddingAddons} label="Addons" />
                </CardContent>
            </Card>

            {/* Homecoming Section */}
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold">Homecoming</CardTitle>
                     <Button variant="ghost" size="sm" type="button" onClick={() => clearSection('homecoming')} className="h-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <DatePickerField control={form.control} name="homecoming.date" label="Homecoming Date" />
                    
                    <FormField
                        control={form.control}
                        name="homecoming.packageType"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Package</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value)
                                if (["Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III"].includes(value)) {
                                    form.setValue("wedding.packageType", value)
                                }
                            }} value={field.value || ''}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a package" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {homecomingPackages.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    
                    <PackageDetailsDisplay details={getDetails("Homecoming Packages", hcPackage)} />
                    
                    {hcPackage === "Customized" && (
                         <FormField
                            control={form.control}
                            name="homecoming.packageDetails"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Custom Package Note</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter custom details..." className="h-20" {...field} value={field.value || ""} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    )}

                    <Separator />
                    <CheckboxGroup name="homecoming.addons" options={homecomingAddons} label="Addons" />
                </CardContent>
            </Card>
            

                 {/* Engagement Section */}
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">Engagement</CardTitle>
                         <Button variant="ghost" size="sm" type="button" onClick={() => clearSection('engagement')} className="h-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <DatePickerField control={form.control} name="engagement.date" label="Engagement Date" />
                        <FormField
                            control={form.control}
                            name="engagement.packageType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Package</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a package" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {engagementPackages.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                             )}
                         />
                         
                         <PackageDetailsDisplay details={getDetails("Engagement Packages", engPackage)} />

                         {engPackage === "Customized" && (
                            <FormField
                                control={form.control}
                                name="engagement.packageDetails"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Custom Note</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Note..." {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                         )}
                         <Separator />
                         <CheckboxGroup name="engagement.addons" options={engagementAddons} label="Addons" />
                    </CardContent>
                </Card>
                
                {/* Pre-shoot Section */}
                <Card className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">Pre-shoot</CardTitle>
                         <Button variant="ghost" size="sm" type="button" onClick={() => clearSection('preShoot')} className="h-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <DatePickerField control={form.control} name="preShoot.date" label="Pre-shoot Date" />
                        <FormField
                            control={form.control}
                            name="preShoot.packageType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Package</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a package" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {preshootPackages.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                             )}
                          />

                          <PackageDetailsDisplay details={getDetails("Pre-shoot Packages", prePackage)} />

                          {prePackage === "Customized" && (
                            <FormField
                                control={form.control}
                                name="preShoot.packageDetails"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Custom Note</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Note..." {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                         )}
                         <Separator />
                         <CheckboxGroup name="preShoot.addons" options={preshootAddons} label="Addons" />
                    </CardContent>
                </Card>

        </div>
        
        {/* General Addons & Locations */}
        <Card className="border-l-4 border-l-primary">
             <CardHeader>
                <CardTitle>General Addons</CardTitle>
            </CardHeader>
             <CardContent>
                <CheckboxGroup name="generalAddons" options={generalAddonsList} />
             </CardContent>
        </Card>


        {/* Locations & Notes Card */}
        <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Locations & Notes</CardTitle>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => append({ name: "", url: "", mode: "library", forEvent: "Wedding" })}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" /> Add Location
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                     {/* Dynamic Locations Picker */}
                     <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="relative p-4 border rounded-lg bg-muted/10 space-y-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                     <FormField
                                        control={form.control}
                                        name={`locations.${index}.mode`}
                                        render={({ field: modeField }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Entry Mode</FormLabel>
                                                <div className="flex bg-muted p-1 rounded-md">
                                                    <button
                                                        type="button"
                                                        className={`flex-1 text-xs py-1 rounded-sm transition-all ${modeField.value === 'library' ? 'bg-background shadow-sm font-semibold' : 'text-muted-foreground'}`}
                                                        onClick={() => {
                                                            modeField.onChange('library')
                                                            form.setValue(`locations.${index}.name` as any, "")
                                                            form.setValue(`locations.${index}.url` as any, "")
                                                        }}
                                                    >
                                                        Library
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`flex-1 text-xs py-1 rounded-sm transition-all ${modeField.value === 'manual' ? 'bg-background shadow-sm font-semibold' : 'text-muted-foreground'}`}
                                                        onClick={() => {
                                                            modeField.onChange('manual')
                                                            form.setValue(`locations.${index}.name` as any, "")
                                                            form.setValue(`locations.${index}.url` as any, "")
                                                        }}
                                                    >
                                                        Manual
                                                    </button>
                                                </div>
                                            </FormItem>
                                        )}
                                     />

                                     <FormField
                                        control={form.control}
                                        name={`locations.${index}.forEvent`}
                                        render={({ field: eventField }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs uppercase font-bold text-muted-foreground">For Event</FormLabel>
                                                <Select onValueChange={eventField.onChange} value={eventField.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-background">
                                                            <SelectValue placeholder="Event Type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Wedding">Wedding</SelectItem>
                                                        <SelectItem value="Homecoming">Homecoming</SelectItem>
                                                        <SelectItem value="Engagement">Engagement</SelectItem>
                                                        <SelectItem value="Pre-Shoot">Pre-Shoot</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                     />

                                     <div className="hidden md:block"></div>

                                     {form.watch(`locations.${index}.mode`) === 'library' ? (
                                         <>
                                            <FormField
                                                control={form.control}
                                                name={`locations.${index}.province`}
                                                render={({ field: provinceField }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Province</FormLabel>
                                                        <Select onValueChange={(val) => {
                                                            provinceField.onChange(val)
                                                            form.setValue(`locations.${index}.district` as any, "")
                                                            form.setValue(`locations.${index}.name` as any, "")
                                                        }} value={provinceField.value || ""}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-background">
                                                                    <SelectValue placeholder="Select Province" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {SRI_LANKA_PROVINCES.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`locations.${index}.district`}
                                                render={({ field: districtField }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground">District</FormLabel>
                                                        <Select 
                                                            onValueChange={(val) => {
                                                                districtField.onChange(val)
                                                                form.setValue(`locations.${index}.name` as any, "")
                                                            }} 
                                                            value={districtField.value || ""}
                                                            disabled={!form.watch(`locations.${index}.province`)}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="bg-background">
                                                                    <SelectValue placeholder="Select District" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {(SRI_LANKA_PROVINCES.find(p => p.name === form.watch(`locations.${index}.province`))?.districts || []).map(d => (
                                                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`locations.${index}.name`}
                                                render={({ field: venueField }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Venue</FormLabel>
                                                        <Select 
                                                            onValueChange={(val) => {
                                                                const loc = libraryLocations.find(l => l.name === val)
                                                                venueField.onChange(val)
                                                                form.setValue(`locations.${index}.url` as any, loc?.googleMapLink || "")
                                                            }} 
                                                            value={venueField.value || ""}
                                                            disabled={!form.watch(`locations.${index}.district`)}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="bg-background">
                                                                    <SelectValue placeholder="Select Venue" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {libraryLocations
                                                                    .filter(l => l.province === form.watch(`locations.${index}.province`) && l.district === form.watch(`locations.${index}.district`))
                                                                    .map(l => <SelectItem key={l._id} value={l.name}>{l.name}</SelectItem>)
                                                                }
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                         </>
                                     ) : (
                                         <>
                                            <FormField
                                                control={form.control}
                                                name={`locations.${index}.name`}
                                                render={({ field: nameField }) => (
                                                    <FormItem className="md:col-span-1">
                                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Location Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter venue name" {...nameField} className="bg-background" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`locations.${index}.url`}
                                                render={({ field: urlField }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Google Map Link</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input 
                                                                placeholder="https://maps.google.com/..." 
                                                                {...urlField} 
                                                                className="pl-9 bg-background" 
                                                              />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                         </>
                                     )}
                                </div>
                                {form.watch(`locations.${index}.url`) && (
                                    <div className="flex items-center gap-2 text-[10px] text-primary bg-primary/5 p-1 px-2 rounded w-fit">
                                        <MapPin className="h-3 w-3" />
                                        <a href={form.watch(`locations.${index}.url`)} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                                            Google Map Link Attached <ExternalLink className="h-2 w-2" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                     </div>


                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Order Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any additional notes..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
            </CardContent>
        </Card>
        
        {/* Financials */}
         <Card className="bg-muted/30 border-l-4 border-l-primary">
            <CardHeader>
                <CardTitle>Payment Details</CardTitle>
            </CardHeader>
             <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <FormField
                       control={form.control}
                       name="financials.packagePrice"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Package Base Price {form.getValues("wedding.packageType") === "Customized" || form.getValues("homecoming.packageType") === "Customized" ? "(Manual)" : "(Auto)"}</FormLabel>
                           <FormControl>
                             <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value))} 
                              onFocus={e => e.target.select()}
                             />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                      />

                      {/* Add-ons Display (Read Only) */}
                      <div className="space-y-2">
                         <FormLabel className="text-muted-foreground">Add-ons Cost (Auto)</FormLabel>
                         <div className="h-10 px-3 py-2 rounded-md border border-input bg-background/0 text-sm flex items-center">
                            {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(addonsCost)}
                         </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="financials.transportCost"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Transport Cost</FormLabel>
                           <FormControl>
                             <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                              onFocus={e => e.target.select()}
                             />
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
                            <FormLabel>Discount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                                onFocus={e => e.target.select()}
                                onKeyDown={(e) => {
                                  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                       control={form.control}
                       name="financials.totalAmount"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Total Amount (LKR)</FormLabel>
                           <FormControl>
                             <Input type="number" {...field} className="text-lg font-semibold bg-muted" readOnly />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                          <div className="text-right">
                              <span className="block text-sm font-muted-foreground mb-1">Balance Due</span>
                              <span className="text-2xl font-bold text-primary underline decoration-double">
                                  LKR {(form.watch("financials.balance") || 0).toLocaleString()}
                              </span>
                          </div>
                     </div>
                </div>
            </CardContent>
         </Card>

        <div className="flex justify-end pb-10">
             <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto min-w-[200px]">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Order
            </Button>
        </div>
      </form>
    </Form>
  )
}
