"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Loader2, Download, FileCheck, Hash, User, MapPin, Mail, Users, Phone, Calendar, BookOpen, Search, FileText, Heart, CreditCard } from "lucide-react"
import { Order } from "@/lib/types"
import { toast } from "sonner"
import { api } from "@/lib/api"

// import dynamic from "next/dynamic" // removed

const agreementSchema = z.object({
  coupleName: z.object({
    bride: z.string().min(1, "Bride's name is required"),
    groom: z.string().min(1, "Groom's name is required"),
  }),
  address: z.string().min(1, "Address is required"),
  phone: z.object({
    bride: z.string().min(1, "Bride's phone is required"),
    groom: z.string().min(1, "Groom's phone is required"),
  }),
  email: z.string().email("Invalid email address"),
  story: z.string().optional(),
  referralSource: z.array(z.string()).optional(),
  ack: z.boolean().refine(val => val === true, "You must acknowledge the terms to sign"),
  signature: z.string().min(1, "Please sign with your full name"),
})

interface ClientAgreementFormProps {
  order: Order
  packageDetails: Record<string, string[]>
  onSwitchToPayment?: () => void
}

// Dynamically import the download button to avoid SSR issues with react-pdf
import AgreementDownloadLink from "./agreement-download-link"

export function ClientAgreementForm({ order, packageDetails, onSwitchToPayment }: ClientAgreementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSigned, setIsSigned] = useState(order.agreementStatus === 'Signed' || order.agreementStatus === 'Completed')

  const form = useForm<z.infer<typeof agreementSchema>>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      coupleName: {
        bride: order.agreementDetails?.coupleName?.bride || "",
        groom: order.agreementDetails?.coupleName?.groom || "",
      },
      address: order.agreementDetails?.address || "",
      phone: {
        bride: order.agreementDetails?.phone?.bride || "",
        groom: order.agreementDetails?.phone?.groom || "",
      },
      email: order.agreementDetails?.email || order.clientInfo.email || "",
      story: order.agreementDetails?.story || "",
      referralSource: order.agreementDetails?.referralSource || [],
      ack: isSigned,
      signature: order.agreementDetails?.signature || "",
    },
  })

  const onInvalid = (errors: any) => {
    console.error("Validation failed:", errors)
    toast.error("Please fill in all required fields marked with *")
  }

  async function onSubmit(values: z.infer<typeof agreementSchema>) {
    setIsSubmitting(true)
    try {
      const result = await api.updateOrder(order._id!, { agreementDetails: values as any, agreementStatus: 'Signed' })
      if (result) {
        toast.success("Agreement signed successfully!")
        setIsSigned(true)
      } else {
        toast.error("Failed to sign agreement. Please try again.")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate package details string
  const getPackageSummary = () => {
    let details = "";

    const formatSection = (title: string, data?: { packageType?: string; packageDetails?: string; addons?: string[] }) => {
        if (!data) return;
        if (!data.packageType && !data.packageDetails && (!data.addons || data.addons.length === 0)) return;

        details += `${title}:\n`;
        if (data.packageType) {
            details += `  - Package: ${data.packageType}\n`;
            // Add full package details breakdown
            const packageFeatures = packageDetails[data.packageType];
            if (packageFeatures && packageFeatures.length > 0) {
                 packageFeatures.forEach(feature => {
                     details += `      • ${feature}\n`;
                 });
            }
        }
        if (data.packageDetails) details += `  - Details: ${data.packageDetails}\n`;
        if (data.addons && data.addons.length > 0) details += `  - Add-ons: ${data.addons.join(", ")}\n`;
        details += "\n";
    };

    // Check for combined Wedding & Homecoming
    if (order.wedding?.packageType && order.homecoming?.packageType && order.wedding.packageType.trim() === order.homecoming.packageType.trim()) {
        const packageType = order.wedding.packageType;
        details += `Wedding & Homecoming:\n`;
        details += `  - Package: ${packageType} (Combined View)\n`;
         const packageFeatures = packageDetails[packageType];
            if (packageFeatures && packageFeatures.length > 0) {
                 packageFeatures.forEach(feature => {
                     details += `      • ${feature}\n`;
                 });
            }
        
        // Addons separately
        if (order.wedding.addons && order.wedding.addons.length > 0) {
             details += `  - Wedding Add-ons: ${order.wedding.addons.join(", ")}\n`;
        }
        if (order.homecoming.addons && order.homecoming.addons.length > 0) {
             details += `  - Homecoming Add-ons: ${order.homecoming.addons.join(", ")}\n`;
        }
        details += "\n";
    } else {
        formatSection("Wedding", order.wedding);
        formatSection("Homecoming", order.homecoming);
    }

    formatSection("Engagement", order.engagement);
    formatSection("Pre-Shoot", order.preShoot);

    if (order.generalAddons && order.generalAddons.length > 0) {
        details += `General Add-ons: ${order.generalAddons.join(", ")}\n`;
    }

    return details.trim() || "No package details available";
  };

  if (isSigned) {
     const updatedOrder = {
        ...order,
        agreementDetails: form.getValues()
    }

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 py-10">
        <div className="bg-card border rounded-lg p-8 shadow-sm text-center space-y-6">
           <div className="bg-green-500/10 text-green-600 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
              <FileCheck className="w-12 h-12" />
           </div>
           <div>
              <h2 className="text-3xl font-bold">Agreement Successfully Signed</h2>
               <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
                   Thank you for completing the service agreement. A digital copy has been generated for your records and sent to your email. Please check your email for copy of official agreement and bank account details to proceed with the advance payment. Our team will be in touch with you shortly to coordinate further arrangements.
               </p>
               
               <div className="bg-muted/50 p-6 rounded-xl mt-6 max-w-xl mx-auto border border-primary/20">
                    <h3 className="font-semibold text-lg text-foreground mb-2">Next Step: Advance Payment</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Please proceed with the advance payment to confirm your booking. You can upload the payment proof in the Payments section.
                    </p>
                    <Button onClick={onSwitchToPayment} className="w-full sm:w-auto" size="lg">
                        Upload Payment Proof <CreditCard className="ml-2 w-4 h-4" />
                    </Button>
               </div>
           </div>
           
           <div className="flex justify-center pt-2">
               <AgreementDownloadLink order={updatedOrder} packageDetails={packageDetails} />
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="border-t-4 border-t-primary shadow-xl">
        <CardHeader className="text-center border-b pb-8 space-y-4">
           <div className="flex flex-col items-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight uppercase">One Promise (Pvt) Ltd</h1>
            <div className="text-xs md:text-sm text-muted-foreground">
              <p>No. 545, Ruwanpura Road, Aggona, Angoda.</p>
              <p>hello@onepromiseweddings.com | 077 995 7368</p>
            </div>
          </div>
          <CardTitle className="text-xl md:text-3xl pt-4">TERMS OF SERVICE - WEDDING VIDEOGRAPHY</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-8">
           {/* Terms of Service Section */}
           <div className="space-y-6 text-sm text-muted-foreground leading-relaxed text-justify px-4 max-h-[500px] overflow-y-auto border rounded-md p-4 bg-muted/5 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted">
            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">How to make a reservation?</h3>
              <p>
                Our staff will assist you in making the best decision after you have thoroughly read our package guide and the service contract given to you. Upon selecting an appropriate package, a deposit of 25,000 LKR should be made to our bank account. Upon receiving any plausible proof of the payment, we will give you an invoice and put you in the schedule. The full payment for your selected package should be completed one week prior to the event date.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">Reservations / Date changes</h3>
              <p>
                All tentative reservations are only valid for a week. If the reservations are not confirmed before the required seven days, we will consider the reservation as canceled and release the date from further holding. Before a period of 4 months from the reserved date, any changes to the reservation dates will be accessible for free; if not, an additional payment equivalent to the initial payment must be made. All payments made in advance are not refundable. Date changes that must be made with less than 4 months' notice for any unforeseen circumstances, such as COVID or any other global periods of distress, will also be free of charge; however, changes that are required because of personal reasons will still be non-refundable but can potentially transferred to a close relative, a friend, or any other preferred individual.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">Price increments</h3>
              <p>
                Unfortunate price increases that cannot be controlled by these anticipated rates may occur in these periods of perpetual inflation. If such an increase were to occur, you would be notified before the additional amount was added to your existing costs. Please be aware that this additional will solely be calculated, considering the cost into account rather than profit-generating.
              </p>
            </section>

             <section>
              <h3 className="text-base font-semibold text-foreground mb-2">Transportation and Accommodation</h3>
              <p>
                A transportation fee in addition to the package you selected will be assessed for your location. Due to the unpredictability of fuel price fluctuations, the exact charge will only be disclosed two days prior to the function. Crew lodging should be offered in a select few locations, or else compensation of an additional payment should be made. Depending on the area, these extra expenses could differ, and they would only be influenced by current fuel prices.
              </p>
            </section>
            
            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">Agenda/Time frame</h3>
              <p>
               To avoid any disagreements that could disrupt the function's orderly flow, the function's finished agenda should be distributed two days before the function. Along with the agenda, information should also be provided if there is any chance that the event will go on past the duration given for a certain package.
              </p>
              <p className="mt-2">
                Our coverage does not exceed for the time period specified in any selected package. In a scenario in which the allotted time is exceeded, each hour exceeding that amount will be charged at a rate of one hour. This is expected to cost you 10,000 LKR every hour. We'll be at your hotel room or salon (close to the event venue) to take pictures of you getting ready; this time will count as the first segment of the time period allotted for your package.
              </p>
            </section>

             <section>
              <h3 className="text-base font-semibold text-foreground mb-2">Things to be provided at the function</h3>
              <p>
                A separate table at the event should be set up for the videography team, which might be shared by the team entrusted with capturing wedding pictures and the planning team (excluding the band). Any damages to the equipment that occur should be compensated by the client party if the crew is required to share a guest table. 
              </p>
               <p className="mt-2">
                The dancing floor or even function will not be covered if the laser lights are used. The Lasers may cause severe damages to the cameras and other equipment.
              </p>
               <p className="mt-2">
                If the crew is not entitled to meals, kindly notify us in advance so we may make arrangements for our own meals, which would require us to take between 40 to 60 minutes off from the function.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">How does the post processing been done?</h3>
              <p>
               Your video footage will be securely backed up on our servers as soon as the videographers arrive at our location. Our team will get in touch with you and set up a time for you to come to our location and collect your own video footage if you require any additional information about the entire function. The client will incur an additional payment. ( HDD with all Raw Footages, 25000 LKR ).
              </p>
              <p className="mt-2">
                The editing style of One Promise is entirely unique and distinctive and it is unable to change or remove during the amendments unless you notify us about your shooting preferences and special requirements beforehand the event.
              </p>
              <p className="mt-2">
                “ The First Version ”, also known as the first cut, will be sent to the client via a Drive link so they can download the video. In case of amendments, the client shall provide the confirmation or written list of the amendments, from which the final version will be prepared. We recommend you to use the first version to make a list of all the amendments that need to be made. Please be aware that after the final version has been approved and delivered, we will NOT be able to make any more changes to your video. All footage from the event will be deleted from our system after the final version or edit has been completed.
              </p>
              <p className="mt-2">
                The final version/ edit will be sent to you within 15 days, depending on the external influences of the country, however we do offer you up to two revisions of amendments, which you must notify us of within two weeks after receiving the first version.
              </p>
              <p className="mt-2">
                In case of more changes or amendments, an additional amount of 5,000 LKR per each revision will be charged.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">Delivery / Turn-around time</h3>
              <p>Timeline of sending the video links are as follows :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>The Highlight Video/ Instagram Teaser - 30 days</li>
                  <li>The Full Wedding Video - 60 days</li>
              </ul>
              <p className="mt-2">
                If there're any requested amendments, it'll take 14 more days to get back with the final version. In case we didn’t hear from the client for more than 4 months, we will consider the finals as per the last edited version and evacuate all footage & project files from our servers. Also note that due to unpredictable circumstances in Sri Lanka, our processing times may vary, and clients will be expected to fully understand and manage any resulting delays.
              </p>
               <p className="mt-2">
               Soft copies are utilized throughout every final delivery. If you need a design pen drive it will be delivered on request. After approval the designed pen drive will be sent for making and as soon as it arrives at the studio (one week) we will inform you to collect your pen drive from the studio. Upon failure to collect the pen drive within two months we will not be held responsible for any damages sustained by your products.
              </p>
            </section>

             <section>
              <h3 className="text-base font-semibold text-foreground mb-2">How to handle technical failures?</h3>
              <p>
                In any case of unavoidable technical issue, the best decision is to be made with the consent of both the parties which will satisfy all parties concerned.
              </p>
            </section>

             <section>
              <h3 className="text-base font-semibold text-foreground mb-2">Termination due to lack of response</h3>
              <p>
                After 2 years from the event, if footage is not requested, we will declare that you are no longer interested in continuing and we shall no longer keep the backup. And if you do not collect your products within 2 months of production we are no longer responsible for their safe keeping. If you are unable to collect these physically you can inform the company to get them couriered to you.
              </p>
              <p className="mt-2 font-medium">Any violation of these terms may result in termination of this agreement.</p>
            </section>

             <section>
              <h3 className="text-base font-semibold text-foreground mb-2">Copyrights</h3>
              <p>
                Service Provider has the right to use videos included in this contract for the purpose of advertising in social media, in exhibitions & in the studios.
              </p>
            </section>
             
             <section>
              <h3 className="text-base font-semibold text-foreground mb-2">In General</h3>
               <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>The client is responsible for making sure that neither the placement of decorations nor the arrangement of guests doesn't obstruct the view of the bride, groom, celebrity or invited guest. Any shots that are missed or omitted as a result of an obstruction at the scene are not our responsibility.</li>
                  <li>One Promise cannot assure the natural or artificial disruptions of the video and audio produced at or by the event location since we are not in a position to interfere with the ceremony in any way unless to correct the least satisfactory shooting conditions.</li>
                  <li>The bride, groom, and the retinue shall attend the photo shoot on or before the decided time of the shoot and collaborate with the videographer in obtaining the desired shots/ scenes, including but not limited to specifying persons and/or scenes to be captured; taking few times to pose for videographer’s direction.</li>
                   <li>The team shall not be responsible for scenes not captured as a result of a delay from the Client's side such as a delay in bridal and hairdressing or any other failure to provide reasonable assistance or cooperation. - We don't capture group portraits on Video.</li>
                   <li>Package changes have to be made two weeks prior.</li>
                   <li>All rates are quoted in Sri Lankan Rupees (LKR) on the specified packages inclusive of all applicable taxes and charges.</li>
                   <li>Government taxes, fees and charges may vary from time to time and One Promise reserves the right to add these, effective from the date of implementation.</li>
                   <li>Additional charges, applicable taxes and fees will be charged on any additional services not already shown on this contract.</li>
              </ul>
            </section>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Order No - Read Only */}
                 <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2"><Hash className="w-4 h-4" /> Order No.</FormLabel>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        {order.orderNumber}
                    </div>
                    <p className="text-[0.8rem] text-muted-foreground">Auto-filled from order.</p>
                 </div>

                 {/* Client Name - Read Only */}
                 <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2"><User className="w-4 h-4" /> Client Name</FormLabel>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        {order.clientInfo.title ? `${order.clientInfo.title}. ` : ""}{order.clientInfo.name}
                    </div>
                     <p className="text-[0.8rem] text-muted-foreground">Auto-filled from order.</p>
                 </div>
              </div>

               <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Address <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Textarea {...field} placeholder="Permanent residential address" className="min-h-[80px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <h4 className="font-medium text-sm text-foreground/80 flex items-center gap-2"><Users className="w-4 h-4" /> Couple Name <span className="text-destructive">*</span></h4>
                      <div className="grid grid-cols-1 gap-4">
                           <FormField
                            control={form.control}
                            name="coupleName.bride"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="Bride Good name" 
                                    value={field.value?.toUpperCase() || ''}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="coupleName.groom"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="Groom Good name" 
                                    value={field.value?.toUpperCase() || ''}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      </div>
                  </div>

                   <div className="space-y-4">
                      <h4 className="font-medium text-sm text-foreground/80 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Numbers <span className="text-destructive">*</span></h4>
                       <div className="grid grid-cols-1 gap-4">
                           <FormField
                            control={form.control}
                            name="phone.bride"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl><Input {...field} placeholder="Bride Phone" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="phone.groom"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl><Input {...field} placeholder="Groom Phone" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                       </div>
                   </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Event Dates - Read Only */}
                 <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Event Dates</FormLabel>
                    <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
                        {[
                            { label: 'Wedding', date: order.wedding?.date },
                            { label: 'Homecoming', date: order.homecoming?.date },
                            { label: 'Engagement', date: order.engagement?.date },
                            { label: 'Pre-Shoot', date: order.preShoot?.date },
                        ].filter(event => event.date).length > 0 ? (
                            <div className="space-y-1">
                                {[
                                    { label: 'Wedding', date: order.wedding?.date },
                                    { label: 'Homecoming', date: order.homecoming?.date },
                                    { label: 'Engagement', date: order.engagement?.date },
                                    { label: 'Pre-Shoot', date: order.preShoot?.date },
                                ].filter(event => event.date).map((event, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span className="font-medium">{event.label}:</span>
                                        <span>{new Date(event.date!).toDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             // Fallback to main date if no specific ones
                            <span className="text-muted-foreground">{order.eventDetails.mainDate ? new Date(order.eventDetails.mainDate).toDateString() : 'N/A'}</span>
                        )}
                    </div>
                     <p className="text-[0.8rem] text-muted-foreground">Auto-filled.</p>
                 </div>

                 {/* Location - Read Only */}
                 <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Location(s)</FormLabel>
                    <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm min-h-[42px]">
                        {order.eventDetails.locations && order.eventDetails.locations.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                                {order.eventDetails.locations.map((loc, i) => (
                                    <li key={i}>
                                        {typeof loc === 'string' ? loc : loc.name}
                                    </li>
                                ))}
                            </ul>
                        ) : "No location specified"}
                    </div>
                     <p className="text-[0.8rem] text-muted-foreground">Auto-filled.</p>
                 </div>
               </div>

                {/* Package Details - Read Only */}
                 <div className="space-y-2">
                    <FormLabel className="flex items-center gap-2"><FileText className="w-4 h-4" /> Package Details</FormLabel>
                    <div className="flex min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 whitespace-pre-wrap">
                        {getPackageSummary()}
                    </div>
                     <p className="text-[0.8rem] text-muted-foreground">Auto-filled with Order number.</p>
                 </div>

              <FormField
                control={form.control}
                name="story"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Heart className="w-4 h-4" /> Tell us about your story (Optional)</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Share your story..." className="min-h-[100px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-3 pt-4 border-t">
                   <h3 className="font-medium flex items-center gap-2"><Search className="w-4 h-4 text-primary" /> How did you find US?</h3>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Instagram', 'Facebook', 'Referral', 'Google Search', 'Planner', 'Other'].map((source) => (
                          <FormField
                              key={source}
                              control={form.control}
                              name="referralSource"
                              render={({ field }) => {
                                  return (
                                      <FormItem
                                          key={source}
                                          className="flex flex-row items-center space-x-3 space-y-0"
                                      >
                                          <FormControl>
                                              <Checkbox
                                                  checked={field.value?.includes(source)}
                                                  onCheckedChange={(checked) => {
                                                      return checked
                                                          ? field.onChange([...(field.value || []), source])
                                                          : field.onChange(
                                                              field.value?.filter(
                                                                  (value) => value !== source
                                                              )
                                                          )
                                                  }}
                                              />
                                          </FormControl>
                                          <FormLabel className="font-normal cursor-pointer">
                                              {source}
                                          </FormLabel>
                                      </FormItem>
                                  )
                              }}
                          />
                      ))}
                   </div>
              </div>

               <FormField
                control={form.control}
                name="ack"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the terms and conditions outlined above.
                      </FormLabel>
                      <FormDescription>
                        By checking this box, you confirm that all details provided are accurate and you agree to One Promise (Pvt) Ltd's terms of service.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-6 pt-6 border-t">
                  <div>
                      <h3 className="text-lg font-semibold mb-4">Electronic Signature</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                            control={form.control}
                            name="signature"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="flex items-center gap-2">Full Name (Electronic Signature) <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter your full name" className="bg-background" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            
                            <div className="space-y-2">
                                <FormLabel>Signed Date <span className="text-destructive">*</span></FormLabel>
                                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                      </div>
                  </div>
                  
                  <div className="rounded-lg bg-muted/40 p-4 border text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Legal Notice:</span> By providing your electronic signature above, you acknowledge that you have read, understood, and agree to be bound by the terms and conditions of this agreement. Your electronic signature has the same legal effect as a handwritten signature.
                  </div>
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign Agreement
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
