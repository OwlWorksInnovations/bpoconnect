import React from "react";
import { getDb } from "@/lib/db";
import { getCurrentUser, submitOffer } from "@/app/actions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const db = await getDb();
  const job = db.jobs.find(j => j.id === id);
  
  if (!job) {
    notFound();
  }

  const author = db.users.find(u => u.id === job.authorId);
  const user = await getCurrentUser();
  const existingOffer = user ? db.offers.find(o => o.jobId === job.id && o.freelancerId === user.id) : null;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Link href="/jobs" style={{ display: "inline-block", marginBottom: "1rem", color: "var(--primary)" }}>
        &larr; Back to Jobs
      </Link>
      
      <div className="card">
        <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "0.5rem" }}>{job.title}</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>Posted by {author?.name || 'Unknown'} • Budget: ${job.budget}</p>
        
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {job.tags.map(tag => (
            <span key={tag} style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.85rem" }}>
              {tag}
            </span>
          ))}
        </div>

        <h3 style={{ marginBottom: "0.5rem" }}>Job Description</h3>
        <p style={{ whiteSpace: "pre-wrap", marginBottom: "2rem" }}>{job.description}</p>
      </div>

      {user?.role === 'freelancer' && job.status === 'open' && !existingOffer && (
        <div className="card" style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--primary)" }}>Submit a Proposal</h2>
          <form action={submitOffer}>
            <input type="hidden" name="jobId" value={job.id} />
            <div style={{ marginBottom: "1rem" }}>
              <label className="label" htmlFor="amount">Your Bid Amount ($)</label>
              <input type="number" id="amount" name="amount" className="input" defaultValue={job.budget} required />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label className="label" htmlFor="message">Proposal Message</label>
              <textarea 
                id="message" 
                name="message" 
                className="input" 
                rows={5} 
                placeholder="Why should they hire you?" 
                required
              ></textarea>
            </div>
            <button type="submit" className="btn" style={{ width: "100%", padding: "0.75rem" }}>
              Submit Offer
            </button>
          </form>
        </div>
      )}

      {existingOffer && (
        <div className="card" style={{ marginTop: "2rem", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <h3 style={{ color: "#166534" }}>✓ You have submitted an offer for this job</h3>
          <p style={{ color: "#166534", margin: 0 }}>Your Bid: ${existingOffer.amount}</p>
        </div>
      )}
      
      {!user && (
        <div className="card" style={{ marginTop: "2rem", textAlign: "center" }}>
          <p>Please <Link href="/login" style={{ color: "var(--primary)", textDecoration: "underline" }}>login</Link> to submit a proposal.</p>
        </div>
      )}
    </div>
  );
}
