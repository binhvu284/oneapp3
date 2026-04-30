import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, MessageSquare, Newspaper, Cloud, Palette, Zap, Shield, Globe, Users, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { SharedHeader } from "@/components/explore/SharedHeader";
import { RevealSection } from "@/components/explore/RevealSection";
import { useLanguage } from "@/hooks/useLanguage";

const Features = () => {
  const { t } = useLanguage();

  const ecosystemApps = [
    {
      nameKey: "features.onemess.name",
      descKey: "features.onemess.desc",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
      features: ["features.onemess.f1", "features.onemess.f2", "features.onemess.f3"]
    },
    {
      nameKey: "features.onenews.name",
      descKey: "features.onenews.desc",
      icon: Newspaper,
      color: "from-orange-500 to-red-500",
      features: ["features.onenews.f1", "features.onenews.f2", "features.onenews.f3"]
    },
    {
      nameKey: "features.cloud.name",
      descKey: "features.cloud.desc",
      icon: Cloud,
      color: "from-purple-500 to-pink-500",
      features: ["features.cloud.f1", "features.cloud.f2", "features.cloud.f3"]
    },
    {
      nameKey: "features.vennor.name",
      descKey: "features.vennor.desc",
      icon: Palette,
      color: "from-emerald-500 to-teal-500",
      features: ["features.vennor.f1", "features.vennor.f2", "features.vennor.f3"]
    }
  ];

  const coreFeatures = [
    { icon: Zap, titleKey: "features.core.performance", descKey: "features.core.performanceDesc" },
    { icon: Shield, titleKey: "features.core.security", descKey: "features.core.securityDesc" },
    { icon: Globe, titleKey: "features.core.multiplatform", descKey: "features.core.multiplatformDesc" },
    { icon: Users, titleKey: "features.core.community", descKey: "features.core.communityDesc" },
    { icon: Layers, titleKey: "features.core.integration", descKey: "features.core.integrationDesc" },
    { icon: Sparkles, titleKey: "features.core.ai", descKey: "features.core.aiDesc" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <ParticleBackground />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <SharedHeader variant="floating" />

      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t("features.badge")}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-up delay-100">
            <span className="bg-gradient-to-r from-foreground via-primary to-cyan-400 bg-clip-text text-transparent">
              {t("features.title")}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-up delay-200">
            {t("features.subtitle")}
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="relative z-10 py-16 bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <RevealSection animation="blur">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("features.core.title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t("features.core.subtitle")}
              </p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <RevealSection key={feature.titleKey} animation="up" delay={index * 100}>
                <div className="group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover-lift h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(feature.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm">{t(feature.descKey)}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Apps */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <RevealSection animation="blur">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("features.ecosystem.title")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t("features.ecosystem.subtitle")}
              </p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-8">
            {ecosystemApps.map((app, index) => (
              <RevealSection key={app.nameKey} animation="scale" delay={index * 150}>
                <div className="group relative p-8 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm hover-lift overflow-hidden h-full">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-6 shadow-lg`}>
                      <app.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{t(app.nameKey)}</h3>
                    <p className="text-muted-foreground mb-6">{t(app.descKey)}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {app.features.map((featureKey) => (
                        <span
                          key={featureKey}
                          className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium whitespace-nowrap"
                        >
                          {t(featureKey)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <RevealSection animation="scale" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-cyan-500/10 to-purple-500/10 border border-primary/20 p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
              {t("features.cta.ready")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 relative z-10">
              {t("features.cta.desc")}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link to="/auth/signup">
                <Button size="lg" className="btn-gradient-animated px-8">
                  {t("features.cta.signup")}
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="lg" variant="outline" className="hover-scale-smooth">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("features.cta.back")}
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

export default Features;
