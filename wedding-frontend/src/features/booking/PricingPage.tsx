import { useState } from "react"
import type { PricingItem } from "@/lib/types"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner" // Using sonner for simpler global access in dialogs if preferred, or useToast

export default function PricingPage() {
  const [items, setItems] = useState<PricingItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null)
  
  const { toast } = useToast()

  const loadItems = async () => {
    try {
      const data = await api.getPricingItems()
      setItems(data)
    } catch (err) {
      toast({ title: "Error", description: "Failed to load pricing items.", variant: "destructive" })
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleCreate = async (data: Omit<PricingItem, "_id" | "updatedAt">) => {
    try {
      await api.createPricingItem(data)
      await loadItems()
      toast({ title: "Success", description: "Item created successfully." })
      setIsDialogOpen(false)
    } catch (err) {
      toast({ title: "Error", description: "Failed to create item.", variant: "destructive" })
    }
  }

  const handleUpdate = async (id: string, data: Partial<PricingItem>) => {
    try {
      await api.updatePricingItem(id, data)
      await loadItems()
      toast({ title: "Success", description: "Item updated successfully." })
      setIsDialogOpen(false)
      setEditingItem(null)
    } catch (err) {
      toast({ title: "Error", description: "Failed to update item.", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deletePricingItem(id)
      await loadItems()
      toast({ title: "Deleted", description: "Item deleted successfully." })
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" })
    }
  }

  const openCreateDialog = (category?: string) => {
    setEditingItem(category ? { category } as PricingItem : null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (item: PricingItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const packageCats = ["Wedding Packages", "Homecoming Packages", "Engagement Packages", "Pre-shoot Packages"]
  const addonCats = ["Wedding Add-ons", "Homecoming Add-ons", "Engagement Add-ons", "Pre-shoot Add-ons", "General Add-ons"]
  
  const existingCats = new Set([...packageCats, ...addonCats])
  const categories = Array.from(new Set(items.map(i => i.category)))
  const otherCats = categories.filter(c => !existingCats.has(c))

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-start">
        <div>
           <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Pricing Management</h1>
           <p className="text-muted-foreground mt-1">Set prices and details for all packages and add-ons.</p>
        </div>
        <Button onClick={() => openCreateDialog()} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Create New
        </Button>
      </div>

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-full">
          <TabsTrigger value="packages" className="rounded-full px-6">Packages</TabsTrigger>
          <TabsTrigger value="addons" className="rounded-full px-6">Add-ons</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
            {packageCats.map(category => (
                <PricingGroup 
                    key={category} 
                    category={category} 
                    items={items.filter(i => i.category === category)} 
                    onEdit={openEditDialog}
                    onDelete={handleDelete}
                    onCreate={() => openCreateDialog(category)}
                />
            ))}
        </TabsContent>

        <TabsContent value="addons" className="space-y-6">
             {addonCats.map(category => (
                <PricingGroup 
                    key={category} 
                    category={category} 
                    items={items.filter(i => i.category === category)} 
                    onEdit={openEditDialog}
                    onDelete={handleDelete}
                    onCreate={() => openCreateDialog(category)}
                />
            ))}
             {otherCats.map(category => (
                <PricingGroup 
                    key={category} 
                    category={category} 
                    items={items.filter(i => i.category === category)} 
                    onEdit={openEditDialog}
                    onDelete={handleDelete}
                    onCreate={() => openCreateDialog(category)}
                />
            ))}
        </TabsContent>
      </Tabs>

      <PricingItemDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        item={editingItem} 
        onSave={editingItem?._id ? (data) => handleUpdate(editingItem._id!, data) : handleCreate}
      />
    </div>
  )
}

function PricingGroup({ category, items, onEdit, onDelete, onCreate }: { 
    category: string, 
    items: PricingItem[], 
    onEdit: (i: PricingItem) => void,
    onDelete: (id: string) => void,
    onCreate: () => void
}) {
    return (
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 pt-10 pb-3 grid grid-cols-[1fr_auto_1fr] items-end">
                <div></div>
                <CardTitle className="text-lg font-semibold uppercase tracking-widest text-foreground/80 text-center">{category}</CardTitle>
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={onCreate} className="h-8 gap-1 text-muted-foreground hover:text-primary mb-1">
                        <Plus className="w-3 h-3" /> Add Item
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/40">
                    {items.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No items in this category.
                        </div>
                    )}
                    {items.map(item => (
                        <div key={item._id} className="group flex items-start justify-between p-4 hover:bg-muted/10 transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                     <span className="font-medium text-foreground/90">{item.name}</span>
                                     <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-mono">
                                        LKR {item.price.toLocaleString()}
                                     </span>
                                </div>
                                {item.details && item.details.length > 0 && (
                                    <div className="text-xs text-muted-foreground line-clamp-2 pl-2 border-l-2 border-muted">
                                        {item.details.join(", ")}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => onEdit(item)}
                                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <DeleteItemButton onDelete={() => onDelete(item._id!)} />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function DeleteItemButton({ onDelete }: { onDelete: () => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this pricing item.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

function PricingItemDialog({ open, onOpenChange, item, onSave }: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    item: PricingItem | null | Partial<PricingItem>,
    onSave: (data: any) => Promise<void> | void
}) {
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("")
    const [details, setDetails] = useState("")
    const [saving, setSaving] = useState(false)
    const [showErrors, setShowErrors] = useState(false)

    useEffect(() => {
        if (open) {
            setName(item?.name || "")
            setPrice(item?.price?.toString() || "")
            setCategory(item?.category || "Wedding Packages")
            setDetails(item?.details?.join("\n") || "")
            setShowErrors(false)
        }
    }, [open, item])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!name || !price || parseFloat(price) <= 0) {
            setShowErrors(true)
            toast.error("Please provide a valid name and price for the item.")
            return
        }

        setSaving(true)
        await onSave({
            name,
            price: parseFloat(price) || 0,
            category,
            details: details.split("\n").filter(line => line.trim().length > 0)
        })
        setSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{item?._id ? "Edit Item" : "Create New Item"}</DialogTitle>
                    <DialogDescription>
                        {item?._id ? "Make changes to the item here." : "Add a new pricing item to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={category} readOnly className="bg-muted text-muted-foreground focus-visible:ring-0" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name" className={cn(showErrors && !name && "text-destructive")}>Name</Label>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="e.g. Bronze Package" 
                            className={cn(showErrors && !name && "border-destructive ring-destructive")}
                        />
                        {showErrors && !name && <p className="text-[10px] text-destructive font-medium">Item name is required</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price" className={cn(showErrors && (!price || parseFloat(price) <= 0) && "text-destructive")}>Price (LKR)</Label>
                        <Input 
                            id="price" 
                            type="number" 
                            value={price} 
                            onChange={e => setPrice(e.target.value)} 
                            placeholder="0.00" 
                            className={cn(showErrors && (!price || parseFloat(price) <= 0) && "border-destructive ring-destructive")}
                        />
                        {showErrors && (!price || parseFloat(price) <= 0) && (
                            <p className="text-[10px] text-destructive font-medium">
                                {!price ? "Price is required" : "Price must be greater than 0"}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="details">Details (One per line)</Label>
                        <Textarea 
                            id="details" 
                            value={details} 
                            onChange={e => setDetails(e.target.value)} 
                            placeholder={"Feature 1\nFeature 2\nFeature 3"} 
                            className="h-32"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
