import { Card } from "@/components/ui/base";

export default function Loading() {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            <nav className="border-b bg-white px-6 py-4 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="flex items-center gap-6">
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="h-[400px] animate-pulse bg-gray-100" children={null} />
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Card className="h-32 animate-pulse bg-gray-100" children={null} />
                        <Card className="h-32 animate-pulse bg-gray-100" children={null} />
                    </div>
                </div>
                <div className="space-y-8">
                    <Card className="h-48 animate-pulse bg-gray-200" children={null} />
                    <Card className="h-64 animate-pulse bg-gray-100" children={null} />
                </div>
            </main>
        </div>
    );
}
