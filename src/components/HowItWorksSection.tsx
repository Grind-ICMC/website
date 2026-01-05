import { useLanguage } from "@/contexts/LanguageContext";
import { FileCode, Users2, ClipboardCheck, Video } from "lucide-react";

const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: FileCode,
      number: "01",
      title: t("how.step1.title"),
      description: t("how.step1.description"),
    },
    {
      icon: Users2,
      number: "02",
      title: t("how.step2.title"),
      description: t("how.step2.description"),
    },
    {
      icon: ClipboardCheck,
      number: "03",
      title: t("how.step3.title"),
      description: t("how.step3.description"),
    },
    {
      icon: Video,
      number: "04",
      title: t("how.step4.title"),
      description: t("how.step4.description"),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-16 md:py-24">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("how.title")}
          </h2>
          <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent hidden sm:block" />

          <div className="space-y-8 md:space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-12 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Step number circle */}
                <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center z-10 hidden sm:flex">
                  <span className="text-primary font-bold text-lg font-mono">
                    {step.number}
                  </span>
                </div>

                {/* Content card */}
                <div
                  className={`glass-card-glow p-6 md:p-8 flex-1 ${
                    index % 2 === 0 ? "md:mr-auto md:pr-16" : "md:ml-auto md:pl-16"
                  } md:max-w-[calc(50%-2rem)]`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0 sm:hidden">
                      <span className="text-primary font-bold text-sm font-mono">
                        {step.number}
                      </span>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0 hidden sm:block">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
