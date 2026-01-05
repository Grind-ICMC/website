import { useLanguage } from "@/contexts/LanguageContext";
import { Github, Youtube, Linkedin } from "lucide-react";
import { GiIciclesAura } from "react-icons/gi";

const Footer = () => {
  const { t } = useLanguage();

  const links = [
    { href: "#about", label: t("nav.about") },
    { href: "#tracks", label: t("nav.tracks") },
    { href: "#how-it-works", label: t("nav.howItWorks") },
    { href: "#content", label: t("nav.content") },
    { href: "https://www.icmc.usp.br/", label: t("nav.icmc") },
    { href: "#faq", label: t("nav.faq") },
    { href: "mailto:grindicmc@gmail.com", label: t("nav.join") },
  ];

  const socials = [
    { icon: Github, href: "https://github.com/Grind-ICMC", label: "GitHub" },
    { icon: Youtube, href: "https://www.youtube.com/@GrindICMC", label: "YouTube" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/grind-icmc", label: "LinkedIn" },
  ];

  return (
    <footer className="relative py-12 border-t border-border/50">
      <div className="section-container">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-3">
              <GiIciclesAura className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl">
                Grind <span className="text-primary">ICMC</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t("footer.description")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Links
            </h4>
            <nav className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Social
            </h4>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2.5 bg-secondary/50 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Grind ICMC. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
