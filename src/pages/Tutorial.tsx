import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Baby, Activity, BarChart3, Calendar } from 'lucide-react';
import { DesktopHeader } from '@/components/layout/DesktopHeader';
import { MobileHeader } from '@/components/layout/MobileHeader';

const Tutorial = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tutorialSteps = [
    {
      id: 0,
      title: t('tutorial.steps.setup.title'),
      description: t('tutorial.steps.setup.description'),
      icon: Baby,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      estimatedTime: '5 min',
      content: [
        t('tutorial.steps.setup.step1'),
        t('tutorial.steps.setup.step2'),
        t('tutorial.steps.setup.step3'),
        t('tutorial.steps.setup.step4')
      ],
      actionText: t('tutorial.actions.createProfile'),
      actionRoute: '/dashboard'
    },
    {
      id: 1,
      title: t('tutorial.steps.tracking.title'),
      description: t('tutorial.steps.tracking.description'),
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      estimatedTime: '10 min',
      content: [
        t('tutorial.steps.tracking.step1'),
        t('tutorial.steps.tracking.step2'),
        t('tutorial.steps.tracking.step3'),
        t('tutorial.steps.tracking.step4')
      ],
      actionText: t('tutorial.actions.startTracking'),
      actionRoute: '/track'
    },
    {
      id: 2,
      title: t('tutorial.steps.reports.title'),
      description: t('tutorial.steps.reports.description'),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      estimatedTime: '7 min',
      content: [
        t('tutorial.steps.reports.step1'),
        t('tutorial.steps.reports.step2'),
        t('tutorial.steps.reports.step3'),
        t('tutorial.steps.reports.step4')
      ],
      actionText: t('tutorial.actions.viewReports'),
      actionRoute: '/reports'
    },
    {
      id: 3,
      title: t('tutorial.steps.advanced.title'),
      description: t('tutorial.steps.advanced.description'),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      estimatedTime: '8 min',
      content: [
        t('tutorial.steps.advanced.step1'),
        t('tutorial.steps.advanced.step2'),
        t('tutorial.steps.advanced.step3'),
        t('tutorial.steps.advanced.step4')
      ],
      actionText: t('tutorial.actions.exploreFeatures'),
      actionRoute: '/sleep-schedule'
    }
  ];

  const markStepCompleted = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTutorial = tutorialSteps[currentStep];
  const IconComponent = currentTutorial.icon;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Headers */}
      <DesktopHeader />
      <MobileHeader />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back button */}
        <div className="mb-6 md:mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>{t('navigation.back')}</span>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
            {t('tutorial.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed">
            {t('tutorial.subtitle')}
          </p>
          <div className="max-w-2xl mx-auto mb-6 md:mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{t('tutorial.progress')}</span>
              <span className="text-sm text-gray-600">{currentStep + 1} / {tutorialSteps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {tutorialSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps.includes(step.id);
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`flex flex-col items-center space-y-2 p-3 md:p-4 rounded-lg transition-all min-w-[100px] md:min-w-[120px] ${
                    isActive 
                      ? 'bg-white shadow-lg border-2 border-blue-200' 
                      : 'bg-white/50 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 md:p-3 rounded-full ${step.bgColor} relative`}>
                    <StepIcon className={`h-5 w-5 md:h-6 md:w-6 ${step.color}`} />
                    {isCompleted && (
                      <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-medium text-gray-900 mb-1">{step.title}</div>
                    <Badge variant="secondary" className="text-xs">{step.estimatedTime}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="mb-8 md:mb-12">
          {/* Step Details - Now using full width */}
          <Card className="border-0 shadow-lg max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className={`p-3 rounded-full ${currentTutorial.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${currentTutorial.color}`} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{currentTutorial.title}</h2>
                  <p className="text-gray-600 font-normal text-sm md:text-base">{currentTutorial.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentTutorial.content.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{item}</p>
                </div>
              ))}
              
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={() => {
                    markStepCompleted(currentTutorial.id);
                    navigate(currentTutorial.actionRoute);
                  }} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {currentTutorial.actionText}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => markStepCompleted(currentTutorial.id)} 
                  className="w-full"
                >
                  {t('tutorial.actions.markCompleted')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 0} 
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('common.previous')}</span>
          </Button>

          <div className="text-center order-first sm:order-none">
            <p className="text-sm text-gray-600 mb-2">
              {t('tutorial.completedSteps', { 
                completed: completedSteps.length, 
                total: tutorialSteps.length 
              })}
            </p>
            {completedSteps.length === tutorialSteps.length && (
              <Badge className="bg-green-100 text-green-800">
                {t('tutorial.allCompleted')}
              </Badge>
            )}
          </div>

          <Button 
            onClick={nextStep} 
            disabled={currentStep === tutorialSteps.length - 1} 
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <span>{t('common.next')}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
