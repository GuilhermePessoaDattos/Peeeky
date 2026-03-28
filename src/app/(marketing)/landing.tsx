import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { BlogSection } from "@/components/marketing/BlogSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { CtaSection } from "@/components/marketing/CtaSection";

export function LandingPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <BlogSection />
      <FaqSection />
      <CtaSection />
    </MarketingLayout>
  );
}
