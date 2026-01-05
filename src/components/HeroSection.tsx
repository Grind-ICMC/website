import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Github, Calendar, Code2, Users, MessageSquare } from "lucide-react";
import { GiIciclesAura } from "react-icons/gi";
import LottieDev from "./lottie_dev";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center pt-20">
      <div className="section-container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card text-sm">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              
              <span className="text-muted-foreground">ICMC-USP Extension Group</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance">
              {t("hero.title").split(" ").map((word, i) => (
                <span
                  key={i}
                  className={
                    word.toLowerCase() === "big" || word.toLowerCase() === "tech"
                      ? "text-gradient glow-text"
                      : ""
                  }
                >
                  {word}{" "}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              {t("hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a href="mailto:grindicmc@gmail.com" className="btn-primary inline-flex items-center gap-2 group">
                {t("hero.cta.join")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#"
                className="btn-secondary inline-flex items-center gap-2"
                aria-label="GitHub placeholder"
              >
                <Github className="w-5 h-5" />
                {t("hero.cta.github")}
              </a>
            </div>
          </div>

          {/* Right content - Logo + Cadence Card */}
          <div className="relative flex flex-col items-center gap-8">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] animate-pulse-slow" />
             <LottieDev />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
