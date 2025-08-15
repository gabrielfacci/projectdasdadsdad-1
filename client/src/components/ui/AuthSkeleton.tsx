import React from 'react';

export default function AuthSkeleton() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden animate-pulse"
      style={{ backgroundColor: '#0d0a14' }}
    >
      {/* Background Effects */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(123, 104, 238, 0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 112, 219, 0.15), transparent 50%), linear-gradient(135deg, rgba(123, 104, 238, 0.05), rgba(147, 112, 219, 0.05))'
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Ghost Logo Skeleton */}
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 mx-auto rounded-full mb-4"
            style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
          />
          <div 
            className="h-8 w-48 mx-auto rounded-lg mb-2"
            style={{ backgroundColor: 'rgba(123, 104, 238, 0.1)' }}
          />
          <div 
            className="h-4 w-64 mx-auto rounded-lg"
            style={{ backgroundColor: 'rgba(123, 104, 238, 0.1)' }}
          />
        </div>

        {/* Form Skeleton */}
        <div 
          className="p-6 rounded-2xl border backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(39, 39, 42, 0.3)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Title Skeleton */}
          <div 
            className="h-6 w-32 mx-auto rounded-lg mb-6"
            style={{ backgroundColor: 'rgba(123, 104, 238, 0.2)' }}
          />

          {/* Input Field Skeleton */}
          <div className="space-y-4">
            <div 
              className="h-12 w-full rounded-lg"
              style={{ backgroundColor: 'rgba(39, 39, 42, 0.5)' }}
            />
            
            {/* Button Skeleton */}
            <div 
              className="h-12 w-full rounded-lg"
              style={{ backgroundColor: 'rgba(123, 104, 238, 0.3)' }}
            />

            {/* Link Skeleton */}
            <div 
              className="h-10 w-full rounded-lg"
              style={{ backgroundColor: 'rgba(39, 39, 42, 0.3)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}