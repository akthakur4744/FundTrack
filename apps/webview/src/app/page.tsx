export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          💰 FundTrack
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Track your expenses, manage budgets, and gain financial insights
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">Learn More</button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl px-4">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">📊 Real-time Tracking</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Track expenses instantly across all your devices
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">💡 Smart Budgets</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Set budgets and receive alerts when you exceed limits
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">📈 Insights</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get detailed reports and spending trends
          </p>
        </div>
      </div>
    </div>
  );
}
