import React from "react";
import { postJob, getCurrentUser } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PostJobPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'client') {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h2 style={{ color: 'var(--primary)' }}>Only clients can post jobs.</h2>
        <p>If you're a freelancer, you can browse available <Link href="/jobs" style={{ textDecoration: "underline" }}>jobs here</Link>.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "1.5rem" }}>Post a New Job</h1>
      
      <form action={postJob} className="card">
        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="title">Job Title</label>
          <input 
            type="text" 
            id="title" 
            name="title"
            className="input" 
            placeholder="e.g. Build a Web Application"
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="description">Job Description</label>
          <textarea 
            id="description" 
            name="description"
            className="input" 
            placeholder="Describe what you need done..."
            rows={5}
            required
          ></textarea>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label className="label" htmlFor="budget">Budget (USD)</label>
          <input 
            type="number" 
            id="budget" 
            name="budget"
            className="input" 
            placeholder="e.g. 500"
            required
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label className="label" htmlFor="tags">Skill Tags (comma separated)</label>
          <input 
            type="text" 
            id="tags" 
            name="tags"
            className="input" 
            placeholder="e.g. React, Node.js, Design"
            required
          />
          <p style={{ fontSize: "0.85rem", color: "#666" }}>* This is how we notify the right professionals. Add specific tags.</p>
        </div>

        <button type="submit" className="btn" style={{ width: "100%", padding: "0.75rem" }}>
          Post Job & Notify Pros
        </button>
      </form>
    </div>
  );
}
