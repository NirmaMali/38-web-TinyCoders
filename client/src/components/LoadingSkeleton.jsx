export function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4 rounded" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="skeleton h-4 w-20 mb-3 rounded" />
          <div className="skeleton h-8 w-28 mb-2 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="skeleton h-4 flex-1 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
