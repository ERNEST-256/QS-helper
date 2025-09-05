import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  User,
  LogOut,
  DollarSign,
  PieChart as PieChartIcon,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient.ts"; // ✅ make sure this exists

const Dashboard = () => {
  const [stockName, setStockName] = useState("");
  const [allocation, setAllocation] = useState("");
  const [investments, setInvestments] = useState<
    Array<{ name: string; amount: number; percentage: number }>
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [user, setUser] = useState<any>(null); // current user
  const navigate = useNavigate();

  // ✅ Check session on mount
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/login"); // redirect if no user
      }
    };

    getSession();

    // ✅ Subscribe to session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        navigate("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // ✅ Form handling
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockName || !allocation) return;

    const amount = parseFloat(allocation);
    const newInvestment = { name: stockName, amount, percentage: 0 };
    const updatedInvestments = [...investments, newInvestment];

    // Recalculate percentages
    const totalAmount = updatedInvestments.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );
    updatedInvestments.forEach((inv) => {
      inv.percentage = (inv.amount / totalAmount) * 100;
    });

    setInvestments(updatedInvestments);
    setStockName("");
    setAllocation("");
    setShowResults(true);
  };

  // ✅ Mock AI explanation
  const aiExplanation =
    investments.length > 0
      ? `Based on your investment preferences, I've analyzed your portfolio allocation across ${
          investments.length
        } stock(s). The largest allocation is ${investments[0]?.percentage.toFixed(
          1
        )}% to ${
          investments[0]?.name
        }. This diversification strategy helps balance risk and potential returns. Consider monitoring market trends and adjusting allocations based on performance metrics.`
      : "";

  // ✅ Charts data
  const pieData = investments.map((inv, index) => ({
    name: inv.name,
    value: inv.percentage,
    color:
      index === 0
        ? "#3b82f6"
        : index === 1
        ? "#10b981"
        : index === 2
        ? "#f59e0b"
        : "#ef4444",
  }));

  const barData = investments.map((inv) => ({
    name: inv.name,
    amount: inv.amount,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">QS-helper</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                {user?.email || "Profile"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Side - Investment Form */}
        <div className="w-80 p-6 border-r bg-card">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Investment Calculator
              </CardTitle>
              <CardDescription>Enter your stock preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Name</Label>
                  <Input
                    id="stock"
                    type="text"
                    placeholder="e.g., AAPL, TSLA, GOOGL"
                    value={stockName}
                    onChange={(e) => setStockName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allocation">Amount to Invest ($)</Label>
                  <Input
                    id="allocation"
                    type="number"
                    placeholder="Amount for this stock"
                    value={allocation}
                    onChange={(e) => setAllocation(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  Add Investment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Results */}
        <div className="flex-1 p-6">
          <div className="grid gap-6">
            {/* Portfolio Overview */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-secondary" />
                  Portfolio Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {investments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {investments.map((investment, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 rounded-lg bg-muted"
                        >
                          <div>
                            <p className="font-medium">{investment.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {investment.percentage.toFixed(1)}% of portfolio
                            </p>
                          </div>
                          <p className="font-bold text-primary">
                            ${investment.amount.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${
                                typeof value === "number"
                                  ? value.toFixed(1)
                                  : value
                              }%`,
                              "Allocation",
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add investments to see your portfolio distribution</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Distribution Chart */}
            {investments.length > 0 && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Investment Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Amount"]}
                        />
                        <Bar
                          dataKey="amount"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            {showResults && investments.length > 0 && (
              <Card className="shadow-soft border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-secondary" />
                    AI Investment Analysis
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
    </div>
  );
};

export default Dashboard;
