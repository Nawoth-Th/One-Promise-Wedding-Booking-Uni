import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    orderNumber: z.string().optional(),
    clientInfo: z.object({
      title: z.string().optional(),
      name: z.string()
        .min(2, "Name must be at least 2 characters")
        .regex(/^[A-Za-z\s.]+$/, "Name can only contain letters, spaces, and dots"),
      email: z.string().email("Invalid email").optional().or(z.literal("")),
      phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^\d+$/, "Phone number must contain only digits"),
    }),
    wedding: z.object({
      date: z.coerce.date().refine(date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, "Date cannot be in the past").optional(),
      packageType: z.string().optional(),
      addons: z.array(z.string()).optional(),
    }).optional(),
    homecoming: z.object({
      date: z.coerce.date().refine(date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, "Date cannot be in the past").optional(),
      packageType: z.string().optional(),
      addons: z.array(z.string()).optional(),
    }).optional(),
    engagement: z.object({
        date: z.coerce.date().refine(date => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        }, "Date cannot be in the past").optional(),
        packageType: z.string().optional(),
        addons: z.array(z.string()).optional(),
      }).optional(),
    preShoot: z.object({
        date: z.coerce.date().refine(date => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        }, "Date cannot be in the past").optional(),
        packageType: z.string().optional(),
        addons: z.array(z.string()).optional(),
      }).optional(),
    locations: z.array(z.object({
      name: z.string().min(1, "Location name is required"),
      url: z.string()
        .url("Invalid URL")
        .regex(/google\.com\/maps|goo\.gl\/maps/, "Must be a valid Google Maps link")
        .optional().or(z.literal("")),
      forEvent: z.string().optional(),
    })).optional(),
    financials: z.object({
      packagePrice: z.number().min(0),
      transportCost: z.number().min(0),
      discount: z.number().min(0).optional(),
      totalAmount: z.number().min(0),
      balance: z.number().min(0),
      paymentProof: z.object({
        url: z.string().url().optional(),
        status: z.enum(['Pending', 'Verified', 'Rejected']).optional(),
        uploadedAt: z.coerce.date().optional(),
      }).optional(),
    }),
  }),
});

export const updateOrderSchema = z.object({
  body: z.object({
    orderNumber: z.string().optional(),
    clientInfo: z.object({
      title: z.string().optional(),
      name: z.string()
        .min(2, "Name must be at least 2 characters")
        .regex(/^[A-Za-z\s.]+$/, "Name can only contain letters, spaces, and dots")
        .optional(),
      email: z.string().email("Invalid email").optional().or(z.literal("")),
      phone: z.string()
        .min(10, "Phone number must be at least 10 digits")
        .regex(/^\d+$/, "Phone number must contain only digits")
        .optional(),
    }).optional(),
    wedding: z.object({
      date: z.coerce.date().refine(date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, "Date cannot be in the past").optional(),
      packageType: z.string().optional(),
      addons: z.array(z.string()).optional(),
    }).optional(),
    homecoming: z.object({
      date: z.coerce.date().refine(date => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, "Date cannot be in the past").optional(),
      packageType: z.string().optional(),
      addons: z.array(z.string()).optional(),
    }).optional(),
    engagement: z.object({
        date: z.coerce.date().refine(date => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        }, "Date cannot be in the past").optional(),
        packageType: z.string().optional(),
        addons: z.array(z.string()).optional(),
      }).optional(),
    preShoot: z.object({
        date: z.coerce.date().refine(date => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        }, "Date cannot be in the past").optional(),
        packageType: z.string().optional(),
        addons: z.array(z.string()).optional(),
      }).optional(),
    locations: z.array(z.object({
      name: z.string().min(1, "Location name is required"),
      url: z.string()
        .url("Invalid URL")
        .regex(/google\.com\/maps|goo\.gl\/maps/, "Must be a valid Google Maps link")
        .optional().or(z.literal("")),
      forEvent: z.string().optional(),
    })).optional(),
    financials: z.object({
      packagePrice: z.number().min(0).optional(),
      transportCost: z.number().min(0).optional(),
      discount: z.number().min(0).optional(),
      totalAmount: z.number().min(0).optional(),
      balance: z.number().min(0).optional(),
      paymentProof: z.object({
        url: z.string().url().optional(),
        status: z.enum(['Pending', 'Verified', 'Rejected']).optional(),
        uploadedAt: z.coerce.date().optional(),
      }).optional(),
    }).optional(),
  }).partial(),
});
