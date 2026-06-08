"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DunningLog {
  id: string;
  customer_email: string;
  subscription_id: string;
  step_order: number;
  created_at: string;
}

export default function DashboardHome() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [isStripeConnected, setIsStripeConnected] = useState(true);
  const [metrics, setMetrics] = useState({
    emailsSent: 0,
    activeWorkflows: 0,
    recoveredRevenue: 0, // Placeholder
  });
  const [recentLogs, setRecentLogs] = useState<DunningLog[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check connections
      const { data: settings } = await supabase
        .from("client_settings")
        .select("stripe_webhook_secret, stripe_secret_key")
        .eq("profile_id", user.id)
        .maybeSingle();

      setIsStripeConnected(!!(settings?.stripe_webhook_secret || settings?.stripe_secret_key));

      // Fetch Total Emails Sent (dunning_logs count)
      const { count: emailsCount } = await supabase
        .from("dunning_logs")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id);

      // Fetch Active Workflows (dunning_steps count)
      const { count: workflowsCount } = await supabase
        .from("dunning_steps")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id);

      // Fetch Recent Activity (top 10 dunning_logs)
      const { data: logs } = await supabase
        .from("dunning_logs")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setMetrics({
        emailsSent: emailsCount || 0,
        activeWorkflows: workflowsCount || 0,
        recoveredRevenue: 0, // Vom calcula asta real într-un update viitor din evenimente Stripe
      });

      if (logs) {
        setRecentLogs(logs);
      }

      setLoading(false);
    }

    fetchDashboardData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-bold tracking-widest text-gray-400 uppercase animate-pulse">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-24 max-w-5xl">
      
      {/* Stripe Connection Warning */}
      {!isStripeConnected && (
        <div className="mb-12 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between text-amber-800 text-sm font-medium gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span>Your Stripe account is not fully connected. The dunning engine cannot fetch failed payments.</span>
          </div>
          <Link href="/dashboard/settings" className="bg-[#1c1c1c] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-colors whitespace-nowrap">
            Setup Connection
          </Link>
        </div>
      )}

      <div className="mb-16">
        <h1 className="text-5xl font-black tracking-tight mb-2 text-[#1c1c1c]">
          Analytics Overview
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Real-time metrics from your automated recovery engine.
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Recovered Revenue
          </h3>
          <div className="text-5xl font-black text-[#2563eb] tracking-tighter mb-2">
            ${metrics.recoveredRevenue.toFixed(2)}
          </div>
          <p className="text-xs font-bold text-gray-400">
            <span className="bg-blue-50 text-[#2563eb] px-2 py-0.5 rounded-md mr-1">Pending Stripe Sync</span>
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Emails Sent
          </h3>
          <div className="text-5xl font-black text-[#1c1c1c] tracking-tighter mb-2">
            {metrics.emailsSent}
          </div>
          <p className="text-xs font-bold text-gray-400">
            Total dunning emails delivered
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Active Workflows
          </h3>
          <div className="text-5xl font-black text-[#1c1c1c] tracking-tighter mb-2">
            {metrics.activeWorkflows}
          </div>
          <p className="text-xs font-bold text-gray-400">
            Automated steps running
          </p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Recent Dunning Activity
        </h2>
        
        {recentLogs.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
            </div>
            <h3 className="text-[#1c1c1c] font-black text-lg mb-2">Engine standing by</h3>
            <p className="text-gray-500 text-sm font-medium max-w-sm">
              No recovery emails have been sent yet. The automated system will appear here once it processes a failed payment.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">Customer Email</th>
                    <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">Subscription ID</th>
                    <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">Email Step</th>
                    <th className="py-5 px-8 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200">Date Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-5 px-8 text-sm font-bold text-[#1c1c1c]">
                        {log.customer_email}
                      </td>
                      <td className="py-5 px-8 text-sm font-medium text-gray-500 font-mono">
                        {log.subscription_id.substring(0, 12)}...
                      </td>
                      <td className="py-5 px-8">
                        <span className="inline-flex items-center justify-center bg-gray-100 text-[#1c1c1c] px-3 py-1 rounded-lg text-xs font-bold">
                          Step {log.step_order}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-sm font-medium text-gray-500">
                        {new Date(log.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}