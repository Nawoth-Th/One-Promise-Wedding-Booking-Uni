import { Order, TeamMember } from "@/lib/types"

// --- MOCK ORDERS ---
export const MOCK_ORDERS: Order[] = [
  {
    _id: "6601a1b2c3d4e5f6a7b8c901",
    orderNumber: "OPW-2026-001",
    trackingToken: "tk-abc-001",
    agreementToken: "ag-abc-001",
    portalToken: "pt-abc-001",
    clientInfo: {
      title: "Mr",
      name: "Kavinda Perera",
      phone: "+94 77 123 4567",
      email: "kavinda@example.com",
    },
    eventDetails: {
      mainDate: new Date("2026-04-15"),
      locations: [
        { name: "Cinnamon Grand Colombo", url: "https://maps.google.com/?q=Cinnamon+Grand+Colombo", forEvent: "Wedding" },
        { name: "Waters Edge", url: "https://maps.google.com/?q=Waters+Edge", forEvent: "Homecoming" },
      ],
      notes: "Outdoor ceremony. Contact hotel for parking arrangements.",
    },
    wedding: {
      date: new Date("2026-04-15"),
      packageType: "The Vow",
      addons: ["Upto 45min Full Video", "Full Day Drone Video Coverage"],
    },
    homecoming: {
      date: new Date("2026-04-16"),
      packageType: "The Vow",
      addons: ["01. Insta Reel"],
    },
    engagement: {
      date: new Date("2026-03-01"),
      packageType: "Engagement Package",
      addons: [],
    },
    preShoot: {
      date: new Date("2026-02-20"),
      packageType: "Pre-shoot Package",
      addons: ["Full Day Drone Coverage"],
    },
    generalAddons: ["HDD with Raw footage", "LED Wall (8x12)"],
    financials: {
      packagePrice: 350000,
      transportCost: 15000,
      discount: 25000,
      totalAmount: 400000,
      balance: 375000,
    },
    status: "Confirmed",
    agreementStatus: "Signed",
    agreementDetails: {
      coupleName: { bride: "Nethmi", groom: "Kavinda" },
      address: "No. 45, Temple Road, Kotte",
      phone: { bride: "+94 77 234 5678", groom: "+94 77 123 4567" },
      email: "kavinda@example.com",
      referralSource: ["Instagram", "Friends"],
      story: "We met at university during our first year and fell in love during a campus trip to Ella.",
      signature: "Kavinda Perera",
      signedAt: new Date("2026-01-20"),
    },
    assignments: {
      wedding: ["team-001", "team-002"],
      homecoming: ["team-001", "team-003"],
    },
    progress: {
      currentStep: 4,
      lastUpdated: new Date("2026-02-10"),
      history: [
        { stepId: 1, timestamp: new Date("2026-01-15") },
        { stepId: 2, timestamp: new Date("2026-01-20") },
        { stepId: 3, timestamp: new Date("2026-01-25") },
        { stepId: 4, timestamp: new Date("2026-02-10") },
      ],
    },
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-02-10"),
  },
  {
    _id: "6601a1b2c3d4e5f6a7b8c902",
    orderNumber: "OPW-2026-002",
    trackingToken: "tk-def-002",
    agreementToken: "ag-def-002",
    portalToken: "pt-def-002",
    clientInfo: {
      title: "Ms",
      name: "Sanduni Fernando",
      phone: "+94 71 987 6543",
      email: "sanduni@example.com",
    },
    eventDetails: {
      mainDate: new Date("2026-06-20"),
      locations: [
        { name: "Taj Samudra", url: "https://maps.google.com/?q=Taj+Samudra", forEvent: "Wedding" },
      ],
      notes: "Beach-side ceremony. Coordinate with hotel on drone regulations.",
    },
    wedding: {
      date: new Date("2026-06-20"),
      packageType: "The Romance",
      addons: ["Full Day Drone Video Coverage", "Same Day edit"],
    },
    homecoming: {
      date: new Date("2026-06-21"),
      packageType: "The Romance",
      addons: ["Upto 45min Full Video"],
    },
    generalAddons: ["Design Wooden Pen Drive"],
    financials: {
      packagePrice: 450000,
      transportCost: 20000,
      totalAmount: 480000,
      balance: 455000,
    },
    status: "Pending",
    agreementStatus: "Sent",
    progress: {
      currentStep: 1,
      lastUpdated: new Date("2026-02-20"),
      history: [{ stepId: 1, timestamp: new Date("2026-02-20") }],
    },
    createdAt: new Date("2026-02-15"),
    updatedAt: new Date("2026-02-20"),
  },
  {
    _id: "6601a1b2c3d4e5f6a7b8c903",
    orderNumber: "OPW-2026-003",
    trackingToken: "tk-ghi-003",
    agreementToken: "ag-ghi-003",
    portalToken: "pt-ghi-003",
    clientInfo: {
      title: "Mr",
      name: "Dinesh Jayawardena",
      phone: "+94 76 555 1234",
      email: "dinesh@example.com",
    },
    eventDetails: {
      mainDate: new Date("2026-08-10"),
      locations: [
        { name: "Shangri-La Colombo", url: "https://maps.google.com/?q=Shangri-La+Colombo", forEvent: "Wedding" },
        { name: "Mount Lavinia Hotel", url: "https://maps.google.com/?q=Mount+Lavinia+Hotel", forEvent: "Homecoming" },
      ],
      notes: "Indoor ceremony. Client requests specific color grading style.",
    },
    wedding: {
      date: new Date("2026-08-10"),
      packageType: "Wed + HC P-II",
      addons: ["To Cover the additional function (Church/Thali/Poruwa)"],
    },
    homecoming: {
      date: new Date("2026-08-11"),
      packageType: "Wed + HC P-II",
      addons: [],
    },
    generalAddons: ["Live broadcasting (Three Camera)"],
    financials: {
      packagePrice: 500000,
      transportCost: 25000,
      discount: 50000,
      totalAmount: 500000,
      balance: 475000,
      paymentProof: {
        url: "https://example.com/proof.jpg",
        status: "Verified",
        uploadedAt: new Date("2026-02-25"),
      },
    },
    status: "Completed",
    agreementStatus: "Signed",
    agreementDetails: {
      coupleName: { bride: "Ayesha", groom: "Dinesh" },
      address: "No. 78, Galle Road, Colombo 3",
      phone: { bride: "+94 77 888 9999", groom: "+94 76 555 1234" },
      email: "dinesh@example.com",
      referralSource: ["Google", "Previous Client"],
      story: "Our families have been friends for generations. We grew up together and our love story was written in the stars.",
      signature: "Dinesh Jayawardena",
      signedAt: new Date("2026-02-01"),
    },
    assignments: {
      wedding: ["team-001", "team-002", "team-004"],
      homecoming: ["team-001", "team-003"],
    },
    progress: {
      currentStep: 8,
      lastUpdated: new Date("2026-02-25"),
      history: [
        { stepId: 1, timestamp: new Date("2026-01-10") },
        { stepId: 2, timestamp: new Date("2026-01-15") },
        { stepId: 3, timestamp: new Date("2026-01-20") },
        { stepId: 4, timestamp: new Date("2026-01-25") },
        { stepId: 5, timestamp: new Date("2026-02-01") },
        { stepId: 6, timestamp: new Date("2026-02-10") },
        { stepId: 7, timestamp: new Date("2026-02-15") },
        { stepId: 8, timestamp: new Date("2026-02-25") },
      ],
    },
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-02-25"),
  },
]

// --- MOCK TEAM MEMBERS ---
export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    _id: "team-001",
    name: "Nuwan Chamara",
    role: "Lead Cinematographer",
    email: "nuwan@onepromise.lk",
    phone: "+94 77 111 2222",
    active: true,
  },
  {
    _id: "team-002",
    name: "Tharindu Silva",
    role: "Cinematographer",
    email: "tharindu@onepromise.lk",
    phone: "+94 71 333 4444",
    active: true,
  },
  {
    _id: "team-003",
    name: "Sadun Madusanka",
    role: "Drone Operator",
    email: "sadun@onepromise.lk",
    phone: "+94 76 555 6666",
    active: true,
  },
  {
    _id: "team-004",
    name: "Lakshan Dias",
    role: "Video Editor",
    email: "lakshan@onepromise.lk",
    phone: "+94 77 777 8888",
    active: false,
  },
]

// --- MOCK PRICING ITEMS ---
export interface PricingItem {
  _id: string
  name: string
  price: number
  category: string
  details?: string[]
  updatedAt?: Date
}

export const MOCK_PRICING_ITEMS: PricingItem[] = [
  { _id: "p-001", name: "The First Look", price: 165000, category: "Wedding Packages", details: ["Bride & Groom getting ready moments", "Portrait session", "Ceremony & Reception highlights", "Exclusive 10 Hours Coverage", "Two Cinematographers", "Film Color Grading", "Wireless microphone", "Upto 45 min Full Video", "Upto 04 min Cinematic Trailer", "02 Insta Reel Videos", "4K Ultra HD Web Delivery"] },
  { _id: "p-002", name: "The Vow", price: 225000, category: "Wedding Packages", details: ["Bride & Groom getting ready moments", "Portrait session", "Ceremony & Reception highlights", "Exclusive 12 Hours Coverage", "Two Cinematographers & One Standby Camera", "Film Color Grading", "Dedicated audio recording devices & Wireless microphone", "Drone coverage for portrait session", "Upto 60 min Full Video", "Upto 06 min Cinematic Story Teller", "Same Day Edited 02 Insta Reel Videos", "4K Ultra HD Web Delivery"] },
  { _id: "p-003", name: "The Romance", price: 325000, category: "Wedding Packages", details: ["Bride & Groom getting ready moments", "Portrait session", "Ceremony & Reception highlights", "Exclusive 12 Hours Coverage", "Three Cinematographers & One Standby Camera", "LOG Profile shooting & Film Color Grading", "Dedicated audio recording devices Wireless microphone", "Drone Included", "Upto 90 min Full Video", "Upto 10 min Cinematic Story Teller", "Same Day Edited 02 Insta Reel Videos", "4K Ultra HD Web Delivery"] },
  { _id: "p-004", name: "Wed + HC P-I", price: 265000, category: "Wedding Packages", details: ["Wedding -10 Hours Coverage", "Homecoming - 08 Hours Coverage", "Two Cinematographers", "Film Color Grading", "Wireless microphone", "4K Ultra HD Web Delivery"] },
  { _id: "p-005", name: "Wed + HC P-II", price: 385000, category: "Wedding Packages", details: ["Wedding -12 Hours Coverage", "Homecoming - 08 Hours Coverage", "Two Cinematographers & One Standby Camera", "Film Color Grading", "LED Wall 8x12*", "4K Ultra HD Web Delivery"] },
  { _id: "p-006", name: "Wed + HC P-III", price: 475000, category: "Wedding Packages", details: ["Wedding -12 Hours Coverage", "Homecoming - 10 Hours Coverage", "Three Cinematographers & One Standby Camera", "LOG Profile shooting & Film Color Grading", "Drone Included", "LED Wall 8x12*", "4K Ultra HD Web Delivery"] },
  { _id: "p-010", name: "The First Look", price: 125000, category: "Homecoming Packages", details: ["10 Hours Coverage", "Two Cinematographers", "Film Color Grading", "4K Ultra HD Web Delivery"] },
  { _id: "p-011", name: "The Vow", price: 165000, category: "Homecoming Packages", details: ["12 Hours Coverage", "Two Cinematographers & One Standby Camera", "Drone coverage", "4K Ultra HD Web Delivery"] },
  { _id: "p-020", name: "Engagement Package", price: 85000, category: "Engagement Packages", details: ["Exclusive 06 Hours Coverage", "One Cinematographer", "Film Color Grading", "Audio recording devices", "Upto 30 min Full Video", "Upto 03 min Cinematic Trailer", "02 Insta Reel", "4K Ultra HD Web Delivery"] },
  { _id: "p-030", name: "Pre-shoot Package", price: 65000, category: "Pre-shoot Packages", details: ["Exclusive 05 Hours Coverage", "One Cinematographer", "Film Color Grading", "Upto 03 min Cinematic Trailer", "02 Insta Reel", "4K Ultra HD Web Delivery"] },
  { _id: "a-001", name: "Upto 45min Full Video", price: 35000, category: "Wedding Add-ons" },
  { _id: "a-002", name: "Full Day Drone Video Coverage", price: 45000, category: "Wedding Add-ons" },
  { _id: "a-003", name: "Same Day edit", price: 25000, category: "Wedding Add-ons" },
  { _id: "a-010", name: "01. Insta Reel", price: 15000, category: "Homecoming Add-ons" },
  { _id: "a-020", name: "Full Day Drone Coverage", price: 40000, category: "Engagement Add-ons" },
  { _id: "a-030", name: "Full Day Drone Coverage", price: 35000, category: "Pre-shoot Add-ons" },
  { _id: "a-040", name: "HDD with Raw footage", price: 25000, category: "General Add-ons" },
  { _id: "a-041", name: "LED Wall (8x12)", price: 30000, category: "General Add-ons" },
  { _id: "a-042", name: "Design Wooden Pen Drive", price: 5000, category: "General Add-ons" },
  { _id: "a-043", name: "Live broadcasting (Three Camera)", price: 75000, category: "General Add-ons" },
]

// Helper to get order by id
export function getOrderById(id: string): Order | undefined {
  return MOCK_ORDERS.find(o => o._id === id)
}

// Helper to get order by token
export function getOrderByToken(token: string): Order | undefined {
  return MOCK_ORDERS.find(o => o.agreementToken === token)
}

export function getOrderByPortalToken(token: string): Order | undefined {
  return MOCK_ORDERS.find(o => o.portalToken === token)
}

export function getOrderByTrackingToken(token: string): Order | undefined {
  return MOCK_ORDERS.find(o => o.trackingToken === token)
}

// Helper to build package details map from pricing items
export function getPackageDetailsMap(): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  MOCK_PRICING_ITEMS.forEach(item => {
    if (item.details) {
      map[item.name] = item.details
    }
  })
  return map
}
