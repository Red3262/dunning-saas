"use client";

import { useState, useEffect } from "react";
// Importăm Supabase exact din utilitarul proiectului tău
import { createClient } from "@/utils/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Starea curată, strict cu setările necesare pentru MVP-ul stabil
  const [formData, setFormData] = useState({
    company_name: "",
    reply_to_email: "",
    primary_color: "#635BFF",
    footer_text: "",
    resend_api_key: "",
  });

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('client_settings')
          .select('*')
          .eq('profile_id', user.id)
          .single();

        if (data) {
          setFormData({
            company_name: data.company_name || "",
            reply_to_email: data.reply_email || "",
            primary_color: data.primary_color || "#635BFF",
            footer_text: data.footer_text || "",
            resend_api_key: data.resend_api_key || "",
          });
        }
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('client_settings').upsert({
        profile_id: user.id,
        company_name: formData.company_name,
        reply_email: formData.reply_to_email,
        primary_color: formData.primary_color,
        footer_text: formData.footer_text,
        resend_api_key: formData.resend_api_key,
        updated_at: new Date().toISOString(),
      });
    }
    setIsSaving(false);
    alert("Setările au fost salvate cu succes!");
  };

  if (isLoading) return <div className="p-8 text-gray-500 font-medium">Se încarcă setările...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Brand & Stripe</h1>
        <p className="text-gray-500">Gestionează setările de recuperare, cheile API și identitatea brandului tău.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        
        {/* SECȚIUNEA DE BRANDING */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c] mb-6 border-b border-gray-200 pb-4">Identitate Brand</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Nume Companie</label>
              <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all" placeholder="Ex: Compania Ta SRL" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email de Răspuns (Reply-to)</label>
              <input type="email" value={formData.reply_to_email} onChange={(e) => setFormData({...formData, reply_to_email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all" placeholder="facturare@domeniultau.ro" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Culoare Principală (Hex)</label>
              <div className="flex gap-3">
                <input type="color" value={formData.primary_color} onChange={(e) => setFormData({...formData, primary_color: e.target.value})} className="h-14 w-14 rounded-xl cursor-pointer border-0 p-0" />
                <input type="text" value={formData.primary_color} onChange={(e) => setFormData({...formData, primary_color: e.target.value})} className="flex-1 bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all font-mono" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Text Subsol Email</label>
              <input type="text" value={formData.footer_text} onChange={(e) => setFormData({...formData, footer_text: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all" placeholder="Dacă ai întrebări, răspunde la acest email." />
            </div>
          </div>
        </section>

        {/* SECȚIUNEA STRIPE CONNECT (Funcțională) */}
        <section className="bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-2">Conectează contul de Stripe</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto">Autorizează Dunning SaaS să monitorizeze în siguranță plățile eșuate și să recupereze automat veniturile pentru tine.</p>
          <a href="https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_UeFI6hTMJN1ugbCIF7XfxSwHtkDPnXXD&scope=read_write&redirect_uri=https://dunning-saas-beta.vercel.app/api/auth/stripe/callback" className="inline-block bg-[#635BFF] hover:bg-[#4B45C6] text-white font-bold py-4 px-10 rounded-xl transition-all shadow-md">
            Connect with Stripe
          </a>
        </section>

        {/* SECȚIUNEA AI DUNNING (Revenire la Coming Soon) */}
        <div className="mb-16 p-8 bg-gray-50 border border-gray-200 rounded-3xl relative overflow-hidden opacity-75">
          <div className="absolute top-6 right-6">
            <span className="bg-[#635BFF] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
              Coming Soon
            </span>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Smart AI Dunning <span className="text-sm font-medium text-gray-500 ml-2">(Beta)</span></h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xl mb-6">
                Agentul nostru AI va analiza automat datele din Stripe, va scrie emailuri de recuperare hiper-personalizate și va crea un program optimizat. Toate planurile generate vor necesita aprobarea ta manuală (Human-in-the-loop).
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-5 bg-gray-200 rounded-full relative cursor-not-allowed">
                  <div className="w-3 h-3 bg-white rounded-full absolute top-1 left-1"></div>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Disabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECȚIUNEA API INTEGRATIONS */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1c1c1c] mb-6 border-b border-gray-200 pb-4">Integrări API</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Resend API Key</label>
              <input type="password" value={formData.resend_api_key} onChange={(e) => setFormData({...formData, resend_api_key: e.target.value})} className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-sm px-4 py-4 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all" placeholder="re_..." />
              <p className="text-xs text-gray-500 mt-2">Necesar pentru expedierea emailurilor automate de pe domeniul tău.</p>
            </div>
          </div>
        </section>

        <div className="pt-8 border-t border-gray-200 flex justify-end">
          <button type="submit" disabled={isSaving} className="bg-gray-900 hover:bg-black text-white font-bold py-4 px-10 rounded-xl transition-all disabled:opacity-50">
            {isSaving ? "Se salvează..." : "Salvează Setările"}
          </button>
        </div>

      </form>
    </div>
  );
}