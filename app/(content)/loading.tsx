import { Container } from "@/components/ui/container";

export default function Loading() {
  return (
    <main id="main" className="flex-1" aria-busy>
      <Container className="py-10 lg:py-14">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-bg-alt" />
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden h-96 animate-pulse rounded-card-lg border border-border bg-bg-alt lg:block" />
          <div className="space-y-4">
            <div className="h-8 w-1/2 animate-pulse rounded-full bg-bg-alt" />
            <div className="h-12 w-3/4 animate-pulse rounded-full bg-bg-alt" />
            <div className="h-4 w-full animate-pulse rounded-full bg-bg-alt" />
            <div className="h-4 w-11/12 animate-pulse rounded-full bg-bg-alt" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-card-lg border border-border bg-bg-alt"
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
