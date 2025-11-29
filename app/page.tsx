import { LandingNavbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero"
import { FeaturesSection } from "@/components/landing/features"
import { LandingFooter } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
      </main>
      <LandingFooter />
    </div>
  )
}
