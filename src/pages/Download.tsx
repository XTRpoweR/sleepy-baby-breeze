
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { 
  Moon, 
  ArrowLeft, 
  Smartphone, 
  Monitor, 
  Download as DownloadIcon,
  Apple,
  Chrome,
  Star,
  Shield,
  Zap
} from "lucide-react";

const Download = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Download SleepyBaby
            <span className="text-blue-600 block">for All Your Devices</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Access SleepyBaby anywhere, anytime. Available on iOS, Android, and web browsers 
            with seamless sync across all your devices.
          </p>

          {/* Download Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* iOS App */}
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center">
                <Apple className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">iOS App</h3>
                <p className="text-gray-600 mb-6">Download for iPhone and iPad</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  App Store
                </Button>
                <div className="flex items-center justify-center space-x-1 mt-4 text-sm text-gray-500">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 • iOS 14.0+</span>
                </div>
              </CardContent>
            </Card>

            {/* Android App */}
            <Card className="border-2 border-green-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center">
                <Smartphone className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Android App</h3>
                <p className="text-gray-600 mb-6">Download for Android devices</p>
                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                  <DownloadIcon className="h-5 w-5 mr-2" />
                  Google Play
                </Button>
                <div className="flex items-center justify-center space-x-1 mt-4 text-sm text-gray-500">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 • Android 8.0+</span>
                </div>
              </CardContent>
            </Card>

            {/* Web App */}
            <Card className="border-2 border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center">
                <Monitor className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Web App</h3>
                <p className="text-gray-600 mb-6">Use in any web browser</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
                  <Chrome className="h-5 w-5 mr-2" />
                  Open Web App
                </Button>
                <div className="flex items-center justify-center space-x-1 mt-4 text-sm text-gray-500">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure • No download needed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Apps?
            </h2>
            <p className="text-xl text-gray-600">
              Built with the latest technology for the best user experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Lightning Fast</h3>
                <p className="text-gray-600">
                  Optimized for quick logging even when you're sleep-deprived. 
                  Log activities in seconds with our intuitive interface.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Secure & Private</h3>
                <p className="text-gray-600">
                  Your family's data is protected with enterprise-grade security. 
                  End-to-end encryption keeps your information safe.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <Monitor className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Cross-Platform Sync</h3>
                <p className="text-gray-600">
                  Start on your phone, continue on your tablet. 
                  All your data syncs seamlessly across all devices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            System Requirements
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">iOS</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• iOS 14.0 or later</li>
                  <li>• iPhone 6s or newer</li>
                  <li>• iPad (5th generation) or newer</li>
                  <li>• 50 MB storage space</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Android</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Android 8.0 (API level 26)</li>
                  <li>• 2 GB RAM minimum</li>
                  <li>• ARMv7 or ARM64 processor</li>
                  <li>• 100 MB storage space</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Web Browser</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Chrome 80+ / Safari 13+</li>
                  <li>• Firefox 75+ / Edge 80+</li>
                  <li>• JavaScript enabled</li>
                  <li>• Internet connection required</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Tracking Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Download SleepyBaby now and begin your journey to better sleep for the whole family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Download for iOS
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Download for Android
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Download;
