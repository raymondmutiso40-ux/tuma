import Skeleton, { SkeletonGroup } from "@/components/ui/Skeleton";

/**
 * Shown while the ticket page reads the booking and renders its QR code.
 * The shapes match the real ticket so nothing jumps when it arrives.
 */
export default function TicketLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <SkeletonGroup label="Preparing your ticket">
        <div className="flex flex-col items-center mb-9">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="h-3 w-32 mt-4" />
          <Skeleton className="h-9 w-72 mt-3" />
          <Skeleton className="h-4 w-64 mt-3" />
        </div>

        <div className="w-full max-w-[26rem] mx-auto rounded-xl border border-ink-200 bg-white overflow-hidden shadow-ticket">
          <Skeleton className="h-[68px] w-full rounded-none" />
          <div className="p-5 space-y-5">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
            <Skeleton className="h-14 w-full" />
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="w-[124px] h-[124px] shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          </div>
        </div>
      </SkeletonGroup>
    </div>
  );
}
