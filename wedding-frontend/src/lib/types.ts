export type PackageType = string;
export type OrderStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface TeamMember {
  _id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PricingItem {
  _id?: string;
  name: string;
  category: string;
  price: number;
  details?: string[];
  updatedAt?: Date;
}

export interface Location {
  _id?: string;
  name: string;
  googleMapLink?: string;
  province: string;
  district: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  trackingToken?: string;
  agreementToken?: string;
  portalToken?: string;
  clientInfo: {
    title?: string;
    name: string;
    phone: string;
    email?: string;
  };
  eventDetails: {
    mainDate?: Date;
    locations?: (string | { name: string; url?: string; forEvent?: string })[];
    notes?: string;
  };
  wedding?: {
    date?: Date;
    packageType?: string;
    packageDetails?: string;
    addons?: string[];
  };
  homecoming?: {
    date?: Date;
    packageType?: string;
    packageDetails?: string;
    addons?: string[];
  };
  engagement?: {
    date?: Date;
    packageType?: string;
    packageDetails?: string;
    addons?: string[];
  };
  preShoot?: {
    date?: Date;
    packageType?: string;
    packageDetails?: string;
    addons?: string[];
  };
  generalAddons?: string[];

  financials: {
    packagePrice: number;
    transportCost: number;
    discount?: number;
    totalAmount: number;
    balance: number;
    paymentProof?: {
        url: string;
        status: "Pending" | "Verified" | "Rejected";
        uploadedAt: Date;
    };
  };
  status: OrderStatus;

  agreementStatus?: "Not Sent" | "Sent" | "Signed" | "Reviewing" | "Completed";
  agreementDetails?: {
    coupleName?: {
      bride: string;
      groom: string;
    };
    address?: string;
    phone?: {
      bride: string;
      groom: string;
    };
    email?: string;
    referralSource?: string[];
    story?: string;
    signature?: string;
    signedAt?: Date;
  };

  assignments?: {
    wedding?: string[];
    homecoming?: string[];
    engagement?: string[];
    preShoot?: string[];
    [key: string]: string[] | undefined;
  };

  progress?: {
    currentStep: number;
    lastUpdated?: Date;
    history?: {
        stepId: number;
        timestamp: Date;
    }[];
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface StatsSummary {
  summary: {
    totalRevenue: number;
    totalBalance: number;
    averageOrderValue: number;
    count: number;
  };
  revenueByMonth: {
    _id: { month: number; year: number };
    revenue: number;
    count: number;
  }[];
  packageDistribution: {
    _id: string;
    count: number;
  }[];
  eventTypes: {
    wedding: number;
    homecoming: number;
    engagement: number;
    preShoot: number;
  };
  teamUtilization: {
    _id: string;
    eventCount: number;
  }[];
  topVenues: {
    _id: string;
    count: number;
  }[];
}
