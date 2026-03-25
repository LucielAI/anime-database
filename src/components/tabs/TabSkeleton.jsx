export default function TabSkeleton() {
  return (
    <div className="min-h-[400px] animate-pulse">
      <div className="space-y-4">
        <div className="h-8 bg-white/5 rounded-lg w-1/3" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
