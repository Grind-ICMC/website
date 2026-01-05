import { useLanguage } from "@/contexts/LanguageContext";
import { Target, TrendingUp, MessageCircle, BookOpen, Award, Users } from "lucide-react";

const AboutSection = () => {
  const { t } = useLanguage();

  const goals = [
    { icon: Target, text: t("about.goal1") },
    { icon: TrendingUp, text: t("about.goal2") },
    { icon: MessageCircle, text: t("about.goal3") },
    { icon: BookOpen, text: t("about.goal4") },
    { icon: Award, text: t("about.goal5") },
    { icon: Users, text: t("about.goal6") },
  ];

  return (
    <section id="about" className="relative py-16 md:py-24">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("about.title")}
            </h2>
            <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full" />
          </div>

          {/* Description */}
          <div className="glass-card p-8 md:p-10 mb-10">
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              {t("about.description")}
            </p>
          </div>

          {/* Goals grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal, index) => (
              <div
                key={index}
                className="glass-card-glow p-5 flex items-start gap-4 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-2 bg-primary/10 rounded-lg shrink-0 transition-colors group-hover:bg-primary/20">
                  <goal.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {goal.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
