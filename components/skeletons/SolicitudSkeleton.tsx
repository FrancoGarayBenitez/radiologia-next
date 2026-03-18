import { Skeleton } from "@/components/ui/skeleton";

export function SolicitudSkeleton() {
    return (
        <div className="space-y-4 py-4">
            {/* Banner paciente */}
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3">
                <div className="flex items-center gap-4">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
            {/* Layout */}
            <div className="flex gap-5">
                {/* Catálogo */}
                <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 w-36" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex gap-3">
                                    <Skeleton className="h-9 w-9 rounded-md" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-full rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Panel lateral */}
                <div className="w-72 shrink-0 space-y-4">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            </div>
        </div>
    );
}
