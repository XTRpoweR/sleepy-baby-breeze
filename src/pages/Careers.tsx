
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { 
  Moon, 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Heart, 
  Coffee,
  Laptop,
  Home,
  Globe,
  Award,
  Zap,
  Shield
} from "lucide-react";

const Careers = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const openPositions = [
    {
      title: "Senior React Developer",
      department: "Engineering",
      type: "Full-time",
      location: "Remote",
      salary: "$120k - $150k",
      description: "Help build the future of baby tracking technology. We're looking for a passionate React developer to join our growing team."
    },
    {
      title: "Pediatric Sleep Consultant",
      department: "Product",
      type: "Full-time",
      location: "Remote",
      salary: "$80k - $100k",
      description: "Shape our sleep guidance features and content. Work directly with families to improve baby sleep outcomes."
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      type: "Full-time",
      location: "San Francisco or Remote",
      salary: "$100k - $130k",
      description: "Design intuitive experiences for sleep-deprived parents. Create beautiful, functional interfaces that make tracking effortless."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Experience",
      type: "Full-time",
      location: "Remote",
      salary: "$70k - $90k",
      description: "Be the voice of our users. Help families get the most out of SleepyBaby and drive product improvements."
    },
    {
      title: "Data Scientist",
      department: "Engineering",
      type: "Full-time",
      location: "Remote",
      salary: "$130k - $160k",
      description: "Unlock insights from sleep data to help families understand their baby's patterns and improve sleep outcomes."
    },
    {
      title: "Content Marketing Manager",
      department: "Marketing",
      type: "Part-time",
      location: "Remote",
      salary: "$60k - $80k",
      description: "Create compelling content that educates and supports parents. Build our brand as the trusted sleep resource."
    }
  ];

  const benefits = [
    {
      icon: Home,
      title: "Remote-First Culture",
      description: "Work from anywhere in the world. We trust our team to do their best work wherever they're most productive."
    },
    {
      icon: Heart,
      title: "Parental Leave",
      description: "Generous parental leave for all new parents, because we understand how important those early days are."
    },
    {
      icon: Laptop,
      title: "Top-Tier Equipment",
      description: "Latest MacBook Pro, monitor, and any equipment you need to do your best work, shipped to your door."
    },
    {
      icon: Coffee,
      title: "Learning & Development",
      description: "$2,000 annual budget for courses, conferences, books, and professional development."
    },
    {
      icon: Shield,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, dental, vision, and mental health support for you and your family."
    },
    {
      icon: Globe,
      title: "Flexible Schedule",
      description: "Work when you're most productive. We care about results, not when you're online."
    }
  ];

  const values = [
    {
      icon: Users,
      title: "Family First",
      description: "We're building for families, and we prioritize family time for our team members too."
    },
    {
      icon: Heart,
      title: "Empathy-Driven",
      description: "Every decision is made with deep empathy for the parents using our product."
    },
    {
      icon: Zap,
      title: "Continuous Learning",
      description: "We're always learning, growing, and improving both as individuals and as a company."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from code quality to customer support."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
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
              <Button onClick={() => navigate('/contact')} variant="outline">
                Questions?
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join Our Mission
            <span className="text-blue-600 block">Help Families Sleep Better</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We're building the future of family wellness, starting with better baby sleep. 
            Join a passionate team of parents, engineers, and sleep experts who are making a real difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              View Open Positions
            </Button>
            <Button size="lg" variant="outline">
              Learn About Our Culture
            </Button>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide how we work and what we build
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <IconComponent className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why You'll Love Working Here
            </h2>
            <p className="text-xl text-gray-600">
              We offer more than just a job – we provide a supportive environment where you can thrive
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <IconComponent className="h-10 w-10 text-blue-600 mb-2" />
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-gray-600">
              Join our growing team and help shape the future of family wellness
            </p>
          </div>

          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{position.title}</CardTitle>
                      <CardDescription className="text-lg mb-4">{position.description}</CardDescription>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Apply Now
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{position.department}</Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{position.type}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{position.location}</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{position.salary}</span>
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don't see a position that fits? We're always looking for talented people.
            </p>
            <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Hiring Process
            </h2>
            <p className="text-xl text-gray-600">
              We believe in a transparent, respectful hiring process that works for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Application", description: "Submit your resume and cover letter through our portal" },
              { step: "2", title: "Phone Screen", description: "Brief call with our team to discuss your background and interest" },
              { step: "3", title: "Technical Interview", description: "Role-specific interview to assess your skills and experience" },
              { step: "4", title: "Team Meeting", description: "Meet the team you'll be working with and ask any questions" }
            ].map((stage, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {stage.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{stage.title}</h3>
                  <p className="text-gray-600">{stage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join a team that's passionate about helping families get better sleep. 
            Your work will directly impact thousands of parents and babies worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Browse Open Positions
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;
