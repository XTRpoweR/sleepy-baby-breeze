import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Moon, ArrowLeft, Heart, Users, Target, Award, Baby, Clock, Shield, Globe } from "lucide-react";
const About = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
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
              <Button onClick={() => navigate('/contact')} className="bg-blue-600 hover:bg-blue-700">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Made by Parents,
            <span className="text-blue-600 block">for Parents</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            SleepyBaby was born from the sleepless nights and endless questions that come with 
            welcoming a new baby into the family. We've been there, and we built the app we 
            wished we had during those precious but challenging early days.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p>
                  It started with Emma and David, new parents struggling to understand their 
                  baby's sleep patterns. Like many parents, they found themselves overwhelmed 
                  by conflicting advice and generic solutions that didn't work for their unique situation.
                </p>
                <p>
                  As software engineers and parents, they realized technology could help families 
                  make sense of their baby's individual needs. They began developing SleepyBaby 
                  during late-night feeding sessions, designing every feature with real-world 
                  parenting challenges in mind.
                </p>
                <p>
                  Today, SleepyBaby helps thousands of families worldwide get better sleep, 
                  backed by sleep science and refined through the experiences of real parents 
                  just like you.
                </p>
              </div>
            </div>
            <div className="relative">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center">
                    <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Our Mission
                    </h3>
                    <p className="text-gray-600">
                      To help every family get the rest they deserve by providing 
                      gentle, science-based guidance that respects each baby's unique needs.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <Baby className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Baby-First</h3>
                <p className="text-gray-600">
                  Every feature is designed with your baby's wellbeing and individual needs as the top priority.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Privacy-First</h3>
                <p className="text-gray-600">
                  Your family's data belongs to you. We use enterprise-grade security and never sell your information.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Evidence-Based</h3>
                <p className="text-gray-600">
                  All our guidance is rooted in pediatric sleep science and validated by real parent experiences.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Inclusive</h3>
                <p className="text-gray-600">
                  Supporting families of all types, available in 8 languages with culturally appropriate guidance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600">
              Real results from real families
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">Families helped</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2M+</div>
              <div className="text-gray-600">Sleep sessions tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">4.9★</div>
              <div className="text-gray-600">Average app rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">8</div>
              <div className="text-gray-600">Languages supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Family
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Become part of a community that's transforming how families approach baby sleep, 
            one peaceful night at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/')} className="bg-white text-blue-600 hover:bg-blue-50">
              Start Your Journey
            </Button>
            <Button size="lg" onClick={() => navigate('/contact')} variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Get in Touch
            </Button>
          </div>
        </div>
      </section>
    </div>;
};
export default About;