"use client";

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { createClient } from "@/utils/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    stripe_secret_key: "",
    stripe_webhook_secret: "",
    resend_api_key: "",
    company_name: "",
    sender_name: "",
    reply_email: "",
    reply_to_email: "",
    primary_color: "#2563eb",
    footer_text: "",
    ai_provider: "gemini",
    ai_api_key: "",
  });

  // URL-ul pentru conectarea securizată cu Stripe Connect OAuth
 // Dacă vrei să te întorci pe varianta Live, pune așa:
const stripeConnectUrl = "https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_UeFI6hTMJN1ugbCIF7XfxSwHtkDPnXXD&scope=read_write&redirect_uri=https://dunning-saas-beta.vercel.app/api/auth/stripe/callback";

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("client_settings")
          .select("*")
          .eq("profile_id", user.id)
          .maybeSingle();

        if (data) {
          setFormData({
            stripe_secret_key: data.stripe_secret_key || "",
            stripe_webhook_secret: data.stripe_webhook_secret || "",
            resend_api_key: data.resend_api_key || "",
            company_name: data.company_name || "",
            sender_name: data.sender_name || "",
            reply_email: data.reply_email || "",
            reply_to_email: data.reply_to_email || "",
            primary_color: data.primary_color || "#2563eb",
            footer_text: data.footer_text || "",
            ai_provider: data.ai_provider || "gemini",
            ai_api_key: data.ai_api_key || "",
          });
        }
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("client_settings")
      .upsert(
        {
          profile_id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id' }
      );

    if (error) {
      setMessage("❌ Failed to save configuration.");
      console.error(error);
    } else {
      setMessage("✓ Configuration saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-bold tracking-widest text-gray-400 uppercase animate-pulse">
          Loading core settings...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl pb-24 animate-in fade-in duration-500">
      <div className="mb-16">
        <h1 className="text-5xl font-black tracking-tight mb-2 text-[#1c1c1c]">
          Settings
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Configure your API integrations and brand identity.
        </p>
      </div>

      {/* Butonul de conectare Stripe */}
      <div className="p-8 border-2 border-gray-100 rounded-3xl bg-white shadow-sm mb-16 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M13.976 9.15c-2.172-.806-3.356-1.143-3.356-2.077 0-.696.687-1.225 1.841-1.225 1.528 0 2.628.453 3.653.946l.865-3.363C15.65 2.766 14.12 2.4 12.396 2.4c-4.417 0-7.391 2.308-7.391 5.672 0 4.908 6.844 3.966 6.844 5.92 0 .93-.843 1.341-2.096 1.341-1.636 0-3.344-.658-4.664-1.39l-.92 3.424c1.472.76 3.47 1.258 5.485 1.258 4.67 0 7.552-2.22 7.552-5.786 0-2.455-1.503-3.9-3.23-4.689zM24 11.5c0-6.351-5.149-11.5-11.5-11.5S1 5.149 1 11.5 6.149 23 12.5 23 24 17.851 24 11.5z" opacity=".2"/><path d="M11.988 3.625c-3.155 0-5.28 1.648-5.28 4.051 0 3.506 4.889 2.833 4.889 4.229 0 .664-.602.958-1.497.958-1.168 0-2.389-.47-3.331-.993l-.657 2.446c1.051.543 2.478.898 3.918.898 3.335 0 5.394-1.586 5.394-4.133 0-1.754-1.074-2.786-2.308-3.35-1.551-.575-2.397-.816-2.397-1.483 0-.497.49-.875 1.315-.875 1.092 0 1.878.324 2.61.676l.617-2.402c-.952-.476-2.043-.736-3.273-.736z"/></svg>
        </div>
        <h3 className="text-xl font-black text-[#1c1c1c] mb-2">Connect your Stripe Account</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Authorize Dunning SaaS to securely monitor your failed payments and recover revenue automatically.
        </p>
        <Link href={stripeConnectUrl}>
          <button className="bg-[#635BFF] hover:bg-[#4B45C6] text-white font-bold py-3 px-8 rounded-full transition-all shadow-md hover:shadow-lg">
            Connect with Stripe
          </button>
        </Link>
      </div>

      {/* AI Coming Soon Card */}
      <div className="mb-16 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl relative overflow-hidden">
        <div className="absolute top-6 right-6">
          <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
            Coming Soon
          </span>
        </div>
        <div className="flex items-start gap-6">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Smart AI Dunning <span className="text-sm font-bold text-indigo-600 ml-2">(Beta)</span></h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed max-w-xl mb-6">
              Our AI agent will automatically analyze your Stripe data, write hyper-personalized recovery emails, detect branding from your website, and create an optimized recovery schedule. All generated plans require your manual approval (Human-in-the-loop) before activation.
            </p>
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-not-allowed">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Disabled</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-16">
        
        {/* Section 1: API Integrations */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c] mb-8 border-b border-gray-200 pb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            API Integrations
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Stripe Secret Key</label>
                <input
                  type="password"
                  value={formData.stripe_secret_key}
                  onChange={(e) => setFormData({ ...formData, stripe_secret_key: e.target.value })}
                  placeholder="sk_live_..."
                  className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Stripe Webhook Secret</label>
                <input
                  type="password"
                  value={formData.stripe_webhook_secret}
                  onChange={(e) => setFormData({ ...formData, stripe_webhook_secret: e.target.value })}
                  placeholder="whsec_..."
                  className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Resend API Key</label>
              <input
                type="password"
                value={formData.resend_api_key}
                onChange={(e) => setFormData({ ...formData, resend_api_key: e.target.value })}
                placeholder="re_..."
                className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
              />
              <p className="text-[11px] text-gray-400 font-medium mt-1">Required for sending automated recovery emails.</p>
            </div>
          </div>
        </section>

        {/* Sectiunea AI Engine (NOUĂ) */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c] mb-8 border-b border-gray-200 pb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AI Autopilot Engine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">AI Provider</label>
              <select
                name="ai_provider"
                value={formData.ai_provider}
                onChange={(e) => setFormData({ ...formData, ai_provider: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all appearance-none cursor-pointer"
              >
                <option value="gemini">Google Gemini (Has Free Tier)</option>
                <option value="openai">OpenAI (GPT-4 / GPT-3.5)</option>
                <option value="anthropic">Anthropic (Claude 3)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your AI API Key</label>
              <input
                type="password"
                name="ai_api_key"
                value={formData.ai_api_key}
                onChange={(e) => setFormData({ ...formData, ai_api_key: e.target.value })}
                placeholder="Paste your API key here..."
                className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Brand Identity */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c] mb-8 border-b border-gray-200 pb-4 flex items-center gap-2">
             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Brand Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Company Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g. Acme Corp"
                className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Sender Name</label>
              <input
                type="text"
                value={formData.sender_name}
                onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                placeholder="e.g. Acme Corp Billing"
                className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Reply-To Email</label>
              <input
                type="email"
                value={formData.reply_to_email}
                onChange={(e) => setFormData({ ...formData, reply_to_email: e.target.value })}
                placeholder="billing@yourdomain.com"
                className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Brand Color</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="flex-1 bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
                />
              </div>
            </div>
            <div className="space-y-4 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Footer Address</label>
              <input
                type="text"
                value={formData.footer_text}
                onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                placeholder="123 Startup Blvd, San Francisco, CA 94107"
                className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
              />
            </div>
          </div>
        </section>

        <div className="pt-8 flex items-center gap-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1c1c1c] hover:bg-black text-white px-10 py-5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
          {message && (
            <span className={`text-sm font-bold ${message.includes("✓") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}