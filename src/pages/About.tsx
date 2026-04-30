import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, Rocket, Heart, Code, Lightbulb, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { SharedHeader } from "@/components/explore/SharedHeader";
import { RevealSection } from "@/components/explore/RevealSection";
import { useLanguage } from "@/hooks/useLanguage";

const About = () => {
  const { t } = useLanguage();

  const timeline = [
    { year: "2022", titleKey: "about.timeline.2022.title", descKey: "about.timeline.2022.desc", icon: Lightbulb },
    { year: "2023", titleKey: "about.timeline.2023.title", descKey: "about.timeline.2023.desc", icon: Rocket },
    { year: "2024", titleKey: "about.timeline.2024.title", descKey: "about.timeline.2024.desc", icon: Code },
    { year: "2025", titleKey: "about.timeline.2025.title", descKey: "about.timeline.2025.desc", icon: Target }
  ];

  const values = [
    { icon: Heart, titleKey: "about.values.passion", descKey: "about.values.passionDesc" },
    { icon: Users, titleKey: "about.values.community", descKey: "about.values.communityDesc" },
    { icon: Lightbulb, titleKey: "about.values.innovation", descKey: "about.values.innovationDesc" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <ParticleBackground />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <SharedHeader variant="floating" />

      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                <Quote className="w-4 h-4" />
                {t("about.badge")}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-up delay-100">
              <span className="bg-gradient-to-r from-foreground via-purple-400 to-primary bg-clip-text text-transparent">
                {t("about.title")}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up delay-200">
              {t("about.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <RevealSection animation="blur" className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm p-8 md:p-12">
              {/* Quote Icon */}
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center shadow-lg">
                  <Quote className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="pt-4">
                <p className="text-lg md:text-xl leading-relaxed text-foreground/90 mb-8">
                  {t("about.story.p1")} <span className="text-primary font-semibold">{t("about.story.oneapp1")}</span> {t("about.story.p1cont")}
                </p>
                
                <p className="text-lg md:text-xl leading-relaxed text-foreground/90 mb-8">
                  {t("about.story.p2")} <span className="text-primary font-semibold">{t("about.story.oneapp2")}</span> {t("about.story.p2cont")}
                </p>

                <p className="text-lg md:text-xl leading-relaxed text-foreground/90 mb-8">
                  {t("about.story.p3")} <span className="text-cyan-400 font-semibold">{t("about.story.onemess")}</span> {t("about.story.onemessDesc")} <span className="text-orange-400 font-semibold">{t("about.story.onenews")}</span> {t("about.story.onenewsDesc")} <span className="text-purple-400 font-semibold">{t("about.story.cloud")}</span> {t("about.story.cloudDesc")} <span className="text-emerald-400 font-semibold">{t("about.story.vennor")}</span> {t("about.story.vennorDesc")}
                </p>

                <p className="text-lg md:text-xl leading-relaxed text-foreground/90">
                  {t("about.story.p4")}
                </p>
              </div>

              {/* Founder Info */}
              <div className="mt-10 pt-8 border-t border-border/50 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  T
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t("about.founder.name")}</h3>
                  <p className="text-muted-foreground">{t("about.founder.role")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Timeline */}
      <section className="relative z-10 py-20 bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <RevealSection animation="blur">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("about.timeline.title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t("about.timeline.subtitle")}
              </p>
            </div>
          </RevealSection>

          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <RevealSection key={item.year} animation="left" delay={index * 150}>
                <div className="relative flex items-start gap-6 pb-12">
                  {/* Timeline Line */}
                  {index < timeline.length - 1 && (
                    <div className="absolute left-8 top-16 w-0.5 h-full bg-gradient-to-b from-primary/50 to-transparent" />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <span className="text-primary font-bold text-lg">{item.year}</span>
                    <h3 className="text-xl font-bold mt-1 mb-2">{t(item.titleKey)}</h3>
                    <p className="text-muted-foreground">{t(item.descKey)}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <RevealSection animation="blur">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("about.values.title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t("about.values.subtitle")}
              </p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <RevealSection key={value.titleKey} animation="up" delay={index * 150}>
                <div className="group p-8 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm text-center hover-lift h-full">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{t(value.titleKey)}</h3>
                  <p className="text-muted-foreground">{t(value.descKey)}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <RevealSection animation="scale" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl bg-gradient-to-br from-purple-500/10 via-primary/10 to-cyan-500/10 border border-purple-500/20 p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
              {t("about.cta.title")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 relative z-10">
              {t("about.cta.desc")}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link to="/community">
                <Button size="lg" className="btn-gradient-animated px-8">
                  {t("about.cta.explore")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button size="lg" variant="outline" className="hover-scale-smooth">
                  {t("about.cta.signup")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 OneApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
