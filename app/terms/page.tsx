import React from 'react';

export const metadata = {
  title: 'Terms of Service - Aelora',
  description: 'Terms of service and usage policies for Aelora AI content optimization tool.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-lg">
        <p className="text-xl text-gray-700 mb-6">
          Welcome to Aelora. By using our service, you agree to these terms.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Service Description</h2>
        <p>
          Aelora provides analysis and recommendations to help optimize website content for AI search engines. Our service is provided on an "as is" and "as available" basis.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">User Responsibilities</h2>
        <p>
          When using Aelora, you agree:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>To provide only URLs you have permission to analyze</li>
          <li>Not to use our service for any illegal or unauthorized purposes</li>
          <li>Not to attempt to interfere with or disrupt our service</li>
          <li>To respect our rate limits and fair usage policies</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Intellectual Property</h2>
        <p>
          Aelora's name, logo, website, and all content and software associated with our service are protected by intellectual property rights. You may not use these assets without our permission.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
        <p>
          Aelora is not responsible for any damages, direct or indirect, resulting from your use of our service. We do not guarantee that our recommendations will improve your website's performance or visibility.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Service Changes and Termination</h2>
        <p>
          We reserve the right to modify or discontinue our service at any time. We may also update these terms of service periodically. Continued use of Aelora after such changes constitutes acceptance of the new terms.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with applicable laws.
        </p>
        
        <p className="text-sm text-gray-500 mt-12">
          Last updated: {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  );
} 