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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  productName: z.string().min(1, "Product name is required"),
  specifications: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  minQuantity: z.string().min(1, "Minimum quantity is required"),
  maxQuantity: z.string().optional(),
  volumeDiscount1Qty: z.string().optional(),
  volumeDiscount1Percent: z.string().optional(),
  volumeDiscount2Qty: z.string().optional(),
  volumeDiscount2Percent: z.string().optional(),
  validUntil: z.string().min(1, "Valid until date is required"),
  deliveryTimeline: z.string().min(1, "Delivery timeline is required"),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  additionalTerms: z.string().optional(),
});

export default function CreateOffer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [showLegalDisclaimer, setShowLegalDisclaimer] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: offerLimits } = useQuery({
    queryKey: ["/api/verification/offer-limits"],
  });

  const { data: marketAnalytics = [] } = useQuery({
    queryKey: ["/api/market-analytics"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      productName: "",
      specifications: "",
      price: "",
      minQuantity: "",
      maxQuantity: "",
      volumeDiscount1Qty: "",
      volumeDiscount1Percent: "",
      volumeDiscount2Qty: "",
      volumeDiscount2Percent: "",
      validUntil: "",
      deliveryTimeline: "1-2 weeks after order confirmation",
      paymentTerms: "Full payment upon order confirmation",
      additionalTerms: "",
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/offers", {
        ...data,
        sellerId: 1, // Mock seller ID
        categoryId: parseInt(data.categoryId),
        price: parseFloat(data.price),
        minQuantity: parseInt(data.minQuantity),
        maxQuantity: data.maxQuantity ? parseInt(data.maxQuantity) : null,
        volumeDiscount1Qty: data.volumeDiscount1Qty ? parseInt(data.volumeDiscount1Qty) : null,
        volumeDiscount1Percent: data.volumeDiscount1Percent ? parseFloat(data.volumeDiscount1Percent) : null,
        volumeDiscount2Qty: data.volumeDiscount2Qty ? parseInt(data.volumeDiscount2Qty) : null,
        volumeDiscount2Percent: data.volumeDiscount2Percent ? parseFloat(data.volumeDiscount2Percent) : null,
        validUntil: new Date(data.validUntil).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your offer has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setLocation("/seller-dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!data.legalDisclaimerAccepted) {
      toast({
        title: "Legal disclaimer required",
        description: "Please accept the legal disclaimer to continue.",
        variant: "destructive",
      });
      return;
    }
    createOfferMutation.mutate(data);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Mock upload - in real app, upload to storage service
      const newImages = Array.from(files).map((file, index) => 
        `/uploads/products/${Date.now()}-${index}-${file.name}`
      );
      setUploadedImages([...uploadedImages, ...newImages]);
      toast({
        title: "Images uploaded",
        description: `${files.length} image(s) uploaded successfully.`,
      });
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Mock upload - in real app, upload to storage service  
      const newDocs = Array.from(files).map((file, index) => 
        `/uploads/documents/${Date.now()}-${index}-${file.name}`
      );
      setUploadedDocuments([...uploadedDocuments, ...newDocs]);
      toast({
        title: "Documents uploaded",
        description: `${files.length} document(s) uploaded successfully.`,
      });
    }
  };

  // Sample opportunity for demo
  const sampleOpportunity = marketAnalytics[0] || {
    productName: "iPhone 15 Pro",
    totalBuyers: 1234,
    priceRange: { min: 999, max: 1199 },
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/seller-dashboard")}
            className="mr-4 p-0"
          >
            <ArrowLeft className="text-neutral-600" size={20} />
          </Button>
          <h2 className="text-xl font-medium">Create Offer</h2>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Opportunity summary */}
          <div className="bg-primary/5 rounded-xl p-4 mb-4">
            <h3 className="font-medium text-primary mb-2">Opportunity Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-neutral-600">Product</p>
                <p className="font-medium">{sampleOpportunity.productName}</p>
              </div>
              <div>
                <p className="text-neutral-600">Interested Buyers</p>
                <p className="font-medium">{sampleOpportunity.totalBuyers} people</p>
              </div>
              <div>
                <p className="text-neutral-600">Target Date</p>
                <p className="font-medium">March 15, 2024</p>
              </div>
              <div>
                <p className="text-neutral-600">Price Range</p>
                <p className="font-medium">
                  ${sampleOpportunity.priceRange?.min} - ${sampleOpportunity.priceRange?.max}
                </p>
              </div>
            </div>
          </div>
          
          {/* Offer form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Product details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                            {categories.map((category: any) => (
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="specifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specifications</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Storage, color options, warranty details..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing & Quantities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Offer Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600">$</span>
                            <Input type="number" placeholder="1099" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="minQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Volume discounts */}
                  <div>
                    <FormLabel>Volume Discounts</FormLabel>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name="volumeDiscount1Qty"
                          render={({ field }) => (
                            <FormControl>
                              <Input type="number" placeholder="100" className="text-sm" {...field} />
                            </FormControl>
                          )}
                        />
                        <span className="text-sm text-neutral-600">+ units:</span>
                        <FormField
                          control={form.control}
                          name="volumeDiscount1Percent"
                          render={({ field }) => (
                            <FormControl>
                              <Input type="number" placeholder="5" className="w-16 text-sm" {...field} />
                            </FormControl>
                          )}
                        />
                        <span className="text-sm text-neutral-600">% off</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer Valid Until</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deliveryTimeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Timeline</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-2 weeks after order confirmation">1-2 weeks after order confirmation</SelectItem>
                            <SelectItem value="2-4 weeks after order confirmation">2-4 weeks after order confirmation</SelectItem>
                            <SelectItem value="1-2 months after order confirmation">1-2 months after order confirmation</SelectItem>
                            <SelectItem value="custom">Custom timeline (specify below)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full payment upon order confirmation">Full payment upon order confirmation</SelectItem>
                            <SelectItem value="50% upfront, 50% on delivery">50% upfront, 50% on delivery</SelectItem>
                            <SelectItem value="30% upfront, 70% on delivery">30% upfront, 70% on delivery</SelectItem>
                            <SelectItem value="custom">Custom terms (specify below)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="additionalTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Terms</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Warranty, return policy, shipping details..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Product Visuals & Documentation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Upload className="mr-2" size={20} />
                    Product Visuals & Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Images */}
                  <div>
                    <Label htmlFor="product-images" className="text-sm font-medium">Product Images</Label>
                    <div className="mt-1">
                      <input
                        id="product-images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Label 
                        htmlFor="product-images"
                        className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="mx-auto mb-2 text-neutral-500" size={24} />
                          <p className="text-sm text-neutral-600">Click to upload product images</p>
                          <p className="text-xs text-neutral-500">PNG, JPG up to 10MB each</p>
                        </div>
                      </Label>
                    </div>
                    {uploadedImages.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-neutral-600 mb-1">{uploadedImages.length} image(s) uploaded:</p>
                        <div className="flex flex-wrap gap-1">
                          {uploadedImages.map((img, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              Image {index + 1}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Documents */}
                  <div>
                    <Label htmlFor="product-documents" className="text-sm font-medium">Product Specifications & Manuals</Label>
                    <div className="mt-1">
                      <input
                        id="product-documents"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        multiple
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                      <Label 
                        htmlFor="product-documents"
                        className="cursor-pointer flex items-center justify-center w-full h-24 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="mx-auto mb-1 text-neutral-500" size={20} />
                          <p className="text-sm text-neutral-600">Upload specs & manuals</p>
                          <p className="text-xs text-neutral-500">PDF, DOC up to 5MB each</p>
                        </div>
                      </Label>
                    </div>
                    {uploadedDocuments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-neutral-600 mb-1">{uploadedDocuments.length} document(s) uploaded:</p>
                        <div className="flex flex-wrap gap-1">
                          {uploadedDocuments.map((doc, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              Doc {index + 1}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seller Website URL */}
                  <FormField
                    control={form.control}
                    name="sellerWebsiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <ExternalLink className="mr-1" size={16} />
                          Seller Website (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://yourwebsite.com/product-details" 
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-xs text-neutral-600">
                          Link to additional product information on your website
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Price Commitment & Legal Terms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <ShieldCheck className="mr-2" size={20} />
                    Price Commitment & Legal Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceCommitmentDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Commitment Period</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="14">14 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="60">60 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-neutral-600">
                            Period you commit to honor this price
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="compensationPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compensation Rate</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="5">5% of order value</SelectItem>
                              <SelectItem value="10">10% of order value</SelectItem>
                              <SelectItem value="15">15% of order value</SelectItem>
                              <SelectItem value="20">20% of order value</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-neutral-600">
                            Compensation if you don't honor OptiBuy price
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-warning/10 p-3 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="text-warning mr-2 mt-0.5" size={16} />
                      <div>
                        <p className="text-sm font-medium text-warning">Price Commitment Agreement</p>
                        <p className="text-xs text-neutral-700 mt-1">
                          You commit to honor the declared OptiBuy price for the selected period. If you fail to provide the product at this price, you agree to compensate buyers {form.watch("compensationPercentage")}% of their order value as per OptiBuy's buyer protection policy.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Legal Disclaimers */}
                  <div className="space-y-3">
                    <div className="bg-neutral-50 p-3 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="text-neutral-600 mr-2 mt-0.5" size={16} />
                        <div>
                          <p className="text-sm font-medium text-neutral-800">Product Responsibility Disclaimer</p>
                          <p className="text-xs text-neutral-700 mt-1">
                            OptiBuy is not responsible for the actual properties, quality, or visuals of products sold through the platform. Sellers are solely responsible for product descriptions, specifications, and ensuring deliveries match what is advertised. Any disputes regarding product quality should be resolved directly between buyers and sellers.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="legalDisclaimerAccepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              I accept the legal terms and disclaimers
                            </FormLabel>
                            <p className="text-xs text-neutral-600">
                              I understand OptiBuy's role as a platform facilitator and accept full responsibility for my product listings, price commitments, and buyer compensation obligations.
                            </p>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
        
        {/* Submit */}
        <div className="p-4 bg-white border-t">
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createOfferMutation.isPending || (offerLimits && !offerLimits.canCreate) || !form.watch("legalDisclaimerAccepted")}
            className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-lg font-medium text-lg transition-colors disabled:opacity-50"
          >
            {createOfferMutation.isPending ? "Submitting..." : 
             (offerLimits && !offerLimits.canCreate) ? "Offer Limit Reached" : 
             !form.watch("legalDisclaimerAccepted") ? "Accept Legal Terms to Continue" : "Submit Offer"}
          </Button>
          <div className="text-xs text-neutral-600 text-center mt-2 space-y-1">
            <p>2% commission will apply on successful sales</p>
            <p>Price commitment period: {form.watch("priceCommitmentDays")} days</p>
            <p>Compensation rate: {form.watch("compensationPercentage")}% if price not honored</p>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
