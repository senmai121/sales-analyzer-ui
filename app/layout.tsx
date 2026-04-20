import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sales Analyzer',
  description: 'AI-powered product catalog analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
              SalesAnalyzer
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link href="/search" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Search
              </Link>
              <Link href="/ranking" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Ranking
              </Link>
              <Link href="/insights" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Insights
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
