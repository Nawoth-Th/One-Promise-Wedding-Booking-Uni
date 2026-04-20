import { useState, useEffect } from "react"
import type { TeamMember } from "@/lib/types"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedMember(null)
    setIsDialogOpen(true)
  }

  async function loadTeam() {
    try {
      const data = await api.getTeamMembers()
      setMembers(data)
    } catch (err) {
      toast.error("Failed to load team members.")
    }
  }

  useEffect(() => {
    loadTeam()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return
    try {
      await api.deleteTeamMember(id)
      await loadTeam()
      toast.success("Member deleted")
    } catch (err) {
      toast.error("Failed to delete member.")
    }
  }

  const handleSave = async (data: TeamMember) => {
    try {
      if (selectedMember?._id) {
        await api.updateTeamMember(selectedMember._id, data)
        toast.success("Member updated")
      } else {
        await api.createTeamMember(data)
        toast.success("Member added")
      }
      await loadTeam()
      setIsDialogOpen(false)
    } catch (err) {
      toast.error("Failed to save member.")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
          <CardDescription>
            Manage your photography and videography team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No team members found. Add one to get started.
                    </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                    <TableRow key={member._id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                        <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            member.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}>
                            {member.active ? "Active" : "Inactive"}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(member._id!)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TeamMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        member={selectedMember}
        onSave={handleSave}
      />
    </div>
  )
}

function TeamMemberDialog({ open, onOpenChange, member, onSave }: {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  member: TeamMember | null,
  onSave: (data: TeamMember) => void,
}) {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [active, setActive] = useState(true)
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    if (member) {
      setName(member.name)
      setRole(member.role)
      setEmail(member.email)
      setPhone(member.phone)
      setActive(member.active)
    } else {
      setName("")
      setRole("")
      setEmail("")
      setPhone("")
      setActive(true)
    }
    setShowErrors(false)
  }, [member, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !role || !email || !phone) {
        setShowErrors(true)
        toast.error("Please fill in all required fields")
        return
    }
    onSave({ name, role, email, phone, active })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
          <DialogDescription>
            {member ? "Update team member details." : "Add a new team member."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className={cn(showErrors && !name && "text-destructive")}>Name</Label>
            <Input 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Full name" 
                className={cn(showErrors && !name && "border-destructive ring-destructive")}
            />
            {showErrors && !name && <p className="text-[10px] text-destructive font-medium">Name is required</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role" className={cn(showErrors && !role && "text-destructive")}>Role</Label>
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger id="role" className={cn(showErrors && !role && "border-destructive ring-destructive")}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead Photographer">Lead Photographer</SelectItem>
                <SelectItem value="Associate Photographer">Associate Photographer</SelectItem>
                <SelectItem value="Second Shooter">Second Shooter</SelectItem>
                <SelectItem value="Third Shooter / Crowd Specialist">Third Shooter / Crowd Specialist</SelectItem>
                <SelectItem value="Videographer">Videographer</SelectItem>
                <SelectItem value="Content Creator">Content Creator</SelectItem>
                <SelectItem value="Drone Operator">Drone Operator</SelectItem>
                <SelectItem value="Lighting Lead / Gaffer">Lighting Lead / Gaffer</SelectItem>
                <SelectItem value="Photography Assistant">Photography Assistant</SelectItem>
                <SelectItem value="Digital Tech">Digital Tech</SelectItem>
                <SelectItem value="Same-Day Editor">Same-Day Editor</SelectItem>
                <SelectItem value="Studio Manager">Studio Manager</SelectItem>
                <SelectItem value="Lead Editor / Retoucher">Lead Editor / Retoucher</SelectItem>
                <SelectItem value="Album Designer">Album Designer</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
              </SelectContent>
            </Select>
            {showErrors && !role && <p className="text-[10px] text-destructive font-medium">Role is required</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className={cn(showErrors && !email && "text-destructive")}>Email</Label>
            <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="email@example.com" 
                className={cn(showErrors && !email && "border-destructive ring-destructive")}
            />
            {showErrors && !email && <p className="text-[10px] text-destructive font-medium">Valid email is required</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone" className={cn(showErrors && !phone && "text-destructive")}>Phone</Label>
            <Input 
                id="phone" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="+94 77 XXX XXXX" 
                className={cn(showErrors && !phone && "border-destructive ring-destructive")}
            />
            {showErrors && !phone && <p className="text-[10px] text-destructive font-medium">Phone is required</p>}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="active">Active</Label>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
