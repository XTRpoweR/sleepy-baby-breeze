import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const articles = [
  {
    id: '1',
    category: 'Getting Started',
    title: 'Welcome to Our Platform',
    author: 'John Doe',
    readTime: '5 min',
    content: [
      '## Introduction',
      'Welcome to our platform! This article will guide you through the basics of using our services.',
      '### Account Setup',
      'To get started, you need to create an account. Follow these steps:',
      '- Go to our website and click on the "Sign Up" button.',
      '- Fill in the required information, such as your name, email, and password.',
      '- Verify your email address by clicking on the link sent to your inbox.',
      '### Navigating the Dashboard',
      'Once you have created an account, you can log in and access the dashboard. Here are the main sections:',
      '- **Overview**: A summary of your account activity.',
      '- **Settings**: Configure your preferences and profile information.',
      '- **Support**: Access our help center and contact support.',
      '## Conclusion',
      'We hope this article has been helpful. If you have any questions, feel free to contact our support team.',
    ],
  },
  {
    id: '2',
    category: 'Troubleshooting',
    title: 'Common Issues and Solutions',
    author: 'Jane Smith',
    readTime: '8 min',
    content: [
      '## Introduction',
      'This article provides solutions to common issues you may encounter while using our platform.',
      '### Issue: Account Login Problems',
      'If you are having trouble logging into your account, try the following:',
      '- Make sure you are using the correct email address and password.',
      '- If you have forgotten your password, click on the "Forgot Password" link to reset it.',
      '- Check your internet connection to ensure you are online.',
      '### Issue: Payment Failures',
      'If your payment is failing, consider the following:',
      '- Verify that your credit card information is up to date.',
      '- Ensure that you have sufficient funds in your account.',
      '- Contact your bank to check if there are any restrictions on your card.',
      '## Conclusion',
      'We hope these solutions help you resolve any issues you may be experiencing. If you need further assistance, please contact our support team.',
    ],
  },
  {
    id: '3',
    category: 'Using Features',
    title: 'How to Use Advanced Features',
    author: 'Mike Johnson',
    readTime: '10 min',
    content: [
      '## Introduction',
      'This article will guide you through the advanced features of our platform.',
      '### Feature: Data Analytics',
      'Our data analytics tool allows you to gain insights into your data. Here’s how to use it:',
      '- Navigate to the "Data Analytics" section in the dashboard.',
      '- Select the data range and metrics you want to analyze.',
      '- View the generated reports and visualizations.',
      '### Feature: Automation',
      'Automation helps you streamline your workflows. Follow these steps to set it up:',
      '- Go to the "Automation" settings.',
      '- Define the triggers and actions for your automated tasks.',
      '- Test your automation to ensure it works as expected.',
      '## Conclusion',
      'By leveraging these advanced features, you can significantly improve your productivity and efficiency. If you have any questions, our support team is here to help.',
    ],
  },
];

const HelpArticle = () => {
  const { category, id } = useParams();
  
  const article = articles.find(
    (article) => article.category.toLowerCase() === category && article.id === id
  );

  const renderContent = (content: string[]) => {
    return content.map((paragraph, index) => {
      // Handle headings
      if (paragraph.startsWith('###')) {
        const text = paragraph.replace(/^###\s*/, '');
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0">
            {text}
          </h3>
        );
      }
      
      if (paragraph.startsWith('##')) {
        const text = paragraph.replace(/^##\s*/, '');
        return (
          <h2 key={index} className="text-xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
            {text}
          </h2>
        );
      }

      // Handle bullet points
      if (paragraph.startsWith('- ')) {
        const text = paragraph.replace(/^-\s*/, '');
        const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <div key={index} className="flex items-start mb-2">
            <span className="text-blue-600 mr-3 mt-1">•</span>
            <p 
              className="text-gray-700 leading-relaxed flex-1"
              dangerouslySetInnerHTML={{ __html: processedText }}
            />
          </div>
        );
      }

      // Handle regular paragraphs
      if (paragraph.trim()) {
        const processedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p 
            key={index} 
            className="text-gray-700 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: processedText }}
          />
        );
      }

      // Handle empty lines
      return <div key={index} className="mb-2" />;
    });
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
            <Link to="/help">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/help" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{article.category}</Badge>
              <Badge variant="outline">{article.readTime}</Badge>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </CardTitle>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {article.author}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {article.readTime}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              {renderContent(article.content)}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/help">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpArticle;
