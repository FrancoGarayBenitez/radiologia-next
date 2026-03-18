import { Skeleton } from "@/components/ui/skeleton";

export function HistorialSkeleton() {
    return (
        <div className="py-8 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-72" />
            </div>
            {/* Filtros */}
            <div className="flex gap-3">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-44" />
                <Skeleton className="h-9 w-44" />
            </div>
            {/* Cards */}
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-72" />
                                <Skeleton className="h-3 w-56" />
                            </div>
                            <div className="space-y-2 items-end flex flex-col">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-7 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
