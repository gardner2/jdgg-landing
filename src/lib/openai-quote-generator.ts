// Enhanced AI quote generation using OpenAI API
// This provides more sophisticated analysis and realistic pricing

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
  aiInsights: string;
  marketAnalysis: string;
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
  confidence: number;
}

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAI(prompt: string, maxTokens: number = 1000): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web development project manager and pricing specialist. You analyze project requirements and provide detailed, realistic quotes for web development projects. Always be professional, accurate, and consider market rates.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    return '';
  }
}

// Enhanced complexity analysis using OpenAI
async function analyzeComplexityWithAI(
  projectType: string,
  features: string[],
  requirements: string,
  budgetRange: string
): Promise<{
  complexity: ProjectAnalysis['complexity'];
  confidence: number;
  reasoning: string;
}> {
  const prompt = `
Analyze this web development project and determine its complexity level:

Project Type: ${projectType}
Features: ${features.join(', ')}
Requirements: ${requirements}
Budget Range: ${budgetRange}

Please respond with a JSON object containing:
1. "complexity": one of "simple", "moderate", "complex", or "enterprise"
2. "confidence": a number between 0-100 indicating your confidence in this assessment
3. "reasoning": a brief explanation of why you chose this complexity level

Consider factors like:
- Number and complexity of features
- Technical requirements
- Integration needs
- Custom development requirements
- Scale and performance needs

Respond only with valid JSON.
`;

  try {
    const response = await callOpenAI(prompt, 500);
    const analysis = JSON.parse(response);
    
    return {
      complexity: analysis.complexity || 'moderate',
      confidence: analysis.confidence || 75,
      reasoning: analysis.reasoning || 'Standard project complexity'
    };
  } catch (error) {
    console.error('AI complexity analysis failed:', error);
    // Fallback to rule-based analysis
    return analyzeComplexityFallback(projectType, features, requirements);
  }
}

// Fallback complexity analysis (rule-based)
function analyzeComplexityFallback(
  projectType: string,
  features: string[],
  requirements: string
): {
  complexity: ProjectAnalysis['complexity'];
  confidence: number;
  reasoning: string;
} {
  let complexityScore = 0;
  
  const typeComplexity = {
    'landing-page': 1,
    'multi-page': 2,
    'ecommerce': 4,
    'web-app': 5,
    'redesign': 2
  };
  
  complexityScore += typeComplexity[projectType as keyof typeof typeComplexity] || 3;
  
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
  
  const requirementsText = requirements.toLowerCase();
  if (requirementsText.includes('custom') || requirementsText.includes('unique')) complexityScore += 2;
  if (requirementsText.includes('integration') || requirementsText.includes('api')) complexityScore += 2;
  if (requirementsText.includes('complex') || requirementsText.includes('advanced')) complexityScore += 2;
  if (requirementsText.includes('enterprise') || requirementsText.includes('scalable')) complexityScore += 3;
  
  let complexity: ProjectAnalysis['complexity'];
  let reasoning: string;
  
  if (complexityScore <= 5) {
    complexity = 'simple';
    reasoning = 'Basic project with standard features';
  } else if (complexityScore <= 10) {
    complexity = 'moderate';
    reasoning = 'Standard project with some advanced features';
  } else if (complexityScore <= 15) {
    complexity = 'complex';
    reasoning = 'Advanced project with multiple integrations and custom requirements';
  } else {
    complexity = 'enterprise';
    reasoning = 'Enterprise-level project with complex requirements and integrations';
  }
  
  return {
    complexity,
    confidence: 85,
    reasoning
  };
}

// Generate AI-powered insights
async function generateAIInsights(
  projectType: string,
  features: string[],
  requirements: string,
  complexity: ProjectAnalysis['complexity']
): Promise<{
  insights: string;
  marketAnalysis: string;
  recommendations: string[];
}> {
  const prompt = `
As a web development expert, provide insights for this project:

Project Type: ${projectType}
Features: ${features.join(', ')}
Requirements: ${requirements}
Complexity: ${complexity}

Please provide:
1. Key insights about this project (2-3 sentences)
2. Market analysis - how this compares to similar projects (2-3 sentences)
3. 3-5 specific recommendations for the client

Be professional, insightful, and helpful. Focus on value and best practices.
`;

  try {
    const response = await callOpenAI(prompt, 800);
    
    // Parse the response to extract insights, market analysis, and recommendations
    const lines = response.split('\n').filter(line => line.trim());
    
    let insights = '';
    let marketAnalysis = '';
    const recommendations: string[] = [];
    
    let currentSection = '';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('insight')) {
        currentSection = 'insights';
        insights = line.replace(/.*insight.*?:/i, '').trim();
      } else if (line.toLowerCase().includes('market')) {
        currentSection = 'market';
        marketAnalysis = line.replace(/.*market.*?:/i, '').trim();
      } else if (line.toLowerCase().includes('recommend')) {
        currentSection = 'recommendations';
      } else if (currentSection === 'insights' && line.trim()) {
        insights += ' ' + line.trim();
      } else if (currentSection === 'market' && line.trim()) {
        marketAnalysis += ' ' + line.trim();
      } else if (currentSection === 'recommendations' && line.trim() && line.match(/^\d+\./)) {
        recommendations.push(line.replace(/^\d+\.\s*/, '').trim());
      }
    }
    
    return {
      insights: insights || 'This project shows good potential for success with proper planning and execution.',
      marketAnalysis: marketAnalysis || 'Similar projects in the market typically require careful attention to user experience and performance optimization.',
      recommendations: recommendations.length > 0 ? recommendations : [
        'Focus on user experience and mobile responsiveness',
        'Implement proper SEO optimization from the start',
        'Plan for scalability and future growth'
      ]
    };
  } catch (error) {
    console.error('AI insights generation failed:', error);
    return {
      insights: 'This project shows good potential for success with proper planning and execution.',
      marketAnalysis: 'Similar projects in the market typically require careful attention to user experience and performance optimization.',
      recommendations: [
        'Focus on user experience and mobile responsiveness',
        'Implement proper SEO optimization from the start',
        'Plan for scalability and future growth'
      ]
    };
  }
}

// Generate enhanced quote text using AI
async function generateAIQuoteText(
  clientName: string,
  projectType: string,
  complexity: ProjectAnalysis['complexity'],
  totalPrice: number,
  timeline: string,
  insights: string
): Promise<string> {
  const prompt = `
Write a professional quote letter for a web development project:

Client: ${clientName}
Project: ${projectType}
Complexity: ${complexity}
Price: £${totalPrice.toLocaleString()}
Timeline: ${timeline}
Key Insights: ${insights}

Write a warm, professional, and confident quote letter that:
1. Thanks the client for choosing us
2. Shows understanding of their project
3. Highlights our expertise and approach
4. Mentions the value they'll receive
5. Expresses excitement about working together

Keep it concise but personal. 3-4 paragraphs maximum.
`;

  try {
    const response = await callOpenAI(prompt, 600);
    return response || generateFallbackQuoteText(clientName, projectType, complexity, totalPrice, timeline);
  } catch (error) {
    console.error('AI quote text generation failed:', error);
    return generateFallbackQuoteText(clientName, projectType, complexity, totalPrice, timeline);
  }
}

// Fallback quote text generation
function generateFallbackQuoteText(
  clientName: string,
  projectType: string,
  complexity: ProjectAnalysis['complexity'],
  totalPrice: number,
  timeline: string
): string {
  return `Dear ${clientName},

Thank you for choosing JGDD for your ${projectType.replace('-', ' ')} project.

Based on our analysis, this is a ${complexity} project that will require careful planning and execution to deliver the best results. Our team is excited to work with you and bring your vision to life.

We're committed to delivering a high-quality, performance-optimized solution that meets your specific needs while maintaining our standards for clean code, accessibility, and user experience.

The project timeline of ${timeline} allows for proper development, testing, and refinement to ensure the best possible outcome.

We look forward to working with you on this exciting project!`;
}

// Enhanced project analysis with AI
async function generateEnhancedProjectAnalysis(
  projectType: string,
  features: string[],
  timeline: string,
  budgetRange: string,
  requirements: string
): Promise<ProjectAnalysis> {
  // Get AI-powered complexity analysis
  const complexityAnalysis = await analyzeComplexityWithAI(projectType, features, requirements, budgetRange);
  
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
  
  let estimatedHours = baseHours[complexityAnalysis.complexity];
  features.forEach(feature => {
    estimatedHours += featureHours[feature as keyof typeof featureHours] || 4;
  });
  
  // Enhanced hourly rates based on complexity and market analysis
  const hourlyRates = {
    'simple': 75,
    'moderate': 85,
    'complex': 95,
    'enterprise': 110
  };
  
  const basePrice = estimatedHours * hourlyRates[complexityAnalysis.complexity];
  
  // Calculate adjustments
  const adjustments = {
    timeline: calculateTimelineAdjustment(timeline),
    features: calculateFeatureAdjustment(features),
    integrations: calculateIntegrationAdjustment(features, requirements),
    design: calculateDesignAdjustment(features, requirements),
    seo: calculateSEOAdjustment(features, requirements),
    maintenance: calculateMaintenanceAdjustment(complexityAnalysis.complexity)
  };
  
  // Calculate breakdown
  const breakdown = {
    design: Math.round(estimatedHours * 0.25 * hourlyRates[complexityAnalysis.complexity]),
    development: Math.round(estimatedHours * 0.45 * hourlyRates[complexityAnalysis.complexity]),
    testing: Math.round(estimatedHours * 0.15 * hourlyRates[complexityAnalysis.complexity]),
    deployment: Math.round(estimatedHours * 0.10 * hourlyRates[complexityAnalysis.complexity]),
    projectManagement: Math.round(estimatedHours * 0.05 * hourlyRates[complexityAnalysis.complexity])
  };
  
  // Generate deliverables
  const deliverables = generateDeliverables(projectType, features, complexityAnalysis.complexity);
  
  // Generate timeline
  const projectTimeline = generateTimeline(estimatedHours, timeline, complexityAnalysis.complexity);
  
  // Generate risks
  const risks = generateRisks(complexityAnalysis.complexity, features, requirements);
  
  // Get AI insights
  const aiInsights = await generateAIInsights(projectType, features, requirements, complexityAnalysis.complexity);
  
  return {
    complexity: complexityAnalysis.complexity,
    estimatedHours,
    basePrice,
    adjustments,
    breakdown,
    deliverables,
    timeline: projectTimeline,
    risks,
    recommendations: aiInsights.recommendations,
    aiInsights: aiInsights.insights,
    marketAnalysis: aiInsights.marketAnalysis
  };
}

// Helper functions (same as before)
function calculateTimelineAdjustment(timeline: string): number {
  const adjustments = {
    'asap': 0.3,
    '1-week': 0.2,
    '2-weeks': 0.1,
    '1-month': 0,
    '2-months': -0.05,
    'flexible': -0.1
  };
  return adjustments[timeline as keyof typeof adjustments] || 0;
}

function calculateFeatureAdjustment(features: string[]): number {
  const complexFeatures = ['cms', 'user-authentication', 'payment-integration', 'api-integration', 'multi-language'];
  const complexCount = features.filter(f => complexFeatures.includes(f)).length;
  return complexCount * 0.05;
}

function calculateIntegrationAdjustment(features: string[], requirements: string): number {
  const integrationKeywords = ['api', 'integration', 'third-party', 'external', 'webhook'];
  const hasIntegrations = features.some(f => f.includes('integration')) || 
                         integrationKeywords.some(keyword => requirements.toLowerCase().includes(keyword));
  return hasIntegrations ? 0.15 : 0;
}

function calculateDesignAdjustment(features: string[], requirements: string): number {
  const designKeywords = ['custom', 'unique', 'brand', 'illustration', 'animation'];
  const hasCustomDesign = features.some(f => f.includes('custom') || f.includes('illustration')) ||
                         designKeywords.some(keyword => requirements.toLowerCase().includes(keyword));
  return hasCustomDesign ? 0.2 : 0;
}

function calculateSEOAdjustment(features: string[], requirements: string): number {
  const hasSEO = features.includes('seo-optimization') || 
                requirements.toLowerCase().includes('seo') ||
                requirements.toLowerCase().includes('search');
  return hasSEO ? 0.1 : 0;
}

function calculateMaintenanceAdjustment(complexity: ProjectAnalysis['complexity']): number {
  const maintenanceRates = {
    'simple': 0.05,
    'moderate': 0.08,
    'complex': 0.12,
    'enterprise': 0.15
  };
  return maintenanceRates[complexity];
}

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
  
  if (complexity === 'complex' || complexity === 'enterprise') {
    deliverables.push('Advanced security measures', 'Performance monitoring', 'Backup system');
  }
  
  if (complexity === 'enterprise') {
    deliverables.push('Scalability planning', 'Documentation', 'Training materials');
  }
  
  return deliverables;
}

function generateTimeline(hours: number, requestedTimeline: string, complexity: ProjectAnalysis['complexity']): string {
  const baseDays = Math.ceil(hours / 8);
  
  const timelineAdjustments = {
    'asap': 0.5,
    '1-week': 0.7,
    '2-weeks': 0.85,
    '1-month': 1,
    '2-months': 1.2,
    'flexible': 1.3
  };
  
  const adjustment = timelineAdjustments[requestedTimeline as keyof typeof timelineAdjustments] || 1;
  const adjustedDays = Math.ceil(baseDays * adjustment);
  
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

// Main enhanced quote generation function
export async function generateEnhancedAIQuote(
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
): Promise<QuoteBreakdown> {
  const analysis = await generateEnhancedProjectAnalysis(
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
  
  // Generate AI-powered quote text
  const quoteText = await generateAIQuoteText(
    clientData.name || 'Client',
    clientData.projectType,
    analysis.complexity,
    totalPrice,
    analysis.timeline,
    analysis.aiInsights
  );
  
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
    exclusions,
    confidence: 90 // High confidence with AI analysis
  };
}





