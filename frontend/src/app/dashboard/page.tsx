import React from "react";
import Link from "next/link";
import { getCurrentUser, getJobs, getOffers } from "@/app/actions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const allJobs = await getJobs();
  
  let activeProjects = 0;
  let escrowBalance = 0;
  let displayItems: React.ReactNode[] = [];

  if (user.role === 'client') {
    const clientJobs = allJobs.filter(j => j.authorId === user.id);
    activeProjects = clientJobs.filter(j => j.status !== 'completed').length;
    escrowBalance = clientJobs.filter(j => j.status === 'in_progress').reduce((acc, curr) => acc + curr.budget, 0);
    
    for (const job of clientJobs) {
      const jobOffers = await getOffers(job.id);
      displayItems.push(
        <div key={job.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0" }}>{job.title}</h3>
            <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>Budget: ${job.budget} • Status: {job.status}</p>
            <p style={{ fontSize: "0.85rem", color: "var(--primary)", margin: 0 }}>{jobOffers.length} Proposal(s)</p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link href={`/jobs/${job.id}`} className="btn btn-secondary">View Job</Link>
            {job.status === 'open' && jobOffers.length > 0 && (
              <Link href={`/jobs/${job.id}/offers`} className="btn">Review Offers</Link>
            )}
          </div>
        </div>
      );
    }
  } else {
    // Freelancer logic is harder without /api/offers/my, so we iterate all jobs
    // In a real app, you'd have a specific endpoint for this
    for (const job of allJobs) {
      const offers = await getOffers(job.id);
      const myOffer = offers.find(o => o.freelancerId === user.id);
      if (myOffer) {
        if (myOffer.status === 'accepted') {
          activeProjects++;
          escrowBalance += myOffer.amount;
        }
        displayItems.push(
          <div key={myOffer.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0" }}>{job.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>Your Bid: ${myOffer.amount} • Status: {myOffer.status}</p>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link href={`/jobs/${job.id}`} className="btn btn-secondary">View Job</Link>
              {myOffer.status === 'accepted' && (
                <Link href={`/messages?offer=${myOffer.id}`} className="btn">Message Client</Link>
              )}
            </div>
          </div>
        );
      }
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "2rem", color: "var(--primary)", marginBottom: "2rem" }}>My Dashboard</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Active Projects</h2>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)", margin: 0 }}>{activeProjects}</p>
        </div>
        <div className="card">
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Escrow Balance</h2>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)", margin: 0 }}>${escrowBalance}</p>
          <p style={{ color: "#666", fontSize: "0.85rem", margin: 0 }}>Funds held securely</p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
          {user.role === 'client' ? 'Your Posted Jobs' : 'Your Proposals'}
        </h2>
        {displayItems.length === 0 ? (
          <p style={{ color: "#666" }}>Nothing to show here yet.</p>
        ) : (
          displayItems
        )}
      </div>
    </div>
  );
}
