"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-4 font-sans text-[#1c1c1c]">
      {/* Container-ul principal (Floating Card-ul masiv) */}
      <div className="max-w-5xl w-full flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white min-h-[600px]">
        
        {/* PARTEA STÂNGĂ (Formularul alb) */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="absolute top-8 left-10 md:left-16">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#1c1c1c]">
              Dunning SaaS
            </span>
          </div>

          <div className="mt-12 md:mt-0 max-w-sm w-full mx-auto">
            <h1 className="text-4xl font-black tracking-tight mb-2">
              {isLogin ? "Sign in" : "Create account"}
            </h1>
            <p className="text-sm text-gray-500 mb-8 font-medium">
              {isLogin 
                ? "Welcome back. Enter your credentials to continue." 
                : "Start recovering your revenue today."}
            </p>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-lg px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-[#1c1c1c] text-lg px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-lg py-4 rounded-xl transition-colors disabled:opacity-70"
              >
                {loading ? "Processing..." : (isLogin ? "Sign in" : "Create account")}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-500 hover:text-[#1c1c1c] font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-[#2563eb] font-bold">
                  {isLogin ? "Create account" : "Sign in"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* PARTEA DREAPTĂ (Panoul de Marketing negru/închis) */}
        <div className="hidden md:flex w-full md:w-1/2 bg-[#1c1c1c] p-16 flex-col justify-center relative overflow-hidden text-[#fcfcfc]">
          {/* Element vizual abstract (Grid subtil pentru vibe de date/financiar) */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 max-w-md">
            <h2 className="text-5xl font-black tracking-tight leading-[1.1] mb-6">
              Recover failed payments on autopilot.
            </h2>
            <p className="text-lg text-gray-400 font-medium leading-relaxed mb-12">
              Join modern SaaS companies saving thousands in lost revenue every month with our automated Dunning engine.
            </p>
            
            {/* Element de Trust (Indicator vizual B2B) */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#1c1c1c] bg-gray-700"></div>
                <div className="w-10 h-10 rounded-full border-2 border-[#1c1c1c] bg-gray-600"></div>
                <div className="w-10 h-10 rounded-full border-2 border-[#1c1c1c] bg-[#2563eb] flex items-center justify-center text-xs font-bold">+</div>
              </div>
              <div className="text-sm font-bold tracking-wide text-gray-400 uppercase">
                Trusted by modern startups
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}