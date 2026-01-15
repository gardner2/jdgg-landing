'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProjectSubmission } from '@/lib/database';

interface FormData {
  projectType: string;
  scope: {
    pages: number;
    features: string[];
    complexity: string;
  };
  timeline: {
    deadline: string;
    urgency: string;
  };
  budget: {
    range: string;
    flexibility: string;
  };
  client: {
    name: string;
    email: string;
    company: string;
    phone: string;
  };
  requirements: string;
}

export default function OnboardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    projectType: '',
    scope: {
      pages: 1,
      features: [],
      complexity: ''
    },
    timeline: {
      deadline: '',
      urgency: ''
    },
    budget: {
      range: '',
      flexibility: ''
    },
    client: {
      name: '',
      email: '',
      company: '',
      phone: ''
    },
    requirements: ''
  });

  const totalSteps = 5;
  const [requirements, setRequirements] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<any>(null);

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };


  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const quoteData = {
        email: formData.client.email,
        name: formData.client.name,
        company: formData.client.company,
        phone: formData.client.phone,
        projectType: formData.projectType,
        scopeFeatures: formData.scope.features,
        timeline: formData.timeline,
        budgetRange: formData.budget,
        requirements: requirements
      };

      // Generate quote
      const response = await fetch('/api/quotes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quote');
      }

      const result = await response.json();
      console.log('Quote generated successfully:', result);
      setQuoteData(result);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startNewProject = () => {
    setFormData({
      projectType: '',
      scope: {
        pages: 1,
        features: [],
        complexity: ''
      },
      timeline: {
        deadline: '',
        urgency: ''
      },
      budget: {
        range: '',
        flexibility: ''
      },
      client: {
        name: '',
        email: '',
        company: '',
        phone: ''
      },
      requirements: ''
    });
    setRequirements('');
    setCurrentStep(1);
    setIsSubmitted(false);
    setSubmitError(null);
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="text-xl sm:text-2xl font-semibold tracking-tight hover:opacity-80 transition-opacity">JGDD</a>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeToggle />
              <a href="/" className="modern-button border border-border text-foreground px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-muted transition-all duration-300">
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 sm:pt-24 pb-6 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        <div className="max-w-5xl mx-auto flex-1 flex flex-col">
          {/* Progress Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-tight tracking-tight">
                Let&apos;s build something amazing
              </h1>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-foreground h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {currentStep === 1 && formData.projectType && '✓ Project type selected'}
              {currentStep === 2 && formData.scope.complexity && '✓ Scope defined'}
              {currentStep === 3 && formData.timeline.deadline && formData.timeline.urgency && '✓ Timeline set'}
              {currentStep === 4 && formData.budget.range && formData.budget.flexibility && '✓ Budget confirmed'}
              {currentStep === 5 && formData.client.name && formData.client.email && '✓ Ready to submit'}
            </div>
          </div>

          {/* Form Content */}
          <div className="modern-card bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
            {isSubmitted ? (
              <SuccessScreen onStartNew={startNewProject} quoteData={quoteData} />
            ) : (
              <>
                {currentStep === 1 && (
                  <ProjectTypeStep 
                    data={formData.projectType}
                    onUpdate={(value) => setFormData(prev => ({ ...prev, projectType: value }))}
                    onNext={nextStep}
                  />
                )}

                {currentStep === 2 && (
                  <ScopeStep 
                    data={formData.scope}
                    onUpdate={(data) => updateFormData('scope', data)}
                    onNext={nextStep}
                    onPrev={prevStep}
                  />
                )}

                {currentStep === 3 && (
                  <TimelineStep 
                    data={formData.timeline}
                    onUpdate={(data) => updateFormData('timeline', data)}
                    onNext={nextStep}
                    onPrev={prevStep}
                  />
                )}

                {currentStep === 4 && (
                  <BudgetStep 
                    data={formData.budget}
                    onUpdate={(data) => updateFormData('budget', data)}
                    onNext={nextStep}
                    onPrev={prevStep}
                  />
                )}

                {currentStep === 5 && (
                  <ClientInfoStep 
                    data={formData.client}
                    requirements={requirements}
                    onUpdate={(data) => updateFormData('client', data)}
                    onRequirementsUpdate={setRequirements}
                    onSubmit={handleSubmit}
                    onPrev={prevStep}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Step 1: Project Type
function ProjectTypeStep({ data, onUpdate, onNext }: {
  data: string;
  onUpdate: (value: string) => void;
  onNext: () => void;
}) {
  const projectTypes = [
    { id: 'website', title: 'Website', description: 'Single page or multi-page website' },
    { id: 'webapp', title: 'Web Application', description: 'Interactive web application with user accounts' },
    { id: 'ecommerce', title: 'E-commerce Store', description: 'Online store with payment processing' },
    { id: 'branding', title: 'Branding & Design', description: 'Logo, brand identity, and marketing materials' },
    { id: 'mobile', title: 'Mobile App', description: 'iOS or Android mobile application' },
    { id: 'other', title: 'Something Else', description: 'Tell us about your unique project' }
  ];

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">What are we building?</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Choose the type of project that best describes your needs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 mb-4 sm:mb-6">
        {projectTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onUpdate(type.id)}
            className={`form-option modern-card p-3 sm:p-4 text-left border-2 rounded-xl min-h-[80px] sm:min-h-[100px] ${
              data === type.id 
                ? 'selected' 
                : 'hover:border-foreground/50 hover:bg-muted/30 active:bg-muted/50'
            }`}
          >
            <h3 className="text-base sm:text-lg font-semibold mb-1">{type.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{type.description}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end mt-auto">
        <button
          onClick={() => {
            if (!data) {
              alert('Please select a project type to continue');
              return;
            }
            onNext();
          }}
          disabled={!data}
          className={`modern-button px-6 py-3 sm:py-2.5 rounded-full font-medium transition-all duration-300 min-h-[44px] w-full sm:w-auto ${
            data 
              ? 'bg-foreground text-background hover:bg-foreground/90' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {data ? 'Continue' : 'Select an option to continue'}
        </button>
      </div>
    </div>
  );
}

// Step 2: Scope
function ScopeStep({ data, onUpdate, onNext, onPrev }: {
  data: FormData['scope'];
  onUpdate: (data: Partial<FormData['scope']>) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const features = [
    'User Authentication',
    'Payment Processing',
    'Content Management',
    'Search Functionality',
    'Social Media Integration',
    'Analytics Dashboard',
    'Multi-language Support',
    'Mobile Responsive',
    'SEO Optimization',
    'Third-party Integrations'
  ];

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">Project Scope</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Help us understand the size and complexity of your project.</p>
      </div>

      <div className="flex-1 space-y-4 sm:space-y-6">
        {/* Number of Pages */}
        <div>
          <label className="block text-sm font-medium mb-3">How many pages do you need?</label>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => onUpdate({ pages: Math.max(1, data.pages - 1) })}
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
            >
              -
            </button>
            <span className="text-2xl sm:text-xl font-semibold min-w-[3rem] text-center">{data.pages}</span>
            <button
              onClick={() => onUpdate({ pages: data.pages + 1 })}
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
            >
              +
            </button>
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium mb-3">What features do you need?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {features.map((feature) => (
              <label key={feature} className={`feature-checkbox flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-300 min-h-[44px] ${
                data.features.includes(feature)
                  ? 'selected shadow-lg scale-105'
                  : 'hover:bg-muted/30 active:bg-muted/50'
              }`}>
                <input
                  type="checkbox"
                  checked={data.features.includes(feature)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onUpdate({ features: [...data.features, feature] });
                    } else {
                      onUpdate({ features: data.features.filter(f => f !== feature) });
                    }
                  }}
                  className={`w-5 h-5 sm:w-4 sm:h-4 rounded border-2 focus:ring-foreground transition-all duration-300 ${
                    data.features.includes(feature)
                      ? 'border-background bg-background text-foreground'
                      : 'border-border text-foreground'
                  }`}
                />
                <span className="text-sm sm:text-xs font-medium">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <label className="block text-sm font-medium mb-3">How complex is your project?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'simple', title: 'Simple', description: 'Basic functionality' },
              { id: 'moderate', title: 'Moderate', description: 'Custom features' },
              { id: 'complex', title: 'Complex', description: 'Advanced development' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => onUpdate({ complexity: level.id })}
                className={`form-option p-3 text-left border-2 rounded-lg min-h-[80px] ${
                  data.complexity === level.id 
                    ? 'selected' 
                    : 'hover:border-foreground/50 hover:bg-muted/30 active:bg-muted/50'
                }`}
              >
                <h3 className="font-semibold text-sm mb-1">{level.title}</h3>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-auto pt-4 sm:pt-6">
        <button
          onClick={onPrev}
          className="modern-button border border-border text-foreground px-6 py-3 rounded-full font-medium hover:bg-muted transition-all duration-300 min-h-[44px] w-full sm:w-auto"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (!data.complexity) {
              alert('Please select a complexity level to continue');
              return;
            }
            onNext();
          }}
          disabled={!data.complexity}
          className={`modern-button px-6 py-3 rounded-full font-medium transition-all duration-300 min-h-[44px] w-full sm:w-auto ${
            data.complexity 
              ? 'bg-foreground text-background hover:bg-foreground/90' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {data.complexity ? 'Continue' : 'Select complexity to continue'}
        </button>
      </div>
    </div>
  );
}

// Step 3: Timeline
function TimelineStep({ data, onUpdate, onNext, onPrev }: {
  data: FormData['timeline'];
  onUpdate: (data: Partial<FormData['timeline']>) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">Timeline & Urgency</h2>
        <p className="text-sm sm:text-base text-muted-foreground">When do you need this project completed?</p>
      </div>

      <div className="flex-1 space-y-4 sm:space-y-6">
        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium mb-3">What&apos;s your target deadline?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'asap', title: 'ASAP', description: 'Rush project' },
              { id: '1month', title: '1 Month', description: 'Fast turnaround' },
              { id: '2months', title: '2 Months', description: 'Standard timeline' },
              { id: '3months', title: '3+ Months', description: 'Flexible timeline' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => onUpdate({ deadline: option.id })}
                className={`form-option p-3 text-left border-2 rounded-lg min-h-[80px] ${
                  data.deadline === option.id 
                    ? 'selected' 
                    : 'hover:border-foreground/50 hover:bg-muted/30 active:bg-muted/50'
                }`}
              >
                <h3 className="font-semibold text-sm mb-1">{option.title}</h3>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium mb-3">How urgent is this project?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'low', title: 'Low Priority', description: 'No rush' },
              { id: 'medium', title: 'Medium Priority', description: 'Balanced' },
              { id: 'high', title: 'High Priority', description: 'Need it quickly' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => onUpdate({ urgency: level.id })}
                className={`form-option p-3 text-left border-2 rounded-lg min-h-[80px] ${
                  data.urgency === level.id 
                    ? 'selected' 
                    : 'hover:border-foreground/50 hover:bg-muted/30 active:bg-muted/50'
                }`}
              >
                <h3 className="font-semibold text-sm mb-1">{level.title}</h3>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-auto pt-4 sm:pt-6">
        <button
          onClick={onPrev}
          className="modern-button border border-border text-foreground px-6 py-3 rounded-full font-medium hover:bg-muted transition-all duration-300 min-h-[44px] w-full sm:w-auto"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!data.deadline || !data.urgency}
          className="modern-button bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] w-full sm:w-auto"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Step 4: Budget
function BudgetStep({ data, onUpdate, onNext, onPrev }: {
  data: FormData['budget'];
  onUpdate: (data: Partial<FormData['budget']>) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">Budget & Investment</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Help us provide an accurate quote for your project.</p>
      </div>

      <div className="flex-1 space-y-4 sm:space-y-6">
        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium mb-3">What&apos;s your budget range?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'under5k', title: 'Under £5,000', description: 'Small project' },
              { id: '5k-10k', title: '£5,000 - £10,000', description: 'Medium project' },
              { id: '10k-25k', title: '£10,000 - £25,000', description: 'Large project' },
              { id: '25k+', title: '£25,000+', description: 'Enterprise project' }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => onUpdate({ range: option.id })}
                className={`form-option p-3 text-left border-2 rounded-lg min-h-[80px] ${
                  data.range === option.id 
                    ? 'selected' 
                    : 'hover:border-foreground/50 hover:bg-muted/30 active:bg-muted/50'
                }`}
              >
                <h3 className="font-semibold text-sm mb-1">{option.title}</h3>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Budget Flexibility */}
        <div>
          <label className="block text-sm font-medium mb-3">How flexible is your budget?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'fixed', title: 'Fixed Budget', description: 'Strict budget' },
              { id: 'flexible', title: 'Flexible Budget', description: 'Can adjust' },
              { id: 'investment', title: 'Investment Focused', description: 'Best results' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => onUpdate({ flexibility: level.id })}
                className={`form-option p-3 text-left border-2 rounded-lg min-h-[80px] ${
                  data.flexibility === level.id 
                    ? 'selected' 
                    : 'hover:border-foreground/50 hover:bg-muted/30 active:bg-muted/50'
                }`}
              >
                <h3 className="font-semibold text-sm mb-1">{level.title}</h3>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-auto pt-4 sm:pt-6">
        <button
          onClick={onPrev}
          className="modern-button border border-border text-foreground px-6 py-3 rounded-full font-medium hover:bg-muted transition-all duration-300 min-h-[44px] w-full sm:w-auto"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!data.range || !data.flexibility}
          className="modern-button bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] w-full sm:w-auto"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Step 5: Client Info & Requirements
function ClientInfoStep({ data, requirements, onUpdate, onRequirementsUpdate, onSubmit, onPrev, isSubmitting, submitError }: {
  data: FormData['client'];
  requirements: string;
  onUpdate: (data: Partial<FormData['client']>) => void;
  onRequirementsUpdate: (value: string) => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">Your Information</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Tell us about yourself and your project requirements.</p>
      </div>

      <div className="flex-1 space-y-4">
        {/* Client Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Full Name *</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all text-sm min-h-[44px]"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Email Address *</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all text-sm min-h-[44px]"
              placeholder="john@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Company Name</label>
            <input
              type="text"
              value={data.company}
              onChange={(e) => onUpdate({ company: e.target.value })}
              className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all text-sm min-h-[44px]"
              placeholder="Your Company"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all text-sm min-h-[44px]"
              placeholder="+44 20 1234 5678"
            />
          </div>
        </div>

        {/* Project Requirements */}
        <div>
          <label className="block text-xs font-medium mb-1">Project Requirements & Goals</label>
          <textarea
            value={requirements}
            onChange={(e) => onRequirementsUpdate(e.target.value)}
            rows={4}
            className="w-full px-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all resize-none text-sm"
            placeholder="Tell us more about your project goals, target audience, specific requirements, and any inspiration or examples you have in mind..."
          />
        </div>
      </div>

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{submitError}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-3 mt-auto pt-4 sm:pt-6">
        <button
          onClick={onPrev}
          disabled={isSubmitting}
          className="modern-button border border-border text-foreground px-6 py-3 rounded-full font-medium hover:bg-muted transition-all duration-300 min-h-[44px] w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (!data.name || !data.email) {
              alert('Please fill in your name and email to submit the form');
              return;
            }
            onSubmit();
          }}
          disabled={!data.name || !data.email || isSubmitting}
          className={`modern-button px-6 py-3 rounded-full font-medium transition-all duration-300 min-h-[44px] w-full sm:w-auto flex items-center justify-center gap-2 ${
            data.name && data.email && !isSubmitting
              ? 'bg-foreground text-background hover:bg-foreground/90' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : data.name && data.email ? (
            'Get My Quote'
          ) : (
            'Fill in name and email to submit'
          )}
        </button>
      </div>
    </div>
  );
}

    // Success Screen
    function SuccessScreen({ onStartNew, quoteData }: { onStartNew: () => void; quoteData: any }) {
      return (
        <div className="animate-fade-in text-center flex flex-col h-full">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">Project Request Submitted!</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Thank you for your project request. Our team is now reviewing your requirements and will prepare a detailed quote for you.
            </p>
          </div>

          {quoteData && (
            <div className="modern-card bg-muted/50 border border-border rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Request Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Request ID</label>
                  <p className="text-lg font-mono text-foreground">#{quoteData.quoteToken.split('_')[2]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className="text-sm font-medium text-blue-600">Under Review</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  We'll review your project requirements and send you a detailed quote within 24 hours.
                </p>
              </div>
            </div>
          )}

          <div className="modern-card bg-muted/50 border border-border rounded-xl p-4 mb-6 flex-1">
            <h3 className="text-lg font-semibold mb-3">What happens next?</h3>
            <div className="grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-semibold mb-2">1</div>
                <h4 className="font-semibold text-sm mb-1">Review & Quote</h4>
                <p className="text-xs text-muted-foreground">Our team reviews your requirements and prepares a detailed quote.</p>
              </div>
              <div>
                <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-semibold mb-2">2</div>
                <h4 className="font-semibold text-sm mb-1">Quote Delivery</h4>
                <p className="text-xs text-muted-foreground">You'll receive a detailed quote via email within 24 hours.</p>
              </div>
              <div>
                <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-semibold mb-2">3</div>
                <h4 className="font-semibold text-sm mb-1">Accept & Start</h4>
                <p className="text-xs text-muted-foreground">Review the quote and accept to begin your project.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-auto">
            <button
              onClick={onStartNew}
              className="modern-button border border-border text-foreground px-6 py-2.5 rounded-full font-medium hover:bg-muted transition-all duration-300 min-h-[44px] w-full sm:w-auto"
            >
              Start Another Project
            </button>
            <a
              href="/"
              className="modern-button bg-foreground text-background px-6 py-2.5 rounded-full font-medium hover:bg-foreground/90 transition-all duration-300 text-center min-h-[44px] w-full sm:w-auto"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }
