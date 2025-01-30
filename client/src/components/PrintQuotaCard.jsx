const PrintQuotaCard = () => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Print Quota</h2>
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span>Monthly Usage</span>
          <span>42 / 500 pages</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "8.4%" }}></div>
        </div>
      </div>
      <p className="text-sm text-gray-400">Your quota resets in 18 days</p>
    </div>
  )
  export default PrintQuotaCard