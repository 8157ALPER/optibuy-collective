import {
  users,
  categories,
  purchaseIntentions,
  offers,
  offerInterests,
  rfqs,
  rfqResponses,
  commissions,
  verificationDocuments,
  verificationRequests,
  verificationTiers,
  competitiveNotifications,
  userNotifications,
  offerCompetitions,
  cancellations,
  advancementRewards,
  orderFulfillments,
  legalAcknowledgments,
  userSegments,
  popupCampaigns,
  campaignInteractions,
  sectorClassification,
  aggregationOrders,
  aggregationParticipants,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type PurchaseIntention,
  type InsertPurchaseIntention,
  type Offer,
  type InsertOffer,
  type OfferInterest,
  type InsertOfferInterest,
  type RFQ,
  type InsertRFQ,
  type RFQResponse,
  type InsertRFQResponse,
  type Commission,
  type InsertCommission,
  type VerificationDocument,
  type InsertVerificationDocument,
  type VerificationRequest,
  type InsertVerificationRequest,
  type VerificationTier,
  type CompetitiveNotification,
  type InsertCompetitiveNotification,
  type UserNotification,
  type InsertUserNotification,
  type OfferCompetition,
  type InsertOfferCompetition,
  type OrderFulfillment,
  type InsertOrderFulfillment,
  type LegalAcknowledgment,
  type InsertLegalAcknowledgment,
  type UserSegment,
  type InsertUserSegment,
  type PopupCampaign,
  type InsertPopupCampaign,
  type CampaignInteraction,
  type InsertCampaignInteraction,
  type SectorClassification,
  type InsertSectorClassification,
  type AggregationOrder,
  type InsertAggregationOrder,
  type AggregationParticipant,
  type InsertAggregationParticipant,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, asc, or, sql, lte, isNull, like, count, gt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Purchase Intentions
  getPurchaseIntentions(): Promise<PurchaseIntention[]>;
  getPurchaseIntentionsByUser(userId: number): Promise<PurchaseIntention[]>;
  getPurchaseIntentionsByCategory(categoryId: number): Promise<PurchaseIntention[]>;
  getPurchaseIntention(id: number): Promise<PurchaseIntention | undefined>;
  createPurchaseIntention(intention: InsertPurchaseIntention): Promise<PurchaseIntention>;
  updatePurchaseIntention(id: number, updates: Partial<PurchaseIntention>): Promise<PurchaseIntention | undefined>;
  
  // Offers
  getOffers(): Promise<Offer[]>;
  getOffersBySeller(sellerId: number): Promise<Offer[]>;
  getOffersByCategory(categoryId: number): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: number, updates: Partial<Offer>): Promise<Offer | undefined>;
  
  // Offer Interests
  getOfferInterests(offerId: number): Promise<OfferInterest[]>;
  createOfferInterest(interest: InsertOfferInterest): Promise<OfferInterest>;
  
  // RFQs
  getRFQs(): Promise<RFQ[]>;
  getRFQsByBuyer(buyerId: number): Promise<RFQ[]>;
  getRFQsByCategory(categoryId: number): Promise<RFQ[]>;
  getRFQ(id: number): Promise<RFQ | undefined>;
  createRFQ(rfq: InsertRFQ): Promise<RFQ>;
  updateRFQ(id: number, updates: Partial<RFQ>): Promise<RFQ | undefined>;
  
  // RFQ Responses
  getRFQResponses(rfqId: number): Promise<RFQResponse[]>;
  getRFQResponsesBySupplier(supplierId: number): Promise<RFQResponse[]>;
  createRFQResponse(response: InsertRFQResponse): Promise<RFQResponse>;
  updateRFQResponse(id: number, updates: Partial<RFQResponse>): Promise<RFQResponse | undefined>;
  
  // Commissions
  getCommissionsBySeller(sellerId: number): Promise<Commission[]>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  
  // Verification
  getVerificationDocuments(userId: number): Promise<VerificationDocument[]>;
  getSellerVerificationDocuments(userId: number): Promise<VerificationDocument[]>;
  createVerificationDocument(document: InsertVerificationDocument): Promise<VerificationDocument>;
  updateVerificationDocument(id: number, updates: Partial<VerificationDocument>): Promise<VerificationDocument | undefined>;
  getVerificationRequests(userId: number): Promise<VerificationRequest[]>;
  getSellerVerificationRequests(userId: number): Promise<VerificationRequest[]>;
  createVerificationRequest(request: InsertVerificationRequest): Promise<VerificationRequest>;
  updateVerificationRequest(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined>;
  getUserVerificationTier(userId: number): Promise<VerificationTier>;
  canCreateRFQ(userId: number): Promise<{ canCreate: boolean; limit: number; used: number }>;
  canCreateOffer(userId: number): Promise<{ canCreate: boolean; limit: number; used: number }>;
  upgradeUserTier(userId: number, newTier: VerificationTier): Promise<User | undefined>;
  upgradeSellerTier(userId: number, newTier: string): Promise<User | undefined>;
  
  // Cancellation management (B2C and B2B)
  canCancelIntention(intentionId: number): Promise<{ canCancel: boolean; hoursToDeadline: number; reason?: string }>;
  cancelIntention(userId: number, intentionId: number, reason: string): Promise<{ success: boolean; penaltyApplied: boolean }>;
  canCancelRFQ(rfqId: number): Promise<{ canCancel: boolean; hoursToDeadline: number; reason?: string }>;
  cancelRFQ(userId: number, rfqId: number, reason: string): Promise<{ success: boolean; penaltyApplied: boolean; compensationRequired?: number }>;
  getUserCancellationStatus(userId: number): Promise<{ cancellationsThisMonth: number; rfqCancellationsThisMonth: number; accountStatus: string; canMakeNewOrders: boolean }>;
  
  // Order advancement (B2C and B2B)
  canAdvanceOrder(intentionId: number, newDate: Date): Promise<{ canAdvance: boolean; maxBonus: number; daysAdvanced: number }>;
  advanceOrder(userId: number, intentionId: number, newDate: Date): Promise<{ success: boolean; bonusDiscount: number; sellerId?: number }>;
  canAdvanceRFQ(rfqId: number, newDate: Date): Promise<{ canAdvance: boolean; maxBonus: number; daysAdvanced: number; costSavings: number }>;
  advanceRFQ(userId: number, rfqId: number, newDate: Date): Promise<{ success: boolean; bonusDiscount: number; costSavings: number; supplierId?: number }>;
  getAdvancementOpportunities(userId: number): Promise<any[]>;
  
  // Competitive notifications and real-time bidding
  createCompetitiveNotification(notification: InsertCompetitiveNotification): Promise<CompetitiveNotification>;
  getActiveNotifications(userId: number): Promise<CompetitiveNotification[]>;
  markNotificationAsRead(userId: number, notificationId: number): Promise<void>;
  createOfferCompetition(competition: InsertOfferCompetition): Promise<OfferCompetition>;
  getOfferCompetitionsByCategory(categoryId: number): Promise<OfferCompetition[]>;
  updateCompetitionStats(categoryId: number, productName: string): Promise<void>;
  getBuyerPoolSize(categoryId: number, productName: string): Promise<number>;
  triggerCompetitiveAlerts(offerId: number): Promise<void>;
  
  // Order fulfillment and selection
  processDeadlineClosureSelection(categoryId: number, productName: string): Promise<{ selectedOffer: any; backupOffers: any[]; totalBuyers: number }>;
  handleSellerFulfillmentFailure(offerId: number, reason: string): Promise<{ nextBestOffer: any | null; success: boolean }>;
  createLegalAcknowledgment(acknowledgment: any): Promise<any>;
  getUserLegalAcknowledgments(userId: number): Promise<any[]>;
  getOrderFulfillmentStatus(categoryId: number, productName: string): Promise<any | null>;
  
  // User segmentation
  createUserSegment(segment: InsertUserSegment): Promise<UserSegment>;
  getUserSegments(userId: number): Promise<UserSegment[]>;
  updateUserSegment(userId: number, segmentType: string, segmentValue: string): Promise<UserSegment | undefined>;
  
  // Pop-up campaigns
  createPopupCampaign(campaign: InsertPopupCampaign): Promise<PopupCampaign>;
  getActivePopupCampaigns(userId: number): Promise<PopupCampaign[]>;
  getPopupCampaignsByCompany(companyId: number): Promise<PopupCampaign[]>;
  updateCampaignParticipants(campaignId: number, increment: number): Promise<PopupCampaign | undefined>;
  
  // Campaign interactions
  createCampaignInteraction(interaction: InsertCampaignInteraction): Promise<CampaignInteraction>;
  getCampaignInteractions(campaignId: number): Promise<CampaignInteraction[]>;
  
  // Sector classification
  createSectorClassification(classification: InsertSectorClassification): Promise<SectorClassification>;
  getUserSectorClassifications(userId: number): Promise<SectorClassification[]>;
  analyzeSectorFromResponse(response: string, questionType: string): Promise<{ sector: string; confidence: number }>;
  
  // Segmentation analysis
  analyzeUserBehavior(userId: number): Promise<{ segments: string[]; confidence: number }>;
  getTargetedCampaigns(userId: number): Promise<PopupCampaign[]>;
  
  // Smart filtering for relevant campaigns
  getRelevantCampaignsForUser(userId: number): Promise<PopupCampaign[]>;
  updateUserNotificationPreferences(userId: number, preferences: { enableUnrelatedPopups?: boolean; notificationFrequency?: string }): Promise<User | undefined>;
  checkCampaignRelevance(userId: number, campaignId: number): Promise<{ isRelevant: boolean; relevanceScore: number; reason: string }>;
  
  // B2B Aggregation Orders for veterinary/pharmacy sectors
  createAggregationOrder(order: InsertAggregationOrder): Promise<AggregationOrder>;
  getAggregationOrders(filters?: { sector?: string; status?: string }): Promise<AggregationOrder[]>;
  getAggregationOrdersByUser(userId: number): Promise<AggregationOrder[]>;
  getAggregationOrder(id: number): Promise<AggregationOrder | undefined>;
  joinAggregationOrder(orderId: number, participant: InsertAggregationParticipant): Promise<{ success: boolean; newQuantity: number; participantCount: number }>;
  getAggregationParticipants(orderId: number): Promise<AggregationParticipant[]>;
  updateAggregationOrderStatus(orderId: number, status: string): Promise<AggregationOrder | undefined>;
  checkAggregationViability(orderId: number): Promise<{ isViable: boolean; progressPercentage: number; unitsNeeded: number }>;
  getVeterinaryAggregationOpportunities(userId: number): Promise<AggregationOrder[]>;
  getPharmacyAggregationOpportunities(userId: number): Promise<AggregationOrder[]>;
  calculateVolumeDiscount(basePrice: number, quantity: number, sector: string): Promise<{ discountPercentage: number; finalPrice: number; savings: number }>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    // Check if categories already exist
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) return;

    // Seed categories
    const defaultCategories = [
      { name: "Automotive", icon: "fas fa-car", description: "Cars, motorcycles, parts" },
      { name: "Electronics", icon: "fas fa-laptop", description: "Phones, computers, gadgets" },
      { name: "Home & Garden", icon: "fas fa-home", description: "Furniture, appliances, tools" },
      { name: "Fashion", icon: "fas fa-tshirt", description: "Clothing, shoes, accessories" },
      { name: "Sports & Outdoor", icon: "fas fa-running", description: "Equipment, gear, apparel" },
      { name: "Health & Beauty", icon: "fas fa-heart", description: "Cosmetics, supplements, care" },
      { name: "Raw Materials", icon: "fas fa-industry", description: "Steel, aluminum, chemicals, plastics" },
      { name: "Industrial Equipment", icon: "fas fa-cogs", description: "Machinery, tools, manufacturing equipment" },
      { name: "Office Supplies", icon: "fas fa-briefcase", description: "Computers, furniture, stationery" },
      { name: "Manufacturing", icon: "fas fa-factory", description: "Production materials and components" },
    ];

    await db.insert(categories).values(defaultCategories);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  // Purchase Intentions
  async getPurchaseIntentions(): Promise<PurchaseIntention[]> {
    return await db.select().from(purchaseIntentions)
      .where(eq(purchaseIntentions.status, 'active'));
  }

  async getPurchaseIntentionsByUser(userId: number): Promise<PurchaseIntention[]> {
    return await db.select().from(purchaseIntentions)
      .where(eq(purchaseIntentions.userId, userId));
  }

  async getPurchaseIntentionsByCategory(categoryId: number): Promise<PurchaseIntention[]> {
    return await db.select().from(purchaseIntentions)
      .where(eq(purchaseIntentions.categoryId, categoryId));
  }

  async getPurchaseIntention(id: number): Promise<PurchaseIntention | undefined> {
    const [intention] = await db.select().from(purchaseIntentions)
      .where(eq(purchaseIntentions.id, id));
    return intention || undefined;
  }

  async createPurchaseIntention(insertIntention: InsertPurchaseIntention): Promise<PurchaseIntention> {
    const [intention] = await db
      .insert(purchaseIntentions)
      .values(insertIntention)
      .returning();
    return intention;
  }

  async updatePurchaseIntention(id: number, updates: Partial<PurchaseIntention>): Promise<PurchaseIntention | undefined> {
    const [intention] = await db
      .update(purchaseIntentions)
      .set(updates)
      .where(eq(purchaseIntentions.id, id))
      .returning();
    return intention || undefined;
  }

  // Offers
  async getOffers(): Promise<Offer[]> {
    return await db.select().from(offers)
      .where(eq(offers.status, 'active'));
  }

  async getOffersBySeller(sellerId: number): Promise<Offer[]> {
    return await db.select().from(offers)
      .where(eq(offers.sellerId, sellerId));
  }

  async getOffersByCategory(categoryId: number): Promise<Offer[]> {
    return await db.select().from(offers)
      .where(eq(offers.categoryId, categoryId));
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    const [offer] = await db.select().from(offers)
      .where(eq(offers.id, id));
    return offer || undefined;
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const [offer] = await db
      .insert(offers)
      .values(insertOffer)
      .returning();
    return offer;
  }

  async updateOffer(id: number, updates: Partial<Offer>): Promise<Offer | undefined> {
    const [offer] = await db
      .update(offers)
      .set(updates)
      .where(eq(offers.id, id))
      .returning();
    return offer || undefined;
  }

  // Offer Interests
  async getOfferInterests(offerId: number): Promise<OfferInterest[]> {
    return await db.select().from(offerInterests)
      .where(eq(offerInterests.offerId, offerId));
  }

  async createOfferInterest(insertInterest: InsertOfferInterest): Promise<OfferInterest> {
    const [interest] = await db
      .insert(offerInterests)
      .values(insertInterest)
      .returning();
    return interest;
  }

  // RFQ methods
  async getRFQs(): Promise<RFQ[]> {
    return await db.select().from(rfqs)
      .where(eq(rfqs.status, 'open'));
  }

  async getRFQsByBuyer(buyerId: number): Promise<RFQ[]> {
    return await db.select().from(rfqs)
      .where(eq(rfqs.buyerId, buyerId));
  }

  async getRFQsByCategory(categoryId: number): Promise<RFQ[]> {
    return await db.select().from(rfqs)
      .where(eq(rfqs.categoryId, categoryId));
  }

  async getRFQ(id: number): Promise<RFQ | undefined> {
    const [rfq] = await db.select().from(rfqs)
      .where(eq(rfqs.id, id));
    return rfq || undefined;
  }

  async createRFQ(insertRfq: InsertRFQ): Promise<RFQ> {
    const [rfq] = await db
      .insert(rfqs)
      .values(insertRfq)
      .returning();
    return rfq;
  }

  async updateRFQ(id: number, updates: Partial<RFQ>): Promise<RFQ | undefined> {
    const [rfq] = await db
      .update(rfqs)
      .set(updates)
      .where(eq(rfqs.id, id))
      .returning();
    return rfq || undefined;
  }

  // RFQ Response methods
  async getRFQResponses(rfqId: number): Promise<RFQResponse[]> {
    return await db.select().from(rfqResponses)
      .where(eq(rfqResponses.rfqId, rfqId));
  }

  async getRFQResponsesBySupplier(supplierId: number): Promise<RFQResponse[]> {
    return await db.select().from(rfqResponses)
      .where(eq(rfqResponses.supplierId, supplierId));
  }

  async createRFQResponse(insertResponse: InsertRFQResponse): Promise<RFQResponse> {
    const [response] = await db
      .insert(rfqResponses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async updateRFQResponse(id: number, updates: Partial<RFQResponse>): Promise<RFQResponse | undefined> {
    const [response] = await db
      .update(rfqResponses)
      .set(updates)
      .where(eq(rfqResponses.id, id))
      .returning();
    return response || undefined;
  }

  // Commissions
  async getCommissionsBySeller(sellerId: number): Promise<Commission[]> {
    return await db.select().from(commissions)
      .where(eq(commissions.sellerId, sellerId));
  }

  async createCommission(insertCommission: InsertCommission): Promise<Commission> {
    const [commission] = await db
      .insert(commissions)
      .values(insertCommission)
      .returning();
    return commission;
  }

  // Verification methods
  async getVerificationDocuments(userId: number): Promise<VerificationDocument[]> {
    return await db.select().from(verificationDocuments).where(
      and(
        eq(verificationDocuments.userId, userId),
        eq(verificationDocuments.userType, "business")
      )
    );
  }

  async getSellerVerificationDocuments(userId: number): Promise<VerificationDocument[]> {
    return await db.select().from(verificationDocuments).where(
      and(
        eq(verificationDocuments.userId, userId),
        eq(verificationDocuments.userType, "seller")
      )
    );
  }

  async createVerificationDocument(insertDocument: InsertVerificationDocument): Promise<VerificationDocument> {
    const [document] = await db
      .insert(verificationDocuments)
      .values(insertDocument)
      .returning();
    return document;
  }

  async updateVerificationDocument(id: number, updates: Partial<VerificationDocument>): Promise<VerificationDocument | undefined> {
    const [document] = await db
      .update(verificationDocuments)
      .set(updates)
      .where(eq(verificationDocuments.id, id))
      .returning();
    return document || undefined;
  }

  async getVerificationRequests(userId: number): Promise<VerificationRequest[]> {
    return await db.select().from(verificationRequests).where(
      and(
        eq(verificationRequests.userId, userId),
        eq(verificationRequests.userType, "business")
      )
    );
  }

  async getSellerVerificationRequests(userId: number): Promise<VerificationRequest[]> {
    return await db.select().from(verificationRequests).where(
      and(
        eq(verificationRequests.userId, userId),
        eq(verificationRequests.userType, "seller")
      )
    );
  }

  async createVerificationRequest(insertRequest: InsertVerificationRequest): Promise<VerificationRequest> {
    const [request] = await db
      .insert(verificationRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateVerificationRequest(id: number, updates: Partial<VerificationRequest>): Promise<VerificationRequest | undefined> {
    const [request] = await db
      .update(verificationRequests)
      .set(updates)
      .where(eq(verificationRequests.id, id))
      .returning();
    return request || undefined;
  }

  async getUserVerificationTier(userId: number): Promise<VerificationTier> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return (user?.verificationTier as VerificationTier) || "basic";
  }

  async canCreateRFQ(userId: number): Promise<{ canCreate: boolean; limit: number; used: number }> {
    const tier = await this.getUserVerificationTier(userId);
    const limits = verificationTiers[tier];
    const limit = limits.rfqLimit;
    
    if (limit === -1) {
      return { canCreate: true, limit: -1, used: 0 }; // Unlimited
    }

    // Count RFQs created this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const used = await db
      .select()
      .from(rfqs)
      .where(
        and(
          eq(rfqs.buyerId, userId),
          gte(rfqs.createdAt, currentMonth)
        )
      );

    return {
      canCreate: used.length < limit,
      limit,
      used: used.length
    };
  }

  async canCreateOffer(userId: number): Promise<{ canCreate: boolean; limit: number; used: number }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const limit = user?.offerLimit || 5;
    
    if (limit === -1) {
      return { canCreate: true, limit: -1, used: 0 }; // Unlimited
    }

    // Count offers created this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const used = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.sellerId, userId),
          gte(offers.createdAt, currentMonth)
        )
      );

    return {
      canCreate: used.length < limit,
      limit,
      used: used.length
    };
  }

  async upgradeUserTier(userId: number, newTier: VerificationTier): Promise<User | undefined> {
    const limits = verificationTiers[newTier];
    const [user] = await db
      .update(users)
      .set({ 
        verificationTier: newTier,
        rfqLimit: limits.rfqLimit === -1 ? 999999 : limits.rfqLimit,
        verificationStatus: "approved"
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async upgradeSellerTier(userId: number, newTier: string): Promise<User | undefined> {
    const sellerTiers = {
      "verified": { offerLimit: 25, trustScore: 3 },
      "trusted": { offerLimit: -1, trustScore: 5 }
    };
    
    const limits = sellerTiers[newTier as keyof typeof sellerTiers];
    if (!limits) return undefined;

    const [user] = await db
      .update(users)
      .set({ 
        sellerTier: newTier as "verified" | "trusted",
        offerLimit: limits.offerLimit === -1 ? 999999 : limits.offerLimit,
        trustScore: limits.trustScore,
        sellerVerificationStatus: "approved"
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Cancellation management methods (B2C and B2B)
  async canCancelIntention(intentionId: number): Promise<{ canCancel: boolean; hoursToDeadline: number; reason?: string }> {
    const [intention] = await db.select().from(purchaseIntentions).where(eq(purchaseIntentions.id, intentionId));
    if (!intention) {
      return { canCancel: false, hoursToDeadline: 0, reason: "Intention not found" };
    }

    const now = new Date();
    const targetDate = new Date(intention.targetDate);
    const hoursToDeadline = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    // Can't cancel within 24 hours of deadline for consumers
    if (hoursToDeadline <= 24) {
      return { canCancel: false, hoursToDeadline, reason: "Cannot cancel within 24 hours of target date" };
    }

    return { canCancel: true, hoursToDeadline };
  }

  async canCancelRFQ(rfqId: number): Promise<{ canCancel: boolean; hoursToDeadline: number; reason?: string }> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, rfqId));
    if (!rfq) {
      return { canCancel: false, hoursToDeadline: 0, reason: "RFQ not found" };
    }

    const now = new Date();
    const deadline = new Date(rfq.deadline);
    const hoursToDeadline = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

    // B2B has stricter cancellation policy: 48 hours before deadline
    if (hoursToDeadline <= 48) {
      return { canCancel: false, hoursToDeadline, reason: "Cannot cancel B2B RFQ within 48 hours of deadline" };
    }

    return { canCancel: true, hoursToDeadline };
  }

  async cancelIntention(userId: number, intentionId: number, reason: string): Promise<{ success: boolean; penaltyApplied: boolean }> {
    const canCancel = await this.canCancelIntention(intentionId);
    if (!canCancel.canCancel) {
      return { success: false, penaltyApplied: false };
    }

    // Update intention status
    await db
      .update(purchaseIntentions)
      .set({ status: "cancelled" })
      .where(eq(purchaseIntentions.id, intentionId));

    // Record cancellation
    await db.insert(cancellations).values({
      userId,
      intentionId,
      cancellationType: "intention",
      reason,
      hoursBeforeDeadline: canCancel.hoursToDeadline,
      penaltyApplied: false
    });

    return this.updateUserCancellationCount(userId, false);
  }

  async cancelRFQ(userId: number, rfqId: number, reason: string): Promise<{ success: boolean; penaltyApplied: boolean; compensationRequired?: number }> {
    const canCancel = await this.canCancelRFQ(rfqId);
    if (!canCancel.canCancel) {
      return { success: false, penaltyApplied: false };
    }

    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, rfqId));
    if (!rfq) {
      return { success: false, penaltyApplied: false };
    }

    // Calculate compensation for suppliers who may have already started working
    const compensationRequired = canCancel.hoursToDeadline < 72 ? 
      parseFloat((rfq.targetPrice || "0")) * 0.1 : 0; // 10% compensation if cancelled within 72 hours

    // Update RFQ status
    await db
      .update(rfqs)
      .set({ status: "cancelled" })
      .where(eq(rfqs.id, rfqId));

    // Record cancellation with B2B specific fields
    await db.insert(cancellations).values({
      userId,
      rfqId,
      cancellationType: "rfq",
      reason,
      hoursBeforeDeadline: canCancel.hoursToDeadline,
      businessImpact: canCancel.hoursToDeadline < 72 ? "high" : "medium",
      compensationRequired: compensationRequired.toString(),
      penaltyApplied: false
    });

    const result = await this.updateUserCancellationCount(userId, true);
    return { ...result, compensationRequired };
  }

  private async updateUserCancellationCount(userId: number, isB2B: boolean): Promise<{ success: boolean; penaltyApplied: boolean }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return { success: true, penaltyApplied: false };
    }

    const now = new Date();
    const lastReset = new Date(user.lastCancellationReset || now);
    const monthsDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());
    
    let newCount = user.monthlyCancellations || 0;
    let newRfqCount = user.monthlyRfqCancellations || 0;
    let resetDate = user.lastCancellationReset;

    // Reset count if a month has passed
    if (monthsDiff >= 1) {
      newCount = isB2B ? 0 : 1;
      newRfqCount = isB2B ? 1 : 0;
      resetDate = now;
    } else {
      if (isB2B) {
        newRfqCount += 1;
      } else {
        newCount += 1;
      }
    }

    // Check limits: B2C = 3/month, B2B = 2/month (stricter)
    const limit = isB2B ? (user.businessCancellationLimit || 2) : 3;
    const currentCount = isB2B ? newRfqCount : newCount;
    
    let accountStatus = user.accountStatus;
    let suspensionUntil = user.suspensionUntil;
    
    if (currentCount > limit) {
      accountStatus = "suspended";
      suspensionUntil = new Date(now.getTime() + (isB2B ? 60 : 30) * 24 * 60 * 60 * 1000); // B2B: 60 days, B2C: 30 days
    }

    await db
      .update(users)
      .set({
        monthlyCancellations: newCount,
        monthlyRfqCancellations: newRfqCount,
        lastCancellationReset: resetDate,
        accountStatus,
        suspensionUntil,
        suspensionReason: currentCount > limit ? 
          `Exceeded ${isB2B ? 'B2B' : 'B2C'} cancellation limit (${currentCount}/${limit} this month)` : 
          user.suspensionReason
      })
      .where(eq(users.id, userId));

    return { success: true, penaltyApplied: currentCount > limit };
  }

  async getUserCancellationStatus(userId: number): Promise<{ cancellationsThisMonth: number; rfqCancellationsThisMonth: number; accountStatus: string; canMakeNewOrders: boolean }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return { cancellationsThisMonth: 0, rfqCancellationsThisMonth: 0, accountStatus: "active", canMakeNewOrders: false };
    }

    const now = new Date();
    const suspensionUntil = user.suspensionUntil ? new Date(user.suspensionUntil) : null;
    const isSuspended = user.accountStatus === "suspended" && suspensionUntil && now < suspensionUntil;

    return {
      cancellationsThisMonth: user.monthlyCancellations || 0,
      rfqCancellationsThisMonth: user.monthlyRfqCancellations || 0,
      accountStatus: isSuspended ? "suspended" : user.accountStatus || "active",
      canMakeNewOrders: !isSuspended && user.accountStatus !== "banned"
    };
  }

  // Order advancement methods (B2C and B2B)
  async canAdvanceOrder(intentionId: number, newDate: Date): Promise<{ canAdvance: boolean; maxBonus: number; daysAdvanced: number }> {
    const [intention] = await db.select().from(purchaseIntentions).where(eq(purchaseIntentions.id, intentionId));
    if (!intention) {
      return { canAdvance: false, maxBonus: 0, daysAdvanced: 0 };
    }

    const originalDate = new Date(intention.targetDate);
    const daysAdvanced = Math.floor((originalDate.getTime() - newDate.getTime()) / (1000 * 60 * 60 * 24));

    // Must advance by at least 30 days to get bonus
    if (daysAdvanced < 30) {
      return { canAdvance: false, maxBonus: 0, daysAdvanced };
    }

    // Calculate bonus: 1% per 30 days advanced, max 15%
    const maxBonus = Math.min(Math.floor(daysAdvanced / 30), 15);

    return { canAdvance: true, maxBonus, daysAdvanced };
  }

  async canAdvanceRFQ(rfqId: number, newDate: Date): Promise<{ canAdvance: boolean; maxBonus: number; daysAdvanced: number; costSavings: number }> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, rfqId));
    if (!rfq) {
      return { canAdvance: false, maxBonus: 0, daysAdvanced: 0, costSavings: 0 };
    }

    const originalDate = new Date(rfq.deadline);
    const daysAdvanced = Math.floor((originalDate.getTime() - newDate.getTime()) / (1000 * 60 * 60 * 24));

    // B2B requires minimum 15 days advancement (lower threshold for business needs)
    if (daysAdvanced < 15) {
      return { canAdvance: false, maxBonus: 0, daysAdvanced, costSavings: 0 };
    }

    // B2B bonus: 2% per 15 days advanced, max 20% (better than B2C)
    const maxBonus = Math.min(Math.floor(daysAdvanced / 15) * 2, 20);
    
    // Calculate estimated cost savings for business
    const targetPrice = parseFloat(rfq.targetPrice?.toString() || "0");
    const costSavings = targetPrice * (maxBonus / 100) * rfq.quantity;

    return { canAdvance: true, maxBonus, daysAdvanced, costSavings };
  }

  async advanceOrder(userId: number, intentionId: number, newDate: Date): Promise<{ success: boolean; bonusDiscount: number; sellerId?: number }> {
    const advancement = await this.canAdvanceOrder(intentionId, newDate);
    if (!advancement.canAdvance) {
      return { success: false, bonusDiscount: 0 };
    }

    const [intention] = await db.select().from(purchaseIntentions).where(eq(purchaseIntentions.id, intentionId));
    if (!intention) {
      return { success: false, bonusDiscount: 0 };
    }

    // Update intention with new date and advancement info
    await db
      .update(purchaseIntentions)
      .set({
        originalTargetDate: intention.targetDate, // Store original date
        targetDate: newDate,
        daysAdvanced: advancement.daysAdvanced,
        advancementBonus: advancement.maxBonus.toString(),
        status: "advanced",
        cancellationDeadline: new Date(newDate.getTime() - (24 * 60 * 60 * 1000)) // 24 hours before new date
      })
      .where(eq(purchaseIntentions.id, intentionId));

    // Find matching offers for potential seller incentive
    const matchingOffers = await db.select().from(offers).where(eq(offers.categoryId, intention.categoryId));
    let sellerId = undefined;
    
    if (matchingOffers.length > 0) {
      // Create advancement reward for best matching seller
      sellerId = matchingOffers[0].sellerId;
      await db.insert(advancementRewards).values({
        userId,
        intentionId,
        sellerId,
        originalDate: intention.targetDate,
        newDate,
        daysAdvanced: advancement.daysAdvanced,
        bonusDiscount: advancement.maxBonus.toString(),
        sellerIncentive: (advancement.maxBonus * 0.5).toString(), // Seller gets 50% of bonus as incentive
        businessPriority: "standard",
        status: "pending"
      });
    }

    return { success: true, bonusDiscount: advancement.maxBonus, sellerId };
  }

  async advanceRFQ(userId: number, rfqId: number, newDate: Date): Promise<{ success: boolean; bonusDiscount: number; costSavings: number; supplierId?: number }> {
    const advancement = await this.canAdvanceRFQ(rfqId, newDate);
    if (!advancement.canAdvance) {
      return { success: false, bonusDiscount: 0, costSavings: 0 };
    }

    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, rfqId));
    if (!rfq) {
      return { success: false, bonusDiscount: 0, costSavings: 0 };
    }

    // Update RFQ with new deadline and advancement info
    await db
      .update(rfqs)
      .set({
        originalDeadline: rfq.deadline, // Store original deadline
        deadline: newDate,
        daysAdvanced: advancement.daysAdvanced,
        advancementBonus: advancement.maxBonus.toString(),
        status: "advanced",
        cancellationDeadline: new Date(newDate.getTime() - (48 * 60 * 60 * 1000)), // 48 hours before new deadline for B2B
        businessUrgency: advancement.daysAdvanced > 60 ? "high" : "medium"
      })
      .where(eq(rfqs.id, rfqId));

    // Find matching suppliers for potential incentive
    const responses = await db.select().from(rfqResponses).where(eq(rfqResponses.rfqId, rfqId));
    let supplierId = undefined;
    
    if (responses.length > 0) {
      // Create advancement reward for best responding supplier
      supplierId = responses[0].supplierId;
      await db.insert(advancementRewards).values({
        userId,
        rfqId,
        supplierId,
        originalDate: rfq.deadline,
        newDate,
        daysAdvanced: advancement.daysAdvanced,
        bonusDiscount: advancement.maxBonus.toString(),
        sellerIncentive: (advancement.maxBonus * 0.3).toString(), // Supplier gets 30% of bonus as incentive
        businessPriority: advancement.daysAdvanced > 60 ? "urgent" : "priority",
        costSavings: advancement.costSavings.toString(),
        status: "pending"
      });
    }

    return { success: true, bonusDiscount: advancement.maxBonus, costSavings: advancement.costSavings, supplierId };
  }

  async getAdvancementOpportunities(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(advancementRewards)
      .where(eq(advancementRewards.userId, userId));
  }

  // Competitive notification methods (placeholder implementations)
  async createCompetitiveNotification(insertNotification: InsertCompetitiveNotification): Promise<CompetitiveNotification> {
    const [notification] = await db
      .insert(competitiveNotifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getActiveNotifications(userId: number): Promise<CompetitiveNotification[]> {
    return [];
  }

  async markNotificationAsRead(userId: number, notificationId: number): Promise<void> {
    return;
  }

  async createOfferCompetition(insertCompetition: InsertOfferCompetition): Promise<OfferCompetition> {
    const [competition] = await db
      .insert(offerCompetitions)
      .values(insertCompetition)
      .returning();
    return competition;
  }

  async getOfferCompetitionsByCategory(categoryId: number): Promise<OfferCompetition[]> {
    return [];
  }

  async updateCompetitionStats(categoryId: number, productName: string): Promise<void> {
    return;
  }

  async getBuyerPoolSize(categoryId: number, productName: string): Promise<number> {
    return 1247; // Mock number for demo
  }

  async triggerCompetitiveAlerts(offerId: number): Promise<void> {
    return;
  }

  // Order fulfillment and selection methods
  async processDeadlineClosureSelection(categoryId: number, productName: string): Promise<{ selectedOffer: any; backupOffers: any[]; totalBuyers: number }> {
    const totalBuyers = await this.getBuyerPoolSize(categoryId, productName);
    
    // Mock selection result for demo
    const selectedOffer = {
      id: 1,
      sellerId: 101,
      sellerName: "TechStore Pro",
      price: 999,
      productName: productName
    };
    
    const backupOffers = [
      { id: 2, sellerId: 102, sellerName: "MegaTech", price: 1049 },
      { id: 3, sellerId: 103, sellerName: "ElectroWorld", price: 1079 }
    ];

    await db
      .insert(orderFulfillments)
      .values({
        categoryId,
        productName,
        deadlineDate: new Date(),
        selectedOfferId: selectedOffer.id,
        backupOfferIds: backupOffers.map(o => o.id.toString()),
        totalBuyers,
        selectionStatus: 'auto_selected',
        selectionCriteria: 'lowest_price',
        selectionProcessedAt: new Date()
      });

    return { selectedOffer, backupOffers, totalBuyers };
  }

  async handleSellerFulfillmentFailure(offerId: number, reason: string): Promise<{ nextBestOffer: any | null; success: boolean }> {
    const [fulfillment] = await db
      .select()
      .from(orderFulfillments)
      .where(eq(orderFulfillments.selectedOfferId, offerId));

    if (!fulfillment || !fulfillment.backupOfferIds?.length) {
      return { nextBestOffer: null, success: false };
    }

    const nextOfferId = parseInt(fulfillment.backupOfferIds[0]);
    const nextOffer = {
      id: nextOfferId,
      sellerId: 102,
      sellerName: "MegaTech",
      price: 1049,
      productName: "iPhone 15 Pro"
    };

    const remainingBackups = fulfillment.backupOfferIds.slice(1);
    await db
      .update(orderFulfillments)
      .set({
        selectedOfferId: nextOfferId,
        backupOfferIds: remainingBackups,
        selectionStatus: 'auto_selected'
      })
      .where(eq(orderFulfillments.id, fulfillment.id));

    return { nextBestOffer: nextOffer, success: true };
  }

  async createLegalAcknowledgment(insertAcknowledgment: InsertLegalAcknowledgment): Promise<LegalAcknowledgment> {
    const [acknowledgment] = await db
      .insert(legalAcknowledgments)
      .values(insertAcknowledgment)
      .returning();
    return acknowledgment;
  }

  async getUserLegalAcknowledgments(userId: number): Promise<LegalAcknowledgment[]> {
    return await db
      .select()
      .from(legalAcknowledgments)
      .where(eq(legalAcknowledgments.userId, userId))
      .orderBy(desc(legalAcknowledgments.acknowledgedAt));
  }

  async getOrderFulfillmentStatus(categoryId: number, productName: string): Promise<OrderFulfillment | null> {
    const [fulfillment] = await db
      .select()
      .from(orderFulfillments)
      .where(
        and(
          eq(orderFulfillments.categoryId, categoryId),
          like(orderFulfillments.productName, `%${productName}%`)
        )
      )
      .orderBy(desc(orderFulfillments.createdAt));
    
    return fulfillment || null;
  }

  // User segmentation methods
  async createUserSegment(insertSegment: InsertUserSegment): Promise<UserSegment> {
    const [segment] = await db.insert(userSegments).values(insertSegment).returning();
    return segment;
  }

  async getUserSegments(userId: number): Promise<UserSegment[]> {
    return await db.select()
      .from(userSegments)
      .where(eq(userSegments.userId, userId))
      .orderBy(desc(userSegments.createdAt));
  }

  async updateUserSegment(userId: number, segmentType: string, segmentValue: string): Promise<UserSegment | undefined> {
    const [existingSegment] = await db.select()
      .from(userSegments)
      .where(and(
        eq(userSegments.userId, userId),
        eq(userSegments.segmentType, segmentType)
      ));

    if (existingSegment) {
      const [updated] = await db.update(userSegments)
        .set({ 
          segmentValue,
          updatedAt: new Date()
        })
        .where(eq(userSegments.id, existingSegment.id))
        .returning();
      return updated;
    } else {
      return await this.createUserSegment({
        userId,
        segmentType,
        segmentValue,
        source: "automatic"
      });
    }
  }

  // Pop-up campaign methods
  async createPopupCampaign(insertCampaign: InsertPopupCampaign): Promise<PopupCampaign> {
    const [campaign] = await db.insert(popupCampaigns).values(insertCampaign).returning();
    return campaign;
  }

  async getActivePopupCampaigns(userId: number): Promise<PopupCampaign[]> {
    const user = await this.getUser(userId);
    if (!user) return [];

    const now = new Date();
    
    return await db.select()
      .from(popupCampaigns)
      .where(and(
        eq(popupCampaigns.isActive, true),
        lte(popupCampaigns.startDate, now),
        gte(popupCampaigns.endDate, now)
      ))
      .orderBy(desc(popupCampaigns.priority), desc(popupCampaigns.createdAt));
  }

  async getPopupCampaignsByCompany(companyId: number): Promise<PopupCampaign[]> {
    return await db.select()
      .from(popupCampaigns)
      .where(eq(popupCampaigns.companyId, companyId))
      .orderBy(desc(popupCampaigns.createdAt));
  }

  async updateCampaignParticipants(campaignId: number, increment: number): Promise<PopupCampaign | undefined> {
    const [updated] = await db.update(popupCampaigns)
      .set({ 
        currentParticipants: sql`${popupCampaigns.currentParticipants} + ${increment}`
      })
      .where(eq(popupCampaigns.id, campaignId))
      .returning();
    return updated;
  }

  // Campaign interaction methods
  async createCampaignInteraction(insertInteraction: InsertCampaignInteraction): Promise<CampaignInteraction> {
    const [interaction] = await db.insert(campaignInteractions).values(insertInteraction).returning();
    return interaction;
  }

  async getCampaignInteractions(campaignId: number): Promise<CampaignInteraction[]> {
    return await db.select()
      .from(campaignInteractions)
      .where(eq(campaignInteractions.campaignId, campaignId))
      .orderBy(desc(campaignInteractions.timestamp));
  }

  // Sector classification methods
  async createSectorClassification(insertClassification: InsertSectorClassification): Promise<SectorClassification> {
    const [classification] = await db.insert(sectorClassification).values(insertClassification).returning();
    
    // Auto-update user segment based on classification
    if (classification.sector) {
      await this.updateUserSegment(classification.userId, "sector", classification.sector);
    }
    
    return classification;
  }

  async getUserSectorClassifications(userId: number): Promise<SectorClassification[]> {
    return await db.select()
      .from(sectorClassification)
      .where(eq(sectorClassification.userId, userId))
      .orderBy(desc(sectorClassification.submittedAt));
  }

  async analyzeSectorFromResponse(response: string, questionType: string): Promise<{ sector: string; confidence: number }> {
    const lowerResponse = response.toLowerCase();
    
    // Simple keyword-based classification
    const sectorKeywords = {
      "automotive": ["car", "vehicle", "auto", "motorcycle", "truck", "transport"],
      "electronics": ["phone", "laptop", "computer", "tablet", "tv", "gadget", "tech"],
      "fashion": ["clothes", "shoes", "dress", "shirt", "fashion", "style", "wear"],
      "home": ["furniture", "kitchen", "home", "house", "decor", "appliance"],
      "health": ["medicine", "health", "medical", "fitness", "wellness", "pharmacy"],
      "food": ["food", "restaurant", "grocery", "drink", "beverage", "meal"],
      "business": ["office", "business", "enterprise", "corporate", "industrial", "commercial"]
    };

    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
      for (const keyword of keywords) {
        if (lowerResponse.includes(keyword)) {
          return { sector, confidence: 85 };
        }
      }
    }

    return { sector: "general", confidence: 50 };
  }

  async analyzeUserBehavior(userId: number): Promise<{ segments: string[]; confidence: number }> {
    const intentions = await this.getPurchaseIntentionsByUser(userId);
    const classifications = await this.getUserSectorClassifications(userId);
    
    const segments: string[] = [];
    
    // Analyze purchase frequency
    if (intentions.length > 5) {
      segments.push("frequent_buyer");
    } else if (intentions.length > 2) {
      segments.push("moderate_buyer");
    } else {
      segments.push("occasional_buyer");
    }
    
    // Analyze sector preferences
    const sectorCounts: Record<string, number> = {};
    classifications.forEach(c => {
      if (c.sector) {
        sectorCounts[c.sector] = (sectorCounts[c.sector] || 0) + 1;
      }
    });
    
    const primarySector = Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    if (primarySector) {
      segments.push(`${primarySector}_buyer`);
    }
    
    return { segments, confidence: 80 };
  }

  async getTargetedCampaigns(userId: number): Promise<PopupCampaign[]> {
    const activeCampaigns = await this.getActivePopupCampaigns(userId);
    
    // Filter campaigns based on user behavior and preferences
    return activeCampaigns.filter(campaign => {
      return campaign.currentParticipants < campaign.targetParticipants;
    });
  }
}

export const storage = new DatabaseStorage();
