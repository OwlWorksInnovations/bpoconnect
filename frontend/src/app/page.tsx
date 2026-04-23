import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto", padding: "4rem 0" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "var(--primary)" }}>
        Outsourcing Made Simple
      </h1>
      <p style={{ fontSize: "1.25rem", color: "#666", marginBottom: "2rem" }}>
        Post your job, tag your needs, and get connected with verified professionals instantly. Secure payments, buyer protection, and a simple 10% fee.
      </p>
      
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "4rem" }}>
        <Link href="/post-job" className="btn" style={{ fontSize: "1.2rem", padding: "0.75rem 2rem" }}>
          Post a Job Now
        </Link>
        <Link href="/jobs" className="btn btn-secondary" style={{ fontSize: "1.2rem", padding: "0.75rem 2rem" }}>
          Browse Jobs
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem", textAlign: "left" }}>
        <div className="card">
          <h3 style={{ marginBottom: "0.5rem", color: "var(--primary)" }}>Smart Tag Matching</h3>
          <p>Instead of hoping someone finds your gig, professionals are instantly notified via email based on their skill tags.</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: "0.5rem", color: "var(--primary)" }}>Direct Messaging</h3>
          <p>Chat directly with clients and freelancers right here on the platform to negotiate terms and deliverables.</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: "0.5rem", color: "var(--primary)" }}>Secure Payments</h3>
          <p>We handle the payments securely with full buyer protection. Funds are only released when the job is done.</p>
        </div>
      </div>
    </div>
  );
}
