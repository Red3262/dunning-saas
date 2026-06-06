"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    sender_name: "",
    reply_email: "",
    primary_color: "#2563eb",
    footer_text: "",
    stripe_webhook_secret: "",
  });

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
            sender_name: data.sender_name || "",
            reply_email: data.reply_email || "",
            primary_color: data.primary_color || "#2563eb",
            footer_text: data.footer_text || "",
            stripe_webhook_secret: data.stripe_webhook_secret || "",
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

    // Folosim o logică curată de upsert cu specificarea id-ului de conflict
    const { error } = await supabase
      .from("client_settings")
      .upsert(
        {
          profile_id: user.id,
          ...formData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'profile_id' } // Îi spunem bazei că profilul unic este cheia de legătură
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
          Brand & Stripe
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Configure your recovery engine identity and payment connections.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-16">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c] mb-8 border-b border-gray-200 pb-4">
            1. Core Connection
          </h2>
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Stripe Webhook Secret</label>
            <input
              type="password"
              value={formData.stripe_webhook_secret}
              onChange={(e) => setFormData({ ...formData, stripe_webhook_secret: e.target.value })}
              placeholder="whsec_..."
              className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
            />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c] mb-8 border-b border-gray-200 pb-4">
            2. Brand Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                value={formData.reply_email}
                onChange={(e) => setFormData({ ...formData, reply_email: e.target.value })}
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