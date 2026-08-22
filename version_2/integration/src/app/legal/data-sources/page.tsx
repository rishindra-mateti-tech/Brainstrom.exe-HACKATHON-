import Link from 'next/link';
import { Button } from '@/components/ui/base';
import { Logo } from '@/components/ui/Logo';
import { Database, Globe, Sparkles, ArrowLeft } from 'lucide-react';

export default function DataSourcesPage() {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center p-6 py-12">
            <div className="w-full max-w-3xl space-y-10">
                <div className="text-center">
                    <Logo className="mx-auto mb-6" />
                    <h1 className="text-3xl font-bold tracking-tight">Data Sources &amp; Disclosures</h1>
                    <p className="text-[hsl(var(--muted-foreground))] mt-2">
                        A plain-language explanation of where CUTiS-IQ's ingredient data comes from.
                    </p>
                </div>

                <section className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] flex items-center justify-center">
                            <Database size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Where this app's data comes from</h2>
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                        CUTiS-IQ's ingredient classifier was trained on the European Union's CosIng
                        (Cosmetic Ingredient Database), a public database maintained by the European
                        Commission that lists cosmetic ingredients along with their regulatory status
                        and functions.
                    </p>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                        For ingredients that our local classifier does not recognize, the app
                        supplements this with data scraped on-demand from INCIDecoder, a
                        third-party ingredient information website.
                    </p>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] flex items-center justify-center">
                            <Globe size={20} />
                        </div>
                        <h2 className="text-xl font-bold">About the INCIDecoder scraping</h2>
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                        When an ingredient isn't in our own trained database, CUTiS-IQ scrapes
                        supplementary information from INCIDecoder.com. We are disclosing plainly
                        that this scraping may not be fully compliant with INCIDecoder's Terms of
                        Service. This section exists for transparency about that fact.
                    </p>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-xl font-bold">AI-generated estimates</h2>
                    </div>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                        When no verified source (CosIng or INCIDecoder) is found for an ingredient,
                        CUTiS-IQ uses Google's Gemini AI to generate an estimate of that
                        ingredient's function and safety profile. Every estimate produced this way
                        is clearly labeled <span className="font-semibold text-[hsl(var(--foreground))]">&quot;AI Estimate&quot;</span> wherever
                        it appears in your product results.
                    </p>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                        AI-generated estimates should not be treated as medical, dermatological, or
                        professional skincare advice. They are a best-effort approximation, not a
                        verified fact.
                    </p>
                </section>

                <div className="pt-4 flex justify-center">
                    <Link href="/dashboard">
                        <Button variant="outline">
                            <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
