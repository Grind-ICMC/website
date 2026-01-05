import { useLanguage } from "@/contexts/LanguageContext";
import { Youtube, Github, ExternalLink } from "lucide-react";

const ContentSection = () => {
  const { t } = useLanguage();

  const contentCards = [
    {
      icon: Youtube,
      title: t("content.youtube.title"),
      description: t("content.youtube.description"),
      cta: t("content.youtube.cta"),
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      href: "https://www.youtube.com/@GrindICMC",
    },
    {
      icon: Github,
      title: t("content.github.title"),
      description: t("content.github.description"),
      cta: t("content.github.cta"),
      color: "text-foreground",
      bgColor: "bg-secondary",
      href: "https://github.com/Grind-ICMC",
    },
  ];

  return (
    <section id="content" className="relative py-16 md:py-24">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("content.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("content.subtitle")}
          </p>
          <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full mt-6" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {contentCards.map((card, index) => (
            <a
              key={index}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-glow p-6 md:p-8 group block transition-transform hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 rounded-xl ${card.bgColor} mb-5`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>

              <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {card.description}
              </p>

              <div
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors"
              >
                {card.cta}
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;
