"use client"

import { useState, useEffect } from "react"
import { Order, OrderStatus, TeamMember, PricingItem } from "@/lib/types"
import { 
  updateOrder, 
  ensurePortalToken, 
  verifyPayment, 
  getPricingItems, 
  deleteOrder, 
  getActiveTeamMembers 
} from "@/lib/mock-actions"
import { TeamAssignment } from "@/features/team-location/team-assignment"
import { ProgressTrackerAdmin } from "@/features/agreement/progress-tracker-admin"
import { LocationPicker } from "@/features/team-location/location-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, Save, X, Edit, CalendarIcon, ArrowLeft, Phone, Mail, MapPin, 
  Plus, Trash2, ExternalLink, Link as LinkIcon, AlertCircle, CheckCircle, Copy 
} from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { format } from "date-fns"
import { 
  PACKAGE_DETAILS, WEDDING_PACKAGES, HOMECOMING_PACKAGES, 
  ENGAGEMENT_PACKAGES, PRESHOOT_PACKAGES,
  WEDDING_ADDONS, HOMECOMING_ADDONS, ENGAGEMENT_ADDONS, 
  PRESHOOT_ADDONS, GENERAL_ADDONS
} from "@/lib/constants"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface OrderDetailsViewProps {
    order: Order
}

export function OrderDetailsView({ order: initialOrder }: OrderDetailsViewProps) {
    const [order, setOrder] = useState<Order>(initialOrder)
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const navigate = useNavigate()

    const [editedOrder, setEditedOrder] = useState<Order>(initialOrder)
    const [origin, setOrigin] = useState('')
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

    useEffect(() => {
        setOrigin(window.location.origin)
        getActiveTeamMembers().then(setTeamMembers)
    }, [])

    // Pricing Logic
    const [pricingItems, setPricingItems] = useState<PricingItem[]>([])
    const [addonsCost, setAddonsCost] = useState(0)

    useEffect(() => {
        getPricingItems().then(setPricingItems)
    }, [])

    useEffect(() => {
        if (pricingItems.length === 0) return

        let aCost = 0
        const getPrice = (cat: string, name: string | undefined) => {
            if (!name) return 0
            const item = pricingItems.find(i => i.category === cat && i.name === name)
            return item ? item.price : 0
        }

        editedOrder.wedding?.addons?.forEach(a => aCost += getPrice("Wedding Add-ons", a))
        editedOrder.homecoming?.addons?.forEach(a => aCost += getPrice("Homecoming Add-ons", a))
        editedOrder.engagement?.addons?.forEach(a => aCost += getPrice("Engagement Add-ons", a))
        editedOrder.preShoot?.addons?.forEach(a => aCost += getPrice("Pre-shoot Add-ons", a))
        editedOrder.generalAddons?.forEach(a => aCost += getPrice("General Add-ons", a))

        setAddonsCost(aCost)
        
        // Auto-calc Total
        // Only update total if we are editing to avoid undesired syncs in view mode if data mismatch?
        // Actually, if we are in view mode, we probably shouldn't be updating 'editedOrder' state that triggers re-renders blindly?
        // But 'editedOrder' is what powers the view... wait.
        // The view mode uses 'order', NOT 'editedOrder'. (Lines 680 uses 'addonsCost')
        // So updating 'addonsCost' is fine.
        // However, updating 'editedOrder.financials.totalAmount' (lines 89) should ONLY happen if isEditing?
        // Or if we want to show the "would be" total?
        // The code at line 88-90 updates 'editedOrder'.
        
        if (isEditing) {
             const total = (editedOrder.financials.packagePrice || 0) + aCost + (editedOrder.financials.transportCost || 0) - (editedOrder.financials.discount || 0)
             if (editedOrder.financials.totalAmount !== total) {
                  updateField('financials.totalAmount', total)
                  updateField('financials.balance', total)
             }
        }

    }, [editedOrder.wedding, editedOrder.homecoming, editedOrder.engagement, editedOrder.preShoot, editedOrder.generalAddons, editedOrder.financials.packagePrice, editedOrder.financials.transportCost, isEditing, pricingItems])

    const handleSave = async () => {
        // Validation Logic
        const sections = [
            { id: 'wedding', name: 'Wedding', data: editedOrder.wedding },
            { id: 'homecoming', name: 'Homecoming', data: editedOrder.homecoming },
            { id: 'engagement', name: 'Engagement', data: editedOrder.engagement },
            { id: 'preShoot', name: 'Pre-shoot', data: editedOrder.preShoot },
        ];

        for (const section of sections) {
            const hasPackage = !!section.data?.packageType;
            const hasDate = !!section.data?.date;

            if (hasPackage && !hasDate) {
                toast({
                    title: "Validation Error",
                    description: `Date is required for ${section.name} when a package is selected.`,
                    variant: "destructive"
                });
                return; 
            }
            if (hasDate && !hasPackage) {
                toast({
                    title: "Validation Error",
                    description: `Package is required for ${section.name} when a date is selected.`,
                    variant: "destructive"
                });
                return;
            }
        }

        setIsLoading(true)
        try {
            const result = await updateOrder(order._id!, editedOrder)
            if (result.success) {
                setOrder(editedOrder)
                setIsEditing(false)
                toast({
                    title: "Order Updated",
                    description: "The order details have been successfully saved.",
                })
                // router.refresh() - not needed
            } else {
                 toast({
                    title: "Error",
                    description: "Failed to update order.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Failed to save:", error)
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const cancelEdit = () => {
        setEditedOrder(order)
        setIsEditing(false)
    }

    const updateField = (path: string, value: any) => {
        setEditedOrder(prev => {
            const newData = { ...prev } as any
            const parts = path.split('.')
            let current = newData
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {}
                current = current[parts[i]]
            }
            current[parts[parts.length - 1]] = value
            return newData
        })
    }

    const handleDateSelect = (path: string, date: Date | undefined) => {
        if (date) {
             updateField(path, date)
        }
    }

    const handleClearSection = (section: "wedding" | "homecoming" | "engagement" | "preShoot") => {
        const currentPackage = editedOrder[section]?.packageType;
        const isComboPackage = ["Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III"].includes(currentPackage || '');

        if (section === 'wedding' && isComboPackage) {
             updateField('homecoming', {});
        }
        if (section === 'homecoming' && isComboPackage) {
             updateField('wedding', {});
        }
        updateField(section, {});
    }


    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const result = await deleteOrder(order._id!)
            if (result.success) {
                toast({
                    title: "Order Deleted",
                    description: "The order has been successfully deleted.",
                })
                navigate("/admin")
            } else {
                 toast({
                    title: "Error",
                    description: "Failed to delete order.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }


    const handleVerifyPayment = async (status: "Verified" | "Rejected") => {
        setIsLoading(true)
        try {
            const result = await verifyPayment(order._id!, status)
            if (result.success) {
                setOrder(prev => ({
                    ...prev,
                    financials: {
                        ...prev.financials,
                        paymentProof: {
                            ...prev.financials.paymentProof!,
                            status: status
                        }
                    }
                }))
                toast({
                    title: "Payment Status Updated",
                    description: `Payment has been marked as ${status}.`,
                })
            } else {
                 toast({
                    title: "Error",
                    description: "Failed to update payment status.",
                    variant: "destructive"
                })
            }
        } catch (error) {
             toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const copyPortalLink = async () => {
         let token = order.portalToken;
         if (!token) {
             // Generate on the fly if missing (though backend usually handles this)
             token = await ensurePortalToken(order._id!) as string;
             // Update local state
             setOrder(prev => ({ ...prev, portalToken: token }));
         }
         
         const link = `${origin}/portal/${token}`;
         navigator.clipboard.writeText(link);
         toast({
             title: "Link Copied",
             description: "Client Portal link copied to clipboard.",
         });
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                     <div className="flex items-center gap-2 mb-2">
                        <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <span className="text-sm text-muted-foreground">/ Orders / {order.orderNumber}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        {order.orderNumber} 
                        {!isEditing && (
                            <Badge className={`rounded-full px-4 text-white border-0
                                ${order.status === 'Confirmed' ? 'bg-green-600 hover:bg-green-700' : ''}
                                ${order.status === 'Pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                                ${order.status === 'Completed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                ${order.status === 'Cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}
                            `}>
                                {order.status}
                            </Badge>
                        )}
                        {isEditing && (
                             <Select 
                                value={editedOrder.status} 
                                onValueChange={(value) => updateField('status', value)}
                             >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </h1>
                     <p className="text-muted-foreground text-sm">Created on {format(new Date(order.createdAt), "PPP")}</p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" onClick={cancelEdit} disabled={isLoading}>
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="mr-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700">
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this order and remove all associated data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-white border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700">
                                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Delete Order
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <Button onClick={() => setIsEditing(true)} variant="outline">
                                <Edit className="h-4 w-4 mr-2" /> Edit Order
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="general">General Info</TabsTrigger>
                    <TabsTrigger value="events">Events & Packages</TabsTrigger>
                    <TabsTrigger value="team">Team Assignment</TabsTrigger>
                    <TabsTrigger value="tracker">Tracker</TabsTrigger>
                    <TabsTrigger value="agreement">Agreement</TabsTrigger>
                </TabsList>

                {/* Tracker Tab */}
                <TabsContent value="tracker" className="space-y-6">
                    <ProgressTrackerAdmin 
                        orderId={order._id!} 
                        portalToken={order.portalToken}
                        currentStep={order.progress?.currentStep || 0}
                        onUpdate={(step) => {
                            setOrder(prev => ({
                                ...prev,
                                progress: {
                                    ...prev.progress,
                                    currentStep: step,
                                    lastUpdated: new Date()
                                }
                            }))
                        }}
                    />
                </TabsContent>

                {/* Team Assignment Tab */}
                <TabsContent value="team" className="space-y-6">
                    <Card className="rounded-3xl shadow-sm border-muted overflow-hidden">
                        <CardHeader>
                            <CardTitle>Team Assignments</CardTitle>
                            <CardDescription>Assign team members to specific events within this order. They will be notified via email.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Wedding */}
                            {(order.wedding?.date || order.wedding?.packageType) && (
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">Wedding Team</Label>
                                    <TeamAssignment 
                                        orderId={order._id!}
                                        eventType="wedding"
                                        eventDate={order.wedding?.date}
                                        assignedMemberIds={order.assignments?.wedding || []}
                                        allMembers={teamMembers}
                                        onUpdate={(newIds) => {
                                            setOrder(prev => ({
                                                ...prev,
                                                assignments: {
                                                    ...prev.assignments,
                                                    wedding: newIds
                                                }
                                            }))
                                        }}
                                    />
                                    <Separator className="my-4" />
                                </div>
                            )}

                            {/* Homecoming */}
                            {(order.homecoming?.date || order.homecoming?.packageType) && (
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">Homecoming Team</Label>
                                    <TeamAssignment 
                                        orderId={order._id!}
                                        eventType="homecoming"
                                        eventDate={order.homecoming?.date}
                                        assignedMemberIds={order.assignments?.homecoming || []}
                                        allMembers={teamMembers}
                                        onUpdate={(newIds) => {
                                            setOrder(prev => ({
                                                ...prev,
                                                assignments: {
                                                    ...prev.assignments,
                                                    homecoming: newIds
                                                }
                                            }))
                                        }}
                                    />
                                    <Separator className="my-4" />
                                </div>
                            )}

                             {/* Engagement */}
                             {(order.engagement?.date || order.engagement?.packageType) && (
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">Engagement Team</Label>
                                    <TeamAssignment 
                                        orderId={order._id!}
                                        eventType="engagement"
                                        eventDate={order.engagement?.date}
                                        assignedMemberIds={order.assignments?.engagement || []}
                                        allMembers={teamMembers}
                                        onUpdate={(newIds) => {
                                            setOrder(prev => ({
                                                ...prev,
                                                assignments: {
                                                    ...prev.assignments,
                                                    engagement: newIds
                                                }
                                            }))
                                        }}
                                    />
                                    <Separator className="my-4" />
                                </div>
                            )}

                             {/* Pre-Shoot */}
                             {(order.preShoot?.date || order.preShoot?.packageType) && (
                                <div className="space-y-2">
                                    <Label className="text-base font-semibold">Pre-Shoot Team</Label>
                                    <TeamAssignment 
                                        orderId={order._id!}
                                        eventType="preShoot"
                                        eventDate={order.preShoot?.date}
                                        assignedMemberIds={order.assignments?.preShoot || []}
                                        allMembers={teamMembers}
                                        onUpdate={(newIds) => {
                                            setOrder(prev => ({
                                                ...prev,
                                                assignments: {
                                                    ...prev.assignments,
                                                    preShoot: newIds
                                                }
                                            }))
                                        }}
                                    />
                                </div>
                            )}

                             {/* Fallback if no specific events */}
                             {(!order.wedding?.date && !order.homecoming?.date && !order.engagement?.date && !order.preShoot?.date) && (
                                 <div className="text-muted-foreground italic">No events found to assign team members.</div>
                             )}

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* General Information Tab */}
                <TabsContent value="general" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Client Details */}
                        <Card className="rounded-3xl shadow-sm border-muted overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-lg">Client Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <Select 
                                                value={editedOrder.clientInfo.title || "Mr"} 
                                                onValueChange={(value) => updateField('clientInfo.title', value)}
                                            >
                                                <SelectTrigger className="w-[80px]">
                                                    <SelectValue placeholder="Title" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Mr">Mr</SelectItem>
                                                    <SelectItem value="Ms">Ms</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input 
                                                value={editedOrder.clientInfo.name || ''} 
                                                onChange={(e) => updateField('clientInfo.name', e.target.value)} 
                                                className="flex-1"
                                            />
                                        </div>
                                    ) : (
                                        <div className="font-medium text-lg">
                                            {order.clientInfo.title ? `${order.clientInfo.title}. ` : ''}{order.clientInfo.name}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    {isEditing ? (
                                        <Input 
                                            value={editedOrder.clientInfo.phone || ''} 
                                            onChange={(e) => updateField('clientInfo.phone', e.target.value)} 
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="h-4 w-4" />
                                            {order.clientInfo.phone}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    {isEditing ? (
                                        <Input 
                                            value={editedOrder.clientInfo.email || ''} 
                                            onChange={(e) => updateField('clientInfo.email', e.target.value)}
                                            placeholder="No email provided" 
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground break-all">
                                            <Mail className="h-4 w-4" />
                                            {order.clientInfo.email || <span className="italic text-muted-foreground/50">Not provided</span>}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Overview */}
                        <Card className="rounded-3xl shadow-sm border-muted overflow-hidden">
                             <CardHeader>
                                <CardTitle className="text-lg">Event Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Function Dates</Label>
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            {/* We only allow editing the "Main Date" here as a fallback or quick access, 
                                                but specific dates are edited in their respective tabs. 
                                                For now, let's keep the Main Date picker but also show others if needed or just redirect users.
                                                Actually, the prompt implies just showing them. Let's keep Main Date editable for backward compatibility 
                                                or consistency, but list others as read-only or just info. 
                                                
                                                Wait, the user wants to "show every event dates". 
                                                I will list them.
                                            */}
                                            <div className="grid gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Main Date</span>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !editedOrder.eventDetails.mainDate && "text-muted-foreground")}>
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {editedOrder.eventDetails.mainDate ? format(new Date(editedOrder.eventDetails.mainDate), "PPP") : <span>Pick a date</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="single"
                                                                selected={editedOrder.eventDetails.mainDate ? new Date(editedOrder.eventDetails.mainDate) : undefined}
                                                                onSelect={(date) => handleDateSelect('eventDetails.mainDate', date)}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Wedding', date: order.wedding?.date },
                                                { label: 'Homecoming', date: order.homecoming?.date },
                                                { label: 'Engagement', date: order.engagement?.date },
                                                { label: 'Pre-Shoot', date: order.preShoot?.date },
                                            ].filter(event => event.date).map((event, index) => {
                                                const eventDate = new Date(event.date!);
                                                // Create Google Calendar Link
                                                let coupleName = order.clientInfo.name;
                                                if (order.agreementDetails?.coupleName) {
                                                    const { bride, groom } = order.agreementDetails.coupleName;
                                                    if (bride && groom) coupleName = `${bride} & ${groom}`;
                                                    else if (bride) coupleName = bride;
                                                    else if (groom) coupleName = groom;
                                                }
                                                const title = encodeURIComponent(`${event.label} - ${order.orderNumber} - ${coupleName}`);
                                                // Format date as YYYYMMDD for all day event
                                                const dateString = format(eventDate, "yyyyMMdd");
                                                const dates = `${dateString}/${dateString}`;
                                                
                                                // Get event-specific details
                                                const eventKey = event.label === 'Pre-Shoot' ? 'preShoot' : event.label.toLowerCase();
                                                const currentEventDetails = (order as any)[eventKey];
                                                const packageType = currentEventDetails?.packageType || "Custom";
                                                const addons = currentEventDetails?.addons && currentEventDetails.addons.length > 0 ? currentEventDetails.addons.join(', ') : "None";
                                                
                                                const packageFeatures = PACKAGE_DETAILS[packageType] || [];
                                                const packageDetailsList = packageFeatures.length > 0 ? packageFeatures.join('\n- ') : "Standard Package Details";

                                                const detailsText = `Package: ${packageType}
Includes:
- ${packageDetailsList}

Add-ons: ${addons}

Notes: ${order.eventDetails.notes || "None"}`;
                                                const details = encodeURIComponent(detailsText);

                                                // Handle Location: Find assigned location or fallback
                                                let locationParam = "";
                                                const locations = order.eventDetails.locations || [];
                                                // Try to find location explicitly assigned to this event
                                                const assignedLoc = locations.find((l: any) => typeof l !== 'string' && l.forEvent === event.label);
                                                
                                                if (assignedLoc && typeof assignedLoc !== 'string') {
                                                    locationParam = `${assignedLoc.name}${assignedLoc.url ? ` - ${assignedLoc.url}` : ''}`;
                                                } else if (locations.length > 0) {
                                                     // Fallback: Use first location, handling string vs object
                                                    const firstLoc = locations[0];
                                                    if (typeof firstLoc === 'string') {
                                                        locationParam = firstLoc;
                                                    } else {
                                                        locationParam = `${firstLoc.name}${firstLoc.url ? ` - ${firstLoc.url}` : ''}`;
                                                    }
                                                }
                                                const location = encodeURIComponent(locationParam);
                                                const gCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;

                                                return (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-dashed border-muted-foreground/20">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">{event.label}</span>
                                                            <span className="text-sm text-muted-foreground">{format(eventDate, "PPP")}</span>
                                                        </div>
                                                        <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 rounded-lg border-primary/20 text-primary hover:text-primary hover:bg-primary/5">
                                                            <a href={gCalLink} target="_blank" rel="noopener noreferrer">
                                                                <CalendarIcon className="h-3.5 w-3.5" />
                                                                Add to Calendar
                                                            </a>
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                            {/* Fallback if no specific event dates but Main Date exists */}
                                            {(!order.wedding?.date && !order.homecoming?.date && !order.engagement?.date && !order.preShoot?.date && order.eventDetails.mainDate) && (
                                                <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-dashed border-muted-foreground/20">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">Main Function</span>
                                                        <span className="text-sm text-muted-foreground">{format(new Date(order.eventDetails.mainDate), "PPP")}</span>
                                                    </div>
                                                    <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 rounded-lg border-primary/20 text-primary hover:text-primary hover:bg-primary/5">
                                                        <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Main Function - ${order.orderNumber} - ${(() => {
                                                            let coupleName = order.clientInfo.name;
                                                            if (order.agreementDetails?.coupleName) {
                                                                const { bride, groom } = order.agreementDetails.coupleName;
                                                                if (bride && groom) coupleName = `${bride} & ${groom}`;
                                                                else if (bride) coupleName = bride;
                                                                else if (groom) coupleName = groom;
                                                            }
                                                            return coupleName;
                                                        })()}`)}&dates=${format(new Date(order.eventDetails.mainDate), "yyyyMMdd")}/${format(new Date(order.eventDetails.mainDate), "yyyyMMdd")}&details=${encodeURIComponent(`Order: ${order.orderNumber}\nClient: ${order.clientInfo.name}\nPhone: ${order.clientInfo.phone}`)}&location=${encodeURIComponent((order.eventDetails.locations && order.eventDetails.locations.length > 0) ? (typeof order.eventDetails.locations[0] === 'string' ? order.eventDetails.locations[0] : order.eventDetails.locations[0].name) : "")}`} target="_blank" rel="noopener noreferrer">
                                                            <CalendarIcon className="h-3.5 w-3.5" />
                                                            Add to Calendar
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}
                                            
                                            {(!order.wedding?.date && !order.homecoming?.date && !order.engagement?.date && !order.preShoot?.date && !order.eventDetails.mainDate) && (
                                                <div className="text-sm text-muted-foreground italic">No dates scheduled</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Locations</Label>
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            {(editedOrder.eventDetails.locations || []).map((loc: any, index: number) => (
                                                <div key={index} className="relative p-4 border rounded-2xl bg-muted/10 space-y-4">
                                                     <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => {
                                                            const newLocs = [...(editedOrder.eventDetails.locations || [])];
                                                            newLocs.splice(index, 1);
                                                            updateField('eventDetails.locations', newLocs);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    
                                                    <LocationPicker 
                                                        value={typeof loc === 'string' ? { name: loc, mode: 'manual' } : { mode: 'manual', ...loc }}
                                                        onChange={(newValue) => {
                                                            const newLocs = [...(editedOrder.eventDetails.locations || [])];
                                                            newLocs[index] = newValue;
                                                            updateField('eventDetails.locations', newLocs);
                                                        }}
                                                    />
                                                </div>
                                            ))}

                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                className="w-full border-dashed border-2 py-8 rounded-2xl hover:bg-primary/5 hover:border-primary/50 transition-all flex flex-col gap-2"
                                                onClick={() => {
                                                    const newLocs = [...(editedOrder.eventDetails.locations || []), { name: "", mode: "library", forEvent: "Wedding" }];
                                                    updateField('eventDetails.locations', newLocs);
                                                }}
                                            >
                                                <Plus className="h-5 w-5 text-primary" />
                                                <span className="font-semibold text-primary">Add Location</span>
                                            </Button>
                                        </div>

                                    ) : (
                                        <div className="space-y-1">
                                            {order.eventDetails.locations && order.eventDetails.locations.length > 0 ? (
                                                order.eventDetails.locations.map((loc, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <MapPin className="h-3 w-3" />
                                                        {typeof loc === 'string' ? (
                                                            loc
                                                        ) : (
                                                            <>
                                                                {loc.forEvent && (
                                                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                                                        {loc.forEvent}
                                                                    </span>
                                                                )}
                                                                {loc.name}
                                                                {loc.url && (
                                                                     <a href={loc.url} target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1 text-xs font-semibold">
                                                                        (View Map)
                                                                     </a>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-muted-foreground italic">No locations added</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financials */}
                         <Card className="md:col-span-2 rounded-3xl shadow-sm border-muted overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-lg">Financials</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                     <div className="space-y-2">
                                        <Label>Package Base Price</Label>
                                        {isEditing ? (
                                            <Input 
                                                type="number"
                                                value={editedOrder.financials.packagePrice || 0} 
                                                onChange={(e) => updateField('financials.packagePrice', Number(e.target.value))} 
                                            />
                                        ) : (
                                            <div className="font-mono text-lg">{new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(order.financials.packagePrice)}</div>
                                        )}
                                    </div>
                                    
                                    {/* Add-ons Display */}
                                    <div className="space-y-2">
                                        <Label>Add-ons Cost (Auto)</Label>
                                    {isEditing ? (
                                            <div className="font-mono text-sm flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 shadow-sm items-center">
                                                {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(addonsCost)}
                                            </div>
                                        ) : (
                                            <div className="font-mono text-lg">{new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(addonsCost)}</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Transport Cost</Label>
                                        {isEditing ? (
                                            <Input 
                                                type="number"
                                                value={editedOrder.financials.transportCost || 0} 
                                                onChange={(e) => updateField('financials.transportCost', Number(e.target.value))} 
                                            />
                                        ) : (
                                            <div className="font-mono text-lg">{new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(order.financials.transportCost)}</div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Discount</Label>
                                        {isEditing ? (
                                            <Input 
                                                type="number"
                                                value={editedOrder.financials.discount || 0} 
                                                onChange={(e) => updateField('financials.discount', Number(e.target.value))} 
                                            />
                                        ) : (
                                            <div className="font-mono text-lg text-red-500">
                                                - {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(order.financials.discount || 0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Calculated Total - In edit mode we might want to auto-calc or allow override? simpler to allow override for now or auto-calc */}
                                    {/* For now, let's allow editing Total, but usually it's sum. Let's make it editable for flexibility */}
                                     <div className="space-y-2">
                                        <Label className="text-primary font-bold">Total Amount</Label>
                                        {isEditing ? (
                                            <Input 
                                                type="number"
                                                className="font-bold border-primary/20 bg-muted/20 px-3 py-2 rounded-xl"
                                                value={editedOrder.financials.totalAmount || 0} 
                                                onChange={(e) => updateField('financials.totalAmount', Number(e.target.value))} 
                                            />
                                        ) : (
                                            <div className="font-mono text-xl font-bold text-primary">{new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(order.financials.totalAmount)}</div>
                                        )}
                                    </div>
                                    

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                 {/* Events Tab - Consolidated */}
                <TabsContent value="events" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* WEDDING */}
                        {/* WEDDING */}
                        {(isEditing || order.wedding?.date || order.wedding?.packageType) && (
                        <Card className="rounded-3xl shadow-sm border-muted overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Wedding</CardTitle>
                                {isEditing && (
                                    <Button variant="ghost" size="sm" onClick={() => handleClearSection('wedding')} className="h-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                        <Label>Date</Label>
                                        {isEditing ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !editedOrder.wedding?.date && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {editedOrder.wedding?.date ? format(new Date(editedOrder.wedding.date), "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={editedOrder.wedding?.date ? new Date(editedOrder.wedding.date) : undefined}
                                                        onSelect={(date) => {
                                                            const currentWedding = editedOrder.wedding || {};
                                                            updateField('wedding', { ...currentWedding, date })
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        ) : (
                                            <div>{order.wedding?.date ? format(new Date(order.wedding.date), "PPP") : <span className="text-muted-foreground text-sm">Not scheduled</span>}</div>
                                        )}
                                </div>
                                <div className="space-y-2">
                                        <Label>Package Type</Label>
                                        {isEditing ? (

                                            <Select 
                                                value={editedOrder.wedding?.packageType || ''} 
                                                key={editedOrder.wedding?.packageType || 'empty'}
                                                onValueChange={(value) => {
                                                    const currentWedding = editedOrder.wedding || {};
                                                    updateField('wedding', { ...currentWedding, packageType: value })
                                                    
                                                    // Auto-select Homecoming if it's a combo package
                                                    if (["Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III"].includes(value)) {
                                                        const currentHomecoming = editedOrder.homecoming || {};
                                                        updateField('homecoming', { ...currentHomecoming, packageType: value })
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Package" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {WEDDING_PACKAGES.map((pkg) => (
                                                        <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div>{order.wedding?.packageType || <span className="text-muted-foreground text-sm">N/A</span>}</div>
                                        )}
                                </div>
                                </div>

                                {/* Package Features Display */}
                                {!isEditing && order.wedding?.packageType && PACKAGE_DETAILS[order.wedding.packageType] && (
                                    <div className="bg-muted/40 p-4 rounded-xl text-sm">
                                        <Label className="mb-2 block text-muted-foreground text-xs uppercase tracking-wider">Package Includes</Label>
                                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                            {PACKAGE_DETAILS[order.wedding.packageType].map((feature, i) => (
                                                <li key={i}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Add-ons Section */}
                                <div className="space-y-2">
                                    <Label>Add-ons</Label>
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-2 border rounded-xl p-4">
                                            {WEDDING_ADDONS.map((addon: string) => (
                                                <div key={addon} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`wedding-addon-${addon}`}
                                                        checked={editedOrder.wedding?.addons?.includes(addon) || false}
                                                        onCheckedChange={(checked) => {
                                                            const currentWedding = editedOrder.wedding || {};
                                                            const currentAddons = currentWedding.addons || [];
                                                            let newAddons;
                                                            if (checked) {
                                                                newAddons = [...currentAddons, addon];
                                                            } else {
                                                                newAddons = currentAddons.filter(a => a !== addon);
                                                            }
                                                            updateField('wedding', { ...currentWedding, addons: newAddons });
                                                        }}
                                                    />
                                                    <Label htmlFor={`wedding-addon-${addon}`} className="text-sm font-normal cursor-pointer">
                                                        {addon}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {order.wedding?.addons && order.wedding.addons.length > 0 ? (
                                                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                                    {order.wedding.addons.map((addon, i) => (
                                                        <li key={i}>{addon}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic">No add-ons selected</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Details & Notes</Label>
                                    {isEditing ? (
                                        <Textarea 
                                            value={editedOrder.wedding?.packageDetails || ''} 
                                            onChange={(e) => {
                                                const currentWedding = editedOrder.wedding || {};
                                                updateField('wedding', { ...currentWedding, packageDetails: e.target.value })
                                            }} 
                                            placeholder="Add specific details here..."
                                        />
                                    ) : (
                                        <div className="text-sm whitespace-pre-wrap">{order.wedding?.packageDetails || <span className="text-muted-foreground italic">No additional notes</span>}</div>
                                    )}
                            </div>
                            </CardContent>
                        </Card>
                        )}

                        {/* HOMECOMING */}
                        {/* HOMECOMING */}
                        {(isEditing || order.homecoming?.date || order.homecoming?.packageType) && (
                        <Card className="rounded-3xl shadow-sm border-muted overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Homecoming</CardTitle>
                                {isEditing && (
                                    <Button variant="ghost" size="sm" onClick={() => handleClearSection('homecoming')} className="h-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                        <Label>Date</Label>
                                        {isEditing ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !editedOrder.homecoming?.date && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {editedOrder.homecoming?.date ? format(new Date(editedOrder.homecoming.date), "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={editedOrder.homecoming?.date ? new Date(editedOrder.homecoming.date) : undefined}
                                                        onSelect={(date) => {
                                                            const current = editedOrder.homecoming || {};
                                                            updateField('homecoming', { ...current, date })
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        ) : (
                                            <div>{order.homecoming?.date ? format(new Date(order.homecoming.date), "PPP") : <span className="text-muted-foreground text-sm">Not scheduled</span>}</div>
                                        )}
                                </div>
                                <div className="space-y-2">
                                        <Label>Package Type</Label>
                                        {isEditing ? (

                                            <Select 
                                                value={editedOrder.homecoming?.packageType || ''} 
                                                key={editedOrder.homecoming?.packageType || 'empty'}
                                                onValueChange={(value) => {
                                                    const current = editedOrder.homecoming || {};
                                                    updateField('homecoming', { ...current, packageType: value })
                                                    
                                                    // Auto-select Wedding if it's a combo package
                                                    if (["Wed + HC P-I", "Wed + HC P-II", "Wed + HC P-III"].includes(value)) {
                                                         const currentWedding = editedOrder.wedding || {};
                                                         updateField('wedding', { ...currentWedding, packageType: value })
                                                    }
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Package" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {HOMECOMING_PACKAGES.map((pkg) => (
                                                        <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div>{order.homecoming?.packageType || <span className="text-muted-foreground text-sm">N/A</span>}</div>
                                        )}
                                </div>
                                </div>

                                {/* Package Features Display */}
                                {!isEditing && order.homecoming?.packageType && PACKAGE_DETAILS[order.homecoming.packageType] && (
                                    <div className="bg-muted/40 p-4 rounded-xl text-sm">
                                        <Label className="mb-2 block text-muted-foreground text-xs uppercase tracking-wider">Package Includes</Label>
                                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                            {PACKAGE_DETAILS[order.homecoming.packageType].map((feature, i) => (
                                                <li key={i}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Add-ons Section */}
                                <div className="space-y-2">
                                    <Label>Add-ons</Label>
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-2 border rounded-md p-3">
                                            {HOMECOMING_ADDONS.map((addon: string) => (
                                                <div key={addon} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`homecoming-addon-${addon}`}
                                                        checked={editedOrder.homecoming?.addons?.includes(addon) || false}
                                                        onCheckedChange={(checked) => {
                                                            const current = editedOrder.homecoming || {};
                                                            const currentAddons = current.addons || [];
                                                            let newAddons;
                                                            if (checked) {
                                                                newAddons = [...currentAddons, addon];
                                                            } else {
                                                                newAddons = currentAddons.filter(a => a !== addon);
                                                            }
                                                            updateField('homecoming', { ...current, addons: newAddons });
                                                        }}
                                                    />
                                                    <Label htmlFor={`homecoming-addon-${addon}`} className="text-sm font-normal cursor-pointer">
                                                        {addon}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {order.homecoming?.addons && order.homecoming.addons.length > 0 ? (
                                                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                                    {order.homecoming.addons.map((addon, i) => (
                                                        <li key={i}>{addon}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic">No add-ons selected</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Details & Notes</Label>
                                    {isEditing ? (
                                        <Textarea 
                                            value={editedOrder.homecoming?.packageDetails || ''} 
                                            onChange={(e) => {
                                                const current = editedOrder.homecoming || {};
                                                updateField('homecoming', { ...current, packageDetails: e.target.value })
                                            }} 
                                            placeholder="Add specific details here..."
                                        />
                                    ) : (
                                        <div className="text-sm whitespace-pre-wrap">{order.homecoming?.packageDetails || <span className="text-muted-foreground italic">No additional notes</span>}</div>
                                    )}
                            </div>
                            </CardContent>
                        </Card>
                        )}

                        {/* ENGAGEMENT */}
                        {/* ENGAGEMENT */}
                        {(isEditing || order.engagement?.date || order.engagement?.packageType) && (
                        <Card className="rounded-3xl shadow-sm border-muted overflow-hidden">
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Engagement</CardTitle>
                                {isEditing && (
                                    <Button variant="ghost" size="sm" onClick={() => handleClearSection('engagement')} className="h-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                        <Label>Date</Label>
                                        {isEditing ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !editedOrder.engagement?.date && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {editedOrder.engagement?.date ? format(new Date(editedOrder.engagement.date), "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={editedOrder.engagement?.date ? new Date(editedOrder.engagement.date) : undefined}
                                                        onSelect={(date) => {
                                                            const current = editedOrder.engagement || {};
                                                            updateField('engagement', { ...current, date })
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        ) : (
                                            <div>{order.engagement?.date ? format(new Date(order.engagement.date), "PPP") : <span className="text-muted-foreground text-sm">Not scheduled</span>}</div>
                                        )}
                                </div>
                                <div className="space-y-2">
                                        <Label>Package Type</Label>
                                        {isEditing ? (
                                            <Select 
                                                value={editedOrder.engagement?.packageType || ''} 
                                                key={editedOrder.engagement?.packageType || 'empty'}
                                                onValueChange={(value) => {
                                                    const current = editedOrder.engagement || {};
                                                    updateField('engagement', { ...current, packageType: value })
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Package" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ENGAGEMENT_PACKAGES.map((pkg) => (
                                                        <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div>{order.engagement?.packageType || <span className="text-muted-foreground text-sm">N/A</span>}</div>
                                        )}
                                </div>
                                </div>

                                {/* Package Features Display */}
                                {!isEditing && order.engagement?.packageType && PACKAGE_DETAILS[order.engagement.packageType] && (
                                    <div className="bg-muted/40 p-4 rounded-xl text-sm">
                                        <Label className="mb-2 block text-muted-foreground text-xs uppercase tracking-wider">Package Includes</Label>
                                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                            {PACKAGE_DETAILS[order.engagement.packageType].map((feature, i) => (
                                                <li key={i}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Add-ons Section */}
                                <div className="space-y-2">
                                    <Label>Add-ons</Label>
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-2 border rounded-md p-3">
                                            {ENGAGEMENT_ADDONS.map((addon: string) => (
                                                <div key={addon} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`engagement-addon-${addon}`}
                                                        checked={editedOrder.engagement?.addons?.includes(addon) || false}
                                                        onCheckedChange={(checked) => {
                                                            const current = editedOrder.engagement || {};
                                                            const currentAddons = current.addons || [];
                                                            let newAddons;
                                                            if (checked) {
                                                                newAddons = [...currentAddons, addon];
                                                            } else {
                                                                newAddons = currentAddons.filter(a => a !== addon);
                                                            }
                                                            updateField('engagement', { ...current, addons: newAddons });
                                                        }}
                                                    />
                                                    <Label htmlFor={`engagement-addon-${addon}`} className="text-sm font-normal cursor-pointer">
                                                        {addon}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {order.engagement?.addons && order.engagement.addons.length > 0 ? (
                                                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                                    {order.engagement.addons.map((addon, i) => (
                                                        <li key={i}>{addon}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic">No add-ons selected</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Details & Notes</Label>
                                    {isEditing ? (
                                        <Textarea 
                                            value={editedOrder.engagement?.packageDetails || ''} 
                                            onChange={(e) => {
                                                const current = editedOrder.engagement || {};
                                                updateField('engagement', { ...current, packageDetails: e.target.value })
                                            }} 
                                            placeholder="Add specific details here..."
                                        />
                                    ) : (
                                        <div className="text-sm whitespace-pre-wrap">{order.engagement?.packageDetails || <span className="text-muted-foreground italic">No additional notes</span>}</div>
                                    )}
                            </div>
                            </CardContent>
                        </Card>
                        )}

                        {/* PRE-SHOOT */}
                        {/* PRE-SHOOT */}
                        {(isEditing || order.preShoot?.date || order.preShoot?.packageType) && (
                        <Card className="rounded-3xl shadow-sm border-muted overflow-hidden">
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Pre-Shoot</CardTitle>
                                {isEditing && (
                                     <Button variant="ghost" size="sm" onClick={() => handleClearSection('preShoot')} className="h-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                        <Label>Date</Label>
                                        {isEditing ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !editedOrder.preShoot?.date && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {editedOrder.preShoot?.date ? format(new Date(editedOrder.preShoot.date), "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={editedOrder.preShoot?.date ? new Date(editedOrder.preShoot.date) : undefined}
                                                        onSelect={(date) => {
                                                            const current = editedOrder.preShoot || {};
                                                            updateField('preShoot', { ...current, date })
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        ) : (
                                            <div>{order.preShoot?.date ? format(new Date(order.preShoot.date), "PPP") : <span className="text-muted-foreground text-sm">Not scheduled</span>}</div>
                                        )}
                                </div>
                                <div className="space-y-2">
                                        <Label>Package Type</Label>
                                        {isEditing ? (
                                            <Select 
                                                value={editedOrder.preShoot?.packageType || ''} 
                                                key={editedOrder.preShoot?.packageType || 'empty'}
                                                onValueChange={(value) => {
                                                    const current = editedOrder.preShoot || {};
                                                    updateField('preShoot', { ...current, packageType: value })
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Package" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRESHOOT_PACKAGES.map((pkg) => (
                                                        <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div>{order.preShoot?.packageType || <span className="text-muted-foreground text-sm">N/A</span>}</div>
                                        )}
                                </div>
                                </div>

                                {/* Package Features Display */}
                                {!isEditing && order.preShoot?.packageType && PACKAGE_DETAILS[order.preShoot.packageType] && (
                                    <div className="bg-muted/40 p-4 rounded-xl text-sm">
                                        <Label className="mb-2 block text-muted-foreground text-xs uppercase tracking-wider">Package Includes</Label>
                                        <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                            {PACKAGE_DETAILS[order.preShoot.packageType].map((feature, i) => (
                                                <li key={i}>{feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Add-ons Section */}
                                <div className="space-y-2">
                                    <Label>Add-ons</Label>
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-2 border rounded-md p-3">
                                            {PRESHOOT_ADDONS.map((addon: string) => (
                                                <div key={addon} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`preshoot-addon-${addon}`}
                                                        checked={editedOrder.preShoot?.addons?.includes(addon) || false}
                                                        onCheckedChange={(checked) => {
                                                            const current = editedOrder.preShoot || {};
                                                            const currentAddons = current.addons || [];
                                                            let newAddons;
                                                            if (checked) {
                                                                newAddons = [...currentAddons, addon];
                                                            } else {
                                                                newAddons = currentAddons.filter(a => a !== addon);
                                                            }
                                                            updateField('preShoot', { ...current, addons: newAddons });
                                                        }}
                                                    />
                                                    <Label htmlFor={`preshoot-addon-${addon}`} className="text-sm font-normal cursor-pointer">
                                                        {addon}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {order.preShoot?.addons && order.preShoot.addons.length > 0 ? (
                                                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                                    {order.preShoot.addons.map((addon, i) => (
                                                        <li key={i}>{addon}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic">No add-ons selected</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Details & Notes</Label>
                                    {isEditing ? (
                                        <Textarea 
                                            value={editedOrder.preShoot?.packageDetails || ''} 
                                            onChange={(e) => {
                                                const current = editedOrder.preShoot || {};
                                                updateField('preShoot', { ...current, packageDetails: e.target.value })
                                            }} 
                                            placeholder="Add specific details here..."
                                        />
                                    ) : (
                                        <div className="text-sm whitespace-pre-wrap">{order.preShoot?.packageDetails || <span className="text-muted-foreground italic">No additional notes</span>}</div>
                                    )}
                            </div>
                            </CardContent>
                        </Card>
                        )}

                        {/* GENERAL ADDONS */}
                        {(isEditing || (order.generalAddons && order.generalAddons.length > 0)) && (
                        <Card className="col-span-full rounded-3xl shadow-sm border-muted overflow-hidden">
                            <CardHeader>
                                <CardTitle>General Addons</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-xl p-4">
                                        {GENERAL_ADDONS.map((addon: string) => (
                                            <div key={addon} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`general-addon-${addon}`}
                                                    checked={editedOrder.generalAddons?.includes(addon) || false}
                                                    onCheckedChange={(checked) => {
                                                        const currentAddons = editedOrder.generalAddons || [];
                                                        let newAddons;
                                                        if (checked) {
                                                            newAddons = [...currentAddons, addon];
                                                        } else {
                                                            newAddons = currentAddons.filter(a => a !== addon);
                                                        }
                                                        updateField('generalAddons', newAddons);
                                                    }}
                                                />
                                                <Label htmlFor={`general-addon-${addon}`} className="text-sm font-normal cursor-pointer">
                                                    {addon}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {order.generalAddons && order.generalAddons.length > 0 ? (
                                            <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                                {order.generalAddons.map((addon, i) => (
                                                    <li key={i}>{addon}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic">No general add-ons selected</div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        )}

                        {/* Show message if no events are selected and not editing */}
                        {!isEditing && !((order.wedding?.date || order.wedding?.packageType) || (order.homecoming?.date || order.homecoming?.packageType) || (order.engagement?.date || order.engagement?.packageType) || (order.preShoot?.date || order.preShoot?.packageType)) && (
                            <div className="col-span-full flex flex-col items-center justify-center p-8 text-muted-foreground bg-secondary border-2 border-dashed rounded-3xl">
                                <CalendarIcon className="h-8 w-8 mb-2 opacity-50" />
                                <p>No events scheduled yet.</p>
                                <Button variant="link" onClick={() => setIsEditing(true)}>Edit Order to add events</Button>
                            </div>
                        )}

                    </div>
                </TabsContent>

                 {/* Agreement Tab */}
                 <TabsContent value="agreement">
                    <Card className="rounded-3xl shadow-sm border-muted overflow-hidden">
                        <CardHeader>
                            <CardTitle>Agreement Status</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Current Status</Label>
                                    {isEditing ? (
                                        <Select 
                                            value={editedOrder.agreementStatus || "Not Sent"} 
                                            onValueChange={(value) => updateField('agreementStatus', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Not Sent">Not Sent</SelectItem>
                                                <SelectItem value="Sent">Sent</SelectItem>
                                                <SelectItem value="Signed">Signed</SelectItem>
                                                <SelectItem value="Reviewing">Reviewing</SelectItem>
                                                <SelectItem value="Completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                       <Badge variant="secondary">{order.agreementStatus || "Not Sent"}</Badge>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-muted p-2 rounded text-xs font-mono flex-1 truncate">
                                            {order.portalToken ? `${origin}/portal/${order.portalToken}` : 'No portal token generated'}
                                        </div>
                                        {order.portalToken ? (
                                             <Button variant="outline" size="sm" asChild>
                                                <a href={`/portal/${order.portalToken}`} target="_blank" rel="noopener noreferrer">Open Portal</a>
                                             </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={copyPortalLink}>Generate</Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Share this unified portal link with your client. They can sign the agreement there.</p>
                                </div>
                            </div>

                            <Separator />
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold">Agreement Form Data</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label>Bride's Name</Label>
                                        <div className="text-sm">{order.agreementDetails?.coupleName?.bride || '-'}</div>
                                     </div>
                                     <div className="space-y-2">
                                        <Label>Groom's Name</Label>
                                        <div className="text-sm">{order.agreementDetails?.coupleName?.groom || '-'}</div>
                                     </div>
                                      <div className="space-y-2">
                                        <Label>Address</Label>
                                        <div className="text-sm text-muted-foreground">{order.agreementDetails?.address || '-'}</div>
                                     </div>
                                     <div className="space-y-2">
                                        <Label>Email</Label>
                                        <div className="text-sm text-muted-foreground">{order.agreementDetails?.email || '-'}</div>
                                     </div>
                                      <div className="space-y-2">
                                        <Label>Bride's Phone</Label>
                                        <div className="text-sm text-muted-foreground">{order.agreementDetails?.phone?.bride || '-'}</div>
                                     </div>
                                      <div className="space-y-2">
                                        <Label>Groom's Phone</Label>
                                        <div className="text-sm text-muted-foreground">{order.agreementDetails?.phone?.groom || '-'}</div>
                                     </div>
                                      <div className="space-y-2 md:col-span-2">
                                        <Label>How did you find US?</Label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {order.agreementDetails?.referralSource && order.agreementDetails.referralSource.length > 0 ? (
                                                order.agreementDetails.referralSource.map((source, i) => (
                                                    <Badge key={i} variant="secondary" className="font-normal">{source}</Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </div>
                                     </div>
                                      <div className="space-y-2 md:col-span-2">
                                        <Label>Story</Label>
                                        <div className="text-sm text-muted-foreground bg-muted/40 p-4 rounded-xl whitespace-pre-wrap">{order.agreementDetails?.story || <span className="italic">No story shared</span>}</div>
                                     </div>
                                </div>
        {(order.financials.paymentProof?.url) && (
                                     <div className="mt-6 p-4 rounded-xl border bg-muted/20 space-y-4">
                                         <div className="flex items-center justify-between">
                                             <div className="flex items-center gap-2">
                                                 <span className="font-semibold text-sm uppercase tracking-wide">Advance Payment Proof</span>
                                                 <Badge variant={
                                                    order.financials.paymentProof.status === 'Verified' ? 'default' : 
                                                    order.financials.paymentProof.status === 'Rejected' ? 'destructive' : 'secondary'
                                                 } className={order.financials.paymentProof.status === 'Verified' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                     {order.financials.paymentProof.status}
                                                 </Badge>
                                             </div>
                                             <div className="text-xs text-muted-foreground">
                                                 Uploaded: {new Date(order.financials.paymentProof.uploadedAt).toLocaleString()}
                                             </div>
                                         </div>
                                         
                                         <div className="flex gap-6 items-start">
                                             <div className="relative w-48 h-32 rounded-lg border bg-background overflow-hidden cursor-pointer group" onClick={() => window.open(order.financials.paymentProof!.url, '_blank')}>
                                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                                 <img 
                                                    src={order.financials.paymentProof.url} 
                                                    alt="Payment Proof" 
                                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                                                 />
                                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                     <ExternalLink className="text-white w-6 h-6" />
                                                 </div>
                                             </div>
                                             
                                             <div className="space-y-2">
                                                 <p className="text-sm text-muted-foreground">
                                                     Please verify the payment receipt against the bank statement.
                                                 </p>
                                                 <div className="flex gap-2">
                                                     <Button size="sm" onClick={() => handleVerifyPayment('Verified')} disabled={isLoading || order.financials.paymentProof?.status === 'Verified'}>
                                                         <CheckCircle className="w-4 h-4 mr-2" /> Verify
                                                     </Button>
                                                     <Button size="sm" variant="destructive" onClick={() => handleVerifyPayment('Rejected')} disabled={isLoading || order.financials.paymentProof?.status === 'Rejected'}>
                                                         <X className="w-4 h-4 mr-2" /> Reject
                                                     </Button>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                )}
                            
                            </div>
                        </CardContent>
                    </Card>

                    {/* Portal Link Card */}
                    <Card className="rounded-3xl shadow-sm border-muted overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg">Client Portal</CardTitle>
                            <CardDescription>Share this unified link with the client to access their agreement, progress tracker, and payments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted p-3 rounded-lg text-sm text-muted-foreground font-mono truncate">
                                    {origin}/portal/{order.portalToken || 'Generating...'}
                                </div>
                                <Button onClick={copyPortalLink} variant="outline" className="shrink-0 gap-2">
                                    <Copy className="w-4 h-4" /> Copy Link
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="shrink-0">
                                    <Link to={`/portal/${order.portalToken}`} target="_blank">
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                 </TabsContent>
            </Tabs>
        </div>
    )
}
