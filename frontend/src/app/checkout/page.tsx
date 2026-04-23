"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const baseAmount = 1500;
  const platformFee = baseAmount * 0.10; // 10% commission
  const totalAmount = baseAmount + platformFee;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      alert("Payment Secured! 🎉\nFunds are held safely in escrow and will only be released when you approve the final work.");
      setLoading(false);
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 0" }}>
      <Link href="/jobs" style={{ display: "inline-block", marginBottom: "1rem", color: "var(--primary)" }}>
        &larr; Back to Jobs
      </Link>
      
      <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1.5rem" }}>Secure Checkout</h1>
      
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
          Project: Build a React Native App
        </h3>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span>Freelancer Bid</span>
          <strong>${baseAmount.toFixed(2)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", color: "#666" }}>
          <span>Platform Fee (10%) & Buyer Protection</span>
          <span>${platformFee.toFixed(2)}</span>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "1rem", fontSize: "1.25rem", fontWeight: "bold" }}>
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handlePayment} className="card">
        <h3 style={{ marginBottom: "1rem" }}>Payment Details</h3>
        
        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="cardName">Name on Card</label>
          <input type="text" id="cardName" className="input" placeholder="John Doe" required />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="cardNumber">Card Number</label>
          <input type="text" id="cardNumber" className="input" placeholder="**** **** **** ****" required />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <label className="label" htmlFor="expiry">Expiry</label>
            <input type="text" id="expiry" className="input" placeholder="MM/YY" required />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" htmlFor="cvc">CVC</label>
            <input type="text" id="cvc" className="input" placeholder="123" required />
          </div>
        </div>

        <button type="submit" className="btn" style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }} disabled={loading}>
          {loading ? "Processing Secure Payment..." : `Pay $${totalAmount.toFixed(2)} Securely`}
        </button>
        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#666", marginTop: "1rem" }}>
          🔒 Your payment is held in escrow. Freelancer is not paid until you approve.
        </p>
      </form>
    </div>
  );
}
