"use client";

import { MessageCircle } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    setMessage("");
    setSent(true);
  };

  return (
    <>
      <Button
        type="button"
        size="icon"
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-soft"
        aria-label="Open chat"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </Button>
      <Modal open={open} title="BookPie Support" onOpenChange={setOpen}>
        <form className="space-y-4" onSubmit={sendMessage}>
          <p className="text-sm text-muted-foreground">আপনার প্রশ্ন লিখুন। ডেমো সাপোর্ট প্যানেল মেসেজ গ্রহণ করে কনফার্মেশন দেখাবে।</p>
          <Input value={message} placeholder="Type your message" aria-label="Chat message" onChange={(event) => setMessage(event.target.value)} />
          {sent ? <p className="text-xs font-medium text-primary">আপনার মেসেজ গ্রহণ করা হয়েছে।</p> : null}
          <Button type="submit" className="w-full">
            Send message
          </Button>
        </form>
      </Modal>
    </>
  );
}
