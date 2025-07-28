import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import MobileContainer from "@/components/mobile-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FormFieldWithHelp } from "@/components/help-tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import ShareIntention from "@/components/share-intention";

const formSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  productName: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  targetDate: z.string().min(1, "Target date is required"),
  flexibility: z.string().min(1, "Flexibility is required"),
  currency: z.string().min(1, "Currency is required"),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  location: z.string().min(1, "Location is required"),
  isPublic: z.boolean().default(true),
  allowSellerContact: z.boolean().default(true),
  includeInAnalytics: z.boolean().default(false),
});

export default function CreatePurchaseIntention() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      productName: "",
      description: "",
      targetDate: "",
      flexibility: "",
      currency: "USD",
      minPrice: "",
      maxPrice: "",
      quantity: "1",
      location: "",
      isPublic: true,
      allowSellerContact: true,
      includeInAnalytics: false,
    },
  });

  const createIntentionMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Form data received:", data);
      
      const payload = {
        userId: 1,
        categoryId: data.categoryId,
        productName: data.productName,
        description: data.description || null,
        targetDate: data.targetDate,
        flexibility: data.flexibility,
        currency: data.currency || "USD",
        minPrice: data.minPrice || null,
        maxPrice: data.maxPrice || null,
        quantity: data.quantity,
        location: data.location,
        isPublic: data.isPublic,
        allowSellerContact: data.allowSellerContact,
        includeInAnalytics: data.includeInAnalytics,
      };
      
      console.log("=== API REQUEST ===");
      console.log("Sending payload:", payload);
      console.log("Payload keys:", Object.keys(payload));
      console.log("Payload values:", Object.values(payload));
      
      try {
        console.log("Making API request to:", "/api/purchase-intentions");
        const response = await apiRequest("POST", "/api/purchase-intentions", payload);
        
        console.log("=== API RESPONSE ===");
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        console.log("Response headers:", response.headers);
        
        const data = await response.json();
        console.log("Response data:", data);
        return data;
      } catch (error) {
        console.error("=== API REQUEST FAILED ===");
        console.error("Error type:", typeof error);
        console.error("Error constructor:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your purchase plan has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-intentions"] });
      setLocation("/consumer-dashboard");
    },
    onError: (error: any) => {
      console.error("=== CREATION ERROR ===");
      console.error("Full error object:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      let errorMessage = "Failed to create purchase plan. Please try again.";
      if (error.message && error.message.includes("400")) {
        errorMessage = "Please check all required fields are filled correctly.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("=== FORM SUBMISSION ===");
    console.log("Form submission data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    
    // Check if all required fields are present
    const requiredFields = ['categoryId', 'productName', 'targetDate', 'flexibility', 'location'] as const;
    const missingFields = requiredFields.filter(field => !data[field as keyof typeof data]);
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      toast({
        title: "Validation Error",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    console.log("All validations passed, submitting...");
    createIntentionMutation.mutate(data);
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/consumer-dashboard")}
              className="mr-4 p-0"
            >
              <ArrowLeft className="text-neutral-600 dark:text-neutral-300" size={20} />
            </Button>
            <h2 className="text-xl font-medium dark:text-white">Create Purchase Plan</h2>
          </div>
          <ThemeToggle />
        </div>
        
        {/* Form content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Product details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What do you want to buy?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(categories as any[]).map((category: any) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., iPhone 15 Pro, Tesla Model 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Any specific requirements or preferences..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Timing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">When do you want to buy?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="targetDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldWithHelp
                          label="Target Purchase Date"
                          helpContent="This is when you need the product. OptiBuy will aggregate similar requests and negotiate better prices before this deadline."
                          helpTitle="Purchase Deadline"
                          required
                        >
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormFieldWithHelp>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="flexibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flexibility</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="How flexible are you?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-2 weeks">I can wait 1-2 weeks for better deals</SelectItem>
                            <SelectItem value="1 month">I can wait 1 month for better deals</SelectItem>
                            <SelectItem value="2-3 months">I can wait 2-3 months for better deals</SelectItem>
                            <SelectItem value="fixed">Date is fixed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Budget */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Budget Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "USD"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="TRY">TRY (₺)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Expected Price Range (Optional)</FormLabel>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <FormField
                        control={form.control}
                        name="minPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input type="number" placeholder="Min" {...field} className="pl-8" />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 text-sm">
                                  {form.watch("currency") === "TRY" ? "₺" : 
                                   form.watch("currency") === "EUR" ? "€" : 
                                   form.watch("currency") === "GBP" ? "£" : 
                                   form.watch("currency") === "JPY" ? "¥" : "$"}
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input type="number" placeholder="Max" {...field} className="pl-8" />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 text-sm">
                                  {form.watch("currency") === "TRY" ? "₺" : 
                                   form.watch("currency") === "EUR" ? "€" : 
                                   form.watch("currency") === "GBP" ? "£" : 
                                   form.watch("currency") === "JPY" ? "¥" : "$"}
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Area</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Privacy settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm">Show my purchase intention to other buyers</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="allowSellerContact"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm">Allow sellers to contact me with offers</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="includeInAnalytics"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm">Include my data in market analytics</FormLabel>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
        
        {/* Submit button */}
        <div className="p-4 bg-white border-t">
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createIntentionMutation.isPending}
            className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg font-medium text-lg transition-colors"
          >
            {createIntentionMutation.isPending ? "Creating..." : "Create Purchase Plan"}
          </Button>
          <p className="text-xs text-neutral-600 text-center mt-2">
            You'll be notified when sellers make offers or when group size reaches threshold
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}
