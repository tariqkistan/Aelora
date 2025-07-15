import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InputForm from '@/components/InputForm';

// Mock the next/navigation router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the apiClient
jest.mock('@/lib/apiClient', () => ({
  configureApiClient: jest.fn(),
  analyzeUrl: jest.fn(),
}));

// Mock BusinessQuestionnaire component
jest.mock('@/components/BusinessQuestionnaire', () => {
  return function MockBusinessQuestionnaire({ onComplete, onSkip }) {
    return (
      <div data-testid="business-questionnaire">
        <button onClick={() => onSkip()}>Skip</button>
        <button 
          onClick={() => onComplete({
            companyName: 'Test Company',
            website: 'test.com',
            industry: 'Technology',
            companySize: 'Small Business (2-10 employees)',
            primaryLocation: 'San Francisco',
            country: 'United States',
            targetMarkets: ['US', 'Canada'],
            languages: ['English'],
            businessModel: 'B2B',
            targetAudience: 'Small businesses',
            priceRange: 'Premium',
            mainCompetitors: ['Competitor 1'],
            uniqueSellingPoints: ['Feature 1'],
            primaryGoals: ['Increase brand awareness'],
            currentChallenges: ['Low brand visibility'],
            brandPersonality: 'Professional',
            additionalInfo: ''
          })}>
          Complete
        </button>
      </div>
    );
  };
});

describe('InputForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the business questionnaire initially', () => {
    render(<InputForm />);
    expect(screen.getByTestId('business-questionnaire')).toBeInTheDocument();
  });

  test('shows URL input form after skipping questionnaire', async () => {
    render(<InputForm />);
    
    // Click skip button on questionnaire
    fireEvent.click(screen.getByText('Skip'));
    
    // Check that URL input form is shown
    await waitFor(() => {
      expect(screen.getByText('Website Analysis')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter website URL (e.g., example.com)')).toBeInTheDocument();
    });
  });

  test('shows URL input form with business info after completing questionnaire', async () => {
    render(<InputForm />);
    
    // Click complete button on questionnaire
    fireEvent.click(screen.getByText('Complete'));
    
    // Check that URL input form is shown with business info
    await waitFor(() => {
      expect(screen.getByText('Website Analysis')).toBeInTheDocument();
      expect(screen.getByText('Business Context Added')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });
  });

  test('validates URL input', async () => {
    render(<InputForm />);
    
    // Skip questionnaire to show URL form
    fireEvent.click(screen.getByText('Skip'));
    
    // Try to submit without a URL
    await waitFor(() => {
      const submitButton = screen.getByText('Analyze Website');
      fireEvent.click(submitButton);
    });
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Please enter a URL')).toBeInTheDocument();
    });
  });

  test('allows editing business info', async () => {
    render(<InputForm />);
    
    // Complete questionnaire
    fireEvent.click(screen.getByText('Complete'));
    
    // Click edit button
    await waitFor(() => {
      const editButton = screen.getByText('Edit');
      fireEvent.click(editButton);
    });
    
    // Check that questionnaire is shown again
    await waitFor(() => {
      expect(screen.getByTestId('business-questionnaire')).toBeInTheDocument();
    });
  });
}); 