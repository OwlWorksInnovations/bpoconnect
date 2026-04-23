import React from "react";
import { loginUser } from "@/app/actions";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem 0" }}>
      <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1.5rem" }}>Login</h1>
      <form action={loginUser} className="card">
        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            className="input" 
            placeholder="you@example.com"
            required
          />
        </div>
        <button type="submit" className="btn" style={{ width: "100%", padding: "0.75rem" }}>
          Login
        </button>
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Don't have an account? <Link href="/register" style={{ color: "var(--primary)" }}>Register here</Link>
        </p>
      </form>
    </div>
  );
}
