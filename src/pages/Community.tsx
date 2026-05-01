import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Share2, Bookmark, TrendingUp, Clock, Users, Star, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { RevealSection } from "@/components/explore/RevealSection";
import { useLanguage } from "@/hooks/useLanguage";

const Community = () => {
  const { t } = useLanguage();

  const featuredPosts = [
    {
      id: 1,
      author: "Minh Nguyen",
      avatar: "M",
      role: "Power User",
      time: "2h",
      titleKey: "community.post1.title",
      excerptKey: "community.post1.excerpt",
      likes: 156,
      comments: 42,
      categoryKey: "community.post1.category",
      categoryColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
    },
    {
      id: 2,
      author: "Thu Trang",
      avatar: "T",
      role: "Developer",
      time: "5h",
      titleKey: "community.post2.title",
      excerptKey: "community.post2.excerpt",
      likes: 234,
      comments: 67,
      categoryKey: "community.post2.category",
      categoryColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    },
    {
      id: 3,
      author: "Hoang Le",
      avatar: "H",
      role: "Designer",
      time: "1d",
      titleKey: "community.post3.title",
      excerptKey: "community.post3.excerpt",
      likes: 189,
      comments: 35,
      categoryKey: "community.post3.category",
      categoryColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    }
  ];

  const trendingTopics = [
    { name: "OneApp 2.0", count: 1234 },
    { name: "AI Integration", count: 856 },
    { name: "Vennor Design", count: 642 },
    { name: "OneMess Tips", count: 521 },
    { name: "Developer API", count: 398 }
  ];

  const topContributors = [
    { name: "Thomas", avatar: "T", posts: 156, role: "Founder" },
    { name: "Minh N.", avatar: "M", posts: 89, role: "Power User" },
    { name: "Thu Trang", avatar: "T", posts: 67, role: "Developer" },
    { name: "Hoang Le", avatar: "H", posts: 54, role: "Designer" }
  ];

  const announcements = [
    { titleKey: "community.announce1.title", date: "15/01/2025", typeKey: "community.announce1.type" },
    { titleKey: "community.announce2.title", date: "10/01/2025", typeKey: "community.announce2.type" },
    { titleKey: "community.announce3.title", date: "05/01/2025", typeKey: "community.announce3.type" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <ParticleBackground />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              {t("community.badge")}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-up delay-100">
            <span className="bg-gradient-to-r from-foreground via-emerald-400 to-primary bg-clip-text text-transparent">
              {t("community.title")}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up delay-200">
            {t("community.subtitle")}
          </p>

          <div className="flex flex-wrap justify-center gap-6 animate-fade-up delay-300">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span><strong className="text-foreground">10K+</strong> {t("community.stats.members")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span><strong className="text-foreground">50K+</strong> {t("community.stats.posts")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="w-5 h-5 text-primary" />
              <span><strong className="text-foreground">200K+</strong> {t("community.stats.interactions")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Posts Column */}
            <div className="lg:col-span-2 space-y-6">
              <RevealSection animation="blur">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{t("community.featured")}</h2>
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    {t("community.viewAll")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </RevealSection>

              {featuredPosts.map((post, index) => (
                <RevealSection key={post.id} animation="up" delay={index * 100}>
                  <article className="group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover-lift">
                    {/* Author Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold">
                          {post.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{post.author}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {post.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {post.time}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full border ${post.categoryColor} whitespace-nowrap`}>
                        {t(post.categoryKey)}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {t(post.titleKey)}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {t(post.excerptKey)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-6 text-muted-foreground">
                      <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors ml-auto">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                </RevealSection>
              ))}

              {/* Load More */}
              <RevealSection animation="up" delay={400}>
                <div className="text-center pt-4">
                  <Button variant="outline" className="hover-scale-smooth">
                    {t("community.loadMore")}
                  </Button>
                </div>
              </RevealSection>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Announcements */}
              <RevealSection animation="right" delay={100}>
                <div className="rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold">{t("community.announcements")}</h3>
                  </div>
                  <div className="space-y-4">
                    {announcements.map((item, index) => (
                      <div key={index} className="group cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">
                              {t(item.titleKey)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{item.date}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {t(item.typeKey)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealSection>

              {/* Trending Topics */}
              <RevealSection animation="right" delay={200}>
                <div className="rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">{t("community.trending")}</h3>
                  </div>
                  <div className="space-y-3">
                    {trendingTopics.map((topic) => (
                      <div
                        key={topic.name}
                        className="flex items-center justify-between group cursor-pointer"
                      >
                        <span className="text-sm group-hover:text-primary transition-colors">
                          #{topic.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {topic.count} {t("community.trendingPosts")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealSection>

              {/* Top Contributors */}
              <RevealSection animation="right" delay={300}>
                <div className="rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-bold">{t("community.topContributors")}</h3>
                  </div>
                  <div className="space-y-4">
                    {topContributors.map((user, index) => (
                      <div key={user.name} className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold">
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                              {user.name}
                            </span>
                            {index === 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                {user.role}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {user.posts} {t("community.stats.posts").toLowerCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealSection>

              {/* Join CTA */}
              <RevealSection animation="right" delay={400}>
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/10 to-cyan-500/10 border border-primary/20 p-6 text-center">
                  <h3 className="font-bold mb-2">{t("community.joinTitle")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("community.joinDesc")}
                  </p>
                  <Link to="/auth/signup">
                    <Button className="btn-gradient-animated w-full">
                      {t("community.joinBtn")}
                    </Button>
                  </Link>
                </div>
              </RevealSection>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-8 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 OneApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Community;
