import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import React from "react";
import { getCurrentUser, logoutUser } from "./actions";

export const metadata: Metadata = {
  title: "BPO Connect - Simplified Business Process Outsourcing",
  description: "Post jobs, connect with pros, secure payments, and buyer protection.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <nav style={{
          borderBottom: "1px solid var(--border)",
          padding: "1rem 0",
          backgroundColor: "var(--surface)"
        }}>
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
              BPO Connect
            </Link>
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <Link href="/jobs" style={{ fontWeight: "500" }}>Find Jobs</Link>
              
              {user ? (
                <>
                  {user.role === 'client' && <Link href="/post-job" className="btn">Post a Job</Link>}
                  <Link href="/messages" style={{ fontWeight: "500" }}>Messages</Link>
                  <Link href="/dashboard" style={{ fontWeight: "500" }}>Dashboard</Link>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "1px solid var(--border)", paddingLeft: "1rem" }}>
                    <span style={{ fontSize: "0.9rem", color: "#666" }}>
                      Hi, <strong>{user.name}</strong> ({user.role})
                    </span>
                    <form action={logoutUser}>
                      <button type="submit" className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}>
                        Logout
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <Link href="/login" style={{ fontWeight: "500" }}>Login</Link>
                  <Link href="/register" className="btn">Register</Link>
                </div>
              )}
            </div>
          </div>
        </nav>
        <main className="container" style={{ padding: "2rem 1rem", minHeight: "80vh" }}>
          {children}
        </main>
        <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 0", textAlign: "center", color: "#666" }}>
          <p>© {new Date().getFullYear()} BPO Connect. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
