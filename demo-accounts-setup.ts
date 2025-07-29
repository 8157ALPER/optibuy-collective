// Demo accounts setup for Google Play Console reviewers
import { db } from "./db";
import { users, categories, purchaseIntentions, offers } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function setupDemoAccounts() {
  try {
    console.log("Setting up demo accounts for Google Play reviewers...");

    // Check if demo accounts already exist
    const existingConsumer = await db.select().from(users).where(eq(users.email, "reviewer.consumer@optibuy.demo"));
    if (existingConsumer.length > 0) {
      console.log("Demo accounts already exist");
      return;
    }

    // Create demo accounts
    const demoAccounts = [
      {
        username: "reviewer_consumer",
        email: "reviewer.consumer@optibuy.demo",
        password: "GooglePlay2025!",
        fullName: "Consumer Reviewer",
        userType: "consumer" as const,
        location: "Istanbul, Turkey"
      },
      {
        username: "reviewer_business",
        email: "reviewer.business@optibuy.demo", 
        password: "GooglePlay2025!",
        fullName: "Business Reviewer",
        userType: "business" as const,
        location: "Istanbul, Turkey",
        businessName: "Demo Veterinary Clinic"
      },
      {
        username: "reviewer_seller",
        email: "reviewer.seller@optibuy.demo",
        password: "GooglePlay2025!",
        fullName: "Seller Reviewer",
        userType: "seller" as const,
        location: "Istanbul, Turkey",
        businessName: "Demo Medical Supplies Co."
      }
    ];

    // Insert demo users
    const createdUsers = [];
    for (const account of demoAccounts) {
      const [user] = await db.insert(users).values(account).returning();
      createdUsers.push(user);
      console.log(`Created demo account: ${account.email}`);
    }

    // Create sample categories if they don't exist
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
      const sampleCategories = [
        { name: "Electronics", description: "Consumer electronics and devices" },
        { name: "Medical Equipment", description: "Professional medical devices and supplies" },
        { name: "Office Supplies", description: "Business office equipment and materials" },
        { name: "Automotive", description: "Vehicle parts and accessories" },
        { name: "Veterinary Supplies", description: "Animal healthcare and medical supplies" }
      ];

      for (const category of sampleCategories) {
        await db.insert(categories).values(category);
      }
      console.log("Created sample categories");
    }

    // Create sample purchase intentions for consumer account
    const consumerUser = createdUsers.find(u => u.userType === "consumer");
    const businessUser = createdUsers.find(u => u.userType === "business");
    
    if (consumerUser) {
      const categoryList = await db.select().from(categories);
      const electronicsCategory = categoryList.find(c => c.name === "Electronics");
      const medicalCategory = categoryList.find(c => c.name === "Medical Equipment");

      if (electronicsCategory) {
        await db.insert(purchaseIntentions).values({
          userId: consumerUser.id,
          categoryId: electronicsCategory.id,
          productName: "iPhone 15 Pro Max",
          description: "Latest iPhone model for personal use",
          targetDate: new Date("2025-03-15"),
          flexibility: "week",
          currency: "USD",
          minPrice: 999,
          maxPrice: 1199,
          quantity: 1,
          location: "Istanbul, Turkey",
          isPublic: true,
          allowSellerContact: true,
          includeInAnalytics: false
        });
      }

      if (medicalCategory && businessUser) {
        await db.insert(purchaseIntentions).values({
          userId: businessUser.id,
          categoryId: medicalCategory.id,
          productName: "Digital Stethoscope",
          description: "Professional grade digital stethoscope for veterinary clinic",
          targetDate: new Date("2025-04-01"),
          flexibility: "month",
          currency: "USD", 
          minPrice: 200,
          maxPrice: 400,
          quantity: 5,
          location: "Istanbul, Turkey",
          isPublic: true,
          allowSellerContact: true,
          includeInAnalytics: true
        });
      }
      console.log("Created sample purchase intentions");
    }

    // Create sample offers for seller account
    const sellerUser = createdUsers.find(u => u.userType === "seller");
    if (sellerUser) {
      const categoryList = await db.select().from(categories);
      const electronicsCategory = categoryList.find(c => c.name === "Electronics");
      
      if (electronicsCategory) {
        await db.insert(offers).values({
          sellerId: sellerUser.id,
          categoryId: electronicsCategory.id,
          productName: "MacBook Air M3",
          specifications: "M3 chip, 8GB RAM, 256GB SSD",
          price: 1299,
          minQuantity: 1,
          maxQuantity: 50,
          volumeDiscount1Qty: 5,
          volumeDiscount1Percent: 5,
          volumeDiscount2Qty: 10,
          volumeDiscount2Percent: 10,
          validUntil: new Date("2025-06-30"),
          deliveryTimeline: "5-7 business days",
          paymentTerms: "Net 30",
          additionalTerms: "Bulk orders welcome, educational discounts available"
        });
        console.log("Created sample seller offer");
      }
    }

    console.log("Demo accounts setup completed successfully!");
    
  } catch (error) {
    console.error("Error setting up demo accounts:", error);
  }
}

// Auto-run setup on server start
setupDemoAccounts();
