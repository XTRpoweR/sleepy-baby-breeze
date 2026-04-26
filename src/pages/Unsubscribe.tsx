import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

type Status = "loading" | "success" | "error" | "missing";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");
  const hasRunRef = useRef(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const runUnsubscribe = async () => {
    setStatus("loading");
    const { data, error } = await supabase.functions.invoke("newsletter-unsubscribe", {
      body: token ? { token } : { email },
    });

    if (error || !data?.success) {
      setStatus("error");
      setMessage(
        "This unsubscribe link is invalid or has already been used. If you continue to receive emails, contact support@sleepybabyy.com."
      );
    } else if (data.alreadyUnsubscribed) {
      setStatus("success");
      setMessage("You have already been unsubscribed from SleepyBabyy emails.");
    } else {
      setStatus("success");
      setMessage("You have been successfully unsubscribed from SleepyBabyy emails.");
    }
  };

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (!token && !email) {
      setStatus("missing");
      return;
    }
    runUnsubscribe();
  }, [token, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Unsubscribe from SleepyBabyy</CardTitle>
          <CardDescription>
            We're sorry to see you go.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Processing your request...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
              <p className="text-sm text-foreground">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <XCircle className="w-12 h-12 text-destructive" />
              <p className="text-sm text-foreground">{message}</p>
              <Button onClick={runUnsubscribe} variant="outline" size="sm">
                Try again
              </Button>
            </div>
          )}

          {status === "missing" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <XCircle className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-foreground">
                Invalid unsubscribe link. Please use the link from your email or contact{" "}
                <a href="mailto:support@sleepybabyy.com" className="text-primary underline">
                  support@sleepybabyy.com
                </a>
                .
              </p>
            </div>
          )}

          <div className="pt-2 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              ← Back to SleepyBabyy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
