import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Moon, Clock, Calendar, Volume2, Users, BarChart3, Star, Baby, Heart, CheckCircle, Play } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: Clock,
      title: "Track Everything",
      description: "Log sleep times, wake-ups, and patterns effortlessly. Get a complete picture of your baby's sleep journey with just a few taps.",
      color: "text-blue-500"
    },
    {
      icon: Calendar,
      title: "Custom Sleep Schedules",
      description: "Create flexible, age-appropriate schedules that adapt to your baby's natural rhythms. No rigid rules - just gentle guidance.",
      color: "text-purple-500"
    },
    {
      icon: Volume2,
      title: "Soothing Sounds & Guidance",
      description: "Access our library of calming sounds and expert-backed sleep tips. Help your little one drift off peacefully, every time.",
      color: "text-green-500"
    },
    {
      icon: Users,
      title: "Multi-Caregiver Support",
      description: "Share access with partners, grandparents, or caregivers. Everyone stays updated, and no sleep detail gets missed.",
      color: "text-orange-500"
    },
    {
      icon: BarChart3,
      title: "Sleep Insights & Analytics",
      description: "Discover patterns with beautiful charts and trends. Make informed decisions about your baby's sleep with data-driven insights.",
      color: "text-indigo-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "New Mom",
      content: "This app saved my sanity! Finally understanding my baby's sleep patterns made everything so much easier.",
      rating: 5
    },
    {
      name: "Mike & Jessica",
      role: "First-time Parents",
      content: "The multi-caregiver feature is a game-changer. My partner and I can both stay on top of our baby's sleep schedule.",
      rating: 5
    },
    {
      name: "Dr. Emily Chen",
      role: "Pediatric Sleep Specialist",
      content: "I recommend this app to all my patients. The insights help parents make better sleep decisions for their babies.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 group">
              <Moon className="h-8 w-8 text-blue-600 transition-transform duration-300 group-hover:rotate-12" />
              <span className="text-xl font-semibold text-gray-900 tracking-tight">SleepyBaby</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105">Features</a>
              <a href="#insights" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105">Insights</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium hover:scale-105">Reviews</a>
              {user ? (
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 font-medium"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button 
                  onClick={handleGetStarted} 
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 font-medium"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                  Better Sleep for
                  <span className="text-blue-600 block">Baby & You</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed font-light">
                  Track, understand, and improve your baby's sleep patterns with gentle guidance designed for real parents. 
                  <span className="block mt-2 font-medium text-gray-700">You've got this, and we've got you.</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium" 
                  onClick={handleGetStarted}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Tracking Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 font-medium"
                >
                  Explore All Features
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1 transition-all duration-300 hover:scale-105">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Free for 14 days</span>
                </div>
                <div className="flex items-center space-x-1 transition-all duration-300 hover:scale-105">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center space-x-1 transition-all duration-300 hover:scale-105">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Made by parents</span>
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl animate-float">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Tonight's Sleep</h3>
                    <Baby className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Bedtime</span>
                      <span className="font-semibold">7:30 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total Sleep</span>
                      <span className="font-semibold text-green-600">11h 20m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Wake-ups</span>
                      <span className="font-semibold">2 times</span>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 mt-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">Great progress! Sleep improved 15% this week.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything You Need for Better Sleep
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Designed by sleep experts and parents who understand the challenges of those sleepless nights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8">
                    <div className={`inline-flex p-3 rounded-2xl bg-gray-50 mb-6 transition-all duration-300 group-hover:scale-110`}>
                      <IconComponent className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed font-light">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Turn Sleep Data Into 
                <span className="text-blue-600 block">Actionable Insights</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
                Our intelligent analytics help you spot patterns, predict optimal bedtimes, and understand what works best for your unique baby. 
                No more guessing - just gentle, data-driven guidance.
              </p>
              <div className="space-y-4">
                {[
                  "Weekly sleep pattern analysis",
                  "Personalized bedtime recommendations", 
                  "Sleep regression alerts and tips",
                  "Progress tracking and milestones"
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium" 
                onClick={handleGetStarted}
              >
                See Your Sleep Insights
              </Button>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-2xl animate-scale-in">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">This Week's Summary</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">11.2h</div>
                    <div className="text-sm text-gray-600">Avg. Night Sleep</div>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">2.1h</div>
                    <div className="text-sm text-gray-600">Avg. Day Naps</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sleep Quality</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-800">
                      🎉 Bedtime routine is working great! Keep it up.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Loved by Parents Everywhere
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Join thousands of families who've found their way to better sleep.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-8">
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic font-light">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 font-medium">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            Ready for Better Nights?
          </h2>
          <p className="text-xl text-blue-100 mb-8 font-light">
            Start your journey to understanding your baby's sleep patterns today. 
            <span className="block mt-2">Your whole family will thank you.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium" 
              onClick={handleGetStarted}
            >
              Start Tracking Now
            </Button>
          </div>
          
          <p className="text-blue-100 text-sm mt-6 font-medium">
            Free 14-day trial • No credit card required • Available on iOS & Android
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 group">
                <Moon className="h-6 w-6 text-blue-400 transition-transform duration-300 group-hover:rotate-12" />
                <span className="text-lg font-semibold tracking-tight">SleepyBaby</span>
              </div>
              <p className="text-gray-400 font-light">
                Helping families get the rest they deserve, one night at a time.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">Features</div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">Pricing</div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">Download</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">Help Center</div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">Contact Us</div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">Privacy Policy</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">About</div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">Blog</div>
                <div className="hover:text-white transition-colors duration-300 cursor-pointer">Careers</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SleepyBaby. Made with ❤️ by parents, for parents.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
