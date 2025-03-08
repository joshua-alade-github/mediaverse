'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  // Get email from URL or localStorage if available
  const email = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('email') || localStorage.getItem('signupEmail') || 'your email'
    : 'your email';

  useEffect(() => {
    // Clear the email from localStorage after a while
    const timeout = setTimeout(() => {
      localStorage.removeItem('signupEmail');
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="bg-green-100 p-6 rounded-full mb-6">
        <MailCheck className="h-12 w-12 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Check your email</h1>
      
      <p className="text-lg text-gray-600 max-w-md mb-8">
        We've sent a verification link to <span className="font-medium">{email}</span>. 
        Click the link to verify your account and log in.
      </p>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          If you don't see it, check your spam folder
        </p>
        
        <div className="border-t border-gray-200 pt-4">
          <Link 
            href="/auth/login" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}