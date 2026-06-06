import Link from "next/link";

// Acesta este un avantaj masiv pentru SEO. Next.js va injecta aceste date în header-ul paginii.
export const metadata = {
  title: "Automated Stripe Dunning & Revenue Recovery",
  description: "Stop losing MRR to failed payments. Connect Stripe, set up automated email sequences, and recover lost revenue on autopilot.",
  keywords: "stripe dunning, revenue recovery, failed payments, saas churn, automated dunning software"
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1c1c1c] font-sans selection:bg-[#2563eb] selection:text-white">
      
      {/* NAVBAR */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="text-xl font-black uppercase tracking-[0.2em]">
          Dunning<span className="text-[#2563eb]">SaaS</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-[#1c1c1c] transition-colors">
            Sign In
          </Link>
          <Link href="/login" className="bg-[#1c1c1c] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#2563eb] transition-all shadow-lg hover:shadow-xl">
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="w-full max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        
        {/* SEO H1 - Titlul principal */}
        <h1 className="max-w-4xl text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-8">
          Stop losing MRR to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-[#1c1c1c]">failed payments.</span>
        </h1>
        
        <p className="max-w-2xl text-xl text-gray-500 font-medium leading-relaxed mb-12">
          An enterprise-grade dunning engine for modern startups. Connect your Stripe account, design your recovery workflows, and let our system save your revenue on autopilot.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login" className="w-full sm:w-auto bg-[#2563eb] text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-[#1d4ed8] transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)]">
            Start Recovering Revenue
          </Link>
          <div className="text-sm font-bold tracking-widest text-gray-400 uppercase mt-4 sm:mt-0 sm:ml-4">
            Takes 2 minutes to setup
          </div>
        </div>

        {/* FAKE DASHBOARD PREVIEW (Niche Touch / Premium Feel) */}
        <div className="mt-24 w-full max-w-5xl relative">
          {/* Un gradient subtil în spate pentru efectul de lux */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2563eb] to-gray-400 rounded-[2.5rem] blur-2xl opacity-20"></div>
          
          <div className="relative bg-[#1c1c1c] rounded-[2rem] border border-gray-800 shadow-2xl overflow-hidden">
            {/* Fereastra de browser fake (Mac style) */}
            <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-2 bg-[#1c1c1c]">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            
            {/* Conținutul fals al dashboard-ului pentru a atrage ochiul */}
            <div className="p-8 md:p-12 flex flex-col md:flex-row gap-12">
              <div className="flex-1 space-y-6">
                <div className="h-4 w-32 bg-gray-800 rounded-full"></div>
                <div className="text-5xl font-black text-white">$42,500.00</div>
                <div className="text-sm font-bold uppercase tracking-widest text-green-400">Revenue Recovered This Month</div>
                <div className="pt-8 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-xs">✉️</div>
                        <div className="text-sm text-gray-400">Recovery Step {i} Sent</div>
                      </div>
                      <div className="text-sm font-bold text-white">Success</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 bg-[#232323] rounded-2xl p-8 border border-gray-800 flex flex-col justify-center items-center text-center">
                 <div className="w-16 h-16 bg-[#2563eb]/20 text-[#2563eb] rounded-full flex items-center justify-center text-2xl mb-6 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                   ⚡️
                 </div>
                 <h3 className="text-white text-xl font-bold mb-2">Stripe Connected</h3>
                 <p className="text-gray-400 text-sm">Listening for failed.payment events via secure webhook.</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER SIMPLU SEO */}
      <footer className="w-full border-t border-gray-200 bg-white py-12 text-center">
        <p className="text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} DunningSaaS. Built for modern MRR businesses.
        </p>
      </footer>
    </div>
  );
}