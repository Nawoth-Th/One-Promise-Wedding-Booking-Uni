"use client"

import { useState, useEffect } from "react"
import { TeamMember } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Check, Plus, User, X, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { assignTeamMembers } from "@/lib/order-actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface TeamAssignmentProps {
  orderId: string
  eventType: string
  eventDate?: Date | string
  assignedMemberIds: string[]
  allMembers: TeamMember[]
  onUpdate: (newIds: string[]) => void
}

export function TeamAssignment({
  orderId,
  eventType,
  eventDate,
  assignedMemberIds,
  allMembers,
  onUpdate,
}: TeamAssignmentProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [busyMemberIds, setBusyMemberIds] = useState<string[]>([])

  useEffect(() => {
    if (open && eventDate) {
      const dateStr = new Date(eventDate).toISOString();
      api.getAvailability(dateStr).then(setBusyMemberIds).catch(console.error);
    }
  }, [open, eventDate])

  const handleSelect = async (memberId: string) => {
    const member = allMembers.find(m => m._id === memberId);
    const isBusy = busyMemberIds.includes(memberId);

    if (isBusy && !assignedMemberIds.includes(memberId)) {
        if (!confirm(`Warning: ${member?.name} is already assigned to another event on this day. Do you still want to assign them?`)) {
            return;
        }
    }
    // Toggle logic
    let newIds: string[];
    if (assignedMemberIds.includes(memberId)) {
      newIds = assignedMemberIds.filter((id) => id !== memberId);
    } else {
      newIds = [...assignedMemberIds, memberId];
    }

    // Call server action
    // Optimistic update
    onUpdate(newIds);
    setIsLoading(true);

    const result = await assignTeamMembers(orderId, eventType, newIds);
    
    if (!result.success) {
      toast.error("Failed to update assignments");
      // Revert if failed (requires parent to handle revert or just re-fetch)
      // For now, simpler to assume success or alert error.
    } else {
      toast.success("Assignments updated & emails sent!");
    }
    
    setIsLoading(false);
  }

  const assignedMembers = allMembers.filter((m) => assignedMemberIds.includes(m._id!));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
          {assignedMembers.map((member) => (
             <Badge key={member._id} variant="secondary" className="pl-2 pr-2 py-1.5 flex items-center gap-2 bg-secondary text-white hover:bg-secondary/80 border border-border/50">
                <div className="bg-white/20 text-white rounded-full p-1">
                    <User className="h-3 w-3" />
                </div>
                <div className="flex flex-col text-xs leading-none">
                     <span className="font-semibold text-sm text-white">{member.name}</span>
                     <span className="text-[10px] text-white/80 uppercase tracking-wide">{member.role}</span>
                </div>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-1 rounded-full p-0 text-white/70 hover:bg-white/20 hover:text-white"
                    onClick={() => handleSelect(member._id!)}
                >
                    <X className="h-3 w-3" />
                </Button>
             </Badge>
          ))}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <Plus className="mr-2 h-3 w-3" />
                    Assign Team
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="right" align="start">
                <Command>
                    <CommandInput placeholder="Select team member..." />
                    <CommandList>
                        <CommandEmpty>No members found.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            {allMembers.map((member) => {
                                const isSelected = assignedMemberIds.includes(member._id!);
                                return (
                                    <CommandItem
                                        key={member._id}
                                        value={member.name} // Search by name
                                        onSelect={() => handleSelect(member._id!)}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span>{member.name}</span>
                                                {busyMemberIds.includes(member._id!) && !isSelected && (
                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 border-red-200 bg-red-50 text-red-600">
                                                        <AlertTriangle className="h-2 w-2 mr-1" />
                                                        Busy
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">{member.role}</span>
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 text-green-600" />}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
         </Popover>
      </div>
    </div>
  )
}
