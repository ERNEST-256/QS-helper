import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Brain, Shield, PieChart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-large">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              StockPath AI
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-foreground">
            Smart Investment Decisions with AI
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Enter your budget and stock preferences, and let our AI analyze the perfect allocation strategy for your investment portfolio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity px-8 py-3 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl bg-gradient-card shadow-soft border">
              <div className="p-2 rounded-lg bg-primary/10 w-fit mx-auto mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent insights and recommendations for your investment strategy
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-card shadow-soft border">
              <div className="p-2 rounded-lg bg-secondary/10 w-fit mx-auto mb-4">
                <PieChart className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Portfolio Visualization</h3>
              <p className="text-sm text-muted-foreground">
                Interactive charts and graphs to visualize your investment distribution
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-card shadow-soft border">
              <div className="p-2 rounded-lg bg-warning/10 w-fit mx-auto mb-4">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Secure Platform</h3>
              <p className="text-sm text-muted-foreground">
                Your financial data is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
