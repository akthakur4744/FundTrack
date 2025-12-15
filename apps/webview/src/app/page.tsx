export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0a1a] overflow-hidden">
      {/* Gradient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero Section */}
        <div className="text-center mb-20">
          {/* Premium Badge */}
          <div className="inline-block mb-8 px-4 py-2 bg-[#d4af37]/10 border border-[#d4af37]/50 rounded-full">
            <span className="text-[#d4af37] text-sm font-semibold">✨ Premium Expense Tracker</span>
          </div>

          {/* Main Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Your Money,</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-[#d4af37] bg-clip-text text-transparent">
              Your Control
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-[#b0afc0] mb-12 max-w-2xl mx-auto leading-relaxed">
            Track expenses with elegance, manage budgets with precision, and gain financial insights that matter
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Get Started Now
            </button>
            <button className="btn-secondary">
              View Features
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-6xl mt-20">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Choose <span className="text-gradient">FundTrack</span>?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                Real-time Tracking
              </h3>
              <p className="text-[#b0afc0] text-lg leading-relaxed">
                Track expenses instantly across all your devices with seamless synchronization
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                Smart Budgets
              </h3>
              <p className="text-[#b0afc0] text-lg leading-relaxed">
                Set intelligent budgets and receive alerts when you exceed category limits
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                Deep Insights
              </h3>
              <p className="text-[#b0afc0] text-lg leading-relaxed">
                Get detailed reports and spending trends to understand your finances better
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="w-full max-w-6xl mt-24 py-16 border-t border-[#3d2e5f]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="text-4xl font-bold text-gradient mb-2">10K+</h4>
              <p className="text-[#b0afc0]">Active Users</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold text-gradient mb-2">$100M+</h4>
              <p className="text-[#b0afc0]">Tracked Expenses</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold text-gradient mb-2">99.9%</h4>
              <p className="text-[#b0afc0]">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
