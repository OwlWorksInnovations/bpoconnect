import React from "react";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import AutoRefresh from "./AutoRefresh";
import ChatForm from "./ChatForm";

export default async function MessagesPage({ searchParams }: { searchParams: { offer?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  
  const { offer: activeOfferId } = await searchParams;
  const db = await getDb();

  // Find offers this user is involved in
  let involvedOffers: any[] = [];
  if (user.role === 'client') {
    // Client sees offers on their jobs
    const clientJobs = db.jobs.filter(j => j.authorId === user.id);
    involvedOffers = db.offers.filter(o => clientJobs.some(j => j.id === o.jobId));
  } else {
    // Freelancer sees their own offers
    involvedOffers = db.offers.filter(o => o.freelancerId === user.id);
  }

  const activeOffer = activeOfferId ? involvedOffers.find(o => o.id === activeOfferId) : involvedOffers[0];
  const messages = activeOffer ? db.messages.filter(m => m.offerId === activeOffer.id).sort((a, b) => a.createdAt - b.createdAt) : [];

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", gap: "2rem", height: "70vh" }}>
      <AutoRefresh />
      {/* Sidebar */}
      <div className="card" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
        <h2 style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", margin: 0 }}>Conversations</h2>
        
        {involvedOffers.length === 0 ? (
          <p style={{ color: "#666", fontSize: "0.85rem" }}>No conversations yet. Submit an offer or wait for proposals!</p>
        ) : (
          involvedOffers.map(offer => {
            const job = db.jobs.find(j => j.id === offer.jobId);
            const otherPartyId = user.role === 'client' ? offer.freelancerId : job?.authorId;
            const otherParty = db.users.find(u => u.id === otherPartyId);
            
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
                <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{job?.title}</h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#666" }}>With: {otherParty?.name || 'Unknown'}</p>
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
              <h3 style={{ margin: "0 0 0.25rem 0" }}>{db.jobs.find(j => j.id === activeOffer.jobId)?.title}</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                Chatting with {
                  db.users.find(u => u.id === (user.role === 'client' ? activeOffer.freelancerId : db.jobs.find(j => j.id === activeOffer.jobId)?.authorId))?.name
                } • Bid: ${activeOffer.amount} ({activeOffer.status})
              </p>
            </div>
            
            <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {messages.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666", marginTop: "auto", marginBottom: "auto" }}>No messages yet. Say hi!</p>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user.id;
                  const sender = db.users.find(u => u.id === msg.senderId);
                  return (
                    <div key={msg.id} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                      <p style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.2rem", textAlign: isMine ? "right" : "left" }}>
                        {isMine ? "You" : sender?.name}
                      </p>
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
            Select a conversation from the sidebar.
          </div>
        )}
      </div>
    </div>
  );
}
