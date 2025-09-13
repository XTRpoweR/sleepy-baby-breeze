
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Music } from 'lucide-react';

export const QuickLogCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/sounds');
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-500 cursor-pointer bg-gradient-to-br from-green-50 to-blue-50 border-green-200 touch-target transform hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-200/50 group"
      onClick={handleClick}
    >
      <CardContent className="p-4 lg:p-6 text-center">
        <div className="bg-green-100 rounded-full w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 lg:mb-4 transition-all duration-500 group-hover:shadow-green-200/50 group-hover:scale-110">
          <div className="relative">
            <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 transition-transform duration-500 group-hover:rotate-12" />
            <Music className="h-3 w-3 lg:h-4 lg:w-4 text-green-700 absolute -top-1 -right-1 transition-transform duration-500 group-hover:animate-bounce" />
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2 text-sm lg:text-base">Quick Log</h3>
        <p className="text-xs lg:text-sm text-gray-600 mb-3">Add a completed activity session</p>
        <div className="mt-3">
          <div className="text-xs text-green-600 font-medium">
            Includes soothing sounds & timers
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
