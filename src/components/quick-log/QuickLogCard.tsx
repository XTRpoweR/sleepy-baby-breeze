
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
      className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-blue-50 border-green-200"
      onClick={handleClick}
    >
      <CardContent className="p-6 text-center">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <div className="relative">
            <Clock className="h-8 w-8 text-green-600" />
            <Music className="h-4 w-4 text-green-700 absolute -top-1 -right-1" />
          </div>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Quick Log</h3>
        <p className="text-sm text-gray-600">Add a completed activity session</p>
        <div className="mt-3">
          <div className="text-xs text-green-600 font-medium">
            Includes soothing sounds & timers
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
