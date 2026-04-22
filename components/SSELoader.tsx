export function SSELoader({ message }: { message: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-mint/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-mint animate-spin" />
      </div>
      {message && (
        <p className="text-sm text-ink-2 animate-pulse font-medium">{message}</p>
      )}
    </div>
  )
}
