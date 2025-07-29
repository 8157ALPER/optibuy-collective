import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import verification schema
export * from "./verification-schema";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // 'consumer', 'seller', or 'business'
  fullName: text("full_name").notNull(),
  businessName: text("business_name"), // For sellers only
  location: text("location"),
  age: integer("age"),
  gender: text("gender"),
  verificationTier: text("verification_tier", { enum: ["basic", "verified", "certified"] }).default("basic"),
  verificationStatus: text("verification_status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  rfqLimit: integer("rfq_limit").default(3), // Monthly RFQ posting limit based on tier
  // Seller-specific verification fields
  sellerTier: text("seller_tier", { enum: ["unverified", "verified", "trusted"] }).default("unverified"),
  sellerVerificationStatus: text("seller_verification_status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  offerLimit: integer("offer_limit").default(5), // Monthly offer posting limit
  trustScore: integer("trust_score").default(1), // 1-5 rating
  completedTransactions: integer("completed_transactions").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description"),
});

export const purchaseIntentions = pgTable("purchase_intentions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  productName: text("product_name").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date").notNull(),
  originalTargetDate: timestamp("original_target_date"), // Track if user moved order forward
  flexibility: text("flexibility").notNull(), // '1-2 weeks', '1 month', '2-3 months', 'fixed'
  currency: text("currency").notNull().default("USD"), // Currency for prices
  minPrice: decimal("min_price", { precision: 10, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").notNull().default(1),
  location: text("location").notNull(),
  isPublic: boolean("is_public").default(true),
  allowSellerContact: boolean("allow_seller_contact").default(true),
  includeInAnalytics: boolean("include_in_analytics").default(false),
  // Cancellation and advancement
  cancellationDeadline: timestamp("cancellation_deadline"), // 24 hours before targetDate
  advancementBonus: decimal("advancement_bonus", { precision: 5, scale: 2 }), // Extra discount for moving forward
  daysAdvanced: integer("days_advanced").default(0), // How many days user moved order forward
  status: text("status").notNull().default('active'), // 'active', 'completed', 'cancelled', 'advanced'
  createdAt: timestamp("created_at").defaultNow(),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  categoryId: integer("category_id").notNull(),
  productName: text("product_name").notNull(),
  specifications: text("specifications"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  minQuantity: integer("min_quantity").notNull(),
  maxQuantity: integer("max_quantity"),
  volumeDiscount1Qty: integer("volume_discount_1_qty"),
  volumeDiscount1Percent: decimal("volume_discount_1_percent", { precision: 5, scale: 2 }),
  volumeDiscount2Qty: integer("volume_discount_2_qty"),
  volumeDiscount2Percent: decimal("volume_discount_2_percent", { precision: 5, scale: 2 }),
  validUntil: timestamp("valid_until").notNull(),
  deliveryTimeline: text("delivery_timeline").notNull(),
  paymentTerms: text("payment_terms").notNull(),
  additionalTerms: text("additional_terms"),
  status: text("status").notNull().default('active'), // 'active', 'expired', 'completed'
  interestedBuyers: integer("interested_buyers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const offerInterests = pgTable("offer_interests", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").notNull(),
  userId: integer("user_id").notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rfqs = pgTable("rfqs", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull(),
  categoryId: integer("category_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  specifications: text("specifications"),
  quantity: integer("quantity").notNull(),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }),
  deliveryLocation: text("delivery_location").notNull(),
  requiredDeliveryDate: timestamp("required_delivery_date").notNull(),
  submissionDeadline: timestamp("submission_deadline").notNull(),
  status: text("status").notNull().default('open'), // 'open', 'closed', 'awarded'
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rfqResponses = pgTable("rfq_responses", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").notNull(),
  supplierId: integer("supplier_id").notNull(),
  quotedPrice: decimal("quoted_price", { precision: 10, scale: 2 }).notNull(),
  deliveryTimeline: text("delivery_timeline").notNull(),
  validityPeriod: text("validity_period").notNull(),
  paymentTerms: text("payment_terms").notNull(),
  technicalResponse: text("technical_response"),
  attachments: text("attachments").array(),
  status: text("status").notNull().default('submitted'), // 'submitted', 'shortlisted', 'awarded', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  offerId: integer("offer_id").notNull(),
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default('2.00'),
  status: text("status").notNull().default('pending'), // 'pending', 'paid'
  createdAt: timestamp("created_at").defaultNow(),
});

// Competitive notification tables
export const competitiveNotifications = pgTable("competitive_notifications", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  targetAudience: text("target_audience", { enum: ["buyers", "competitors", "both"] }).notNull(),
  notificationType: text("notification_type", { enum: ["new_offer", "price_drop", "deadline_warning", "competition_alert"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  priceInfo: decimal("price_info", { precision: 10, scale: 2 }),
  buyerPoolSize: integer("buyer_pool_size"),
  urgencyLevel: text("urgency_level", { enum: ["low", "medium", "high", "critical"] }).default("medium"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userNotifications = pgTable("user_notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  notificationId: integer("notification_id").notNull(),
  isRead: boolean("is_read").default(false),
  isClicked: boolean("is_clicked").default(false),
  deliveryMethod: text("delivery_method", { enum: ["popup", "email", "both"] }).default("popup"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const offerCompetitions = pgTable("offer_competitions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  productName: text("product_name").notNull(),
  buyerPoolSize: integer("buyer_pool_size").notNull(),
  competingOffers: integer("competing_offers").default(0),
  bestPrice: decimal("best_price", { precision: 10, scale: 2 }),
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }),
  competitionDeadline: timestamp("competition_deadline").notNull(),
  status: text("status", { enum: ["open", "active", "final_phase", "closed"] }).default("open"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cancellations = pgTable("cancellations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  intentionId: integer("intention_id"),
  offerId: integer("offer_id"),
  rfqId: integer("rfq_id"),
  cancellationType: text("cancellation_type", { enum: ["intention", "offer", "order", "rfq"] }).notNull(),
  reason: text("reason"),
  hoursBeforeDeadline: integer("hours_before_deadline"),
  penaltyApplied: boolean("penalty_applied").default(false),
  businessImpact: text("business_impact", { enum: ["low", "medium", "high"] }),
  compensationRequired: decimal("compensation_required", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const advancementRewards = pgTable("advancement_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  intentionId: integer("intention_id"),
  rfqId: integer("rfq_id"),
  sellerId: integer("seller_id"),
  supplierId: integer("supplier_id"),
  originalDate: timestamp("original_date").notNull(),
  newDate: timestamp("new_date").notNull(),
  daysAdvanced: integer("days_advanced").notNull(),
  bonusDiscount: decimal("bonus_discount", { precision: 5, scale: 2 }).notNull(),
  sellerIncentive: decimal("seller_incentive", { precision: 5, scale: 2 }),
  businessPriority: text("business_priority", { enum: ["standard", "priority", "urgent"] }).default("standard"),
  costSavings: decimal("cost_savings", { precision: 10, scale: 2 }),
  status: text("status", { enum: ["pending", "approved", "redeemed"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order fulfillment and selection tracking
export const orderFulfillments = pgTable("order_fulfillments", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  productName: text("product_name").notNull(),
  deadlineDate: timestamp("deadline_date").notNull(),
  selectedOfferId: integer("selected_offer_id"), // Best price offer
  backupOfferIds: text("backup_offer_ids").array(), // Array of backup offer IDs
  totalBuyers: integer("total_buyers").notNull(),
  selectionStatus: text("selection_status", { enum: ["pending", "auto_selected", "manual_review", "completed", "failed"] }).default("pending"),
  selectionCriteria: text("selection_criteria").notNull().default("lowest_price"), // "lowest_price", "best_value", "reliability"
  legalNoticeShown: boolean("legal_notice_shown").default(false),
  selectionProcessedAt: timestamp("selection_processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legal disclaimers and user acknowledgments
export const legalAcknowledgments = pgTable("legal_acknowledgments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  acknowledgmentType: text("acknowledgment_type", { enum: ["fulfillment_disclaimer", "selection_process", "liability_waiver"] }).notNull(),
  content: text("content").notNull(), // Legal text acknowledged
  acknowledgedAt: timestamp("acknowledged_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// B2B Aggregation Orders - Core feature for veterinary clinics
export const aggregationOrders = pgTable("aggregation_orders", {
  id: serial("id").primaryKey(),
  initiatorId: integer("initiator_id").notNull().references(() => users.id), // First clinic to create order
  productName: text("product_name").notNull(),
  productCode: text("product_code"), // Standardized product code
  categoryId: integer("category_id").notNull().references(() => categories.id),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  minimumQuantity: integer("minimum_quantity").notNull(), // Min total units for wholesale pricing
  currentQuantity: integer("current_quantity").default(0),
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(1),
  targetSector: text("target_sector", { enum: ["veterinary", "pharmaceutical", "medical"] }).notNull(),
  deadline: timestamp("deadline").notNull(),
  status: text("status", { enum: ["collecting", "ready_for_quote", "quoted", "ordered", "delivered", "cancelled"] }).default("collecting"),
  description: text("description"),
  specifications: text("specifications"),
  createdAt: timestamp("created_at").defaultNow()
});

export const aggregationParticipants = pgTable("aggregation_participants", {
  id: serial("id").primaryKey(),
  aggregationOrderId: integer("aggregation_order_id").notNull().references(() => aggregationOrders.id),
  participantId: integer("participant_id").notNull().references(() => users.id),
  requestedQuantity: integer("requested_quantity").notNull(),
  confirmedQuantity: integer("confirmed_quantity"), // After warehouse confirms availability
  participantType: text("participant_type", { enum: ["veterinary_clinic", "pharmacy", "medical_practice"] }).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  status: text("status", { enum: ["pending", "confirmed", "withdrawn"] }).default("pending")
});

// User segmentation and campaigns tables
export const userSegments = pgTable("user_segments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  segmentType: text("segment_type").notNull(), // "demographic", "behavioral", "business"
  segmentValue: text("segment_value").notNull(),
  confidence: integer("confidence").default(100), // 0-100 confidence score
  source: text("source").notNull(), // "manual", "automatic", "survey"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const popupCampaigns = pgTable("popup_campaigns", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetSegments: text("target_segments").array().notNull(), // Array of segment IDs
  productName: text("product_name").notNull(),
  brandName: text("brand_name").notNull(),
  discountPercentage: integer("discount_percentage"),
  currentParticipants: integer("current_participants").default(0),
  targetParticipants: integer("target_participants").notNull(),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  targetGender: text("target_gender"), // "male", "female", "all"
  targetSectors: text("target_sectors").array(),
  businessSegments: text("business_segments").array(), // For B2B targeting
  priority: text("priority").default("medium"), // "low", "medium", "high", "urgent"
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const campaignInteractions = pgTable("campaign_interactions", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => popupCampaigns.id),
  userId: integer("user_id").notNull().references(() => users.id),
  interactionType: text("interaction_type").notNull(), // "view", "click", "join", "dismiss"
  interactionData: text("interaction_data"), // JSON data for additional context
  timestamp: timestamp("timestamp").defaultNow()
});

export const sectorClassification = pgTable("sector_classification", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  questionType: text("question_type").notNull(), // "what_to_buy", "when_to_buy"
  response: text("response").notNull(),
  sector: text("sector"), // Derived sector from response
  confidence: integer("confidence").default(100),
  submittedAt: timestamp("submitted_at").defaultNow()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertPurchaseIntentionSchema = createInsertSchema(purchaseIntentions).omit({
  id: true,
  createdAt: true,
  originalTargetDate: true,
  cancellationDeadline: true,
  advancementBonus: true,
  daysAdvanced: true,
  status: true,
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  interestedBuyers: true,
});

export const insertOfferInterestSchema = createInsertSchema(offerInterests).omit({
  id: true,
  createdAt: true,
});

export const insertRfqSchema = createInsertSchema(rfqs).omit({
  id: true,
  createdAt: true,
});

export const insertRfqResponseSchema = createInsertSchema(rfqResponses).omit({
  id: true,
  createdAt: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
});

export const insertCompetitiveNotificationSchema = createInsertSchema(competitiveNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertOfferCompetitionSchema = createInsertSchema(offerCompetitions).omit({
  id: true,
  createdAt: true,
});

export const insertOrderFulfillmentSchema = createInsertSchema(orderFulfillments).omit({
  id: true,
  createdAt: true,
});

export const insertLegalAcknowledgmentSchema = createInsertSchema(legalAcknowledgments).omit({
  id: true,
  acknowledgedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type PurchaseIntention = typeof purchaseIntentions.$inferSelect;
export type InsertPurchaseIntention = z.infer<typeof insertPurchaseIntentionSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type OfferInterest = typeof offerInterests.$inferSelect;
export type InsertOfferInterest = z.infer<typeof insertOfferInterestSchema>;
export type RFQ = typeof rfqs.$inferSelect;
export type InsertRFQ = z.infer<typeof insertRfqSchema>;
export type RFQResponse = typeof rfqResponses.$inferSelect;
export type InsertRFQResponse = z.infer<typeof insertRfqResponseSchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type CompetitiveNotification = typeof competitiveNotifications.$inferSelect;
export type InsertCompetitiveNotification = z.infer<typeof insertCompetitiveNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type OfferCompetition = typeof offerCompetitions.$inferSelect;
export type InsertOfferCompetition = z.infer<typeof insertOfferCompetitionSchema>;
export type OrderFulfillment = typeof orderFulfillments.$inferSelect;
export type InsertOrderFulfillment = z.infer<typeof insertOrderFulfillmentSchema>;
export type LegalAcknowledgment = typeof legalAcknowledgments.$inferSelect;
export type InsertLegalAcknowledgment = z.infer<typeof insertLegalAcknowledgmentSchema>;

export const insertUserSegmentSchema = createInsertSchema(userSegments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPopupCampaignSchema = createInsertSchema(popupCampaigns).omit({
  id: true,
  createdAt: true
});

export const insertCampaignInteractionSchema = createInsertSchema(campaignInteractions).omit({
  id: true,
  timestamp: true
});

export const insertSectorClassificationSchema = createInsertSchema(sectorClassification).omit({
  id: true,
  submittedAt: true
});

export type UserSegment = typeof userSegments.$inferSelect;
export type InsertUserSegment = z.infer<typeof insertUserSegmentSchema>;

export type PopupCampaign = typeof popupCampaigns.$inferSelect;
export type InsertPopupCampaign = z.infer<typeof insertPopupCampaignSchema>;

export type CampaignInteraction = typeof campaignInteractions.$inferSelect;
export type InsertCampaignInteraction = z.infer<typeof insertCampaignInteractionSchema>;

export type SectorClassification = typeof sectorClassification.$inferSelect;
export type InsertSectorClassification = z.infer<typeof insertSectorClassificationSchema>;
export type AggregationOrder = typeof aggregationOrders.$inferSelect;
export type InsertAggregationOrder = z.infer<typeof insertAggregationOrderSchema>;
export type AggregationParticipant = typeof aggregationParticipants.$inferSelect;
export type InsertAggregationParticipant = z.infer<typeof insertAggregationParticipantSchema>;
