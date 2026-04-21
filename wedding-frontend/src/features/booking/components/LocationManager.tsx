/**
 * @file LocationManager.tsx
 * @description Complex interface for managing multiple event locations.
 * It supports both 'Library' locations (pre-defined in the database) and 
 * 'Manual' locations (user-entered).
 * 
 * Features:
 * - Dynamic Form Arrays: Uses useFieldArray to handle N number of locations.
 * - Hybrid Input Modes: Switch between selecting from a list or manual entry.
 * - Geographic Integration: Nested dropdowns for Sri Lankan Provinces and Districts.
 * - Map Discovery: Automated URL linking for Google Maps verification.
 */

import { UseFormReturn, useFieldArray } from "react-hook-form"
import { OrderFormValues } from "../schema"
import { MapPin, Trash2, Plus, ExternalLink } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { SRI_LANKA_PROVINCES } from "@/lib/sri-lanka"

interface LocationManagerProps {
  form: UseFormReturn<OrderFormValues>
  libraryLocations: any[] // Data fetched from the backend /locations endpoint
}

/**
 * LocationManager Component
 * Manages the "locations" array field within the main order form.
 */
export function LocationManager({ form, libraryLocations }: LocationManagerProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "locations",
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Event Locations
        </h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => append({ name: "", mode: "manual", forEvent: "Wedding" })}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-4 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30 relative group">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => remove(index)}
              className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-4">
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`locations.${index}.forEvent`}
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <Select onValueChange={field.onChange} value={field.value || "Wedding"}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-[10px] uppercase font-bold">
                            <SelectValue placeholder="Event" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Wedding">Wedding</SelectItem>
                          <SelectItem value="Homecoming">Homecoming</SelectItem>
                          <SelectItem value="Engagement">Engagement</SelectItem>
                          <SelectItem value="Pre-shoot">Pre-shoot</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`locations.${index}.mode`}
                  render={({ field }) => (
                    <FormItem className="w-2/3">
                      <Select 
                        onValueChange={(val) => {
                          field.onChange(val)
                          // Feature: State Cleanup - Reset name if switching back to manual
                          if (val === "manual") {
                            form.setValue(`locations.${index}.name`, "")
                          }
                        }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-[10px] uppercase font-bold">
                            <SelectValue placeholder="Mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">Enter Manually</SelectItem>
                          <SelectItem value="library">Library Location</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Feature: Library Selection Logic - Auto-populates URL and Region */}
              {form.watch(`locations.${index}.mode`) === "library" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name={`locations.${index}.province`}
                      render={({ field }) => (
                        <FormItem>
                          <Select 
                            onValueChange={(val) => {
                              field.onChange(val)
                              // Feature: Dependent Dropdown - Reset district and name when province changes
                              form.setValue(`locations.${index}.district`, "")
                              form.setValue(`locations.${index}.name`, "")
                              form.setValue(`locations.${index}.url`, "")
                            }} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-[10px]">
                                <SelectValue placeholder="Province" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SRI_LANKA_PROVINCES.map(p => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`locations.${index}.district`}
                      render={({ field }) => {
                        const provinceName = form.watch(`locations.${index}.province`)
                        const province = SRI_LANKA_PROVINCES.find(p => p.name === provinceName)
                        const districts = province ? province.districts : []
                        return (
                          <FormItem>
                            <Select 
                              onValueChange={(val) => {
                                field.onChange(val)
                                // Feature: Dependent Dropdown - Reset name when district changes
                                form.setValue(`locations.${index}.name`, "")
                                form.setValue(`locations.${index}.url`, "")
                              }} 
                              value={field.value}
                              disabled={!provinceName}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 text-[10px]">
                                  <SelectValue placeholder="District" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`locations.${index}.name`}
                    render={({ field }) => {
                      const province = form.watch(`locations.${index}.province`)
                      const district = form.watch(`locations.${index}.district`)
                      
                      // Feature: Library Filter Logic
                      // Only show venues that match the selected province and district.
                      // Robustness: Using lowercase and trim to prevent mismatches due to formatting.
                      const filteredLocations = libraryLocations.filter(loc => 
                        (!province || loc.province.trim().toLowerCase() === province.trim().toLowerCase()) && 
                        (!district || loc.district.trim().toLowerCase() === district.trim().toLowerCase())
                      )

                      return (
                        <FormItem>
                          <Select 
                            onValueChange={(val) => {
                              const loc = libraryLocations.find(l => l.name === val)
                              if (loc) {
                                field.onChange(loc.name)
                                form.setValue(`locations.${index}.url`, loc.googleMapLink || "")
                                // Feature: Data Integrity - Ensure province/district match the selected venue
                                form.setValue(`locations.${index}.province`, loc.province)
                                form.setValue(`locations.${index}.district`, loc.district)
                              }
                            }} 
                            value={field.value}
                            disabled={!district}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select venue..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredLocations.map(l => (
                                <SelectItem key={l._id} value={l.name}>{l.name}</SelectItem>
                              ))}
                              {filteredLocations.length === 0 && (
                                <div className="p-2 text-xs text-muted-foreground text-center">No venues found in this area</div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name={`locations.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Venue Name..." className="h-8 text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Feature: Simplified Manual Entry
                      Regional fields (Province/District) removed as per user requirement 
                      to focus strictly on Venue and Map Link.
                  */}
                </div>
              )}

              <FormField
                control={form.control}
                name={`locations.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Google Maps URL..." className="h-8 text-[10px] pr-8" {...field} />
                        {field.value && (
                          <a href={field.value} target="_blank" rel="noreferrer" className="absolute right-2 top-2 text-primary hover:text-primary/70">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="col-span-full py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
            <MapPin className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No locations added yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
