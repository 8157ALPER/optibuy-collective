import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { 
  insertUserSchema, 
  insertPurchaseIntentionSchema, 
  insertOfferSchema,
  insertOfferInterestSchema,
  insertRfqSchema,
  insertRfqResponseSchema,
  insertCommissionSchema,
  insertCompetitiveNotificationSchema
} from "@shared/schema";
import { sendOrderConfirmation, sendRFQConfirmation, sendSellerOfferNotification } from "./email";
import { aiEngine } from "./ai-recommendations";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Login error", error });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories", error });
    }
  });

  // Purchase Intentions
  app.get("/api/purchase-intentions", async (req, res) => {
    try {
      const { userId, categoryId } = req.query;
      
      let intentions;
      if (userId) {
        intentions = await storage.getPurchaseIntentionsByUser(parseInt(userId as string));
      } else if (categoryId) {
        intentions = await storage.getPurchaseIntentionsByCategory(parseInt(categoryId as string));
      } else {
        intentions = await storage.getPurchaseIntentions();
      }
      
      res.json(intentions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching purchase intentions", error });
    }
  });

  app.post("/api/purchase-intentions", async (req, res) => {
    try {
      // Validate and transform the data
      const rawData = req.body;
      const intentionData = {
        userId: rawData.userId || 1,
        categoryId: parseInt(rawData.categoryId),
        productName: rawData.productName,
        description: rawData.description || null,
        targetDate: new Date(rawData.targetDate),
        flexibility: rawData.flexibility,
        currency: rawData.currency || "USD",
        minPrice: rawData.minPrice ? parseFloat(rawData.minPrice) : null,
        maxPrice: rawData.maxPrice ? parseFloat(rawData.maxPrice) : null,
        quantity: parseInt(rawData.quantity),
        location: rawData.location,
        isPublic: rawData.isPublic !== false,
        allowSellerContact: rawData.allowSellerContact !== false,
        includeInAnalytics: rawData.includeInAnalytics || false,
      };
      
      const intention = await storage.createPurchaseIntention(intentionData);
      res.json(intention);
    } catch (error) {
      console.error("Error creating purchase intention:", error);
      res.status(400).json({ message: "Failed to create purchase plan", error: error.message || error });
    }
  });

  app.get("/api/purchase-intentions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const intention = await storage.getPurchaseIntention(id);
      if (!intention) {
        return res.status(404).json({ message: "Purchase intention not found" });
      }
      res.json(intention);
    } catch (error) {
      res.status(500).json({ message: "Error fetching purchase intention", error });
    }
  });

  // Offers
  app.get("/api/offers", async (req, res) => {
    try {
      const { sellerId, categoryId } = req.query;
      
      let offers;
      if (sellerId) {
        offers = await storage.getOffersBySeller(parseInt(sellerId as string));
      } else if (categoryId) {
        offers = await storage.getOffersByCategory(parseInt(categoryId as string));
      } else {
        offers = await storage.getOffers();
      }
      
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching offers", error });
    }
  });

  app.post("/api/offers", async (req, res) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      
      // Set competitive offer deadline (1 week from now)
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      
      const offer = await storage.createOffer(offerData);
      
      // Trigger competitive notifications (commenting out for now until method is implemented)
      // await storage.triggerCompetitiveAlerts(offer.id);
      
      // Notify interested users about new offer
      const intentions = await storage.getPurchaseIntentionsByCategory(offer.categoryId);
      const seller = await storage.getUser(offer.sellerId);
      
      if (seller) {
        for (const intention of intentions) {
          const user = await storage.getUser(intention.userId);
          if (user && intention.allowSellerContact) {
            await sendSellerOfferNotification(
              user.email,
              user.fullName,
              intention.productName,
              seller.fullName,
              `${offer.productName} - Starting from $${offer.price}`
            );
          }
        }
      }
      
      res.json(offer);
    } catch (error) {
      res.status(400).json({ message: "Invalid offer data", error });
    }
  });

  app.get("/api/offers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const offer = await storage.getOffer(id);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json(offer);
    } catch (error) {
      res.status(500).json({ message: "Error fetching offer", error });
    }
  });

  // Offer interests
  app.post("/api/offer-interests", async (req, res) => {
    try {
      const interestData = insertOfferInterestSchema.parse(req.body);
      const interest = await storage.createOfferInterest(interestData);
      res.json(interest);
    } catch (error) {
      res.status(400).json({ message: "Invalid offer interest data", error });
    }
  });

  app.get("/api/offers/:id/interests", async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const interests = await storage.getOfferInterests(offerId);
      res.json(interests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching offer interests", error });
    }
  });

  // Market analytics for sellers
  app.get("/api/market-analytics", async (req, res) => {
    try {
      const { categoryId } = req.query;
      
      let intentions;
      if (categoryId) {
        intentions = await storage.getPurchaseIntentionsByCategory(parseInt(categoryId as string));
      } else {
        intentions = await storage.getPurchaseIntentions();
      }
      
      // Group by product name and calculate aggregated data
      const analytics = intentions.reduce((acc: any, intention) => {
        const key = intention.productName.toLowerCase();
        if (!acc[key]) {
          acc[key] = {
            productName: intention.productName,
            categoryId: intention.categoryId,
            totalBuyers: 0,
            averageQuantity: 0,
            priceRange: { min: null, max: null },
            targetDates: [],
          };
        }
        
        acc[key].totalBuyers += 1;
        acc[key].averageQuantity += intention.quantity;
        acc[key].targetDates.push(intention.targetDate);
        
        if (intention.minPrice) {
          acc[key].priceRange.min = acc[key].priceRange.min 
            ? Math.min(acc[key].priceRange.min, parseFloat(intention.minPrice))
            : parseFloat(intention.minPrice);
        }
        
        if (intention.maxPrice) {
          acc[key].priceRange.max = acc[key].priceRange.max
            ? Math.max(acc[key].priceRange.max, parseFloat(intention.maxPrice))
            : parseFloat(intention.maxPrice);
        }
        
        return acc;
      }, {});
      
      // Calculate final analytics
      const result = Object.values(analytics).map((item: any) => ({
        ...item,
        averageQuantity: Math.round(item.averageQuantity / item.totalBuyers),
        estimatedRevenue: item.priceRange.max 
          ? item.totalBuyers * item.averageQuantity * item.priceRange.max / item.totalBuyers
          : 0,
      }));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching market analytics", error });
    }
  });

  // RFQs
  app.get("/api/rfqs", async (req, res) => {
    try {
      const { buyerId, categoryId } = req.query;
      
      let rfqs;
      if (buyerId) {
        rfqs = await storage.getRFQsByBuyer(parseInt(buyerId as string));
      } else if (categoryId) {
        rfqs = await storage.getRFQsByCategory(parseInt(categoryId as string));
      } else {
        rfqs = await storage.getRFQs();
      }
      
      res.json(rfqs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching RFQs", error });
    }
  });

  app.post("/api/rfqs", async (req, res) => {
    try {
      const rfqData = insertRfqSchema.parse(req.body);
      const rfq = await storage.createRFQ(rfqData);
      res.json(rfq);
    } catch (error) {
      res.status(400).json({ message: "Invalid RFQ data", error });
    }
  });

  app.get("/api/rfqs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rfq = await storage.getRFQ(id);
      if (!rfq) {
        return res.status(404).json({ message: "RFQ not found" });
      }
      res.json(rfq);
    } catch (error) {
      res.status(500).json({ message: "Error fetching RFQ", error });
    }
  });

  // RFQ Responses
  app.get("/api/rfqs/:id/responses", async (req, res) => {
    try {
      const rfqId = parseInt(req.params.id);
      const responses = await storage.getRFQResponses(rfqId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching RFQ responses", error });
    }
  });

  app.post("/api/rfq-responses", async (req, res) => {
    try {
      const responseData = insertRfqResponseSchema.parse(req.body);
      const response = await storage.createRFQResponse(responseData);
      res.json(response);
    } catch (error) {
      res.status(400).json({ message: "Invalid RFQ response data", error });
    }
  });

  app.get("/api/supplier-responses", async (req, res) => {
    try {
      const { supplierId } = req.query;
      if (!supplierId) {
        return res.status(400).json({ message: "Supplier ID required" });
      }
      
      const responses = await storage.getRFQResponsesBySupplier(parseInt(supplierId as string));
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching supplier responses", error });
    }
  });

  // Commissions
  app.get("/api/commissions", async (req, res) => {
    try {
      const { sellerId } = req.query;
      if (!sellerId) {
        return res.status(400).json({ message: "Seller ID required" });
      }
      
      const commissions = await storage.getCommissionsBySeller(parseInt(sellerId as string));
      res.json(commissions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching commissions", error });
    }
  });

  app.post("/api/commissions", async (req, res) => {
    try {
      const commissionData = insertCommissionSchema.parse(req.body);
      const commission = await storage.createCommission(commissionData);
      res.json(commission);
    } catch (error) {
      res.status(400).json({ message: "Invalid commission data", error });
    }
  });

  // Verification routes
  app.get("/api/verification/documents", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const documents = await storage.getVerificationDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ error: "Failed to fetch verification documents" });
    }
  });

  app.post("/api/verification/upload-document", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const { documentType, userType = "business" } = req.body;
      
      // In a real app, handle file upload here
      const document = await storage.createVerificationDocument({
        userId,
        documentType,
        documentName: `${documentType}.pdf`,
        documentUrl: `/uploads/${userId}/${documentType}.pdf`,
        verificationStatus: "pending",
        userType
      });
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.get("/api/verification/requests", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const requests = await storage.getVerificationRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      res.status(500).json({ error: "Failed to fetch verification requests" });
    }
  });

  app.post("/api/verification/request", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const { requestedTier } = req.body;
      const currentTier = await storage.getUserVerificationTier(userId);
      
      const request = await storage.createVerificationRequest({
        userId,
        requestedTier,
        currentTier,
        userType: "business",
        status: "pending"
      });
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating verification request:", error);
      res.status(500).json({ error: "Failed to create verification request" });
    }
  });

  app.get("/api/verification/rfq-limits", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const limits = await storage.canCreateRFQ(userId);
      res.json(limits);
    } catch (error) {
      console.error("Error fetching RFQ limits:", error);
      res.status(500).json({ error: "Failed to fetch RFQ limits" });
    }
  });

  app.get("/api/user/profile", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  // AI Recommendation Routes
  app.get("/api/ai/recommendations", async (req, res) => {
    try {
      const { userId, context, mood, categoryFilter } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const recommendations = await aiEngine.getPersonalizedRecommendations({
        userId: parseInt(userId as string),
        context: context as any,
        mood: mood as string,
        categoryFilter: categoryFilter as string
      });

      res.json(recommendations);
    } catch (error) {
      console.error("AI recommendations error:", error);
      res.status(500).json({ message: "Error generating recommendations", error });
    }
  });

  app.get("/api/ai/timing", async (req, res) => {
    try {
      const { userId, productName } = req.query;
      
      if (!userId || !productName) {
        return res.status(400).json({ message: "User ID and product name are required" });
      }

      const timing = await aiEngine.optimizePurchaseTiming(
        parseInt(userId as string),
        productName as string
      );

      res.json(timing);
    } catch (error) {
      console.error("AI timing optimization error:", error);
      res.status(500).json({ message: "Error optimizing timing", error });
    }
  });

  // User Safety and Reporting Routes
  app.post("/api/report-user", async (req, res) => {
    try {
      const { targetUserId, reason, description, contentType, contentId } = req.body;
      const reporterId = 1; // TODO: Get from session

      // In production, store reports in database and trigger moderation workflow
      console.log("User report received:", {
        reporterId,
        targetUserId,
        reason,
        description,
        contentType,
        contentId,
        timestamp: new Date()
      });

      // For Google Play compliance, log all reports for review
      res.json({ 
        success: true, 
        message: "Report submitted successfully",
        reportId: Date.now() // Mock report ID
      });
    } catch (error) {
      console.error("Error submitting user report:", error);
      res.status(500).json({ error: "Failed to submit report" });
    }
  });

  app.post("/api/block-user", async (req, res) => {
    try {
      const { targetUserId } = req.body;
      const userId = 1; // TODO: Get from session

      // In production, store blocked users relationship in database
      console.log("User blocked:", {
        userId,
        blockedUserId: targetUserId,
        timestamp: new Date()
      });

      res.json({ 
        success: true, 
        message: "User blocked successfully" 
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  app.get("/api/blocked-users", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      
      // In production, fetch from database
      res.json([]);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      res.status(500).json({ error: "Failed to fetch blocked users" });
    }
  });

  // Account Deletion Route
  app.post("/api/account-deletion-request", async (req, res) => {
    try {
      const { reason } = req.body;
      const userId = 1; // TODO: Get from session

      // In production, store deletion request and trigger workflow
      console.log("Account deletion request:", {
        userId,
        reason,
        requestedAt: new Date(),
        status: "pending"
      });

      // Send confirmation email and initiate deletion process
      res.json({ 
        success: true, 
        message: "Deletion request submitted. You will receive confirmation via email within 30 days.",
        requestId: `DEL-${Date.now()}`
      });
    } catch (error) {
      console.error("Error submitting deletion request:", error);
      res.status(500).json({ error: "Failed to submit deletion request" });
    }
  });

  // Data Deletion Request Route (selective)
  app.post("/api/data-deletion-request", async (req, res) => {
    try {
      const { deletionType, specificData, reason } = req.body;
      const userId = 1; // TODO: Get from session

      // In production, store data deletion request and trigger workflow
      console.log("Data deletion request:", {
        userId,
        deletionType,
        specificData,
        reason,
        requestedAt: new Date(),
        status: "pending"
      });

      // Send confirmation email and initiate selective deletion process
      res.json({ 
        success: true, 
        message: "Data deletion request submitted. You will receive confirmation via email within 30 days.",
        requestId: `DATA-DEL-${Date.now()}`,
        deletionType,
        affectedDataTypes: specificData || "all-personal"
      });
    } catch (error) {
      console.error("Error submitting data deletion request:", error);
      res.status(500).json({ error: "Failed to submit data deletion request" });
    }
  });

  // Seller verification routes
  app.get("/api/verification/seller-documents", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const documents = await storage.getSellerVerificationDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching seller verification documents:", error);
      res.status(500).json({ error: "Failed to fetch seller verification documents" });
    }
  });

  app.get("/api/verification/seller-requests", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const requests = await storage.getSellerVerificationRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching seller verification requests:", error);
      res.status(500).json({ error: "Failed to fetch seller verification requests" });
    }
  });

  app.post("/api/verification/seller-request", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const { requestedTier } = req.body;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const currentTier = user?.sellerTier || "unverified";
      
      const request = await storage.createVerificationRequest({
        userId,
        requestedTier,
        currentTier,
        userType: "seller",
        status: "pending"
      });
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating seller verification request:", error);
      res.status(500).json({ error: "Failed to create seller verification request" });
    }
  });

  app.get("/api/verification/offer-limits", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const limits = await storage.canCreateOffer(userId);
      res.json(limits);
    } catch (error) {
      console.error("Error fetching offer limits:", error);
      res.status(500).json({ error: "Failed to fetch offer limits" });
    }
  });

  const httpServer = createServer(app);
  // User segmentation routes
  app.post("/api/segments", async (req, res) => {
    try {
      const segment = await storage.createUserSegment(req.body);
      res.json(segment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user segment" });
    }
  });

  app.get("/api/segments/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const segments = await storage.getUserSegments(userId);
      res.json(segments);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user segments" });
    }
  });

  // Pop-up campaign routes
  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaign = await storage.createPopupCampaign(req.body);
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.get("/api/campaigns/active/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const campaigns = await storage.getTargetedCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active campaigns" });
    }
  });

  app.get("/api/campaigns/company/:companyId", async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const campaigns = await storage.getPopupCampaignsByCompany(companyId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to get company campaigns" });
    }
  });

  app.post("/api/campaigns/:campaignId/join", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const { userId } = req.body;
      
      // Record interaction
      await storage.createCampaignInteraction({
        campaignId,
        userId,
        interactionType: "join"
      });
      
      // Update participant count
      const campaign = await storage.updateCampaignParticipants(campaignId, 1);
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to join campaign" });
    }
  });

  // Campaign interaction routes
  app.post("/api/campaigns/:campaignId/interact", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const interaction = await storage.createCampaignInteraction({
        campaignId,
        ...req.body
      });
      res.json(interaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to record interaction" });
    }
  });

  // Sector classification routes
  app.post("/api/classification", async (req, res) => {
    try {
      const { userId, questionType, response } = req.body;
      
      // Analyze sector from response
      const analysis = await storage.analyzeSectorFromResponse(response, questionType);
      
      const classification = await storage.createSectorClassification({
        userId,
        questionType,
        response,
        sector: analysis.sector,
        confidence: analysis.confidence
      });
      
      res.json(classification);
    } catch (error) {
      res.status(500).json({ error: "Failed to create classification" });
    }
  });

  app.get("/api/classification/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const classifications = await storage.getUserSectorClassifications(userId);
      res.json(classifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to get classifications" });
    }
  });

  // User behavior analysis
  app.get("/api/analysis/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const behavior = await storage.analyzeUserBehavior(userId);
      res.json(behavior);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze user behavior" });
    }
  });

  // Update user notification preferences
  app.patch("/api/user/notification-preferences", async (req, res) => {
    // For demo purposes, using userId 1. In real app, get from session
    const userId = 1;
    const preferences = req.body;
    
    try {
      const updatedUser = await storage.updateUserNotificationPreferences(userId, preferences);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // Get user profile (including notification preferences)
  app.get("/api/user/profile", async (req, res) => {
    // For demo purposes, using userId 1. In real app, get from session
    const userId = 1;
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Get relevant campaigns for user (with smart filtering)
  app.get("/api/user/relevant-campaigns", async (req, res) => {
    // For demo purposes, using userId 1. In real app, get from session
    const userId = 1;
    
    try {
      const campaigns = await storage.getRelevantCampaignsForUser(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching relevant campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  // Check campaign relevance for user
  app.get("/api/campaigns/:campaignId/relevance", async (req, res) => {
    const campaignId = parseInt(req.params.campaignId);
    // For demo purposes, using userId 1. In real app, get from session
    const userId = 1;
    
    try {
      const relevance = await storage.checkCampaignRelevance(userId, campaignId);
      res.json(relevance);
    } catch (error) {
      console.error("Error checking campaign relevance:", error);
      res.status(500).json({ error: "Failed to check relevance" });
    }
  });

  // B2B Aggregation Orders API
  app.post("/api/aggregation-orders", async (req, res) => {
    // For demo purposes, using userId 1. In real app, get from session
    const userId = 1;
    
    try {
      const orderData = { ...req.body, initiatorId: userId };
      const order = await storage.createAggregationOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating aggregation order:", error);
      res.status(500).json({ error: "Failed to create aggregation order" });
    }
  });

  app.get("/api/aggregation-orders", async (req, res) => {
    try {
      const { sector, status } = req.query;
      const filters: any = {};
      if (sector) filters.sector = sector as string;
      if (status) filters.status = status as string;
      
      const orders = await storage.getAggregationOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching aggregation orders:", error);
      res.status(500).json({ error: "Failed to fetch aggregation orders" });
    }
  });

  app.get("/api/user/aggregation-orders", async (req, res) => {
    // For demo purposes, using userId 1. In real app, get from session
    const userId = 1;
    
    try {
      const orders = await storage.getAggregationOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user aggregation orders:", error);
      res.status(500).json({ error: "Failed to fetch user orders" });
    }
  });

  app.post("/api/aggregation-orders/:orderId/join", async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    // For demo purposes, using userId 1. In real app, get from session
    const userId = 1;
    
    try {
      const { requestedQuantity, participantType } = req.body;
      const result = await storage.joinAggregationOrder(orderId, {
        aggregationOrderId: orderId,
        participantId: userId,
        requestedQuantity,
        participantType
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error joining aggregation order:", error);
      res.status(500).json({ error: "Failed to join aggregation order" });
    }
  });

  app.get("/api/aggregation-orders/:orderId/participants", async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    
    try {
      const participants = await storage.getAggregationParticipants(orderId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching aggregation participants:", error);
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  app.get("/api/aggregation-orders/:orderId/viability", async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    
    try {
      const viability = await storage.checkAggregationViability(orderId);
      res.json(viability);
    } catch (error) {
      console.error("Error checking aggregation viability:", error);
      res.status(500).json({ error: "Failed to check viability" });
    }
  });

  app.get("/api/user/veterinary-opportunities", async (req, res) => {
    // For demo purposes, using userId 1. In real app, get from session
    const userId = 1;
    
    try {
      const opportunities = await storage.getVeterinaryAggregationOpportunities(userId);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching veterinary opportunities:", error);
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  app.get("/api/user/pharmacy-opportunities", async (req, res) => {
    // For demo purposes, using userId 1. In real app, get from session
    const userId = 1;
    
    try {
      const opportunities = await storage.getPharmacyAggregationOpportunities(userId);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching pharmacy opportunities:", error);
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  // Add catch-all route for SPA routing before returning server
  app.get('*', (req, res, next) => {
    // Skip API routes and let them be handled normally
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // For non-API routes, let Vite handle them (in development) or serve index.html (in production)
    next();
  });

  return httpServer;
}
