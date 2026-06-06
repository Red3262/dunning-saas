import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verificăm doar dacă e conectat pentru a ști dacă afișăm o alertă discretă
  const { data: settings } = await supabase
    .from('client_settings')
    .select('stripe_webhook_secret')
    .eq('profile_id', user.id)
    .maybeSingle();

  const isStripeConnected = !!settings?.stripe_webhook_secret;

  const { data: payments } = await supabase
    .from('failed_payments')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  const safePayments = payments || [];
  const activeRecoveries = safePayments.filter(p => p.status === 'pending');
  const valueAtRisk = activeRecoveries.reduce((sum, p) => sum + (Number(p.amount_due) || 0), 0);
  
  const recoveredPayments = safePayments.filter(p => p.status === 'recovered');
  const recoveredRevenue = recoveredPayments.reduce((sum, p) => sum + (Number(p.amount_due) || 0), 0);

  const recentPayments = safePayments.slice(0, 5);

  const productStats = safePayments.reduce((acc: any, payment) => {
    const name = payment.product_name || 'Unknown Subscription';
    if (!acc[name]) {
      acc[name] = { count: 0, value: 0 };
    }
    acc[name].count += 1;
    acc[name].value += (Number(payment.amount_due) || 0);
    return acc;
  }, {});

  const topProducts = Object.entries(productStats)
    .map(([name, stats]: [string, any]) => ({ name, ...stats }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      
      {/* ALERTĂ SUBTILĂ DACĂ STRIPE NU E CONECTAT (Nu blochează ecranul!) */}
      {!isStripeConnected && (
        <div className="mb-12 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between text-amber-800 text-sm font-medium">
          <div className="flex items-center gap-3">
            <span>⚠️</span>
            <span>Your Stripe account is not connected. Metrics will remain at $0.00 until setup is complete.</span>
          </div>
          <Link href="/dashboard/settings" className="bg-[#1c1c1c] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-colors">
            Setup Connection
          </Link>
        </div>
      )}

      <div className="mb-20">
        <h1 className="text-5xl font-black tracking-tight mb-2 text-[#1c1c1c]">
          Financial Overview
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Real-time Dunning & Recovery Analytics
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24 border-b border-gray-200 pb-16">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Value at Risk</h3>
          <div className="text-6xl font-black text-[#1c1c1c] tracking-tighter mb-2">
            ${valueAtRisk.toFixed(2)}
          </div>
          <p className="text-sm font-medium text-gray-500">
            {activeRecoveries.length} active invoices pending
          </p>
        </div>

        <div className="md:border-l md:border-gray-200 md:pl-16">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Recovered Revenue</h3>
          <div className="text-6xl font-black text-[#2563eb] tracking-tighter mb-2">
            ${recoveredRevenue.toFixed(2)}
          </div>
          <p className="text-sm font-medium text-gray-500">
            {recoveredPayments.length} successful recoveries
          </p>
        </div>

        <div className="md:border-l md:border-gray-200 md:pl-16">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Recovery Rate</h3>
          <div className="text-6xl font-black text-[#1c1c1c] tracking-tighter mb-2">
            {safePayments.length > 0 
              ? Math.round((recoveredPayments.length / safePayments.length) * 100) 
              : 0}%
          </div>
          <p className="text-sm font-medium text-gray-500">
            Platform average metric
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">
            Recent Activity
          </h2>
          
          {recentPayments.length === 0 ? (
            <p className="text-sm text-gray-400 font-medium italic">
              No failed payments detected yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-4 pr-8 text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200">Customer</th>
                    <th className="py-4 px-8 text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200">Amount</th>
                    <th className="py-4 px-8 text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="group">
                      <td className="py-6 pr-8 text-sm font-medium text-[#1c1c1c] border-b border-gray-100">
                        {payment.customer_email}
                      </td>
                      <td className="py-6 px-8 text-sm font-bold text-[#1c1c1c] border-b border-gray-100">
                        ${Number(payment.amount_due).toFixed(2)} <span className="text-gray-400 font-normal uppercase ml-1">{payment.currency}</span>
                      </td>
                      <td className="py-6 px-8 border-b border-gray-100">
                        <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                          payment.status === 'pending' ? 'text-amber-500' :
                          payment.status === 'recovered' ? 'text-green-500' :
                          'text-red-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            payment.status === 'pending' ? 'bg-amber-500' :
                            payment.status === 'recovered' ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 self-start">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">
            High Risk Products
          </h2>
          
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 font-medium italic">
              Not enough data to analyze.
            </p>
          ) : (
            <div className="space-y-6">
              {topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div>
                    <div className="text-sm font-bold text-[#1c1c1c] mb-1">{product.name}</div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{product.count} Failed Payments</div>
                  </div>
                  <div className="text-lg font-black text-red-500">
                    ${product.value.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}