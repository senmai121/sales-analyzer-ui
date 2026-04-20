import Link from 'next/link'

const features = [
  {
    title: 'Smart Search',
    description:
      'Search products using natural language. Ask for "comfortable running shoes for women" or "blue jeans under $50" and get AI-matched results.',
    href: '/search',
    icon: '🔍',
    cta: 'Search Products',
    color: 'indigo',
  },
  {
    title: 'Product Ranking',
    description:
      'See AI-powered product rankings filtered by gender and category. Understand which products score highest and why.',
    href: '/ranking',
    icon: '🏆',
    cta: 'View Rankings',
    color: 'amber',
  },
  {
    title: 'Business Insights',
    description:
      'Get a high-level analysis of your entire catalog: top brands, underperforming products, category gaps, and pricing tips.',
    href: '/insights',
    icon: '📊',
    cta: 'View Insights',
    color: 'emerald',
  },
]

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
  amber: 'bg-amber-50 border-amber-200 hover:border-amber-400',
  emerald: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
}

const btnColorMap: Record<string, string> = {
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  amber: 'bg-amber-500 hover:bg-amber-600',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
}

const iconBgMap: Record<string, string> = {
  indigo: 'bg-indigo-100',
  amber: 'bg-amber-100',
  emerald: 'bg-emerald-100',
}

export default function Home() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Product Catalog AI Analysis</h1>
        <p className="text-lg text-gray-500 max-w-2xl">
          Leverage AI to search, rank, and analyze your product catalog. Get actionable insights
          from customer reviews and sales data — all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.href}
            className={`rounded-xl border-2 p-6 flex flex-col transition-all ${colorMap[f.color]}`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 ${iconBgMap[f.color]}`}>
              {f.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{f.title}</h2>
            <p className="text-gray-600 text-sm flex-1 mb-5">{f.description}</p>
            <Link
              href={f.href}
              className={`inline-block text-center text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ${btnColorMap[f.color]}`}
            >
              {f.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">How it works</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
          <li>Use <strong>Smart Search</strong> to find products by natural language query — click any result to see its full AI summary.</li>
          <li>Use <strong>Product Ranking</strong> to filter by gender and category and see which products rank highest with AI scoring.</li>
          <li>Use <strong>Business Insights</strong> for a catalog-wide AI analysis covering brand performance, gaps, and pricing strategy.</li>
        </ol>
      </div>
    </div>
  )
}
