import { Skeleton } from "@/components/ui/skeleton";

export function PacienteSkeleton() {
    return (
        <div className="max-w-lg mx-auto py-8 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="border border-slate-200 rounded-xl p-6 space-y-5">
                <Skeleton className="h-9 w-full" />
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                </div>
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
        </div>
    );
}
