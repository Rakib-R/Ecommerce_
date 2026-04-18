
export const GridSkeleton = () => (
  <div className="m-auto grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-7 gap-6">
    {Array.from({ length: 13 }).map((_, i) => (
      <div key={i} className="h-[220px] bg-gray-300 animate-pulse rounded-xl" />
    ))}
  </div>
);


export const SmallSkeleton = () => (
  <div className="m-auto grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-7 gap-6">
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="h-[220px] bg-gray-300 animate-pulse rounded-xl" />
    ))}
  </div>
);