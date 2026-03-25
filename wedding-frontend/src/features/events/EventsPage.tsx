import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Plus, Calendar as CalendarIcon, Info, AlertCircle, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format, isSameDay, parseISO } from "date-fns"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'order' | 'manual';
  eventType?: string;
  orderId?: string;
  description?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", description: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadEvents = async () => {
    try {
      const data = await api.getEvents()
      setEvents(data)
    } catch (err: any) {
      toast.error("Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleAddEvent = async () => {
    if (!selectedDate || !newEvent.title) return
    setIsSubmitting(true)
    try {
      await api.createManualEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: selectedDate
      })
      toast.success("Manual event added")
      setIsAddModalOpen(false)
      setNewEvent({ title: "", description: "" })
      loadEvents()
    } catch (err: any) {
      toast.error(err.message || "Failed to add event")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this manual event?")) return
    try {
      await api.deleteManualEvent(id)
      toast.success("Event deleted")
      loadEvents()
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event")
    }
  }

  const eventsOnSelectedDate = events.filter(e => 
    selectedDate && isSameDay(parseISO(e.date), selectedDate)
  )

  const modifiers = {
    booked: events.map(e => parseISO(e.date)),
    order: events.filter(e => e.type === 'order').map(e => parseISO(e.date)),
    manual: events.filter(e => e.type === 'manual').map(e => parseISO(e.date)),
  }

  const modifiersStyles = {
    order: { borderBottom: '2px solid hsl(var(--primary))' },
    manual: { borderBottom: '2px solid hsl(var(--destructive))' },
  }

  return (
    <div className="container mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage bookings and manual schedule</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-lg hover:shadow-primary/20 transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" /> Add Manual Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] backdrop-blur-xl bg-background/80">
            <DialogHeader>
              <DialogTitle>Add Manual Event</DialogTitle>
              <CardDescription>
                Schedule an event that will block this day from new bookings.
              </CardDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Selected Date</Label>
                <Input disabled value={selectedDate ? format(selectedDate, "PPP") : "No date selected"} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Office Maintenance" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Details about the event..." 
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddEvent} disabled={isSubmitting || !newEvent.title}>
                {isSubmitting ? "Adding..." : "Save Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Card className="lg:col-span-12 xl:col-span-8 shadow-xl border-none bg-background/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/30 py-3 px-6 flex flex-row items-center h-14 space-y-0">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Schedule Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 flex items-center justify-center">
             <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-xl border shadow-inner p-4 scale-110 md:scale-125 my-8 h-auto"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
          </CardContent>
          <div className="p-4 border-t bg-muted/20 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Wedding / Order</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span>Manual Block</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-12 xl:col-span-4 shadow-xl border-none bg-background/50 backdrop-blur-sm h-full max-h-[600px] flex flex-col">
          <CardHeader className="border-b bg-muted/30 py-3 px-6 flex flex-row items-center h-14 space-y-0">
            <div className="flex justify-between items-center w-full">
              <CardTitle className="text-lg">
                Events for {selectedDate ? format(selectedDate, "MMM d, yyyy") : "..."}
              </CardTitle>
              <Badge variant="outline">{eventsOnSelectedDate.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground italic">
                Scanning schedule...
              </div>
            ) : eventsOnSelectedDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <Info className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground italic">No events scheduled for this day.</p>
                <p className="text-xs text-muted-foreground/60 max-w-[200px]">
                  This day is available for new photography bookings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {eventsOnSelectedDate.map((event) => (
                  <div 
                    key={event.id}
                    className={`p-4 rounded-xl border-l-4 shadow-sm transition-all hover:translate-x-1 ${
                      event.type === 'order' 
                        ? 'bg-primary/5 border-primary' 
                        : 'bg-destructive/5 border-destructive'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      <div className="flex items-center gap-2">
                        {event.type === 'manual' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                        <Badge variant={event.type === 'order' ? 'secondary' : 'destructive'} className="text-[10px] h-4">
                          {event.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 italic">
                        "{event.description}"
                      </p>
                    )}
                    {event.orderId && (
                       <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-xs text-primary mt-2"
                        asChild
                      >
                        <a href={`/admin/orders/${event.orderId}`}>View Full Bill & Details →</a>
                      </Button>
                    )}
                  </div>
                ))}

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-xs leading-relaxed">
                    <strong>Overlap Prevented:</strong> This date is marked as occupied in the system. New orders cannot be booked on this day.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
