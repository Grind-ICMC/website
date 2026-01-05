import { useLanguage } from "@/contexts/LanguageContext";
import { GraduationCap, Beaker, Users, ExternalLink } from "lucide-react";

const ICMCSection = () => {
  const { t } = useLanguage();

  const highlights = [
    { icon: Beaker, text: t("icmc.highlight1") },
    { icon: GraduationCap, text: t("icmc.highlight2") },
    { icon: Users, text: t("icmc.highlight3") },
  ];

  return (
    <section id="icmc" className="relative py-16 md:py-24">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("icmc.title")}
            </h2>
            <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full" />
          </div>

          <div className="glass-card p-8 md:p-10">
            <img src="/icmc-logo.svg" alt="ICMC Logo" className="h-24 mx-auto mb-8" />
            
            <p className="text-lg text-muted-foreground leading-relaxed text-center mb-8">
              {t("icmc.description")}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-4"
                >
                  <div className="p-3 bg-primary/10 rounded-xl mb-3">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href="https://www.icmc.usp.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-border/50 rounded-lg transition-colors hover:border-primary/50"
              >
                {t("icmc.cta")}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ICMCSection;
