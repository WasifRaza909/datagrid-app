interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-slate-200 to-slate-100 rounded-md ${className}`}></div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="bg-white shadow-sm">
      <table className="border-collapse bg-white w-full">
        <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200">
          <tr>
            <th className="bg-slate-100 border border-slate-200 px-3 py-3 min-w-[50px]">
              <Skeleton className="h-4 w-8 mx-auto" />
            </th>
            {Array.from({ length: 8 }, (_, i) => (
              <th key={i} className="bg-slate-100 border border-slate-200 px-4 py-3 min-w-[100px]">
                <Skeleton className="h-4 w-12 mx-auto" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 15 }, (_, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-sky-50">
              <td className="bg-slate-50 border border-slate-200 px-3 py-2">
                <Skeleton className="h-4 w-6 mx-auto" />
              </td>
              {Array.from({ length: 8 }, (_, colIndex) => (
                <td key={colIndex} className="border border-slate-200 px-4 py-2 bg-white">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const TabSkeleton = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-lg" />
      ))}
    </div>
  );
};
