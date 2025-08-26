
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EnhancedFeatureCardProps {
  feature: {
    icon?: any;
    illustration?: string;
    title: string;
    description: string;
  };
  index: number;
}

const EnhancedFeatureCard = memo(({ feature, index }: EnhancedFeatureCardProps) => {
  const IconComponent = feature.icon;
  const hasIllustration = !!feature.illustration;
  
  return (
    <Card 
      className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up card-glow gpu-accelerated ${
        hasIllustration ? 'md:col-span-2 lg:col-span-1' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className={`p-4 sm:p-6 md:p-8 ${hasIllustration ? 'text-center' : ''}`}>
        {hasIllustration ? (
          <div className="mb-6">
            <div className="inline-flex p-4 rounded-2xl gradient-dynamic-slow mb-4 transition-transform duration-300 group-hover:scale-105">
              <img 
                src={feature.illustration} 
                alt={`${feature.title} illustration`}
                className="w-16 h-16 sm:w-20 sm:h-20"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <div className="inline-flex p-2 sm:p-3 rounded-2xl gradient-dynamic-slow mb-4 sm:mb-6 transition-transform duration-300 group-hover:scale-110">
            <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
        )}
        
        <h3 className={`text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight ${
          hasIllustration ? 'text-center' : ''
        }`}>
          {feature.title}
        </h3>
        <p className={`text-sm sm:text-base text-gray-600 leading-relaxed font-light ${
          hasIllustration ? 'text-center max-w-md mx-auto' : ''
        }`}>
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
});

EnhancedFeatureCard.displayName = "EnhancedFeatureCard";

export default EnhancedFeatureCard;
