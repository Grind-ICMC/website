import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, MessageCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JoinSection = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: language === "pt" ? "Inscrição recebida!" : "Application received!",
        description: language === "pt" 
          ? "Entraremos em contato em breve." 
          : "We'll be in touch soon.",
      });
    }, 1000);
  };

  const preparingOptions = [
    { value: "internship", label: t("join.form.preparing.internship") },
    { value: "newgrad", label: t("join.form.preparing.newgrad") },
    { value: "experienced", label: t("join.form.preparing.experienced") },
    { value: "other", label: t("join.form.preparing.other") },
  ];

  return (
    <section id="join" className="relative py-16 md:py-24">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("join.title")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("join.subtitle")}
          </p>
          <div className="w-20 h-1 bg-gradient-primary mx-auto rounded-full mt-6" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Form */}
          <div className="glass-card p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  {t("join.form.name")}
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  placeholder={language === "pt" ? "Seu nome" : "Your name"}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {t("join.form.email")}
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium mb-2">
                  {t("join.form.linkedin")}
                </label>
                <input
                  type="url"
                  id="linkedin"
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  placeholder="linkedin.com/in/..."
                />
              </div>

              <div>
                <label htmlFor="preparing" className="block text-sm font-medium mb-2">
                  {t("join.form.preparing")}
                </label>
                <select
                  id="preparing"
                  required
                  defaultValue=""
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    {language === "pt" ? "Selecione..." : "Select..."}
                  </option>
                  {preparingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {t("join.form.submit")}
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Community links */}
          <div className="flex flex-col justify-center">
            <p className="text-muted-foreground mb-6">{t("join.community")}</p>

            <div className="space-y-4">
              <button
                className="w-full glass-card-glow p-5 flex items-center gap-4 text-left group"
                disabled
              >
                <div className="p-3 bg-[#5865F2]/20 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-[#5865F2]" />
                </div>
                <div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    Discord
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "pt" ? "Em breve" : "Coming soon"}
                  </p>
                </div>
              </button>

              <button
                className="w-full glass-card-glow p-5 flex items-center gap-4 text-left group"
                disabled
              >
                <div className="p-3 bg-[#25D366]/20 rounded-xl">
                  <Users className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    WhatsApp
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "pt" ? "Em breve" : "Coming soon"}
                  </p>
                </div>
              </button>

              <button
                className="w-full glass-card-glow p-5 flex items-center gap-4 text-left group"
                disabled
              >
                <div className="p-3 bg-[#0088cc]/20 rounded-xl">
                  <Send className="w-6 h-6 text-[#0088cc]" />
                </div>
                <div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">
                    Telegram
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "pt" ? "Em breve" : "Coming soon"}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
