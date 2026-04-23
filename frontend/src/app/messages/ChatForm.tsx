"use client";

import React, { useRef } from "react";
import { sendMessage } from "@/app/actions";

export default function ChatForm({ offerId }: { offerId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const text = formData.get("text") as string;
    if (text.trim()) {
      formRef.current?.reset();
      await sendMessage(offerId, text);
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
      <input 
        type="text" 
        name="text"
        className="input" 
        style={{ margin: 0, flex: 1 }}
        placeholder="Type your message..."
        required
        autoComplete="off"
      />
      <button type="submit" className="btn">Send</button>
    </form>
  );
}
