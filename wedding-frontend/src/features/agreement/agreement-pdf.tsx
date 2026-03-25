/* eslint-disable jsx-a11y/alt-text */

import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer"
import { Order } from "@/lib/types"
import { format } from "date-fns"
import { TERMS_OF_SERVICE } from "@/lib/constants"

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf" },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf", fontStyle: "italic" },
  ],
})

Font.register({
  family: "RobotoBold",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
})

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingLeft: 35,
    paddingRight: 35,
    fontFamily: "Roboto",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#222",
  },
  logo: {
      width: 250,
      marginBottom: 0,
      alignSelf: 'center',
  },
  centerContainer: {
     alignItems: 'center',
     marginBottom: 15,
  },
  headerTitle: {
      fontSize: 18,
      fontFamily: "RobotoBold",
      textTransform: "uppercase",
      marginBottom: 12,
  },
  headerSub: {
      fontSize: 9,
      color: "#666",
  },
  mainTitle: {
    fontSize: 14,
    fontFamily: "RobotoBold",
    marginBottom: 25,
    color: "#111",
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 5,
  },
  section: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "RobotoBold",
    marginBottom: 6,
    color: "#333",
    textTransform: "uppercase",
    backgroundColor: "#f5f5f5",
    padding: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  col: {
    flex: 1,
  },
  label: {
    color: "#666",
    fontSize: 9,
    width: 120,
  },
  value: {
    fontFamily: "RobotoBold",
    fontSize: 10,
    flex: 1,
  },
  packageDetailList: {
    marginLeft: 120,
    marginTop: 2,
  },
  packageDetailItem: {
    fontSize: 9,
    color: "#444",
    marginBottom: 2,
  },
  addonItem: {
    fontSize: 9,
    color: "#444",
    marginBottom: 1,
  },
  totalSection: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 4,
    width: 250,
    justifyContent: "space-between",
  },
  totalLabel: {
    fontFamily: "RobotoBold",
  },
  termSection: {
    marginBottom: 8,
  },
  termHeader: {
    fontSize: 10,
    fontFamily: "RobotoBold",
    marginBottom: 3,
  },
  termText: {
    fontSize: 9,
    marginBottom: 3,
    textAlign: "justify",
    color: "#444",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#999",
  },
})

interface OrderPdfProps {
  order: Order
  packageDetails?: Record<string, string[]>
}

export const OrderPdf = ({ order, packageDetails = {} }: OrderPdfProps) => {

  const renderPackageDetails = (packageType?: string) => {
    if (!packageType || !packageDetails[packageType]) return null;
    return (
        <View style={styles.packageDetailList}>
            {packageDetails[packageType].map((item, i) => (
                <Text key={i} style={styles.packageDetailItem}>• {item}</Text>
            ))}
        </View>
    );
  };

  return (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* 1. LOGO & HEADER */}
      <Image src="/one promise logo Black.png" style={styles.logo} />
      
      <View style={styles.centerContainer}>
          <Text style={styles.headerTitle}>One Promise (Pvt) Ltd</Text>
          <Text style={styles.headerSub}>No. 545, Ruwanpura Road, Aggona, Angoda.</Text>
          <Text style={styles.headerSub}>hello@onepromiseweddings.com | 077 995 7368</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 }}>
            <Text style={{ fontFamily: "RobotoBold" }}>Order No: {order.orderNumber}</Text>
            <Text>Date: {format(new Date(order.createdAt), "PPP")}</Text>
      </View>

      {/* 2. TERMS OF SERVICE */}
      <Text style={styles.mainTitle}>Terms of Service - Wedding Videography</Text>
      {TERMS_OF_SERVICE.map((term, i) => (
          <View key={i} style={styles.termSection} break={i === 4 || i === 8}>
              <Text style={styles.termHeader}>{i + 1}. {term.title}</Text>
              {term.content.map((p, j) => (
                  <Text key={j} style={styles.termText}>{p}</Text>
              ))}
          </View>
      ))}
      <Text break />
      


      {/* 3. AGREEMENT DETAILS (ORDER SUMMARY) */}
      <View style={{ marginTop: 20 }}>
        
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
            <Text style={{ width: 120, fontFamily: 'RobotoBold', fontSize: 10 }}>Order No</Text>
            <Text style={{ fontFamily: 'RobotoBold', fontSize: 10 }}>: {order.orderNumber}</Text>
        </View>

        <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 10, fontFamily: 'Roboto', marginBottom: 4 }}>Client Details</Text>
            <View style={{ marginLeft: 20 }}>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                    <Text style={{ width: 100, fontSize: 10, fontFamily: 'Roboto' }}>Name</Text>
                    <Text style={{ flex: 1, fontSize: 10, fontFamily: 'Roboto' }}>: {order.clientInfo.title ? `${order.clientInfo.title}. ` : ""}{order.clientInfo.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                    <Text style={{ width: 100, fontSize: 10, fontFamily: 'Roboto' }}>Address</Text>
                    <Text style={{ flex: 1, fontSize: 10, fontFamily: 'Roboto' }}>: {order.agreementDetails?.address || "N/A"}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                    <Text style={{ width: 100, fontSize: 10, fontFamily: 'Roboto' }}>Email</Text>
                    <Text style={{ flex: 1, fontSize: 10, fontFamily: 'Roboto' }}>: {order.agreementDetails?.email || order.clientInfo.email}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                    <Text style={{ width: 100, fontSize: 10, fontFamily: 'Roboto' }}>Phone</Text>
                    <Text style={{ flex: 1, fontSize: 10, fontFamily: 'Roboto' }}>: {order.clientInfo.phone}</Text>
                </View>
            </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
            <Text style={{ width: 120, fontFamily: 'Roboto', fontSize: 10 }}>Couple Names</Text>
            <Text style={{ fontFamily: 'RobotoBold', fontSize: 10, textTransform: 'uppercase' }}>
                : {order.agreementDetails?.coupleName ? `${order.agreementDetails.coupleName.bride} & ${order.agreementDetails.coupleName.groom}` : "N/A"}
            </Text>
        </View>

        {/* Package Details */}
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
            <Text style={{ width: 15, fontSize: 10 }}>•</Text>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontFamily: 'RobotoBold', marginBottom: 5 }}>Package Details</Text>
                
                {/* Combined Wedding & Homecoming or Separate */}
                {order.wedding?.packageType && order.homecoming?.packageType && order.wedding.packageType.trim() === order.homecoming.packageType.trim() ? (
                    <View style={{ marginBottom: 10 }} wrap={false}>
                        <Text style={{ fontSize: 10, textDecoration: 'underline', marginBottom: 3, fontFamily: 'RobotoBold' }}>
                            Wedding & Homecoming - {order.wedding.packageType}
                        </Text>
                         {/* Common Package Details - Render only once */}
                         {packageDetails[order.wedding.packageType]?.map((item, i) => (
                             <Text key={i} style={{ fontSize: 10, marginLeft: 5 }}>- {item}</Text>
                         ))}
                         
                         {/* Wedding Addons */}
                         {order.wedding.addons && order.wedding.addons.length > 0 && (
                            <View style={{ marginTop: 4 }}>
                                <Text style={{ fontSize: 10, marginLeft: 5, fontFamily: 'RobotoBold', textDecoration: 'underline' }}>Wedding Add-ons:</Text>
                                {order.wedding.addons.map((addon, i) => (
                                    <Text key={`wed-add-${i}`} style={{ fontSize: 10, marginLeft: 10 }}>- {addon}</Text>
                                ))}
                            </View>
                         )}

                         {/* Homecoming Addons */}
                         {order.homecoming.addons && order.homecoming.addons.length > 0 && (
                            <View style={{ marginTop: 4 }}>
                                <Text style={{ fontSize: 10, marginLeft: 5, fontFamily: 'RobotoBold', textDecoration: 'underline' }}>Homecoming Add-ons:</Text>
                                {order.homecoming.addons.map((addon, i) => (
                                    <Text key={`hc-add-${i}`} style={{ fontSize: 10, marginLeft: 10 }}>- {addon}</Text>
                                ))}
                            </View>
                         )}
                    </View>
                ) : (
                    <>
                        {/* Wedding */}
                        {order.wedding?.packageType && (
                            <View style={{ marginBottom: 10 }} wrap={false}>
                                <Text style={{ fontSize: 10, textDecoration: 'underline', marginBottom: 3, fontFamily: 'RobotoBold' }}>
                                    1st Day - {order.wedding.packageType}
                                </Text>
                                {order.wedding.packageType && packageDetails[order.wedding.packageType]?.map((item, i) => (
                                    <Text key={i} style={{ fontSize: 10, marginLeft: 5 }}>- {item}</Text>
                                ))}
                                {order.wedding.addons?.map((addon, i) => (
                                    <Text key={`add-${i}`} style={{ fontSize: 10, marginLeft: 5 }}>- {addon}</Text>
                                ))}
                            </View>
                        )}

                        {/* Homecoming */}
                        {order.homecoming?.packageType && (
                            <View style={{ marginBottom: 10 }} wrap={false}>
                                <Text style={{ fontSize: 10, textDecoration: 'underline', marginBottom: 3, fontFamily: 'RobotoBold' }}>
                                    2nd Day - {order.homecoming.packageType}
                                </Text>
                                {order.homecoming.packageType && packageDetails[order.homecoming.packageType]?.map((item, i) => (
                                    <Text key={i} style={{ fontSize: 10, marginLeft: 5 }}>- {item}</Text>
                                ))}
                                {order.homecoming.addons?.map((addon, i) => (
                                    <Text key={`add-${i}`} style={{ fontSize: 10, marginLeft: 5 }}>- {addon}</Text>
                                ))}
                            </View>
                        )}
                    </>
                )}

                {/* Engagement */}
                 {order.engagement?.packageType && (
                    <View style={{ marginBottom: 10 }} wrap={false}>
                        <Text style={{ fontSize: 10, textDecoration: 'underline', marginBottom: 3, fontFamily: 'RobotoBold' }}>
                            Engagement - {order.engagement.packageType}
                        </Text>
                        {order.engagement.packageType && packageDetails[order.engagement.packageType]?.map((item, i) => (
                            <Text key={i} style={{ fontSize: 10, marginLeft: 5 }}>- {item}</Text>
                        ))}
                        {order.engagement.addons?.map((addon, i) => (
                            <Text key={`add-${i}`} style={{ fontSize: 10, marginLeft: 5 }}>- {addon}</Text>
                        ))}
                    </View>
                )}

                 {/* Pre-shoot */}
                 {order.preShoot?.packageType && (
                    <View style={{ marginBottom: 10 }} wrap={false}>
                        <Text style={{ fontSize: 10, textDecoration: 'underline', marginBottom: 3, fontFamily: 'RobotoBold' }}>
                            Pre-shoot - {order.preShoot.packageType}
                        </Text>
                        {order.preShoot.packageType && packageDetails[order.preShoot.packageType]?.map((item, i) => (
                            <Text key={i} style={{ fontSize: 10, marginLeft: 5 }}>- {item}</Text>
                        ))}
                        {order.preShoot.addons?.map((addon, i) => (
                            <Text key={`add-${i}`} style={{ fontSize: 10, marginLeft: 5 }}>- {addon}</Text>
                        ))}
                    </View>
                )}
            </View>
        </View>

        </View>

        {/* Package Price - Forced Page Break */}
        <Text break />
        <View>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
            <Text style={{ width: 15, fontSize: 10 }}>•</Text>
            <View style={{ flex: 1 }}>
                {/* Package Price Row + Details */}
                <View style={{ marginBottom: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ fontSize: 10, fontFamily: 'RobotoBold' }}>Package Price</Text>
                        <View style={{ width: 100, alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 10 }}>:      {order.financials.packagePrice.toLocaleString()}</Text>
                        </View>
                    </View>
                    
                    {/* List Package Names */}
                    <View style={{ marginLeft: 10 }}>
                        {(() => {
                            const lines: string[] = [];
                            const w = order.wedding?.packageType;
                            const h = order.homecoming?.packageType;
                            const e = order.engagement?.packageType;
                            const p = order.preShoot?.packageType;

                            if (w && h && w.trim() === h.trim()) {
                                lines.push(`Wedding & Homecoming - ${w}`);
                            } else {
                                if (w) lines.push(`1st Day - ${w}`);
                                if (h) lines.push(`2nd Day - ${h}`);
                            }
                            if (e) lines.push(`Engagement - ${e}`);
                            if (p) lines.push(`Pre-shoot - ${p}`);

                            return lines.map((line, k) => (
                                <Text key={k} style={{ fontSize: 9, color: '#444', marginBottom: 1 }}>{line}</Text>
                            ));
                        })()}
                    </View>
                </View>

                {/* Add-ons Price Row + Details */}
                <View style={{ marginBottom: 5 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text style={{ fontSize: 10 }}>Add-ons Price</Text>
                        <View style={{ width: 100, alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 10 }}>:      {(order.financials.totalAmount - order.financials.packagePrice - order.financials.transportCost + (order.financials.discount || 0)).toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* List Add-ons */}
                    <View style={{ marginLeft: 10 }}>
                        {[
                            ...(order.wedding?.addons || []),
                            ...(order.homecoming?.addons || []),
                            ...(order.engagement?.addons || []),
                            ...(order.preShoot?.addons || []),
                            ...(order.generalAddons || [])
                        ].map((addon, k) => (
                            <Text key={k} style={{ fontSize: 9, color: '#444', marginBottom: 1 }}>- {addon}</Text>
                        ))}
                    </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 10 }}>Transport</Text>
                    </View>
                    <View style={{ width: 100, alignItems: 'flex-end' }}>
                         <Text style={{ fontSize: 10 }}>:      {order.financials.transportCost.toLocaleString()}</Text>
                    </View>
                </View>

                {order.financials.discount && order.financials.discount > 0 ? (
                    <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={{ fontSize: 10, color: '#e11d48' }}>Discount</Text>
                        </View>
                        <View style={{ width: 100, alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 10, color: '#e11d48' }}>:    - {order.financials.discount.toLocaleString()}</Text>
                        </View>
                    </View>
                ) : null}

                <Text style={{ fontSize: 9, fontStyle: 'italic', marginBottom: 5 }}>
                    (*may be changed due to the economic crisis)
                </Text>
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 10, fontFamily: 'RobotoBold' }}>Total</Text>
                    </View>
                    <View style={{ width: 100, alignItems: 'flex-end' }}>
                         <Text style={{ fontSize: 10, fontFamily: 'RobotoBold' }}>:      {order.financials.totalAmount.toLocaleString()}</Text>
                    </View>
                </View>
            </View>
        </View>
        
        {/* Dates */}
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
            <Text style={{ width: 15, fontSize: 10 }}>•</Text>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontFamily: 'RobotoBold', marginBottom: 5 }}>Dates</Text>

                {order.wedding?.date && (
                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ width: 120, fontSize: 10 }}>1st day - Wedding</Text>
                        <Text style={{ fontSize: 10 }}>: {format(new Date(order.wedding.date), "dd-MM-yyyy")}</Text>
                    </View>
                )}
                {order.homecoming?.date && (
                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ width: 120, fontSize: 10 }}>2nd day - Homecoming</Text>
                        <Text style={{ fontSize: 10 }}>: {format(new Date(order.homecoming.date), "dd-MM-yyyy")}</Text>
                    </View>
                )}
                 {order.engagement?.date && (
                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ width: 120, fontSize: 10 }}>Engagement</Text>
                        <Text style={{ fontSize: 10 }}>: {format(new Date(order.engagement.date), "dd-MM-yyyy")}</Text>
                    </View>
                )}
                 {order.preShoot?.date && (
                    <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
                        <Text style={{ width: 120, fontSize: 10 }}>Pre-shoot</Text>
                        <Text style={{ fontSize: 10 }}>: {format(new Date(order.preShoot.date), "dd-MM-yyyy")}</Text>
                    </View>
                )}
            </View>
        </View>

        {/* Locations */}
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
            <Text style={{ width: 15, fontSize: 10 }}>•</Text>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, fontFamily: 'RobotoBold', marginBottom: 5 }}>Locations</Text>
                <View style={{ paddingLeft: 0 }}>
                    {Array.isArray(order.eventDetails?.locations) ? 
                        order.eventDetails.locations.map((loc, i) => (
                            <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                <Text style={{ fontSize: 10 }}>- {typeof loc === 'string' ? loc : loc.name}</Text>
                            </View>
                        ))
                    : <Text style={{ fontSize: 10 }}>{order.eventDetails?.locations ? `- ${order.eventDetails.locations}` : "- N/A"}</Text>
                    }
                </View>
            </View>
        </View>



      </View>
      
      

      
      <View style={{ marginTop: 30, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#ccc", alignItems: 'center' }}>
         <Text style={{ fontSize: 10, fontFamily: "RobotoBold", textTransform: 'uppercase', color: "#555" }}>
            This document is electronically signed.
         </Text>
      </View>

      <View fixed style={styles.footer}>
        <Text style={styles.footerText}>One Promise (Pvt) Ltd - hello@onepromiseweddings.com - 077 995 7368</Text>
      </View>
    </Page>
  </Document>
  )
}
