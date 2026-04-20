import { useState, useEffect } from "react"
import { Plus, Trash2, MapPin, ExternalLink, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { SRI_LANKA_PROVINCES } from "@/lib/sri-lanka"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Location } from "@/lib/types"

export default function LocationPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null)
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null)

  // New Location Form State
  const [newName, setNewName] = useState("")
  const [newLink, setNewLink] = useState("")
  const [newProvince, setNewProvince] = useState("")
  const [newDistrict, setNewDistrict] = useState("")
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const data = await api.getLocations()
      setLocations(data)
    } catch (error) {
      toast.error("Failed to fetch locations")
    } finally {
      setLoading(false)
    }
  }

  const handleAddLocation = async () => {
    if (!newName || !newProvince || !newDistrict) {
      setShowErrors(true)
      toast.error("Please fill in all required fields marked in red")
      return
    }

    if (newLink && !/google\.com\/maps|goo\.gl\/maps|maps\.google\.com/.test(newLink)) {
      toast.error("Invalid Google Maps link. Please enter a valid URL.")
      return
    }

    setShowErrors(false)

    try {
      await api.createLocation({
        name: newName,
        googleMapLink: newLink,
        province: newProvince,
        district: newDistrict,
      })

      toast.success("Location added successfully")
      setNewName("")
      setNewLink("")
      fetchLocations()
    } catch (error) {
      toast.error("Error adding location")
    }
  }

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return

    try {
      await api.deleteLocation(id)
      toast.success("Location deleted")
      fetchLocations()
    } catch (error) {
      toast.error("Error deleting location")
    }
  }

  const getDistricts = (provinceName: string) => {
    return SRI_LANKA_PROVINCES.find((p) => p.name === provinceName)?.districts || []
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Location Library</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Location Form */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Add New Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className={cn("text-sm font-medium", showErrors && !newProvince && "text-destructive")}>Province</label>
              <Select onValueChange={(val) => { setNewProvince(val); setNewDistrict(""); }}>
                <SelectTrigger className={cn(showErrors && !newProvince && "border-destructive ring-destructive")}>
                  <SelectValue placeholder="Select Province" />
                </SelectTrigger>
                <SelectContent>
                  {SRI_LANKA_PROVINCES.map((p) => (
                    <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showErrors && !newProvince && <p className="text-[10px] text-destructive font-medium">Province is required</p>}
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-medium", showErrors && !newDistrict && "text-destructive")}>District</label>
              <Select onValueChange={setNewDistrict} value={newDistrict} disabled={!newProvince}>
                <SelectTrigger className={cn(showErrors && !newDistrict && "border-destructive ring-destructive")}>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {getDistricts(newProvince).map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showErrors && !newDistrict && <p className="text-[10px] text-destructive font-medium">District is required</p>}
            </div>

            <div className="space-y-2">
              <label className={cn("text-sm font-medium", showErrors && !newName && "text-destructive")}>Location Name</label>
              <Input
                placeholder="Hotel Name / Venue"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={cn(showErrors && !newName && "border-destructive ring-destructive")}
              />
              {showErrors && !newName && <p className="text-[10px] text-destructive font-medium">Name is required</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Google Maps Link (Optional)</label>
              <Input
                placeholder="https://maps.google.com/..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className={newLink && !/google\.com\/maps|goo\.gl\/maps|maps\.google\.com/.test(newLink) ? "border-destructive" : ""}
              />
              {newLink && !/google\.com\/maps|goo\.gl\/maps|maps\.google\.com/.test(newLink) && (
                <p className="text-[10px] text-destructive font-medium">Must be a valid Google Maps link</p>
              )}
            </div>

            <Button className="w-full" onClick={handleAddLocation}>
              <Plus className="mr-2 h-4 w-4" /> Add Location
            </Button>
          </CardContent>
        </Card>

        {/* Location Browser */}
        <div className="lg:col-span-2 space-y-4">
          {SRI_LANKA_PROVINCES.map((province) => (
            <Card key={province.name} className="overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedProvince(expandedProvince === province.name ? null : province.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">{province.name} Province</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {locations.filter(l => l.province === province.name).length} Locations
                  </span>
                </div>
                {expandedProvince === province.name ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {expandedProvince === province.name && (
                <div className="border-t p-4 space-y-3 bg-muted/5">
                  {province.districts.map((district) => {
                    const districtLocations = locations.filter(l => l.province === province.name && l.district === district);
                    return (
                      <div key={district} className="space-y-2">
                        <button
                          className="text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setExpandedDistrict(expandedDistrict === district ? null : district)}
                        >
                          {expandedDistrict === district ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          {district} ({districtLocations.length})
                        </button>

                        {expandedDistrict === district && (
                          <div className="pl-5 space-y-2">
                            {districtLocations.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">No locations added yet.</p>
                            ) : (
                              districtLocations.map((loc) => (
                                <div key={loc._id} className="flex items-center justify-between p-2 rounded-md border bg-background group">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{loc.name}</span>
                                    {loc.googleMapLink && (
                                      <a
                                        href={loc.googleMapLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-blue-500 flex items-center hover:underline"
                                      >
                                        Google Maps <ExternalLink className="ml-1 h-2 w-2" />
                                      </a>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteLocation(loc._id!)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
