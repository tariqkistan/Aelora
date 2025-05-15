import React from 'react';

export const metadata = {
  title: 'Privacy Policy - Aelora',
  description: 'Privacy policy and data handling practices for Aelora AI content optimization tool.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg">
        <p className="text-xl text-gray-700 mb-6">
          At Aelora, we take your privacy seriously. This policy outlines how we collect, use, and protect your data.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
        <p>
          When you use Aelora to analyze a website, we collect:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>URLs you submit for analysis</li>
          <li>Content from those URLs that is necessary for analysis</li>
          <li>Basic usage statistics to improve our service</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
        <p>
          We use the collected information to:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li>Provide analysis results and recommendations</li>
          <li>Improve our algorithms and service quality</li>
          <li>Maintain and enhance the platform</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Storage and Security</h2>
        <p>
          All data is stored securely on AWS infrastructure with industry-standard encryption and security practices. Analysis results are stored temporarily and may be purged periodically.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Services</h2>
        <p>
          We may use third-party services to help us operate our website and analyze how users interact with our platform. These services may collect non-personal information.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
        <p>
          If you have any questions regarding this privacy policy, you can contact us via email.
        </p>
        
        <p className="text-sm text-gray-500 mt-12">
          Last updated: {new Date().toISOString().split('T')[0]}
        </p>
      </div>
    </div>
  );
} 