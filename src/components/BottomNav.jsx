function DashboardIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function PlanIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-2 12H7v-2h10v2zm0-4H7V9h10v2z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  )
}

function InspectIcon({ filled }) {
  return filled ? (
    <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24">
      <path d="M15 4H9a1 1 0 0 0-1 1v1H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V5a1 1 0 0 0-1-1z" fill="currentColor" />
      <path d="M10 14.5l1 1 3-3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg className="w-4 h-4 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  )
}

export default function BottomNav({ activeTab, onSwitch }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-40">
      <div className="max-w-md mx-auto flex py-1.5">
        <button
          onClick={() => onSwitch('dashboard')}
          className={`flex-1 flex flex-col items-center transition-colors ${
            activeTab === 'dashboard' ? 'text-slate-800' : 'text-gray-400'
          }`}
        >
          <DashboardIcon filled={activeTab === 'dashboard'} />
          <span className="text-[10px] font-medium">看板</span>
        </button>
        <button
          onClick={() => onSwitch('plan')}
          className={`flex-1 flex flex-col items-center transition-colors ${
            activeTab === 'plan' ? 'text-slate-800' : 'text-gray-400'
          }`}
        >
          <PlanIcon filled={activeTab === 'plan'} />
          <span className="text-[10px] font-medium">计划</span>
        </button>
        <button
          onClick={() => onSwitch('inspect')}
          className={`flex-1 flex flex-col items-center transition-colors ${
            activeTab === 'inspect' ? 'text-slate-800' : 'text-gray-400'
          }`}
        >
          <InspectIcon filled={activeTab === 'inspect'} />
          <span className="text-[10px] font-medium">巡查</span>
        </button>
      </div>
    </nav>
  )
}
