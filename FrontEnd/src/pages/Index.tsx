import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  LogOut,
  PieChart as PieChartIcon,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient.ts";
import { optimizePortfolio } from "@/api/portfolio.ts";

const Dashboard = () => {
  const [stockName, setStockName] = useState("");
  const [allocation, setAllocation] = useState("");
  const [investments, setInvestments] = useState<
    Array<{ name: string; amount: number; percentage: number }>
  >([]);
  const [aiExplanation, setAiExplanation] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placeholderMessage, setPlaceholderMessage] = useState(
    "Start investing by entering a stock and amount"
  );
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Warn before page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Are you sure you want to leave? Your current session may be lost.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Supabase session
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
      else navigate("/login");
    };
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else {
        setUser(null);
        navigate("/login");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleOptimizePortfolio = async () => {
    if (!stockName || !allocation) return;
    const amount = parseFloat(allocation);
    const budget = amount;
    const stocks = stockName
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (stocks.length === 0) return;

    setLoading(true);
    try {
      const result = await optimizePortfolio(budget, stocks);
      const newInvestments = stocks.map((stock) => ({
        name: stock,
        amount: result.allocation[stock] || 0,
        percentage: ((result.allocation[stock] || 0) / budget) * 100,
      }));
      setInvestments(newInvestments);
      setAiExplanation(result.explanation || "");
      setShowResults(true);
      setStockName("");
      setAllocation("");
    } catch (err: any) {
      console.error("Optimization failed:", err.message);
      alert("Failed to optimize portfolio. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const pieData = investments.map((inv, idx) => ({
    name: inv.name,
    value: inv.percentage,
    color:
      idx === 0
        ? "#3b82f6"
        : idx === 1
        ? "#10b981"
        : idx === 2
        ? "#f59e0b"
        : "#ef4444",
  }));

  const barData = investments.map((inv) => ({
    name: inv.name,
    amount: inv.amount,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b bg-card shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-slate-800">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold">QS-helper</h1>
        </div>
        <Button onClick={handleLogout} className="bg-slate-600 text-white">
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </Button>
      </header>

      {/* Main */}
      <div className="flex flex-col md:flex-row flex-1 w-full">
        {/* Left Panel */}
        <div className="w-full md:w-80 p-3 border-b md:border-b-0 md:border-r bg-white">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary font-bold text-lg md:text-xl">
                <TrendingUp className="h-5 w-5" />
                <span>Investment Calculator</span>
              </div>
              <CardDescription className="mt-1 text-sm md:text-base">
                Enter your stock and amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stock">Stock Name (comma-separated)</Label>
                <Input
                  id="stock"
                  type="text"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  placeholder={placeholderMessage}
                  className="placeholder:opacity-60"
                />
              </div>
              <div>
                <Label htmlFor="allocation">Amount ($)</Label>
                <Input
                  id="allocation"
                  type="number"
                  value={allocation}
                  onChange={(e) => setAllocation(e.target.value)}
                  placeholder="e.g. 1000"
                  className="placeholder:opacity-60"
                />
              </div>
              <Button
                className="w-full bg-primary hover:opacity-90 mt-2"
                onClick={handleOptimizePortfolio}
              >
                Optimize Portfolio
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-4 md:p-6 space-y-6">
          {/* Placeholder */}
          {!loading && investments.length === 0 && (
            <Card className="shadow-sm border-dashed border border-primary/30">
              <CardHeader>
                <CardTitle>Start Investing</CardTitle>
                <CardDescription>{placeholderMessage}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Your portfolio overview will appear here once you optimize
                  your investment.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading */}
          {loading && (
            <Card className="shadow-sm border-primary/20">
              <CardHeader>
                <CardTitle>Processing Portfolio</CardTitle>
                <CardDescription>
                  Please wait while we optimize your stocks...
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-32">
                <svg
                  className="animate-spin h-12 w-12 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              </CardContent>
            </Card>
          )}

          {/* Pie Chart */}
          {!loading && investments.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>
                  <PieChartIcon className="inline mr-2" /> Portfolio Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {investments.map((inv, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 rounded-lg bg-muted"
                      >
                        <div>
                          <p className="font-medium">{inv.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {inv.percentage.toFixed(1)}% of portfolio
                          </p>
                        </div>
                        <p className="font-bold text-primary">
                          ${inv.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="h-64 md:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${value.toFixed(1)}%`,
                            "Allocation",
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bar Chart */}
          {!loading && investments.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Bar
                      dataKey="amount"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {!loading && showResults && investments.length > 0 && (
            <Card className="shadow-sm border-primary/20">
              <CardHeader>
                <CardTitle>
                  <Brain className="inline mr-2" /> AI Investment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <p className="text-sm leading-relaxed">{aiExplanation}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
