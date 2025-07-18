import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ArrowLeft, Search, Book, MessageCircle, Video, Download, Users, Settings, CreditCard, Baby, BarChart3, Volume2, Calendar, PlayCircle, GraduationCap, ArrowRight } from "lucide-react";

const HelpCenter = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    {
      icon: Baby,
      title: "Getting Started",
      description: "Learn the basics of SleepyBaby",
      articles: 12,
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Family Sharing", 
      description: "Add family members and caregivers",
      articles: 8,
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Understanding your baby's patterns",
      articles: 10,
      color: "text-purple-600"
    },
    {
      icon: CreditCard,
      title: "Billing & Subscriptions",
      description: "Manage your premium subscription",
      articles: 6,
      color: "text-orange-600"
    },
    {
      icon: Volume2,
      title: "Sounds & Sleep",
      description: "Using our sound library effectively",
      articles: 5,
      color: "text-pink-600"
    },
    {
      icon: Settings,
      title: "Account Settings",
      description: "Customize your app experience",
      articles: 7,
      color: "text-indigo-600"
    }
  ];

  const quickStartOptions = [
    {
      title: "Interactive Tutorial",
      description: "Step-by-step guided tour of all features",
      icon: GraduationCap,
      action: () => navigate('/tutorial'),
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Quick Setup",
      description: "Get started in under 5 minutes",
      icon: Baby,
      action: () => navigate('/dashboard'),
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const popularArticles = [
    "How to create your first baby profile",
    "Understanding sleep pattern charts",
    "Inviting family members to collaborate",
    "Setting up smart notifications",
    "Exporting your baby's data",
    "Troubleshooting sync issues"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Headers */}
      <DesktopHeader />
      <MobileHeader />

      {/* Hero Section with integrated navigation */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button and tutorial button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
            <Button onClick={() => navigate('/tutorial')} className="bg-blue-600 hover:bg-blue-700">
              Start Tutorial
            </Button>
          </div>

          {/* Hero content */}
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
              Help Center
              <span className="text-blue-600 block">How can we help you?</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
              Find answers to common questions, learn how to use SleepyBaby effectively, 
              and get the most out of your baby tracking experience.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search for help articles..." 
                className="pl-12 pr-4 py-4 md:py-6 text-base md:text-lg border-2 border-blue-200 focus:border-blue-500" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Quick Start Options
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
            {quickStartOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={option.action}>
                  <CardContent className="p-6 md:p-8 text-center">
                    <div className={`inline-flex p-3 md:p-4 rounded-2xl ${option.bgColor} mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-6 w-6 md:h-8 md:w-8 ${option.color}`} />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{option.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">{option.description}</p>
                    <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700">
                      <span className="mr-2 text-sm md:text-base">Get Started</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">
            Browse by Category
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className={`inline-flex p-2 md:p-3 rounded-2xl bg-gray-50 mb-3 md:mb-4 w-fit`}>
                      <IconComponent className={`h-6 w-6 md:h-8 md:w-8 ${category.color}`} />
                    </div>
                    <CardTitle className="text-lg md:text-xl">{category.title}</CardTitle>
                    <CardDescription className="text-sm md:text-base">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs md:text-sm">{category.articles} articles</Badge>
                      <Button variant="ghost" size="sm" className="text-sm">
                        Browse →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
                Popular Articles
              </h2>
              <div className="space-y-3 md:space-y-4">
                {popularArticles.map((article, index) => (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center space-x-3">
                        <Book className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm md:text-base text-gray-900 hover:text-blue-600 transition-colors">
                          {article}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
                Additional Resources
              </h2>
              <div className="space-y-4 md:space-y-6">
                <Card className="border-0 shadow-lg cursor-pointer" onClick={() => navigate('/tutorial')}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-base md:text-lg">Interactive Tutorial</h3>
                        <p className="text-sm md:text-base text-gray-600">Complete step-by-step walkthrough</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <Video className="h-6 w-6 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-base md:text-lg">Video Tutorials</h3>
                        <p className="text-sm md:text-base text-gray-600">Step-by-step guides for all features</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <Download className="h-6 w-6 md:h-8 md:w-8 text-purple-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-base md:text-lg">User Manual</h3>
                        <p className="text-sm md:text-base text-gray-600">Complete guide to SleepyBaby (PDF)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-orange-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-base md:text-lg">Community Forum</h3>
                        <p className="text-sm md:text-base text-gray-600">Connect with other parents</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Premium pricing info */}
                <Card className="border-0 shadow-lg bg-orange-50 border-orange-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-orange-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-bold text-base md:text-lg">Premium Support</h3>
                        <p className="text-sm md:text-base text-gray-600 mb-2">Priority support for Premium users</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-gray-500 line-through">$14.99/month</span>
                          <span className="text-lg font-bold text-orange-600">$9.99/month</span>
                          <Badge className="bg-red-500 text-white text-xs">40% OFF</Badge>
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
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            Still Need Help?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8">
            Can't find what you're looking for? Our support team is here to help you get the most out of SleepyBaby.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')} className="bg-white text-blue-600 hover:bg-blue-50">
              Contact Support
            </Button>
          </div>
          <p className="text-blue-100 text-sm mt-4 md:mt-6">
            Average response time: Under 24 hours
          </p>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
