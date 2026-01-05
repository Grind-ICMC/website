import { useLanguage } from "@/contexts/LanguageContext";
import { Code2, Database, Shield, CheckCircle2, Clock } from "lucide-react";

const TracksSection = () => {
  const { t } = useLanguage();

  const tracks = [
    {
      icon: Code2,
      title: t("tracks.swe.title"),
      description: t("tracks.swe.description"),
      status: t("tracks.swe.status"),
      isActive: true,
    },
    {
      icon: Database,
      title: t("tracks.data.title"),
      description: t("tracks.data.description"),
      status: t("tracks.data.status"),
      isActive: false,
    },
    {
      icon: Shield,
      title: t("tracks.security.title"),
      description: t("tracks.security.description"),
      status: t("tracks.security.status"),
      isActive: false,
    },
  ];

  return (
    <section id="tracks" className="relative py-16 md:py-24">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("tracks.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("tracks.subtitle")}
          </p>
          <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full mt-6" />
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tracks.map((track, index) => (
            <div
              key={index}
              className={`glass-card-glow p-6 md:p-8 flex flex-col ${
                !track.isActive ? "opacity-60" : ""
              }`}
            >
              {/* Status badge */}
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`p-3 rounded-xl ${
                    track.isActive ? "bg-primary/10" : "bg-secondary"
                  }`}
                >
                  <track.icon
                    className={`w-6 h-6 ${
                      track.isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${
                    track.isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {track.isActive ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  {track.status}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3">{track.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                {track.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TracksSection;
