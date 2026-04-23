import React from "react";
import { registerUser } from "@/app/actions";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem 0" }}>
      <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1.5rem" }}>Create an Account</h1>
      <form action={registerUser} className="card">
        
        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="name">Full Name</label>
          <input 
            type="text" 
            id="name" 
            name="name"
            className="input" 
            placeholder="John Doe"
            required
          />
        </div>

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

        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="role">I want to...</label>
          <select id="role" name="role" className="input" required defaultValue="client">
            <option value="client">Post jobs and hire professionals (Client)</option>
            <option value="freelancer">Find work and submit proposals (Freelancer)</option>
          </select>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label className="label" htmlFor="tags">Skill Tags (For Freelancers only)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags"
            className="input" 
            placeholder="e.g. React, Node.js, Design"
          />
          <p style={{ fontSize: "0.85rem", color: "#666" }}>* Comma separated. We'll email you when jobs match these tags.</p>
        </div>

        <button type="submit" className="btn" style={{ width: "100%", padding: "0.75rem" }}>
          Register
        </button>
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--primary)" }}>Login here</Link>
        </p>
      </form>
    </div>
  );
}
