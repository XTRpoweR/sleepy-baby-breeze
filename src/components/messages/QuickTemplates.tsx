
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Baby, 
  Coffee, 
  Moon, 
  Utensils,
  AlertCircle,
  Calendar,
  X
} from 'lucide-react';

interface QuickTemplatesProps {
  onSelectTemplate: (template: string) => void;
  onClose: () => void;
}

export const QuickTemplates = ({ onSelectTemplate, onClose }: QuickTemplatesProps) => {
  const templates = [
    {
      category: 'Feeding',
      icon: <Utensils className="h-4 w-4" />,
      items: [
        'Just finished feeding 🍼',
        'Started feeding at [time]',
        'Had a great feeding session!',
        'Feeding completed - baby seems satisfied'
      ]
    },
    {
      category: 'Sleep',
      icon: <Moon className="h-4 w-4" />,
      items: [
        'Nap time started 😴',
        'Just woke up from nap',
        'Going down for the night',
        'Had a long, peaceful sleep'
      ]
    },
    {
      category: 'Diaper',
      icon: <Baby className="h-4 w-4" />,
      items: [
        'Diaper changed ✅',
        'Clean diaper on!',
        'Fresh and clean now'
      ]
    },
    {
      category: 'Activities',
      icon: <Coffee className="h-4 w-4" />,
      items: [
        'Having tummy time',
        'Playing and happy 😊',
        'Story time together',
        'Going for a walk'
      ]
    },
    {
      category: 'Schedule',
      icon: <Calendar className="h-4 w-4" />,
      items: [
        'Running a bit late today',
        'Early pickup needed',
        'Schedule change for tomorrow',
        'Will be there in 15 minutes'
      ]
    },
    {
      category: 'Questions',
      icon: <AlertCircle className="h-4 w-4" />,
      items: [
        'Any feeding concerns today?',
        'How was the nap schedule?',
        'Need any supplies?',
        'Everything going well?'
      ]
    }
  ];

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Quick Message Templates</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {templates.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center space-x-2">
                {category.icon}
                <h4 className="text-xs font-medium text-gray-700">{category.category}</h4>
              </div>
              <div className="grid grid-cols-1 gap-1 pl-6">
                {category.items.map((template, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                    className="justify-start text-xs h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
