import React from "react";
import { getDb } from "@/lib/db";
import { getCurrentUser, acceptOffer } from "@/app/actions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function JobOffersPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const db = await getDb();
  const job = db.jobs.find(j => j.id === id);
  if (!job) notFound();

  const user = await getCurrentUser();
  if (!user || user.id !== job.authorId) redirect('/dashboard');

  const offers = db.offers.filter(o => o.jobId === job.id);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Link href="/dashboard" style={{ display: "inline-block", marginBottom: "1rem", color: "var(--primary)" }}>
        &larr; Back to Dashboard
      </Link>
      
      <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "0.5rem" }}>Offers for: {job.title}</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Budget: ${job.budget} • Status: {job.status}</p>
      
      {offers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2 style={{ color: "#666" }}>No offers received yet.</h2>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {offers.map(offer => {
            const freelancer = db.users.find(u => u.id === offer.freelancerId);
            return (
              <div key={offer.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>{freelancer?.name || 'Unknown Freelancer'}</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>Skills: {freelancer?.tags?.join(', ') || 'None listed'}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)", margin: 0 }}>${offer.amount}</p>
                    <span style={{ fontSize: "0.85rem", color: "#666", textTransform: "capitalize" }}>{offer.status}</span>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Proposal:</h4>
                  <p style={{ whiteSpace: "pre-wrap", margin: 0, color: "#333", backgroundColor: "var(--background)", padding: "1rem", borderRadius: "4px" }}>
                    {offer.message}
                  </p>
                </div>
                
                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                  <Link href={`/messages?offer=${offer.id}`} className="btn btn-secondary">
                    Message Freelancer
                  </Link>
                  {job.status === 'open' && offer.status === 'pending' && (
                    <form action={acceptOffer}>
                      <input type="hidden" name="offerId" value={offer.id} />
                      <button type="submit" className="btn">Accept & Pay Securely</button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
