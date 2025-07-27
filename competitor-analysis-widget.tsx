import { useState, useEffect } from "react";
import { Target, TrendingUp, TrendingDown, Users, DollarSign, Zap, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CompetitorData {
  id: number;
  name: string;
  company: string;
  avgPrice: number;
  priceChange: number;
  marketShare: number;
  responseTime: string;
  winRate: number;
  dealsClosed: number;
  threatLevel: "low" | "medium" | "high" | "critical";
  recentActivity: string;
}

interface PriceHistory {
  time: string;
  yourPrice: number;
  competitorAvg: number;
  marketLow: number;
}

interface CompetitorAnalysisWidgetProps {
  category?: string;
  currentUserId?: number;
}

export default function CompetitorAnalysisWidget({ 
  category = "Electronics", 
  currentUserId = 1 
}: CompetitorAnalysisWidgetProps) {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<"price" | "share" | "response">("price");

  useEffect(() => {
    // Generate competitor data
    const competitorData: CompetitorData[] = [
      {
        id: 1,
        name: "TechStore Pro",
        company: "TechStore Electronics",
        avgPrice: 999,
        priceChange: -12,
        marketShare: 28,
        responseTime: "2 min",
        winRate: 73,
        dealsClosed: 156,
        threatLevel: "critical",
        recentActivity: "Dropped iPhone price by 15% - 2 hours ago"
      },
      {
        id: 2,
        name: "MegaTech",
        company: "MegaTech Solutions",
        avgPrice: 1049,
        priceChange: -8,
        marketShare: 22,
        responseTime: "5 min",
        winRate: 68,
        dealsClosed: 134,
        threatLevel: "high",
        recentActivity: "Posted competitive MacBook offer - 4 hours ago"
      },
      {
        id: 3,
        name: "ElectroWorld",
        company: "ElectroWorld Inc",
        avgPrice: 1079,
        priceChange: 3,
        marketShare: 18,
        responseTime: "12 min",
        winRate: 61,
        dealsClosed: 89,
        threatLevel: "medium",
        recentActivity: "Increased Samsung TV pricing - 1 day ago"
      },
      {
        id: 4,
        name: "GadgetHub",
        company: "GadgetHub Limited",
        avgPrice: 1099,
        priceChange: -5,
        marketShare: 15,
        responseTime: "8 min",
        winRate: 55,
        dealsClosed: 67,
        threatLevel: "medium",
        recentActivity: "New headphone bundle launched - 6 hours ago"
      }
    ];

    setCompetitors(competitorData);

    // Generate price history
    const history: PriceHistory[] = [];
    for (let i = 23; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit' });
      history.push({
        time,
        yourPrice: 1050 + Math.random() * 100 - 50,
        competitorAvg: 1020 + Math.random() * 80 - 40,
        marketLow: 990 + Math.random() * 60 - 30
      });
    }
    setPriceHistory(history);
  }, []);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "critical": return "text-red-600 bg-red-100 border-red-300";
      case "high": return "text-orange-600 bg-orange-100 border-orange-300";
      case "medium": return "text-yellow-600 bg-yellow-100 border-yellow-300";
      default: return "text-green-600 bg-green-100 border-green-300";
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case "critical": return <AlertTriangle className="text-red-500" size={16} />;
      case "high": return <Zap className="text-orange-500" size={16} />;
      case "medium": return <Target className="text-yellow-500" size={16} />;
      default: return <Users className="text-green-500" size={16} />;
    }
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case "share":
        return competitors.map(c => ({ name: c.name.split(" ")[0], value: c.marketShare }));
      case "response":
        return competitors.map(c => ({ name: c.name.split(" ")[0], value: parseInt(c.responseTime) }));
      default:
        return competitors.map(c => ({ name: c.name.split(" ")[0], value: c.avgPrice }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Competitor Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <Target className="text-orange-500" size={20} />
              <span>Competitor Analysis</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick metrics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <Button
              variant={selectedMetric === "price" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric("price")}
              className="flex flex-col h-auto py-2"
            >
              <DollarSign size={16} />
              <span className="text-xs mt-1">Avg Price</span>
            </Button>
            <Button
              variant={selectedMetric === "share" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric("share")}
              className="flex flex-col h-auto py-2"
            >
              <TrendingUp size={16} />
              <span className="text-xs mt-1">Market Share</span>
            </Button>
            <Button
              variant={selectedMetric === "response" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric("response")}
              className="flex flex-col h-auto py-2"
            >
              <Zap size={16} />
              <span className="text-xs mt-1">Response Time</span>
            </Button>
          </div>

          {/* Metric chart */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getMetricData()}>
                <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const unit = selectedMetric === "price" ? "$" : selectedMetric === "share" ? "%" : " min";
                      return (
                        <div className="bg-white p-2 border rounded shadow text-xs">
                          <p>{`${label}: ${payload[0]?.value}${unit}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Competitor List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Competitors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {competitors.map((competitor, index) => (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 border rounded-lg ${getThreatColor(competitor.threatLevel)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getThreatIcon(competitor.threatLevel)}
                  <div>
                    <h4 className="font-medium text-sm">{competitor.name}</h4>
                    <p className="text-xs text-neutral-600">{competitor.company}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${getThreatColor(competitor.threatLevel)}`}>
                  {competitor.threatLevel.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2 text-xs">
                <div className="text-center">
                  <p className="text-neutral-600">Avg Price</p>
                  <p className="font-bold">${competitor.avgPrice.toLocaleString()}</p>
                  <div className={`flex items-center justify-center space-x-1 ${
                    competitor.priceChange < 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {competitor.priceChange < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                    <span>{Math.abs(competitor.priceChange)}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-neutral-600">Market Share</p>
                  <p className="font-bold">{competitor.marketShare}%</p>
                </div>
                <div className="text-center">
                  <p className="text-neutral-600">Win Rate</p>
                  <p className="font-bold">{competitor.winRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-neutral-600">Response</p>
                  <p className="font-bold">{competitor.responseTime}</p>
                </div>
              </div>

              <div className="text-xs text-neutral-600 mb-2">
                <strong>Recent:</strong> {competitor.recentActivity}
              </div>

              {competitor.threatLevel === "critical" && (
                <Button 
                  size="sm" 
                  className="w-full bg-red-500 hover:bg-red-600 text-xs"
                >
                  <AlertTriangle className="mr-1" size={12} />
                  Counter Strategy Required
                </Button>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Price Trend Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Price Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <Line type="monotone" dataKey="yourPrice" stroke="#3b82f6" strokeWidth={2} name="Your Price" />
                <Line type="monotone" dataKey="competitorAvg" stroke="#f59e0b" strokeWidth={2} name="Competitor Avg" />
                <Line type="monotone" dataKey="marketLow" stroke="#ef4444" strokeWidth={2} name="Market Low" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow text-xs">
                          <p>{`Time: ${label}`}</p>
                          {payload.map((entry, index) => (
                            <p key={index} style={{ color: entry.color }}>
                              {`${entry.name}: $${entry.value?.toLocaleString()}`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
