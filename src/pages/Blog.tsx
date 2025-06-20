
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { 
  Moon, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Baby, 
  Heart, 
  Lightbulb,
  Stethoscope,
  Users,
  BookOpen
} from "lucide-react";

const Blog = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const featuredArticle = {
    title: "The Science Behind Baby Sleep Cycles: What Every Parent Should Know",
    excerpt: "Understanding your baby's sleep patterns can transform your approach to bedtime routines. Learn about the latest research in pediatric sleep science and how to apply it to your daily routine.",
    author: "Dr. Sarah Johnson",
    date: "December 10, 2024",
    readTime: "8 min read",
    category: "Sleep Science",
    image: "/placeholder.svg"
  };

  const articles = [
    {
      title: "Creating the Perfect Bedtime Routine for Your 6-Month-Old",
      excerpt: "A step-by-step guide to establishing healthy sleep habits that will benefit your baby for years to come.",
      author: "Emily Chen",
      date: "December 8, 2024",
      readTime: "5 min read",
      category: "Sleep Training",
      icon: Baby
    },
    {
      title: "Managing Sleep Regressions: A Parent's Survival Guide",
      excerpt: "Sleep regressions are normal but challenging. Here's how to navigate them with confidence and patience.",
      author: "Dr. Michael Torres",
      date: "December 5, 2024",
      readTime: "7 min read",
      category: "Development",
      icon: Heart
    },
    {
      title: "The Benefits of White Noise for Baby Sleep",
      excerpt: "Discover how different types of sound can help your baby fall asleep faster and sleep more soundly.",
      author: "Lisa Rodriguez",
      date: "December 3, 2024",
      readTime: "4 min read",
      category: "Sleep Tips",
      icon: Lightbulb
    },
    {
      title: "When to Consult a Pediatric Sleep Specialist",
      excerpt: "Learn the warning signs that indicate it might be time to seek professional help for your baby's sleep issues.",
      author: "Dr. Jennifer Kim",
      date: "November 30, 2024",
      readTime: "6 min read",
      category: "Medical",
      icon: Stethoscope
    },
    {
      title: "Co-Parenting Night Duties: Strategies That Actually Work",
      excerpt: "Practical tips for sharing nighttime responsibilities fairly and effectively between partners.",
      author: "Mark Thompson",
      date: "November 28, 2024",
      readTime: "5 min read",
      category: "Parenting",
      icon: Users
    },
    {
      title: "Understanding Your Baby's Sleep Data: Making Sense of the Numbers",
      excerpt: "How to interpret sleep tracking data to make informed decisions about your baby's sleep schedule.",
      author: "Anna Phillips",
      date: "November 25, 2024",
      readTime: "8 min read",
      category: "Data & Analytics",
      icon: BookOpen
    }
  ];

  const categories = [
    "All", "Sleep Science", "Sleep Training", "Development", "Sleep Tips", "Medical", "Parenting", "Data & Analytics"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-1 sm:space-x-2 p-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Moon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <span className="text-lg sm:text-xl font-semibold text-gray-900">{t('app.name')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>
              <Button 
                onClick={() => navigate('/contact')} 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Write for Us</span>
                <span className="sm:hidden">Write</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            SleepyBaby Blog
            <span className="text-blue-600 block">Sleep Better, Parent Smarter</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2 sm:px-0">
            Expert advice, real parent experiences, and the latest research in baby sleep science. 
            Everything you need to help your family get better rest.
          </p>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-xl sm:shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 sm:p-8 lg:p-12 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 text-blue-600 mx-auto mb-4 sm:mb-6" />
                  <Badge className="mb-3 sm:mb-4 text-xs sm:text-sm">{featuredArticle.category}</Badge>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Featured Article</h2>
                </div>
              </div>
              <div className="p-6 sm:p-8 lg:p-12">
                <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 text-xs sm:text-sm">{featuredArticle.category}</Badge>
                <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                  {featuredArticle.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{featuredArticle.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{featuredArticle.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{featuredArticle.readTime}</span>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto touch-target">
                  Read Full Article
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className={`text-xs sm:text-sm px-3 sm:px-4 touch-target ${
                  index === 0 ? "bg-blue-600 hover:bg-blue-700" : ""
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Latest Articles
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((article, index) => {
              const IconComponent = article.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                    </div>
                    <CardTitle className="text-base sm:text-lg leading-tight">{article.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-3">{article.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex flex-col space-y-2 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{article.author}</span>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>{article.date}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Button variant="outline" size="lg" className="touch-target">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Never Miss a Sleep Tip
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 px-2 sm:px-0">
            Subscribe to our newsletter for weekly sleep tips, expert advice, and early access to new articles.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white text-sm sm:text-base touch-target"
            />
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 touch-target whitespace-nowrap"
            >
              Subscribe
            </Button>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm mt-3 sm:mt-4 px-4 sm:px-0">
            No spam, unsubscribe anytime. Privacy policy applies.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Blog;
