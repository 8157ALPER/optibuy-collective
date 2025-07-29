import OpenAI from "openai";
import { db } from "./db";
import { users, purchaseIntentions, offers, categories } from "@shared/schema";
import { eq, desc, and, gte } from "drizzle-orm";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UserProfile {
  id: number;
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    purchaseFrequency: string;
    location: string;
  };
  purchaseHistory: Array<{
    productName: string;
    category: string;
    price: number;
    date: Date;
  }>;
  currentIntentions: Array<{
    productName: string;
    category: string;
    targetPrice: number;
    targetDate: Date;
  }>;
}

interface RecommendationRequest {
  userId: number;
  context?: "dashboard" | "browsing" | "category" | "mood";
  mood?: string;
  categoryFilter?: string;
}

interface ProductRecommendation {
  productName: string;
  category: string;
  reasoning: string;
  confidence: number;
  estimatedPrice: number;
  groupBuyingPotential: number;
  urgency: "low" | "medium" | "high";
  tags: string[];
}

export class AIRecommendationEngine {
  async getUserProfile(userId: number): Promise<UserProfile> {
    // Get user basic info
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    // Get user's purchase intentions (as purchase history proxy)
    const intentions = await db
      .select({
        productName: purchaseIntentions.productName,
        categoryId: purchaseIntentions.categoryId,
        maxPrice: purchaseIntentions.maxPrice,
        targetDate: purchaseIntentions.targetDate,
        createdAt: purchaseIntentions.createdAt
      })
      .from(purchaseIntentions)
      .where(eq(purchaseIntentions.userId, userId))
      .orderBy(desc(purchaseIntentions.createdAt))
      .limit(20);

    // Get categories for mapping
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

    // Build user profile
    const profile: UserProfile = {
      id: userId,
      preferences: {
        categories: [...new Set(intentions.map(i => categoryMap.get(i.categoryId) || "Unknown"))],
        priceRange: {
          min: Math.min(...intentions.map(i => Number(i.maxPrice) || 0)),
          max: Math.max(...intentions.map(i => Number(i.maxPrice) || 1000))
        },
        purchaseFrequency: this.calculatePurchaseFrequency(intentions),
        location: user.location || "Unknown"
      },
      purchaseHistory: intentions.map(i => ({
        productName: i.productName,
        category: categoryMap.get(i.categoryId) || "Unknown",
        price: Number(i.maxPrice) || 0,
        date: i.createdAt
      })),
      currentIntentions: intentions
        .filter(i => new Date(i.targetDate) > new Date())
        .map(i => ({
          productName: i.productName,
          category: categoryMap.get(i.categoryId) || "Unknown",
          targetPrice: Number(i.maxPrice) || 0,
          targetDate: i.targetDate
        }))
    };

    return profile;
  }

  private calculatePurchaseFrequency(intentions: any[]): string {
    if (intentions.length === 0) return "new_user";
    
    const monthsActive = Math.max(1, 
      (Date.now() - new Date(intentions[intentions.length - 1].createdAt).getTime()) 
      / (1000 * 60 * 60 * 24 * 30)
    );
    
    const frequency = intentions.length / monthsActive;
    
    if (frequency >= 2) return "frequent";
    if (frequency >= 1) return "regular"; 
    return "occasional";
  }

  async getPersonalizedRecommendations(request: RecommendationRequest): Promise<ProductRecommendation[]> {
    try {
      const userProfile = await getUserProfile(request.userId);
      
      // Get market data for context
      const marketOffers = await db
        .select({
          productName: offers.productName,
          categoryId: offers.categoryId,
          price: offers.price,
          interestedBuyers: offers.interestedBuyers
        })
        .from(offers)
        .where(eq(offers.status, "active"))
        .limit(50);

      const categories = await db.select().from(categories);
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));

      // Prepare AI prompt
      const prompt = this.buildRecommendationPrompt(userProfile, marketOffers, categoryMap, request);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI recommendation engine for OptiBuy, a collective purchasing platform. Analyze user behavior and market trends to suggest personalized product recommendations that maximize group buying potential and user satisfaction."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.recommendations || [];

    } catch (error) {
      console.error("AI recommendation error:", error);
      // Fallback to rule-based recommendations
      return this.getFallbackRecommendations(request);
    }
  }

  private buildRecommendationPrompt(
    userProfile: UserProfile, 
    marketOffers: any[], 
    categoryMap: Map<number, string>,
    request: RecommendationRequest
  ): string {
    const contextualInfo = this.getContextualPrompt(request);
    
    return `
Analyze this user profile and market data to provide personalized product recommendations:

USER PROFILE:
- ID: ${userProfile.id}
- Preferred categories: ${userProfile.preferences.categories.join(", ")}
- Price range: $${userProfile.preferences.priceRange.min} - $${userProfile.preferences.priceRange.max}
- Purchase frequency: ${userProfile.preferences.purchaseFrequency}
- Location: ${userProfile.preferences.location}

RECENT PURCHASE HISTORY:
${userProfile.purchaseHistory.slice(0, 5).map(p => 
  `- ${p.productName} (${p.category}) - $${p.price}`
).join("\n")}

CURRENT INTENTIONS:
${userProfile.currentIntentions.map(i => 
  `- ${i.productName} (${i.category}) - Target: $${i.targetPrice} by ${i.targetDate.toDateString()}`
).join("\n")}

MARKET OFFERS:
${marketOffers.slice(0, 10).map(o => 
  `- ${o.productName} (${categoryMap.get(o.categoryId)}) - $${o.price} (${o.interestedBuyers} buyers interested)`
).join("\n")}

CONTEXT: ${contextualInfo}

Provide 3-5 product recommendations in JSON format:
{
  "recommendations": [
    {
      "productName": "string",
      "category": "string", 
      "reasoning": "why this product fits the user",
      "confidence": 0.85,
      "estimatedPrice": 299,
      "groupBuyingPotential": 0.75,
      "urgency": "medium",
      "tags": ["trending", "price-drop", "group-discount"]
    }
  ]
}

Focus on:
1. User's demonstrated preferences and patterns
2. Complementary products to current intentions
3. Group buying opportunities with high participation potential
4. Seasonal trends and timing optimization
5. Price optimization through collective purchasing
`;
  }

  private getContextualPrompt(request: RecommendationRequest): string {
    switch (request.context) {
      case "dashboard":
        return "User is browsing their main dashboard - suggest trending and timely recommendations";
      case "browsing": 
        return "User is actively browsing products - suggest related and alternative products";
      case "category":
        return `User is viewing ${request.categoryFilter} category - suggest specific products in this category`;
      case "mood":
        return `User's current mood: ${request.mood} - adapt recommendations to their emotional state`;
      default:
        return "General recommendation context";
    }
  }

  private async getFallbackRecommendations(request: RecommendationRequest): Promise<ProductRecommendation[]> {
    // Simple rule-based fallback when AI is not available
    return [
      {
        productName: "iPhone 15 Pro Max",
        category: "Electronics",
        reasoning: "Popular choice with strong group buying potential",
        confidence: 0.7,
        estimatedPrice: 1199,
        groupBuyingPotential: 0.8,
        urgency: "medium",
        tags: ["popular", "electronics", "group-discount"]
      },
      {
        productName: "Digital Stethoscope",
        category: "Medical Equipment", 
        reasoning: "High demand in B2B veterinary market",
        confidence: 0.75,
        estimatedPrice: 299,
        groupBuyingPotential: 0.85,
        urgency: "high",
        tags: ["professional", "b2b", "medical"]
      }
    ];
  }

  async optimizePurchaseTiming(userId: number, productName: string): Promise<{
    recommendedDate: Date;
    reasoning: string;
    priceOptimization: number;
    groupFormationProbability: number;
  }> {
    try {
      const userProfile = await this.getUserProfile(userId);
      
      const prompt = `
Analyze optimal purchase timing for "${productName}" based on:
- User location: ${userProfile.preferences.location}
- User purchase patterns: ${userProfile.preferences.purchaseFrequency}
- Current season and market trends
- Group buying formation patterns

Provide timing optimization in JSON format:
{
  "recommendedDate": "2025-03-15",
  "reasoning": "explanation of timing choice",
  "priceOptimization": 0.15,
  "groupFormationProbability": 0.82
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.5
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Timing optimization error:", error);
      return {
        recommendedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        reasoning: "Standard 30-day optimization period for group formation",
        priceOptimization: 0.1,
        groupFormationProbability: 0.6
      };
    }
  }
}

// Fix function scope issue
async function getUserProfile(userId: number): Promise<UserProfile> {
  // Get user basic info
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new Error("User not found");

  // Get user's purchase intentions (as purchase history proxy)
  const intentions = await db
    .select({
      productName: purchaseIntentions.productName,
      categoryId: purchaseIntentions.categoryId,
      maxPrice: purchaseIntentions.maxPrice,
      targetDate: purchaseIntentions.targetDate,
      createdAt: purchaseIntentions.createdAt
    })
    .from(purchaseIntentions)
    .where(eq(purchaseIntentions.userId, userId))
    .orderBy(desc(purchaseIntentions.createdAt))
    .limit(20);

  // Get categories for mapping
  const allCategories = await db.select().from(categories);
  const categoryMap = new Map(allCategories.map(c => [c.id, c.name]));

  // Build user profile
  const profile: UserProfile = {
    id: userId,
    preferences: {
      categories: [...new Set(intentions.map(i => categoryMap.get(i.categoryId) || "Unknown"))],
      priceRange: {
        min: Math.min(...intentions.map(i => Number(i.maxPrice) || 0)),
        max: Math.max(...intentions.map(i => Number(i.maxPrice) || 1000))
      },
      purchaseFrequency: calculatePurchaseFrequency(intentions),
      location: user.location || "Unknown"
    },
    purchaseHistory: intentions.map(i => ({
      productName: i.productName,
      category: categoryMap.get(i.categoryId) || "Unknown",
      price: Number(i.maxPrice) || 0,
      date: i.createdAt
    })),
    currentIntentions: intentions
      .filter(i => new Date(i.targetDate) > new Date())
      .map(i => ({
        productName: i.productName,
        category: categoryMap.get(i.categoryId) || "Unknown",
        targetPrice: Number(i.maxPrice) || 0,
        targetDate: i.targetDate
      }))
  };

  return profile;
}

function calculatePurchaseFrequency(intentions: any[]): string {
  if (intentions.length === 0) return "new_user";
  
  const monthsActive = Math.max(1, 
    (Date.now() - new Date(intentions[intentions.length - 1].createdAt).getTime()) 
    / (1000 * 60 * 60 * 24 * 30)
  );
  
  const frequency = intentions.length / monthsActive;
  
  if (frequency >= 2) return "frequent";
  if (frequency >= 1) return "regular"; 
  return "occasional";
}

export const aiEngine = new AIRecommendationEngine();
