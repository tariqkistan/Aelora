import React from 'react';

export const metadata = {
  title: 'About Aelora - AI Content Optimization',
  description: 'Learn more about Aelora and our mission to help content creators optimize for AI visibility.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About Aelora</h1>
      
      <div className="prose prose-lg">
        <p className="text-xl text-gray-700 mb-6">
          Aelora is an innovative tool designed to help content creators, marketers, and website owners optimize their content for AI search engines.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p>
          As search engines increasingly rely on AI to understand and rank content, traditional SEO practices are evolving. Our mission is to provide accessible and actionable insights that help creators adapt to these changes and improve their visibility.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">What We Do</h2>
        <p>
          Aelora analyzes your website content through the lens of modern AI systems. We evaluate factors that influence how well AI models can understand, contextualize, and recommend your content to users.
        </p>
        <p>
          Our analysis provides scores across multiple dimensions and offers practical recommendations to improve your content's AI visibility.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Technology</h2>
        <p>
          Aelora leverages advanced natural language processing and machine learning techniques to evaluate content in a way that mirrors how AI search engines process information. Our tools are continuously refined to keep pace with developments in AI search technology.
        </p>
      </div>
    </div>
  );
} 