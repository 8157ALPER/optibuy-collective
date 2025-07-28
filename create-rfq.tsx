import { ArrowLeft, FileText, Calendar, MapPin } from "lucide-react";
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
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  specifications: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  targetPrice: z.string().optional(),
  deliveryLocation: z.string().min(1, "Delivery location is required"),
  requiredDeliveryDate: z.string().min(1, "Required delivery date is required"),
  submissionDeadline: z.string().min(1, "Submission deadline is required"),
});

export default function CreateRFQ() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const businessCategories = categories.filter((cat: any) => 
    ["Raw Materials", "Industrial Equipment", "Office Supplies", "Manufacturing"].includes(cat.name)
  );

  const { data: rfqLimits } = useQuery({
    queryKey: ["/api/verification/rfq-limits"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      title: "",
      description: "",
      specifications: "",
      quantity: "",
      targetPrice: "",
      deliveryLocation: "",
      requiredDeliveryDate: "",
      submissionDeadline: "",
    },
  });

  const createRfqMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/rfqs", {
        ...data,
        buyerId: 1, // Mock business user ID
        categoryId: parseInt(data.categoryId),
        quantity: parseInt(data.quantity),
        targetPrice: data.targetPrice ? parseFloat(data.targetPrice) : null,
        requiredDeliveryDate: new Date(data.requiredDeliveryDate).toISOString(),
        submissionDeadline: new Date(data.submissionDeadline).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your RFQ has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rfqs"] });
      setLocation("/business-dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create RFQ. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createRfqMutation.mutate(data);
  };

  return (
    <MobileContainer>
      <div className="h-screen flex flex-col bg-neutral-50">
        <div className="bg-white shadow-sm px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/business-dashboard")}
            className="mr-4 p-0"
          >
            <ArrowLeft className="text-neutral-600" size={20} />
          </Button>
          <h2 className="text-xl font-medium">Create RFQ</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* RFQ Limits Notice */}
          {rfqLimits && (
            <Card className="bg-neutral-50 border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">RFQ Usage</p>
                    <p className="text-xs text-neutral-600">
                      {rfqLimits.used} / {rfqLimits.limit === -1 ? "Unlimited" : rfqLimits.limit} this month
                    </p>
                  </div>
                  {!rfqLimits.canCreate && (
                    <Badge variant="destructive" className="text-xs">
                      Limit Reached
                    </Badge>
                  )}
                </div>
                {rfqLimits.limit !== -1 && (
                  <div className="mt-2">
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${Math.min((rfqLimits.used / rfqLimits.limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {!rfqLimits.canCreate && (
                  <p className="text-xs text-destructive mt-2">
                    <span 
                      className="underline cursor-pointer"
                      onClick={() => setLocation("/verification")}
                    >
                      Upgrade your verification
                    </span> to increase limits
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="mr-2" size={20} />
                    RFQ Details
                  </CardTitle>
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
                            {businessCategories.map((category: any) => (
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFQ Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Industrial Steel Sheets - 500 Tonnes" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Detailed description of your requirements..." {...field} />
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
                        <FormLabel>Technical Specifications</FormLabel>
                        <FormControl>
                          <Textarea rows={4} placeholder="Grade, dimensions, quality standards, certifications..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quantity & Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="targetPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Price (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600">$</span>
                            <Input type="number" placeholder="2500" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="mr-2" size={20} />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="submissionDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quote Submission Deadline</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requiredDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Delivery Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="mr-2" size={20} />
                    Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="deliveryLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Factory address, city, state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
        
        <div className="p-4 bg-white border-t">
          <div className="bg-warning/10 p-3 rounded-lg mb-4">
            <p className="text-xs text-warning font-medium mb-1">Confidentiality Notice:</p>
            <p className="text-xs text-neutral-600">
              Avoid sharing sensitive company information. OptiBuy is not responsible for confidentiality of shared data.{" "}
              <span 
                className="text-primary underline cursor-pointer"
                onClick={() => setLocation("/legal")}
              >
                View full disclaimer
              </span>
            </p>
          </div>
          
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={createRfqMutation.isPending || (rfqLimits && !rfqLimits.canCreate)}
            className="w-full bg-warning hover:bg-warning/90 text-white py-4 rounded-lg font-medium text-lg transition-colors disabled:opacity-50"
          >
            {createRfqMutation.isPending ? "Publishing..." : 
             (rfqLimits && !rfqLimits.canCreate) ? "RFQ Limit Reached" : "Publish RFQ"}
          </Button>
          <p className="text-xs text-neutral-600 text-center mt-2">
            Suppliers will be notified and can submit quotes until the deadline
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}
