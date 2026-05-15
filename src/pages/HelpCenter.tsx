import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useSmartBack } from "@/hooks/useSmartBack";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ArrowLeft, Search, Book, MessageCircle, Download, Users, Settings, CreditCard, Baby, BarChart3, Volume2, Calendar, PlayCircle, GraduationCap, ArrowRight, Sparkles, X, SearchX } from "lucide-react";
const HelpCenter = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuth();
  const goBack = useSmartBack(user ? '/dashboard' : '/');
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  const handleSignIn = () => {
    navigate('/auth');
  };
  const categories = [{
    icon: Baby,
    title: "Getting Started",
    description: "Learn the basics of SleepyBaby",
    articles: 12,
    gradient: "from-pink-400 to-pink-500",
    accent: "bg-pink-50 text-pink-600",
    route: "/help/getting-started"
  }, {
    icon: Users,
    title: "Family Sharing",
    description: "Add family members and caregivers",
    articles: 8,
    gradient: "from-purple-400 to-purple-500",
    accent: "bg-purple-50 text-purple-600",
    route: "/help/family-sharing"
  }, {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Understanding your baby's patterns",
    articles: 10,
    gradient: "from-indigo-400 to-indigo-500",
    accent: "bg-indigo-50 text-indigo-600",
    route: "/help/reports-analytics"
  }, {
    icon: CreditCard,
    title: "Billing & Subscriptions",
    description: "Manage your premium subscription",
    articles: 6,
    gradient: "from-orange-400 to-pink-500",
    accent: "bg-orange-50 text-orange-600",
    route: "/help/billing-subscriptions"
  }, {
    icon: Volume2,
    title: "Sounds & Sleep",
    description: "Using our sound library effectively",
    articles: 5,
    gradient: "from-pink-400 to-purple-500",
    accent: "bg-pink-50 text-pink-600",
    route: "/help/sounds-sleep"
  }, {
    icon: Settings,
    title: "Account Settings",
    description: "Customize your app experience",
    articles: 7,
    gradient: "from-purple-400 to-indigo-500",
    accent: "bg-indigo-50 text-indigo-600",
    route: "/help/account-settings"
  }];
  const quickStartOptions = [{
    title: "Interactive Tutorial",
    description: "Step-by-step guided tour of all features",
    icon: GraduationCap,
    action: () => navigate('/tutorial'),
    gradient: "from-pink-400 to-purple-500"
  }, {
    title: "Quick Setup",
    description: "Get started in under 5 minutes",
    icon: Baby,
    action: () => navigate('/dashboard'),
    gradient: "from-purple-400 to-indigo-500"
  }];
  const popularArticles = [
    { title: "How to create your first baby profile", category: "getting-started" },
    { title: "Understanding sleep pattern charts", category: "reports-analytics" },
    { title: "Inviting family members to collaborate", category: "family-sharing" },
    { title: "Setting up smart notifications", category: "account-settings" },
    { title: "Exporting your baby's data", category: "reports-analytics" },
    { title: "Troubleshooting sync issues", category: "account-settings" },
  ];
  const handleCategoryClick = (route: string) => {
    // Extract category name from route and navigate to dynamic help articles page
    const categoryName = route.split('/').pop(); // Extract the last part of the route
    navigate(`/help/category/${categoryName}`);
  };

  // Live search: filter categories and articles by query
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;
  const filteredCategories = isSearching
    ? categories.filter(c =>
        c.title.toLowerCase().includes(normalizedQuery) ||
        c.description.toLowerCase().includes(normalizedQuery)
      )
    : categories;
  const filteredArticles = isSearching
    ? popularArticles.filter(a => a.title.toLowerCase().includes(normalizedQuery))
    : popularArticles;
  const hasResults = filteredCategories.length > 0 || filteredArticles.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If exactly one category matches, jump straight to it
    if (isSearching && filteredCategories.length === 1) {
      handleCategoryClick(filteredCategories[0].route);
      return;
    }
    // If no categories matched but a single article did, open its category
    if (isSearching && filteredCategories.length === 0 && filteredArticles.length === 1) {
      navigate(`/help/category/${filteredArticles[0].category}`);
      return;
    }
    // Otherwise let live results stay visible — just dismiss the mobile keyboard
    (document.activeElement as HTMLElement | null)?.blur();
  };
  return <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50/40 to-indigo-50">
      {/* Decorative blurred blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-300/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-purple-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-indigo-300/20 blur-3xl" />
      </div>

      {/* Conditional Headers */}
      {user ? <>
          <DesktopHeader />
          <MobileHeader />
        </> : <>
          {/* Non-authenticated Desktop Header */}
          <header className="bg-white/70 backdrop-blur-md border-b border-white/60 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-2">
                  <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="SleepyBabyy Logo" className="h-12 w-auto" />
                  <span className="text-xl font-bold text-gray-900">SleepyBabyy</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" onClick={() => navigate('/')}>
                    Home
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/features')}>
                    Features
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/pricing')}>
                    Pricing
                  </Button>
                  <LanguageSelector />
                  <Button variant="outline" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-md shadow-purple-500/30">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Non-authenticated Mobile Header */}
          <header className="bg-white/70 backdrop-blur-md border-b border-white/60 lg:hidden">
            <div className="flex justify-between items-center h-16 px-4">
              <div className="flex items-center space-x-2">
                <img src="/lovable-uploads/5e403470-892e-4e72-8a4e-faa117177a49.png" alt="SleepyBabyy Logo" className="h-10 w-auto" />
                <span className="text-lg font-bold text-gray-900">SleepyBabyy</span>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSelector />
                <Button size="sm" onClick={handleGetStarted} className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0">
                  Get Started
                </Button>
              </div>
            </div>
          </header>
        </>}

      {/* Hero Section with integrated navigation */}
      <section className="py-10 md:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button and tutorial button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 touch-target"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={() => navigate('/tutorial')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] rounded-full px-6"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Start Tutorial
            </Button>
          </div>

          {/* Hero content */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-pink-200/60 text-pink-700 text-xs sm:text-sm font-medium mb-5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Answers, guides, and more</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Help Center
              <span className="block mt-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                How can we help you?
              </span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto">
              Find answers to common questions, learn how to use SleepyBaby effectively,
              and get the most out of your baby tracking experience.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto" role="search">
              <Search className="pointer-events-none absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              <Input
                type="text"
                inputMode="search"
                enterKeyHint="search"
                aria-label="Search help articles"
                placeholder="Search for help articles..."
                className="pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-lg border-2 border-purple-200/70 bg-white/80 backdrop-blur-sm focus:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-200 rounded-2xl shadow-sm [&::-webkit-search-cancel-button]:appearance-none"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-purple-100/70 hover:bg-purple-200/70 flex items-center justify-center transition-colors touch-target"
                >
                  <X className="h-4 w-4 text-purple-700" />
                </button>
              )}
              <button type="submit" className="sr-only" aria-label="Submit search">Search</button>
            </form>
            {isSearching && (
              <p className="mt-3 text-xs sm:text-sm text-gray-600">
                {hasResults
                  ? `${filteredCategories.length + filteredArticles.length} result${filteredCategories.length + filteredArticles.length === 1 ? '' : 's'} for "${searchQuery.trim()}"`
                  : `No matches for "${searchQuery.trim()}"`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Start Section — hidden while searching */}
      <section className={`py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-sm border-y border-white/60 ${isSearching ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Quick Start Options
            </span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 md:gap-8 mb-4 md:mb-8 max-w-3xl mx-auto">
            {quickStartOptions.map((option, index) => {
            const IconComponent = option.icon;
            return <Card key={index} className="border border-white/60 shadow-lg hover:shadow-xl shadow-purple-500/5 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1" onClick={option.action}>
                  <div className={`h-1.5 bg-gradient-to-r ${option.gradient}`} />
                  <CardContent className="p-6 md:p-8 text-center">
                    <div className={`inline-flex h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br ${option.gradient} mb-4 md:mb-5 items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-7 w-7 md:h-8 md:w-8 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4">{option.description}</p>
                    <div className="inline-flex items-center text-purple-600 group-hover:text-purple-700 font-medium">
                      <span className="mr-2 text-sm md:text-base">Get Started</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>
      </section>

      {/* No-results state */}
      {isSearching && !hasResults && (
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl shadow-md p-8 sm:p-10">
            <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 items-center justify-center mb-4">
              <SearchX className="h-7 w-7 sm:h-8 sm:w-8 text-purple-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              We couldn't find anything for "{searchQuery.trim()}". Try a different keyword or contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => setSearchQuery('')} className="rounded-full">
                Clear search
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-md rounded-full"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Help Categories */}
      <section className={`py-10 md:py-14 px-4 sm:px-6 lg:px-8 ${filteredCategories.length === 0 ? 'hidden' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              {isSearching ? 'Matching Categories' : 'Browse by Category'}
            </span>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filteredCategories.map((category, index) => {
            const IconComponent = category.icon;
            return <Card key={index} className="border border-white/60 shadow-md hover:shadow-xl shadow-purple-500/5 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer group transition-all hover:-translate-y-1" onClick={() => handleCategoryClick(category.route)}>
                  <div className={`h-1.5 bg-gradient-to-r ${category.gradient}`} />
                  <CardHeader className="pb-3">
                    <div className={`inline-flex h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br ${category.gradient} mb-3 items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6 md:h-7 md:w-7 text-white" />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{category.title}</CardTitle>
                    <CardDescription className="text-sm md:text-base">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${category.accent} border-0`}>{category.articles} articles</Badge>
                      <div className="flex items-center text-purple-600 group-hover:text-purple-700 font-medium">
                        <span className="mr-1 text-sm">Browse</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>
      </section>

      {/* Popular Articles + Resources — Resources hidden during search */}
      <section className={`py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white/60 backdrop-blur-sm border-t border-white/60 ${filteredArticles.length === 0 && isSearching ? 'hidden' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`grid ${isSearching ? '' : 'lg:grid-cols-2'} gap-8 md:gap-12`}>
            <div className={filteredArticles.length === 0 ? 'hidden' : ''}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {isSearching ? 'Matching Articles' : 'Popular Articles'}
                </span>
              </h2>
              <div className="space-y-3">
                {filteredArticles.map((article, index) => <Card key={index} onClick={() => navigate(`/help/category/${article.category}`)} className="border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Book className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm md:text-base text-gray-900 group-hover:text-purple-700 transition-colors">
                          {article.title}
                        </span>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>

            <div className={isSearching ? 'hidden' : ''}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
                <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Additional Resources
                </span>
              </h2>
              <div className="space-y-4">
                <Card className="border border-white/60 shadow-md hover:shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5" onClick={() => navigate('/tutorial')}>
                  <div className="h-1 bg-gradient-to-r from-pink-400 to-purple-500" />
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base md:text-lg">Interactive Tutorial</h3>
                        <p className="text-sm md:text-base text-gray-600">Complete step-by-step walkthrough</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-white/60 shadow-md hover:shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5">
                  <div className="h-1 bg-gradient-to-r from-purple-400 to-indigo-500" />
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/20">
                        <Download className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base md:text-lg">User Manual</h3>
                        <p className="text-sm md:text-base text-gray-600">Complete guide to SleepyBaby (PDF)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-white/60 shadow-md hover:shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5">
                  <div className="h-1 bg-gradient-to-r from-indigo-400 to-pink-500" />
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/20">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base md:text-lg">Community Forum</h3>
                        <p className="text-sm md:text-base text-gray-600">Connect with other parents</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Premium pricing info */}
                <Card className="border border-purple-200/60 shadow-md bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 backdrop-blur-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/30">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base md:text-lg">Premium Support</h3>
                        <p className="text-sm md:text-base text-gray-600 mb-2">Priority support for Premium users</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">From $7.99/month</span>
                          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs border-0">7-day free trial</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            Still Need Help?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8">Can't find what you're looking for? Our support team is here to help you get the most out of SleepyBabyy.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              className="bg-white text-purple-600 hover:bg-white/95 hover:scale-[1.02] shadow-xl shadow-black/10 rounded-full px-8 font-semibold transition-all"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
          </div>
          <p className="text-white/80 text-sm mt-4 md:mt-6">
            Average response time: Under 24 hours
          </p>
        </div>
      </section>
    </div>;
};
export default HelpCenter;