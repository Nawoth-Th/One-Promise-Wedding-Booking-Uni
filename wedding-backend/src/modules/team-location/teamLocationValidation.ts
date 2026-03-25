import { z } from 'zod';

export const teamMemberSchema = z.object({
  body: z.object({
    name: z.string()
      .min(2, "Name must be at least 2 characters")
      .regex(/^[A-Za-z\s.]+$/, "Name can only contain letters, spaces, and dots"),
    role: z.string().min(2, "Role is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\d+$/, "Phone number must contain only digits"),
    active: z.boolean().optional().default(true),
  }),
});

export const locationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Location name is required"),
    googleMapLink: z.string()
      .url("Invalid URL")
      .regex(/google\.com\/maps|goo\.gl\/maps/, "Must be a valid Google Maps link")
      .optional().or(z.literal("")),
    province: z.string().min(1, "Province is required"),
    district: z.string().min(1, "District is required"),
  }),
});

export const updateTeamMemberSchema = z.object({
  body: teamMemberSchema.shape.body.partial()
});

export const updateLocationSchema = z.object({
  body: locationSchema.shape.body.partial()
});
