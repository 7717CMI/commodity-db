import Image from 'next/image'

export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200"
      style={{ height: 64 }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo.png"
            alt="Coherent Market Insights"
            height={40}
            width={160}
            style={{ objectFit: 'contain', objectPosition: 'left' }}
            priority
          />
        </div>

        {/* Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-lg font-semibold text-slate-800">
            Coherent Commodity Pricing Platform
          </h1>
          <p className="text-xs text-slate-500">Commodity Price Tracker for UAE</p>
        </div>

        {/* Right spacer */}
        <div className="w-32" />
      </div>
    </header>
  )
}
