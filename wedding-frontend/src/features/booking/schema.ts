/**
 * @file schema.ts
 * @description Zod Validation Schemas for the Wedding Booking Form.
 * This file centralizes all data validation rules, ensuring that data is normalized
 * before being sent to the backend. It also provides automatic TypeScript types
 * inferred directly from the schema.
 * 
 * Features:
 * - Real-time client-side validation messages.
 * - Business logic cross-checks (e.g., ensuring a package is selected if a date is picked).
 * - Regex-based input sanitization (Phone, Name, and Google Maps URL validation).
 */

import * as z from "zod"

/**
 * Main Order Schema
 * This object defines the required structure for a complete booking.
 */
export const orderSchema = z.object({
  orderNumber: z.string(),
  // Strategy: Grouping related fields into sub-objects for better data hierarchy
  clientInfo: z.object({
    title: z.string().min(1, "Title is required"),
    name: z.string()
      .min(2, "Client name must be at least 2 characters")
      // Validation Feature: Standard Names only
      .regex(/^[A-Za-z\s.]+$/, "Name can only contain letters, spaces, and dots"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string()
      .min(10, "Phone number must be at least 10 digits")
      // Validation Feature: Purely numeric phone numbers
      .regex(/^\d+$/, "Phone number must contain only digits"),
  }),
  // Wedding Event Section
  // Logic: superRefine is used here for cross-field validation (Co-dependency)
  wedding: z.object({
    date: z.date().optional(),
    packageType: z.string().optional(),
    packageDetails: z.string().optional(),
    addons: z.array(z.string()).default([]),
  }).optional().superRefine((data, ctx) => {
    if (!data) return
    if (data.packageType && !data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date is required when a package is selected",
        path: ["date"],
      })
    }
    if (data.date && !data.packageType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package is required when a date is selected",
        path: ["packageType"],
      })
    }
  }),
  // Homecoming
  homecoming: z.object({
    date: z.date().optional(),
    packageType: z.string().optional(),
    packageDetails: z.string().optional(),
    addons: z.array(z.string()).default([]),
  }).optional().superRefine((data, ctx) => {
    if (!data) return
    if (data.packageType && !data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date is required when a package is selected",
        path: ["date"],
      })
    }
    if (data.date && !data.packageType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package is required when a date is selected",
        path: ["packageType"],
      })
    }
  }),
  // Engagement
  engagement: z.object({
    date: z.date().optional(),
    packageType: z.string().optional(),
    packageDetails: z.string().optional(),
    addons: z.array(z.string()).default([]),
  }).optional().superRefine((data, ctx) => {
    if (!data) return
    if (data.packageType && !data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date is required when a package is selected",
        path: ["date"],
      })
    }
    if (data.date && !data.packageType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package is required when a date is selected",
        path: ["packageType"],
      })
    }
  }),
  // Pre-shoot
  preShoot: z.object({
    date: z.date().optional(),
    packageType: z.string().optional(),
    packageDetails: z.string().optional(),
    addons: z.array(z.string()).default([]),
  }).optional().superRefine((data, ctx) => {
    if (!data) return
    if (data.packageType && !data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date is required when a package is selected",
        path: ["date"],
      })
    }
    if (data.date && !data.packageType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Package is required when a date is selected",
        path: ["packageType"],
      })
    }
  }),
  
  // General Addons
  generalAddons: z.array(z.string()).default([]),
  
  // Financials
  financials: z.object({
    packagePrice: z.coerce.number().min(0).default(0),
    transportCost: z.coerce.number().min(0).default(0),
    discount: z.coerce.number().min(0).default(0),
    totalAmount: z.coerce.number().min(0).default(0),
    balance: z.coerce.number().min(0).default(0),
  }),
  locations: z.array(z.object({
    name: z.string().min(1, "Location name is required"),
    url: z.string()
      .url("Invalid URL")
      .regex(/google\.com\/maps|goo\.gl\/maps/, "Must be a valid Google Maps link")
      .optional().or(z.literal("")),
    forEvent: z.string().optional(),
    mode: z.enum(["library", "manual"]).default("manual"),
    province: z.string().optional(),
    district: z.string().optional(),
  })).default([]),

  notes: z.string().optional(),
})

/**
 * Type Inference
 * Feature: Type-Safe Forms.
 * Inferred type from the schema to be used with react-hook-form.
 */
export type OrderFormValues = z.infer<typeof orderSchema>
