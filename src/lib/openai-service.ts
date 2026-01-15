import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ProjectData {
  projectType: string;
  scopeFeatures: string[];
  timeline: string;
  budgetRange: string;
  requirements?: string;
  clientName?: string;
}

interface QuoteLineItem {
  label: string;
  hours: number;
  rate: number;
  cost: number;
}

interface QuoteSpec {
  overview: string;
  features: string[];
  pages?: string[];
  nonGoals?: string[];
}

interface AIQuoteResponse {
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  estimatedHours: number;
  basePrice: number;
  totalPrice: number;
  timeline: string;
  budgetRange?: string;
  quoteText: string;
  projectScope: string;
  deliverables: string[];
  risks: string[];
  recommendations: string[];
  lineItems?: QuoteLineItem[];
  spec?: QuoteSpec;
  confidence: number;
}

export async function generateOpenAIQuote(projectData: ProjectData): Promise<AIQuoteResponse> {
  try {
    const prompt = `
You are an expert web development project manager and pricing specialist. Analyze this project and provide a detailed quote.

Project Details:
- Type: ${projectData.projectType}
- Features: ${projectData.scopeFeatures.join(', ')}
- Timeline: ${projectData.timeline}
- Budget Range: ${projectData.budgetRange}
- Requirements: ${projectData.requirements || 'None specified'}
- Client: ${projectData.clientName || 'Unknown'}

Please respond with a JSON object containing:
{
  "complexity": "simple|moderate|complex|enterprise",
  "estimatedHours": number,
  "basePrice": number,
  "totalPrice": number,
  "timeline": "realistic timeline string",
  "budgetRange": "e.g., £4,000 - £6,000",
  "quoteText": "professional quote letter (2-3 paragraphs)",
  "projectScope": "detailed project scope",
  "deliverables": ["array", "of", "deliverables"],
  "risks": ["array", "of", "potential", "risks"],
  "recommendations": ["array", "of", "recommendations"],
  "lineItems": [{ "label": string, "hours": number, "rate": number, "cost": number }],
  "spec": { "overview": string, "features": string[], "pages"?: string[], "nonGoals"?: string[] },
  "confidence": number (0-100)
}

Consider:
- Market rates for web development (£75-110/hour)
- Project complexity and technical requirements
- Timeline constraints and rush fees
- Feature complexity and integration needs
- Industry best practices and standards

Respond only with valid JSON.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert web development project manager and pricing specialist. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const aiResponse = JSON.parse(response);
    
    // Validate and return the response
    return {
      complexity: aiResponse.complexity || 'moderate',
      estimatedHours: aiResponse.estimatedHours || 40,
      basePrice: aiResponse.basePrice || 3000,
      totalPrice: aiResponse.totalPrice || 3500,
      timeline: aiResponse.timeline || '4-6 weeks',
      budgetRange: aiResponse.budgetRange || projectData.budgetRange,
      quoteText: aiResponse.quoteText || 'Thank you for your project request. We will provide a detailed quote shortly.',
      projectScope: aiResponse.projectScope || 'Web development project',
      deliverables: aiResponse.deliverables || ['Responsive website', 'Basic SEO', '3 months support'],
      risks: aiResponse.risks || ['Standard development risks'],
      recommendations: aiResponse.recommendations || ['Focus on user experience'],
      lineItems: Array.isArray(aiResponse.lineItems) ? aiResponse.lineItems : [],
      spec: aiResponse.spec || { overview: 'Website specification', features: [] },
      confidence: aiResponse.confidence || 85
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback to rule-based calculation
    return generateFallbackQuote(projectData);
  }
}

function generateFallbackQuote(projectData: ProjectData): AIQuoteResponse {
  // Simple fallback calculation
  let basePrice = 3000;
  let estimatedHours = 40;
  let complexity: 'simple' | 'moderate' | 'complex' | 'enterprise' = 'moderate';

  // Adjust based on project type
  switch (projectData.projectType) {
    case 'landing-page':
      basePrice = 2500;
      estimatedHours = 30;
      complexity = 'simple';
      break;
    case 'multi-page':
      basePrice = 4000;
      estimatedHours = 50;
      complexity = 'moderate';
      break;
    case 'ecommerce':
      basePrice = 6000;
      estimatedHours = 80;
      complexity = 'complex';
      break;
    case 'web-app':
      basePrice = 8000;
      estimatedHours = 100;
      complexity = 'enterprise';
      break;
    case 'redesign':
      basePrice = 2000;
      estimatedHours = 25;
      complexity = 'simple';
      break;
  }

  // Adjust for features
  const featureMultiplier = projectData.scopeFeatures.length * 0.1;
  basePrice += basePrice * featureMultiplier;
  estimatedHours += projectData.scopeFeatures.length * 5;

  // Adjust for timeline
  if (projectData.timeline === 'asap') {
    basePrice *= 1.3;
  } else if (projectData.timeline === '1-week') {
    basePrice *= 1.2;
  }

  const totalPrice = Math.round(basePrice);

  // Create a simple breakdown based on common phases
  const rate = complexity === 'simple' ? 75 : complexity === 'moderate' ? 85 : complexity === 'complex' ? 95 : 110;
  const designHours = Math.round(estimatedHours * 0.25);
  const developmentHours = Math.round(estimatedHours * 0.5);
  const qaHours = Math.round(estimatedHours * 0.15);
  const pmHours = Math.max(1, estimatedHours - (designHours + developmentHours + qaHours));

  const lineItems: QuoteLineItem[] = [
    { label: 'Design & UX', hours: designHours, rate, cost: designHours * rate },
    { label: 'Development', hours: developmentHours, rate, cost: developmentHours * rate },
    { label: 'QA & Accessibility', hours: qaHours, rate, cost: qaHours * rate },
    { label: 'Project Management', hours: pmHours, rate, cost: pmHours * rate },
  ];

  return {
    complexity,
    estimatedHours,
    basePrice,
    totalPrice,
    timeline: projectData.timeline === 'asap' ? '1-2 weeks' : 
              projectData.timeline === '1-week' ? '2-3 weeks' :
              projectData.timeline === '2-weeks' ? '3-4 weeks' :
              projectData.timeline === '1-month' ? '4-6 weeks' : '6-8 weeks',
    budgetRange: projectData.budgetRange,
    quoteText: `Dear ${projectData.clientName || 'Client'},

Thank you for choosing JGDD for your ${projectData.projectType.replace('-', ' ')} project.

Based on our analysis, this is a ${complexity} project that will require approximately ${estimatedHours} hours of development time. Our team is excited to work with you and bring your vision to life.

We're committed to delivering a high-quality, performance-optimized solution that meets your specific needs while maintaining our standards for clean code, accessibility, and user experience.

We look forward to working with you on this exciting project!`,
    projectScope: `Development of a ${projectData.projectType.replace('-', ' ')} website with the following features: ${projectData.scopeFeatures.join(', ')}`,
    deliverables: [
      'Fully responsive website',
      'Cross-browser compatibility',
      'Performance optimization',
      'Basic SEO setup',
      '3 months post-launch support'
    ],
    risks: [
      'Standard development timeline may be affected by scope changes',
      'Third-party integrations may require additional time'
    ],
    recommendations: [
      'Focus on user experience and mobile responsiveness',
      'Implement proper SEO optimization from the start',
      'Plan for scalability and future growth'
    ],
    lineItems,
    spec: {
      overview: `Build a ${projectData.projectType.replace('-', ' ')} with ${projectData.scopeFeatures.join(', ')}.`,
      features: projectData.scopeFeatures,
    },
    confidence: 75
  };
}
