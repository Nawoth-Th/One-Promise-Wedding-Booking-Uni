import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Order } from '../models/Order';
import { PricingItem } from '../models/PricingItem';
import { TeamMember } from '../models/TeamMember';

dotenv.config();

// Temporary mock data from frontend structure
const MOCK_TEAM_MEMBERS = [
  { name: "Damith", role: "Chief Photographer", email: "damith@onepromise.lk", phone: "077 123 4567", active: true },
  { name: "Sarah", role: "Second Shooter", email: "sarah@onepromise.lk", phone: "077 234 5678", active: true },
  { name: "Kamal", role: "Videographer", email: "kamal@onepromise.lk", phone: "077 345 6789", active: true },
  { name: "Nimal", role: "Drone Operator", email: "nimal@onepromise.lk", phone: "077 456 7890", active: true },
];

const MOCK_PRICING_ITEMS = [
  { name: "Standard Package", price: 150000, category: "Wedding Packages", details: ["Full day coverage", "1 Photographer", "1 Videographer"] },
  { name: "Premium Package", price: 250000, category: "Wedding Packages", details: ["Full day coverage", "2 Photographers", "Signature Album"] },
  { name: "Extra Photographer", price: 35000, category: "Wedding Add-ons" },
  { name: "Pre-shoot Standard", price: 45000, category: "Pre-shoot Packages", details: ["Half day", "2 Locations"] },
];

const MOCK_ORDERS = [
  {
    orderNumber: "OPW-2026-001",
    trackingToken: "tk-c8x9y2",
    agreementToken: "ag-v5b6n7",
    portalToken: "pt-1q2w3e",
    clientInfo: { title: "Mr", name: "Suresh Silva", phone: "077 111 2222", email: "suresh@example.com" },
    eventDetails: { mainDate: new Date("2026-08-15"), locations: [], notes: "Outdoor wedding" },
    wedding: { date: new Date("2026-08-15"), packageType: "Premium Package" },
    financials: { packagePrice: 250000, transportCost: 10000, totalAmount: 260000, balance: 260000 },
    status: "Confirmed",
    agreementStatus: "Sent",
  },
  {
    orderNumber: "OPW-2026-002",
    trackingToken: "tk-p0o9i8",
    agreementToken: "ag-m4j5k6",
    portalToken: "pt-a1s2d3",
    clientInfo: { title: "Ms", name: "Amali Perera", phone: "071 333 4444", email: "amali@example.com" },
    eventDetails: { mainDate: new Date("2026-09-20"), locations: [], notes: "" },
    wedding: { date: new Date("2026-09-20"), packageType: "Standard Package" },
    financials: { packagePrice: 150000, transportCost: 5000, totalAmount: 155000, balance: 55000 },
    status: "Pending",
    agreementStatus: "Not Sent",
  }
];

const seedData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await PricingItem.deleteMany();
    await TeamMember.deleteMany();

    console.log('Data Destroyed!');

    // Insert Team
    const createdTeam = await TeamMember.insertMany(MOCK_TEAM_MEMBERS);
    
    // Insert Pricing
    const createdPricing = await PricingItem.insertMany(MOCK_PRICING_ITEMS);

    // Insert Orders
    await Order.insertMany(MOCK_ORDERS);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
