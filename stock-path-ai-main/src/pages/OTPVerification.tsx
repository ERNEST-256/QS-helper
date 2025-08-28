import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { TrendingUp, Shield, Phone } from "lucide-react";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState(""); // feedback message
  const [cooldown, setCooldown] = useState(0); // resend cooldown timer
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setMessage("✅ OTP verified successfully!");
      setTimeout(() => navigate("/dashboard"), 1000); // navigate after short delay
    } else {
      setMessage("❌ Please enter a valid 6-digit OTP.");
    }
  };

  const handleResendOTP = () => {
    if (cooldown === 0) {
      alert("OTP resent to your phone number!");
      setCooldown(30); // 30 seconds cooldown
    }
  };

  // countdown effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">StockPath AI</h1>
          </div>
          <p className="text-muted-foreground">
            Secure your account with phone verification
          </p>
        </div>

        <Card className="shadow-medium">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to your phone number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  className="w-full"
                >
                  <InputOTPGroup className="w-full justify-center">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="w-12 h-12 text-lg"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={otp.length !== 6}
              >
                Verify Account
              </Button>
            </form>

            {message && (
              <p className="text-center text-sm mt-3 text-primary font-medium">
                {message}
              </p>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={cooldown > 0}
                className="text-primary hover:text-primary/80"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPVerification;
