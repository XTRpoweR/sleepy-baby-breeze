
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
      <CardContent className={`p-6 sm:p-8 ${hasIllustration ? 'text-center' : ''}`}>
        {hasIllustration ? (
          <div className="mb-6">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 mb-6 transition-transform duration-300 group-hover:scale-105 border border-blue-100">
              <img 
                src={feature.illustration} 
                alt={`${feature.title} illustration`}
                className="w-24 h-18 sm:w-32 sm:h-24 object-contain"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <div className="inline-flex p-3 rounded-2xl gradient-dynamic-slow mb-6 transition-transform duration-300 group-hover:scale-110">
            <IconComponent className="h-8 w-8 text-white" />
          </div>
        )}
        
        <h3 className={`text-xl font-bold text-gray-900 mb-4 tracking-tight leading-tight ${
          hasIllustration ? 'text-center' : ''
        }`}>
          {feature.title}
        </h3>
        <p className={`text-base text-gray-600 leading-relaxed font-light ${
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
