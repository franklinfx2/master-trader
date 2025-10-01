import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface Feedback {
  id: string;
  user_id: string;
  feedback_type: string;
  message: string;
  screenshot_url: string | null;
  created_at: string;
}

const AdminFeedback = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (profile && !profile.is_admin) {
      toast({
        title: "Access denied",
        description: "You must be an admin to view this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    const fetchFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from("feedback")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setFeedback(data || []);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast({
          title: "Error",
          description: "Failed to load feedback.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (profile?.is_admin) {
      fetchFeedback();
    }
  }, [user, profile, navigate]);

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case "bug_report":
        return "Bug Report";
      case "feature_request":
        return "Feature Request";
      case "general_feedback":
        return "General Feedback";
      default:
        return type;
    }
  };

  const getFeedbackTypeVariant = (type: string): "default" | "destructive" | "secondary" => {
    switch (type) {
      case "bug_report":
        return "destructive";
      case "feature_request":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p className="text-center text-muted-foreground">Loading feedback...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">User Feedback</h1>

        {feedback.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No feedback submissions yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Badge variant={getFeedbackTypeVariant(item.feedback_type)}>
                          {getFeedbackTypeLabel(item.feedback_type)}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.created_at), "PPpp")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap mb-4">{item.message}</p>
                  {item.screenshot_url && (
                    <a
                      href={item.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Screenshot
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminFeedback;
