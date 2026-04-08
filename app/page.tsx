import { Gnb } from "@/components/gnb";
import { HeroSection } from "@/components/hero-section";
import { PricingSection } from "@/components/pricing-section";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Gnb />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <HeroSection />
        <PricingSection />
      </main>
    </div>
  );
}
