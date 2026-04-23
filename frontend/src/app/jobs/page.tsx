import Link from "next/link";
import React from "react";
import { getCurrentUser, getJobs } from "@/app/actions";

export default async function JobsPage() {
  const user = await getCurrentUser();
  const jobs = await getJobs();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--primary)" }}>Available Jobs</h1>
        {user?.role === 'client' && (
          <Link href="/post-job" className="btn">Post a New Job</Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2 style={{ color: "#666" }}>No jobs available right now.</h2>
          {user?.role === 'client' && <p>Be the first to post a job!</p>}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {jobs.map((job) => {
            return (
              <div key={job.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                    <Link href={`/jobs/${job.id}`} style={{ color: "var(--primary)", textDecoration: "underline" }}>
                      {job.title}
                    </Link>
                  </h2>
                  <p style={{ color: "#666", marginBottom: "0.5rem" }}>Budget: ${job.budget}</p>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {job.tags && job.tags.map(tag => (
                      <span key={tag} style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.85rem" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <Link href={`/jobs/${job.id}`} className="btn">View Details</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
