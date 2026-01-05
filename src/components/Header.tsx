import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X, Globe } from "lucide-react";
import { GiIciclesAura } from "react-icons/gi";
const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#about", label: t("nav.about") },
    { href: "#tracks", label: t("nav.tracks") },
    { href: "#how-it-works", label: t("nav.howItWorks") },
    { href: "#content", label: t("nav.content") },
    { href: "#icmc", label: t("nav.icmc") },
    { href: "#faq", label: t("nav.faq") },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <GiIciclesAura className="w-8 h-8 text-primary hidden lg:block" />

            <span className="font-bold text-lg md:text-xl text-foreground hidden sm:block">
              Grind <span className="text-primary">ICMC</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-4/5" />
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>

            {/* CTA Button - Desktop */}
            <a href="mailto:grindicmc@gmail.com" className="hidden md:block btn-primary text-sm">
              {t("nav.join")}
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 animate-fade-in">
          <nav className="section-container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="mailto:grindicmc@gmail.com"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary text-center mt-2"
            >
              {t("nav.join")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
