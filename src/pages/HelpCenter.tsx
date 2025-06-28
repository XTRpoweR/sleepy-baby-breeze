import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Moon, ArrowLeft, Search, Book, MessageCircle, Video, Download, Users, Settings, CreditCard, Baby, BarChart3, Volume2, Calendar, PlayCircle, GraduationCap, ArrowRight } from "lucide-react";
const HelpCenter = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const categories = [{
    icon: Baby,
    title: "Getting Started",
    description: "Learn the basics of SleepyBaby",
    articles: 12,
    color: "text-blue-600"
  }, {
    icon: Users,
    title: "Family Sharing",
    description: "Add family members and caregivers",
    articles: 8,
    color: "text-green-600"
  }, {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Understanding your baby's patterns",
    articles: 10,
    color: "text-purple-600"
  }, {
    icon: CreditCard,
    title: "Billing & Subscriptions",
    description: "Manage your premium subscription",
    articles: 6,
    color: "text-orange-600"
  }, {
    icon: Volume2,
    title: "Sounds & Sleep",
    description: "Using our sound library effectively",
    articles: 5,
    color: "text-pink-600"
  }, {
    icon: Settings,
    title: "Account Settings",
    description: "Customize your app experience",
    articles: 7,
    color: "text-indigo-600"
  }];
  const quickStartOptions = [{
    title: "Interactive Tutorial",
    description: "Step-by-step guided tour of all features",
    icon: GraduationCap,
    action: () => navigate('/tutorial'),
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  }, {
    title: "Video Guides",
    description: "Watch how to use key features",
    icon: PlayCircle,
    action: () => {},
    color: "text-green-600",
    bgColor: "bg-green-50"
  }, {
    title: "Quick Setup",
    description: "Get started in under 5 minutes",
    icon: Baby,
    action: () => navigate('/dashboard'),
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  }];
  const popularArticles = ["How to create your first baby profile", "Understanding sleep pattern charts", "Inviting family members to collaborate", "Setting up smart notifications", "Exporting your baby's data", "Troubleshooting sync issues"];
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Moon className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">{t('app.name')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button onClick={() => navigate('/tutorial')} className="bg-blue-600 hover:bg-blue-700">
                Start Tutorial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Help Center
            <span className="text-blue-600 block">How can we help you?</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Find answers to common questions, learn how to use SleepyBaby effectively, 
            and get the most out of your baby tracking experience.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input type="text" placeholder="Search for help articles..." className="pl-12 pr-4 py-6 text-lg border-2 border-blue-200 focus:border-blue-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Quick Start Options
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {quickStartOptions.map((option, index) => {
            const IconComponent = option.icon;
            return <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={option.action}>
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex p-4 rounded-2xl ${option.bgColor} mb-6 group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-8 w-8 ${option.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700">
                      <span className="mr-2">Get Started</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Browse by Category
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => {
            const IconComponent = category.icon;
            return <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-2xl bg-gray-50 mb-4 w-fit`}>
                      <IconComponent className={`h-8 w-8 ${category.color}`} />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{category.articles} articles</Badge>
                      <Button variant="ghost" size="sm">
                        Browse →
                      </Button>
                    </div>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Popular Articles
              </h2>
              <div className="space-y-4">
                {popularArticles.map((article, index) => <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Book className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-900 hover:text-blue-600 transition-colors">
                          {article}
                        </span>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Additional Resources
              </h2>
              <div className="space-y-6">
                <Card className="border-0 shadow-lg cursor-pointer" onClick={() => navigate('/tutorial')}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <GraduationCap className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-lg">Interactive Tutorial</h3>
                        <p className="text-gray-600">Complete step-by-step walkthrough</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Video className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-bold text-lg">Video Tutorials</h3>
                        <p className="text-gray-600">Step-by-step guides for all features</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Download className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-bold text-lg">User Manual</h3>
                        <p className="text-gray-600">Complete guide to SleepyBaby (PDF)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <MessageCircle className="h-8 w-8 text-orange-600" />
                      <div>
                        <h3 className="font-bold text-lg">Community Forum</h3>
                        <p className="text-gray-600">Connect with other parents</p>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Still Need Help?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Can't find what you're looking for? Our support team is here to help you get the most out of SleepyBaby.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')} className="bg-white text-blue-600 hover:bg-blue-50">
              Contact Support
            </Button>
            
          </div>
          <p className="text-blue-100 text-sm mt-6">
            Average response time: Under 24 hours
          </p>
        </div>
      </section>
    </div>;
};
export default HelpCenter;