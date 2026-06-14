import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingChatButton() {
  return (
    <Button
      type="button"
      size="icon"
      className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-soft"
      aria-label="Open chat"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </Button>
  );
}
