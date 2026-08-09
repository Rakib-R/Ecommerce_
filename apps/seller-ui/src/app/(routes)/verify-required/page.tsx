'use client';
import React, { useState } from 'react';

const CheckEmailPage = () => {
  // Replace this with real user context / email query parameters later
  const userEmail = 'user@example.com';
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleOpenInbox = () => {
    // Extracts domain to help user jump straight to their provider (e.g., gmail.com)
    const domain = userEmail.split('@')[1];
    if (domain.includes('gmail')) {
      window.open('https://google.com', '_blank');
    } else if (domain.includes('outlook') || domain.includes('hotmail')) {
      window.open('https://live.com', '_blank');
    } else {
      window.open(`https://${domain}`, '_blank');
    }
  };

  const handleResendLink = async () => {
    setIsResending(true);
    setResendStatus('idle');

    try {
      // TODO: Replace with your actual auth-service API call
      // await axios.post('/api/auth/resend-verification', { email: userEmail })

      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulation
      setResendStatus('success');
    } catch (err) {
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 dark:bg-slate-900">
      <div className="w-full max-w-md text-center">
        {/* Animated/Glowing Envelope Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 mb-6 dark:bg-indigo-950/40 dark:text-indigo-400 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-10"></span>
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </div>

        {/* Heading Content */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Confirm your email
        </h1>

        <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          We sent a secure magic confirmation link to <br />
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {userEmail}
          </span>
        </p>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
          Click the link inside the email to instantly verify your account and
          sign in.
        </p>

        {/* Primary Action: Go to mail app */}
        <div className="mt-8">
          <button
            onClick={handleOpenInbox}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Open Email Inbox
            <svg
              className="ml-2 -mr-1 w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </button>
        </div>

        {/* Secondary Action: Resend & Troubleshooting */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Can't find the email? Check your spam folder or try again.
          </p>

          <div>
            <button
              onClick={handleResendLink}
              disabled={isResending}
              className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 transition-colors"
            >
              {isResending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Resending link...
                </>
              ) : (
                'Resend magic link'
              )}
            </button>
          </div>

          {/* Feedback Toasts/Messages */}
          {resendStatus === 'success' && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 py-2 rounded-lg">
              A new link has been delivered to your inbox.
            </p>
          )}
          {resendStatus === 'error' && (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 py-2 rounded-lg">
              ❌ Failed to send. Please check your connection and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
