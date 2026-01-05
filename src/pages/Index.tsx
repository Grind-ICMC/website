import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TracksSection from "@/components/TracksSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import ContentSection from "@/components/ContentSection";
import ICMCSection from "@/components/ICMCSection";
import FAQSection from "@/components/FAQSection";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";

const PageContent = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = t("meta.title");
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", t("meta.description"));
    }
    document.documentElement.lang = language;
  }, [t, language]);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <TracksSection />
        <HowItWorksSection />
        <ContentSection />
        <ICMCSection />
        <FAQSection />
        {/* <JoinSection /> */}
      </main>
      <Footer />
    </div>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <PageContent />
    </LanguageProvider>
  );
};

export default Index;
