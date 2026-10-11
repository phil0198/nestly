export default function Loading() {
  return (
    <div className="container-narrow pt-[104px]">
      <div className="skeleton mb-6 hidden h-8 w-1/2 rounded sm:block" />
      <div className="grid h-[min(560px,45vw)] min-h-[260px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl">
        <div className="skeleton col-span-4 row-span-2 sm:col-span-2" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton hidden sm:block" />
        ))}
      </div>
      <div className="mt-8 lg:flex lg:gap-[8.33%]">
        <div className="space-y-3 lg:w-[58.33%]">
          <div className="skeleton h-6 w-2/3 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="skeleton mt-8 h-24 w-full rounded-xl" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
        </div>
        <div className="skeleton hidden h-[380px] rounded-xl lg:block lg:w-[33.33%]" />
      </div>
    </div>
  );
}
