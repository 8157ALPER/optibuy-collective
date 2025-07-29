import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentType: text("document_type").notNull(), // Business: 'business_registration', 'chamber_membership', 'tax_certificate', 'bank_reference' | Seller: 'id_verification', 'business_license', 'bank_verification', 'insurance_coverage'
  documentName: text("document_name").notNull(),
  documentUrl: text("document_url"), // File storage URL
  verificationStatus: text("verification_status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  rejectionReason: text("rejection_reason"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  expiryDate: timestamp("expiry_date"),
  isRequired: boolean("is_required").default(false),
  userType: text("user_type", { enum: ["business", "seller"] }).notNull(),
});

export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  requestedTier: text("requested_tier").notNull(), // Business: "verified", "certified" | Seller: "verified", "trusted"
  currentTier: text("current_tier").notNull(), // Business: "basic", "verified", "certified" | Seller: "unverified", "verified", "trusted"
  userType: text("user_type", { enum: ["business", "seller"] }).notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected", "incomplete"] }).default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewerNotes: text("reviewer_notes"),
});

// Verification tiers and their benefits
export const verificationTiers = {
  basic: {
    name: "Basic Business",
    rfqLimit: 3,
    maxRfqValue: 10000,
    features: ["Email verification", "Basic company profile", "Limited RFQ posting"],
    requirements: ["Valid business email domain"]
  },
  verified: {
    name: "Verified Business", 
    rfqLimit: 15,
    maxRfqValue: 100000,
    features: ["Priority listing", "Enhanced profile badge", "Increased posting limits", "Buyer contact info"],
    requirements: ["Business registration documents", "Tax certificate or chamber membership"]
  },
  certified: {
    name: "Premium Certified",
    rfqLimit: -1, // Unlimited
    maxRfqValue: -1, // Unlimited
    features: ["Unlimited RFQs", "Premium support", "API access", "Custom terms", "International trading"],
    requirements: ["Notarized documents", "Bank reference letters", "International trade certificates"]
  }
} as const;

// Seller verification tiers for B2C
export const sellerVerificationTiers = {
  unverified: {
    name: "Unverified Seller",
    offerLimit: 5,
    maxOfferValue: 1000,
    features: ["Basic selling", "Limited visibility", "Consumer warnings displayed"],
    requirements: ["Email verification only"],
    trustScore: 1
  },
  verified: {
    name: "Verified Seller",
    offerLimit: 25,
    maxOfferValue: 25000,
    features: ["Verified badge", "Enhanced visibility", "Customer testimonials", "Priority support"],
    requirements: ["ID verification", "Business license or tax ID", "Bank account verification"],
    trustScore: 3
  },
  trusted: {
    name: "Trusted Seller",
    offerLimit: -1,
    maxOfferValue: -1,
    features: ["Trusted badge", "Premium placement", "Extended warranties", "Volume discounts", "Brand partnership"],
    requirements: ["Multiple successful transactions", "Insurance coverage", "Professional references", "Quality certifications"],
    trustScore: 5
  }
} as const;

export const insertVerificationDocumentSchema = createInsertSchema(verificationDocuments).omit({
  id: true,
  uploadedAt: true,
  verifiedAt: true,
});

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});

export type VerificationDocument = typeof verificationDocuments.$inferSelect;
export type InsertVerificationDocument = z.infer<typeof insertVerificationDocumentSchema>;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type VerificationTier = keyof typeof verificationTiers;
