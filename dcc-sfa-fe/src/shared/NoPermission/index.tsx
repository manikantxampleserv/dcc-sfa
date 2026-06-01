import React from 'react';
import { Lock } from 'lucide-react';

const NoPermission: React.FC = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="z-[99999] fixed inset-0 w-screen h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-xl w-full">
        {/* Simple Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>

        {/* Title and Message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your
          administrator if you think this is an error.
        </p>

        {/* Simple Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleGoBack}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Possible Causes */}
        <div className="text-left space-y-3">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
              <svg
                className="w-4 h-4 transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              What can I do?
            </summary>
            <div className="mt-3 pl-6 space-y-2 text-sm text-gray-600">
              <p>• Contact your administrator to request access</p>
              <p>• Check if your user role is correct</p>
              <p>• Try logging out and back in</p>
            </div>
          </details>
        </div>

        {/* Simple Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact your IT support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoPermission;
