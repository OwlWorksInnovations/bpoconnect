import React from "react";
import { getCurrentUser, getJobs, getOffers, getMessages } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import AutoRefresh from "./AutoRefresh";
import ChatForm from "./ChatForm";

export default async function MessagesPage({ searchParams }: { searchParams: { offer?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  
  const { offer: activeOfferId } = await searchParams;
  
  // To show full names, we might need more backend endpoints, but let's stick to what we have
  const allJobs = await getJobs();
  
  // This is a bit inefficient without a specific "my-offers" endpoint, 
  // but for MVP it works by filtering all offers of all jobs
  let involvedOffers: any[] = [];
  
  if (user.role === 'client') {
    const myJobs = allJobs.filter(j => j.authorId === user.id);
    for (const job of myJobs) {
      const offers = await getOffers(job.id);
      involvedOffers.push(...offers);
    }
  } else {
    // For freelancers, we'd ideally have a /api/offers/my endpoint
    // For now, let's just use the activeOfferId if provided
    if (activeOfferId) {
      // In a real app, you'd fetch the specific offer
      // Let's assume the user is involved if they have the ID for now
    }
  }

  const activeOffer = involvedOffers.find(o => o.id === activeOfferId) || involvedOffers[0];
  const messages = activeOffer ? await getMessages(activeOffer.id) : [];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", gap: "2rem", height: "70vh" }}>
      <AutoRefresh />
      {/* Sidebar */}
      <div className="card" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
        <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", margin: 0 }}>Conversations</h2>
        
        {involvedOffers.length === 0 ? (
          <p style={{ color: "#666", fontSize: "0.85rem" }}>No conversations yet.</p>
        ) : (
          involvedOffers.map(offer => {
            const job = allJobs.find(j => j.id === offer.jobId);
            const isActive = activeOffer?.id === offer.id;
            return (
              <Link key={offer.id} href={`/messages?offer=${offer.id}`} style={{
                padding: "0.75rem",
                backgroundColor: isActive ? "var(--background)" : "transparent",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                borderLeft: isActive ? "4px solid var(--primary)" : "1px solid var(--border)",
                display: "block",
                color: "inherit",
                textDecoration: "none"
              }}>
                <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job?.title || 'Job'}</h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}>Bid: ${offer.amount}</p>
              </Link>
            );
          })
        )}
      </div>

      {/* Main Chat Area */}
      <div className="card" style={{ flex: 2, display: "flex", flexDirection: "column", padding: "0" }}>
        {activeOffer ? (
          <>
            <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
              <h3 style={{ margin: "0 0 0.25rem 0" }}>{allJobs.find(j => j.id === activeOffer.jobId)?.title}</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                Status: {activeOffer.status}
              </p>
            </div>
            
            <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {messages.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", marginTop: "auto", marginBottom: "auto" }}>No messages yet.</p>
              ) : (
                messages.map((msg: any) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                      <div style={{
                        backgroundColor: isMine ? "var(--primary)" : "#e5e7eb",
                        color: isMine ? "white" : "black",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        borderBottomRightRadius: isMine ? "0" : "8px",
                        borderBottomLeftRadius: !isMine ? "0" : "8px",
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
              <ChatForm offerId={activeOffer.id} />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>
            Select a conversation.
          </div>
        )}
      </div>
    </div>
  );
}
