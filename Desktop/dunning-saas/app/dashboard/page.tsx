"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface DunningLog {
  id: string;
  customer_email: string;
  subscription_id: string;
  step_order: number;
  sent_at: string;
}

const DashboardOverview = () => {
  const supabase = createClient();
  const [totalEmails, setTotalEmails] = useState(0);
  const [activeWorkflows, setActiveWorkflows] = useState(0);
  const [recentLogs, setRecentLogs] = useState<DunningLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get total emails sent
      const { count: emailsCount } = await supabase
        .from("dunning_logs")
        .select("*", { count: 'exact', head: true })
        .eq("profile_id", user.id);
      
      if (emailsCount !== null) setTotalEmails(emailsCount);

      // 2. Get active workflow steps
      const { count: stepsCount } = await supabase
        .from("dunning_steps")
        .select("*", { count: 'exact', head: true })
        .eq("profile_id", user.id);

      if (stepsCount !== null) setActiveWorkflows(stepsCount);

      // 3. Get recent activity logs
      const { data: logsData } = await supabase
        .from("dunning_logs")
        .select("*")
        .eq("profile_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(5);

      if (logsData) setRecentLogs(logsData);

      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-sm font-bold tracking-widest text-gray-400 uppercase animate-pulse">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="max-w-5xl animate-in fade-in duration-500 pb-32">
      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-2 text-[#1c1c1c]">
          Mission Control
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Real-time analytics for your automated recovery engine.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-8 border-2 border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Recovered Revenue</span>
          <div>
            <span className="text-4xl font-black text-green-500">$0.00</span>
            <p className="text-xs font-medium text-gray-400 mt-2">Awaiting first successful payment recovery.</p>
          </div>
        </div>

        <div className="p-8 border-2 border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Total Emails Sent</span>
          <div>
            <span className="text-4xl font-black text-[#1c1c1c]">{totalEmails}</span>
            <p className="text-xs font-medium text-gray-400 mt-2">Automated reminders delivered.</p>
          </div>
        </div>

        <div className="p-8 border-2 border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Active Workflows</span>
          <div>
            <span className="text-4xl font-black text-[#1c1c1c]">{activeWorkflows}</span>
            <p className="text-xs font-medium text-gray-400 mt-2">Steps configured in your sequence.</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#1c1c1c] mb-6">Recent Dunning Activity</h2>
        
        {recentLogs.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </div>
            <h3 className="text-lg font-black text-[#1c1c1c] mb-1">Your engine is standing by</h3>
            <p className="text-sm text-gray-500 font-medium max-w-md">No recovery emails have been sent yet. The system will automatically detect failed payments and trigger the workflow.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-2xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Customer</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500">Action Taken</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Date Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm text-[#1c1c1c]">{log.customer_email}</div>
                      <div className="text-xs text-gray-400 font-mono mt-1">{log.subscription_id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        Sent Step {log.step_order}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-sm font-medium text-gray-500">
                        {new Date(log.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;