"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface DunningLog {
  id: string;
  customer_email: string;
  subscription_id: string;
  step_order: number;
  sent_at: string;
}

// Date mock pentru grafic (mai târziu le putem trage direct din baza de date)
const chartData = [
  { name: "Jan", failed: 400, recovered: 240 },
  { name: "Feb", failed: 300, recovered: 139 },
  { name: "Mar", failed: 200, recovered: 980 },
  { name: "Apr", failed: 278, recovered: 390 },
  { name: "May", failed: 189, recovered: 480 },
  { name: "Jun", failed: 2390, recovered: 1909 },
];

const DashboardOverview = () => {
  const supabase = createClient();
  const [totalEmails, setTotalEmails] = useState(0);
  const [activeWorkflows, setActiveWorkflows] = useState(0);
  const [recentLogs, setRecentLogs] = useState<DunningLog[]>([]);
  const [recoveredRevenue, setRecoveredRevenue] = useState(0);
  
  // Noile state-uri pentru Stripe
  const [isConnected, setIsConnected] = useState(false);
  const [atRiskRevenue, setAtRiskRevenue] = useState(2450); // Mock momentan pt "Lost Revenue"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get total emails sent
      const { count: emailsCount } = await supabase
        .from("dunning_logs")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id);
      
      if (emailsCount !== null) setTotalEmails(emailsCount);

      // 2. Get active workflow steps
      const { count: stepsCount } = await supabase
        .from("dunning_steps")
        .select("*", { count: "exact", head: true })
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

      // 4. Get settings (Stripe Connection & Recovered Revenue)
      const { data: settingsData } = await supabase
        .from("client_settings")
        .select("total_recovered_revenue, stripe_account_id")
        .eq("profile_id", user.id)
        .single();
        
      if (settingsData) {
        // Verificăm dacă are Stripe conectat
        if (settingsData.stripe_account_id) {
          setIsConnected(true);
        }
        if (settingsData.total_recovered_revenue) {
          setRecoveredRevenue(Number(settingsData.total_recovered_revenue));
        }
      }

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

  // ECRANUL DE BLOCAJ: Dacă nu are Stripe conectat
  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto pt-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-100">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4 text-[#1c1c1c]">
          Start recovering lost revenue
        </h1>
        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
          Securely connect your Stripe account to analyze your billing data and automatically recover failed subscriptions before they churn.
        </p>
        <Link href="/dashboard/settings">
          <button className="bg-[#635BFF] hover:bg-[#4B45C6] text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-xl text-lg flex items-center gap-3 mx-auto">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13.976 9.15c-2.172-.806-3.356-1.143-3.356-2.077 0-.696.687-1.225 1.841-1.225 1.528 0 2.628.453 3.653.946l.865-3.363C15.65 2.766 14.12 2.4 12.396 2.4c-4.417 0-7.391 2.308-7.391 5.672 0 4.908 6.844 3.966 6.844 5.92 0 .93-.843 1.341-2.096 1.341-1.636 0-3.344-.658-4.664-1.39l-.92 3.424c1.472.76 3.47 1.258 5.485 1.258 4.67 0 7.552-2.22 7.552-5.786 0-2.455-1.503-3.9-3.23-4.689zM24 11.5c0-6.351-5.149-11.5-11.5-11.5S1 5.149 1 11.5 6.149 23 12.5 23 24 17.851 24 11.5z" opacity=".5"/><path d="M11.988 3.625c-3.155 0-5.28 1.648-5.28 4.051 0 3.506 4.889 2.833 4.889 4.229 0 .664-.602.958-1.497.958-1.168 0-2.389-.47-3.331-.993l-.657 2.446c1.051.543 2.478.898 3.918.898 3.335 0 5.394-1.586 5.394-4.133 0-1.754-1.074-2.786-2.308-3.35-1.551-.575-2.397-.816-2.397-1.483 0-.497.49-.875 1.315-.875 1.092 0 1.878.324 2.61.676l.617-2.402c-.952-.476-2.043-.736-3.273-.736z"/></svg>
            Connect Stripe securely
          </button>
        </Link>
      </div>
    );
  }

  // ECRANUL PRINCIPAL: Dacă are Stripe conectat (Codul tău original integrat perfect)
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

      {/* Stat Cards - Acum cu 4 coloane pentru a include At-Risk Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        
        {/* NOU: Cardul cu Banii Pierduți (At-Risk) */}
        <div className="p-8 border-2 border-red-100 rounded-3xl bg-red-50/30 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            At-Risk Revenue
          </span>
          <div>
            <span className="text-4xl font-black text-[#1c1c1c]">${atRiskRevenue.toFixed(2)}</span>
            <p className="text-[11px] font-medium text-gray-500 mt-2">Pending from failed invoices.</p>
          </div>
        </div>

        <div className="p-8 border-2 border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Recovered Revenue</span>
          <div>
            <span className="text-4xl font-black text-green-500">${recoveredRevenue.toFixed(2)}</span>
            <p className="text-[11px] font-medium text-gray-400 mt-2">Recovered automatically via Stripe.</p>
          </div>
        </div>

        <div className="p-8 border-2 border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Total Emails Sent</span>
          <div>
            <span className="text-4xl font-black text-[#1c1c1c]">{totalEmails}</span>
            <p className="text-[11px] font-medium text-gray-400 mt-2">Automated reminders delivered.</p>
          </div>
        </div>

        <div className="p-8 border-2 border-gray-100 rounded-3xl bg-white shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Active Workflows</span>
          <div>
            <span className="text-4xl font-black text-[#1c1c1c]">{activeWorkflows}</span>
            <p className="text-[11px] font-medium text-gray-400 mt-2">Steps configured in your sequence.</p>
          </div>
        </div>
      </div>

      {/* Recovery Breakdown Chart (Stripe-like) */}
      <div className="mb-16">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#1c1c1c] mb-6">Recovery Breakdown</h2>
        <div className="p-8 border-2 border-gray-100 rounded-3xl bg-white shadow-sm h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600, color: '#4b5563' }} />
              <Bar dataKey="failed" name="Failed Revenue" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={32} />
              <Bar dataKey="recovered" name="Recovered Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
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
          <div className="overflow-hidden border border-gray-200 rounded-2xl bg-white shadow-sm">
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