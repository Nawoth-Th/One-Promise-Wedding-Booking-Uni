import { UseFormReturn } from "react-hook-form"
import { OrderFormValues } from "../schema"
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

interface ClientInfoSectionProps {
  form: UseFormReturn<OrderFormValues>
}

export function ClientInfoSection({ form }: ClientInfoSectionProps) {
  return (
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
  )
}
