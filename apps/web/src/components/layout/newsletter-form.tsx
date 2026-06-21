"use client";

import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email.");
      setMessage(null);
      return;
    }

    setError(null);
    setMessage("Subscribed for BookPie updates.");
    setEmail("");
  };

  return (
    <form className="mt-4" onSubmit={subscribe}>
      <div className="flex gap-2">
        <Input type="email" value={email} placeholder="Write your email here" aria-label="Newsletter email" onChange={(event) => setEmail(event.target.value)} />
        <Button type="submit" size="icon" aria-label="Subscribe">
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-destructive">{error}</p> : null}
      {message ? <p className="mt-2 text-xs font-medium text-primary">{message}</p> : null}
    </form>
  );
}
