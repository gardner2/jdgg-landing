// AI-powered quote generation system
// This simulates intelligent analysis of project requirements to generate realistic quotes

interface ProjectAnalysis {
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  estimatedHours: number;
  basePrice: number;
  adjustments: {
    timeline: number;
    features: number;
    integrations: number;
    design: number;
    seo: number;
    maintenance: number;
  };
  breakdown: {
    design: number;
    development: number;
    testing: number;
    deployment: number;
    projectManagement: number;
  };
  deliverables: string[];
  timeline: string;
  risks: string[];
  recommendations: string[];
}

interface QuoteBreakdown {
  basePrice: number;
  adjustments: number;
  totalPrice: number;
  currency: string;
  analysis: ProjectAnalysis;
  quoteText: string;
  projectScope: string;
  assumptions: string[];
  exclusions: string[];
}

// Complexity scoring system
function analyzeComplexity(projectType: string, features: string[], requirements: string): ProjectAnalysis['complexity'] {
  let complexityScore = 0;
  
  // Project type complexity
  const typeComplexity = {
    'landing-page': 1,
    'multi-page': 2,
    'ecommerce': 4,
    'web-app': 5,
    'redesign': 2
  };
  
  complexityScore += typeComplexity[projectType as keyof typeof typeComplexity] || 3;
  
  // Feature complexity
  const featureComplexity = {
    'responsive-design': 1,
    'contact-form': 1,
    'blog': 2,
    'cms': 3,
    'user-authentication': 3,
    'payment-integration': 4,
    'api-integration': 3,
    'seo-optimization': 2,
    'analytics': 1,
    'social-media': 1,
    'email-marketing': 2,
    'multi-language': 3,
    'advanced-animations': 2,
    'custom-illustrations': 2,
    'video-integration': 2
  };
  
  features.forEach(feature => {
    complexityScore += featureComplexity[feature as keyof typeof featureComplexity] || 1;
  });
  
  // Requirements complexity (analyze text for keywords)
  const requirementsText = requirements.toLowerCase();
  if (requirementsText.includes('custom') || requirementsText.includes('unique')) complexityScore += 2;
  if (requirementsText.includes('integration') || requirementsText.includes('api')) complexityScore += 2;
  if (requirementsText.includes('complex') || requirementsText.includes('advanced')) complexityScore += 2;
  if (requirementsText.includes('enterprise') || requirementsText.includes('scalable')) complexityScore += 3;
  
  // Determine complexity level
  if (complexityScore <= 5) return 'simple';
  if (complexityScore <= 10) return 'moderate';
  if (complexityScore <= 15) return 'complex';
  return 'enterprise';
}

// Generate detailed project analysis
function generateProjectAnalysis(
  projectType: string,
  features: string[],
  timeline: string,
  budgetRange: string,
  requirements: string
): ProjectAnalysis {
  const complexity = analyzeComplexity(projectType, features, requirements);
  
  // Base hours estimation
  const baseHours = {
    'simple': 20,
    'moderate': 40,
    'complex': 80,
    'enterprise': 150
  };
  
  // Feature hour multipliers
  const featureHours = {
    'responsive-design': 8,
    'contact-form': 4,
    'blog': 12,
    'cms': 20,
    'user-authentication': 16,
    'payment-integration': 24,
    'api-integration': 16,
    'seo-optimization': 8,
    'analytics': 4,
    'social-media': 6,
    'email-marketing': 12,
    'multi-language': 16,
    'advanced-animations': 12,
    'custom-illustrations': 16,
    'video-integration': 8
  };
  
  let estimatedHours = baseHours[complexity];
  features.forEach(feature => {
    estimatedHours += featureHours[feature as keyof typeof featureHours] || 4;
  });
  
  // Base pricing (GBP per hour)
  const hourlyRates = {
    'simple': 75,
    'moderate': 85,
    'complex': 95,
    'enterprise': 110
  };
  
  const basePrice = estimatedHours * hourlyRates[complexity];
  
  // Calculate adjustments
  const adjustments = {
    timeline: calculateTimelineAdjustment(timeline),
    features: calculateFeatureAdjustment(features),
    integrations: calculateIntegrationAdjustment(features, requirements),
    design: calculateDesignAdjustment(features, requirements),
    seo: calculateSEOAdjustment(features, requirements),
    maintenance: calculateMaintenanceAdjustment(complexity)
  };
  
  // Calculate breakdown
  const breakdown = {
    design: Math.round(estimatedHours * 0.25 * hourlyRates[complexity]),
    development: Math.round(estimatedHours * 0.45 * hourlyRates[complexity]),
    testing: Math.round(estimatedHours * 0.15 * hourlyRates[complexity]),
    deployment: Math.round(estimatedHours * 0.10 * hourlyRates[complexity]),
    projectManagement: Math.round(estimatedHours * 0.05 * hourlyRates[complexity])
  };
  
  // Generate deliverables
  const deliverables = generateDeliverables(projectType, features, complexity);
  
  // Generate timeline
  const projectTimeline = generateTimeline(estimatedHours, timeline, complexity);
  
  // Generate risks and recommendations
  const risks = generateRisks(complexity, features, requirements);
  const recommendations = generateRecommendations(complexity, features, budgetRange);
  
  return {
    complexity,
    estimatedHours,
    basePrice,
    adjustments,
    breakdown,
    deliverables,
    timeline: projectTimeline,
    risks,
    recommendations
  };
}

// Adjustment calculation functions
function calculateTimelineAdjustment(timeline: string): number {
  const adjustments = {
    'asap': 0.3,      // 30% rush fee
    '1-week': 0.2,    // 20% rush fee
    '2-weeks': 0.1,   // 10% rush fee
    '1-month': 0,     // No adjustment
    '2-months': -0.05, // 5% discount for longer timeline
    'flexible': -0.1   // 10% discount for flexible timeline
  };
  return adjustments[timeline as keyof typeof adjustments] || 0;
}

function calculateFeatureAdjustment(features: string[]): number {
  const complexFeatures = ['cms', 'user-authentication', 'payment-integration', 'api-integration', 'multi-language'];
  const complexCount = features.filter(f => complexFeatures.includes(f)).length;
  return complexCount * 0.05; // 5% per complex feature
}

function calculateIntegrationAdjustment(features: string[], requirements: string): number {
  const integrationKeywords = ['api', 'integration', 'third-party', 'external', 'webhook'];
  const hasIntegrations = features.some(f => f.includes('integration')) || 
                         integrationKeywords.some(keyword => requirements.toLowerCase().includes(keyword));
  return hasIntegrations ? 0.15 : 0; // 15% for integrations
}

function calculateDesignAdjustment(features: string[], requirements: string): number {
  const designKeywords = ['custom', 'unique', 'brand', 'illustration', 'animation'];
  const hasCustomDesign = features.some(f => f.includes('custom') || f.includes('illustration')) ||
                         designKeywords.some(keyword => requirements.toLowerCase().includes(keyword));
  return hasCustomDesign ? 0.2 : 0; // 20% for custom design
}

function calculateSEOAdjustment(features: string[], requirements: string): number {
  const hasSEO = features.includes('seo-optimization') || 
                requirements.toLowerCase().includes('seo') ||
                requirements.toLowerCase().includes('search');
  return hasSEO ? 0.1 : 0; // 10% for SEO
}

function calculateMaintenanceAdjustment(complexity: ProjectAnalysis['complexity']): number {
  const maintenanceRates = {
    'simple': 0.05,    // 5% for 3 months
    'moderate': 0.08,  // 8% for 3 months
    'complex': 0.12,   // 12% for 3 months
    'enterprise': 0.15 // 15% for 3 months
  };
  return maintenanceRates[complexity];
}

// Generate deliverables based on project type and features
function generateDeliverables(projectType: string, features: string[], complexity: ProjectAnalysis['complexity']): string[] {
  const baseDeliverables = [
    'Fully responsive website',
    'Cross-browser compatibility',
    'Performance optimization',
    'Basic SEO setup',
    '3 months post-launch support'
  ];
  
  const featureDeliverables = {
    'contact-form': ['Contact form with validation', 'Email notifications'],
    'blog': ['Blog system with categories', 'Search functionality'],
    'cms': ['Content management system', 'Admin dashboard'],
    'user-authentication': ['User registration/login', 'Password reset functionality'],
    'payment-integration': ['Payment gateway integration', 'Order management system'],
    'api-integration': ['API integration', 'Data synchronization'],
    'seo-optimization': ['Advanced SEO optimization', 'Schema markup'],
    'analytics': ['Google Analytics setup', 'Conversion tracking'],
    'social-media': ['Social media integration', 'Sharing functionality'],
    'email-marketing': ['Email marketing integration', 'Newsletter signup'],
    'multi-language': ['Multi-language support', 'Language switcher'],
    'advanced-animations': ['Custom animations', 'Interactive elements'],
    'custom-illustrations': ['Custom illustrations', 'Brand graphics'],
    'video-integration': ['Video integration', 'Video optimization']
  };
  
  const deliverables = [...baseDeliverables];
  
  features.forEach(feature => {
    const featureDeliverable = featureDeliverables[feature as keyof typeof featureDeliverables];
    if (featureDeliverable) {
      deliverables.push(...featureDeliverable);
    }
  });
  
  // Add complexity-based deliverables
  if (complexity === 'complex' || complexity === 'enterprise') {
    deliverables.push('Advanced security measures', 'Performance monitoring', 'Backup system');
  }
  
  if (complexity === 'enterprise') {
    deliverables.push('Scalability planning', 'Documentation', 'Training materials');
  }
  
  return deliverables;
}

// Generate realistic timeline
function generateTimeline(hours: number, requestedTimeline: string, complexity: ProjectAnalysis['complexity']): string {
  const baseDays = Math.ceil(hours / 8); // 8 hours per day
  
  const timelineAdjustments = {
    'asap': 0.5,      // Half the time
    '1-week': 0.7,    // 70% of normal time
    '2-weeks': 0.85,  // 85% of normal time
    '1-month': 1,     // Normal time
    '2-months': 1.2,  // 20% more time
    'flexible': 1.3   // 30% more time
  };
  
  const adjustment = timelineAdjustments[requestedTimeline as keyof typeof timelineAdjustments] || 1;
  const adjustedDays = Math.ceil(baseDays * adjustment);
  
  // Minimum timeline based on complexity
  const minDays = {
    'simple': 3,
    'moderate': 7,
    'complex': 14,
    'enterprise': 21
  };
  
  const finalDays = Math.max(adjustedDays, minDays[complexity]);
  
  if (finalDays <= 7) return `${finalDays} days`;
  if (finalDays <= 14) return `${Math.ceil(finalDays / 7)} weeks`;
  return `${Math.ceil(finalDays / 30)} months`;
}

// Generate project risks
function generateRisks(complexity: ProjectAnalysis['complexity'], features: string[], requirements: string): string[] {
  const risks = [];
  
  if (complexity === 'complex' || complexity === 'enterprise') {
    risks.push('Increased complexity may require additional development time');
  }
  
  if (features.includes('payment-integration')) {
    risks.push('Payment gateway integration may require additional testing and compliance checks');
  }
  
  if (features.includes('api-integration')) {
    risks.push('Third-party API dependencies may affect project timeline');
  }
  
  if (requirements.toLowerCase().includes('custom')) {
    risks.push('Custom requirements may require additional design and development iterations');
  }
  
  if (complexity === 'enterprise') {
    risks.push('Enterprise-level features may require specialized expertise');
  }
  
  return risks;
}

// Generate recommendations
function generateRecommendations(complexity: ProjectAnalysis['complexity'], features: string[], budgetRange: string): string[] {
  const recommendations = [];
  
  if (complexity === 'simple' && budgetRange === '10000+') {
    recommendations.push('Consider adding advanced features to maximize your budget');
  }
  
  if (features.includes('cms')) {
    recommendations.push('Consider adding user training for the CMS system');
  }
  
  if (features.includes('seo-optimization')) {
    recommendations.push('Plan for ongoing SEO maintenance and content updates');
  }
  
  if (complexity === 'enterprise') {
    recommendations.push('Consider phased development approach for better risk management');
  }
  
  return recommendations;
}

// Generate quote text
function generateQuoteText(analysis: ProjectAnalysis, clientName: string, projectType: string): string {
  const complexityDescriptions = {
    'simple': 'straightforward',
    'moderate': 'well-defined',
    'complex': 'comprehensive',
    'enterprise': 'enterprise-level'
  };
  
  return `Thank you for choosing JGDD for your ${projectType.replace('-', ' ')} project.

Based on our analysis of your requirements, this is a ${complexityDescriptions[analysis.complexity]} project that will require approximately ${analysis.estimatedHours} hours of development time.

Our approach will focus on delivering a high-quality, performance-optimized solution that meets your specific needs while maintaining our standards for clean code, accessibility, and user experience.

The project timeline of ${analysis.timeline} allows for proper planning, development, testing, and refinement to ensure the best possible outcome.

We're excited to work with you on this project and look forward to bringing your vision to life.`;
}

// Generate project scope
function generateProjectScope(projectType: string, features: string[], analysis: ProjectAnalysis): string {
  const scopeItems = [
    `Development of a ${projectType.replace('-', ' ')} website`,
    'Responsive design for all devices',
    'Cross-browser compatibility testing',
    'Performance optimization',
    'Basic SEO implementation',
    '3 months post-launch support and maintenance'
  ];
  
  features.forEach(feature => {
    const featureDescriptions = {
      'contact-form': 'Contact form with validation and email notifications',
      'blog': 'Blog system with categories and search functionality',
      'cms': 'Content management system with admin dashboard',
      'user-authentication': 'User registration and authentication system',
      'payment-integration': 'Payment gateway integration and order management',
      'api-integration': 'Third-party API integration and data synchronization',
      'seo-optimization': 'Advanced SEO optimization and schema markup',
      'analytics': 'Google Analytics setup and conversion tracking',
      'social-media': 'Social media integration and sharing functionality',
      'email-marketing': 'Email marketing integration and newsletter signup',
      'multi-language': 'Multi-language support with language switcher',
      'advanced-animations': 'Custom animations and interactive elements',
      'custom-illustrations': 'Custom illustrations and brand graphics',
      'video-integration': 'Video integration and optimization'
    };
    
    const description = featureDescriptions[feature as keyof typeof featureDescriptions];
    if (description) {
      scopeItems.push(description);
    }
  });
  
  return scopeItems.join('\n• ');
}

// Generate assumptions
function generateAssumptions(projectType: string, features: string[], requirements: string): string[] {
  const assumptions = [
    'Client will provide all necessary content, images, and branding materials',
    'Client will provide timely feedback during review phases',
    'No major scope changes during development',
    'Standard hosting and domain setup (not included in quote)',
    'Third-party services (if any) will be available and accessible'
  ];
  
  if (features.includes('cms')) {
    assumptions.push('Client will provide training on CMS usage');
  }
  
  if (features.includes('api-integration')) {
    assumptions.push('Third-party APIs will be available and properly documented');
  }
  
  if (requirements.toLowerCase().includes('custom')) {
    assumptions.push('Custom requirements are clearly defined and won\'t change');
  }
  
  return assumptions;
}

// Generate exclusions
function generateExclusions(projectType: string, features: string[]): string[] {
  const exclusions = [
    'Ongoing content creation and updates',
    'Hosting and domain registration',
    'Third-party service fees (if applicable)',
    'Photography or video production',
    'Copywriting and content creation',
    'Ongoing marketing and SEO services beyond basic setup'
  ];
  
  if (features.includes('payment-integration')) {
    exclusions.push('Payment gateway setup fees and transaction fees');
  }
  
  if (features.includes('email-marketing')) {
    exclusions.push('Email marketing service subscription fees');
  }
  
  return exclusions;
}

// Main quote generation function
export function generateAIQuote(
  clientData: {
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    projectType: string;
    scopeFeatures: string[];
    timeline: string;
    budgetRange: string;
    requirements?: string;
  }
): QuoteBreakdown {
  const analysis = generateProjectAnalysis(
    clientData.projectType,
    clientData.scopeFeatures,
    clientData.timeline,
    clientData.budgetRange,
    clientData.requirements || ''
  );
  
  // Calculate total adjustments
  const totalAdjustment = Object.values(analysis.adjustments).reduce((sum, adj) => sum + adj, 0);
  const adjustedPrice = analysis.basePrice * (1 + totalAdjustment);
  
  // Round to nearest 50 for psychological pricing
  const totalPrice = Math.round(adjustedPrice / 50) * 50;
  
  const quoteText = generateQuoteText(analysis, clientData.name || 'Client', clientData.projectType);
  const projectScope = generateProjectScope(clientData.projectType, clientData.scopeFeatures, analysis);
  const assumptions = generateAssumptions(clientData.projectType, clientData.scopeFeatures, clientData.requirements || '');
  const exclusions = generateExclusions(clientData.projectType, clientData.scopeFeatures);
  
  return {
    basePrice: analysis.basePrice,
    adjustments: totalAdjustment,
    totalPrice,
    currency: 'GBP',
    analysis,
    quoteText,
    projectScope,
    assumptions,
    exclusions
  };
}
