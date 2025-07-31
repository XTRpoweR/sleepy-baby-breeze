
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';

interface NewsletterSubscriptionProps {
  className?: string;
}

export const NewsletterSubscription = ({ className = "" }: NewsletterSubscriptionProps) => {
  const [email, setEmail] = useState('');
  const { subscribe, isSubscribing } = useNewsletterSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    const success = await subscribe(email);
    if (success) {
      setEmail(''); // Clear the form on success
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white text-sm sm:text-base touch-target"
        required
        disabled={isSubscribing}
      />
      <Button 
        type="submit"
        size="lg" 
        className="bg-white text-blue-600 hover:bg-blue-50 touch-target whitespace-nowrap" 
        disabled={isSubscribing || !email.trim()}
      >
        {isSubscribing ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
};
