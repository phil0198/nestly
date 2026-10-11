import { Header } from "@/components/header/Header";

export default function Loading() {
  return (
    <>
      <Header variant="search" />
      <div className="h-[78px]" />
      <div className="lg:flex">
        <div className="page-gutter pt-6 lg:w-[58%] xl:w-[60%]">
          <div className="skeleton mb-6 h-4 w-40 rounded" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[20/19] rounded-xl" />
                <div className="skeleton mt-3 h-4 w-3/4 rounded" />
                <div className="skeleton mt-2 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="skeleton hidden h-[calc(100vh-158px)] flex-1 lg:block" />
      </div>
    </>
  );
}
