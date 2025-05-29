
import { UserButton, useUser } from "@clerk/clerk-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Moon, 
  Clock, 
  Calendar, 
  Baby,
  BarChart3,
  Plus,
  TrendingUp
} from "lucide-react";

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Moon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SleepyBaby</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.firstName}!</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sleep Dashboard</h1>
          <p className="text-gray-600">Track and understand your baby's sleep patterns</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Baby className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Log Sleep</h3>
                  <p className="text-sm text-gray-600">Record bedtime and wake up</p>
                </div>
              </div>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Sleep Entry
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Schedule</h3>
                  <p className="text-sm text-gray-600">Manage sleep routine</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Insights</h3>
                  <p className="text-sm text-gray-600">Sleep analytics</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sleep Summary */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Last Night's Sleep</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bedtime</span>
                  <span className="font-medium">7:30 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Wake up</span>
                  <span className="font-medium">6:50 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Sleep</span>
                  <span className="font-medium text-green-600">11h 20m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Night wakings</span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Sleep</span>
                  <span className="font-medium">10h 45m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Night</span>
                  <span className="font-medium text-green-600">12h 10m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sleep Quality</span>
                  <span className="font-medium">Improving ↗️</span>
                </div>
                <div className="bg-green-50 rounded-lg p-3 mt-4">
                  <p className="text-sm text-green-800">
                    🎉 Great progress! Sleep patterns are becoming more consistent.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
