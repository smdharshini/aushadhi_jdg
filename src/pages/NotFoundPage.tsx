import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-12 h-12 rounded bg-bg-muted border border-line flex items-center justify-center text-ink-muted mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h1 className="font-serif font-bold text-2xl text-ink">
        404 &ndash; Page Not Found
      </h1>
      <p className="text-xs text-ink-muted leading-relaxed">
        The requested operations resource does not exist in the Aushadhi Grid network directory.
      </p>
      <div className="pt-2">
        <Link
          to="/app/dashboard"
          className="inline-flex items-center space-x-2 bg-teal hover:bg-teal-hover text-bg-paper px-4 py-2 rounded text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
