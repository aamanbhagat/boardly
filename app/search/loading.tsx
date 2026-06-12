import { Container } from "@/components/ui/container";

export default function SearchLoading() {
  return (
    <main id="main" className="flex-1" aria-busy>
      <Container className="py-10 lg:py-14">
        <div className="h-4 w-40 animate-pulse rounded-full bg-bg-alt" />
        <div className="mt-8 h-12 w-32 animate-pulse rounded-full bg-bg-alt" />
        <div className="mt-6 h-14 w-full animate-pulse rounded-pill bg-bg-alt" />
        <div className="mt-5 flex gap-3">
          <div className="h-10 w-32 animate-pulse rounded-full bg-bg-alt" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-bg-alt" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-bg-alt" />
        </div>
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-card border border-border bg-bg-alt"
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
