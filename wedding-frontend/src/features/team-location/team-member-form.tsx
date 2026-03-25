"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { TeamMember } from "@/lib/types"
import { createTeamMember, updateTeamMember } from "@/lib/mock-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[A-Za-z\s.]+$/, "Name can only contain letters, spaces, and dots"),
  role: z.string().min(2, "Role is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface TeamMemberFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: TeamMember | null
  onSuccess: () => void
}

export function TeamMemberForm({ open, onOpenChange, member, onSuccess }: TeamMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
      phone: "",
      active: true,
    },
  })

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        role: member.role,
        email: member.email,
        phone: member.phone,
        active: member.active,
      })
    } else {
        form.reset({
            name: "",
            role: "",
            email: "",
            phone: "",
            active: true,
        })
    }
  }, [member, form])

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      if (member && member._id) {
        const result = await updateTeamMember(member._id, values)
        if (result.success) {
          toast.success("Team member updated successfully")
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error("Failed to update team member")
        }
      } else {
        const result = await createTeamMember(values as any)
        if (result.success) {
          toast.success("Team member created successfully")
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error("Failed to create team member")
        }
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const ROLES = [
    "Photographer",
    "Videographer",
    "Drone Operator",
    "Editor",
    "Assistant",
    "Manager"
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update team member details here." : "Add a new team member to the system."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {ROLES.map((role) => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="email"
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
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                        <Input 
                          placeholder="0779957368" 
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
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {member ? "Save Changes" : "Create Member"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
