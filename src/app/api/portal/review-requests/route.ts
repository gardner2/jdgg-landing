import { NextRequest, NextResponse } from 'next/server';
import { portalDatabase } from '@/lib/portal-database';

// Get review requests for a client
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 });
    }

    // Validate session
    const sessionResult = await portalDatabase.validateSession(sessionToken);
    
    if (!sessionResult.success) {
      return NextResponse.json({ error: sessionResult.error }, { status: 401 });
    }

    const clientId = sessionResult.client!.id!;
    const requests = await portalDatabase.getReviewRequestsByClient(clientId);

    return NextResponse.json({ 
      success: true, 
      requests 
    });

  } catch (error: any) {
    console.error('Review requests fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new review request
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 });
    }

    // Validate session
    const sessionResult = await portalDatabase.validateSession(sessionToken);
    
    if (!sessionResult.success) {
      return NextResponse.json({ error: sessionResult.error }, { status: 401 });
    }

    const clientId = sessionResult.client!.id!;
    
    // Handle both JSON and FormData
    let requestData: any;
    let attachments: File[] = [];
    
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      requestData = {
        request_type: formData.get('request_type'),
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority')
      };
      
      // Handle file attachments
      const attachmentCount = parseInt(formData.get('attachment_count') as string) || 0;
      for (let i = 0; i < attachmentCount; i++) {
        const file = formData.get(`attachment_${i}`) as File;
        if (file) {
          attachments.push(file);
        }
      }
    } else {
      requestData = await request.json();
    }

    const { request_type, title, description, priority } = requestData;

    // Check if client can make a review request
    const canMakeRequest = await portalDatabase.canMakeReviewRequest(clientId);
    
    if (!canMakeRequest.success) {
      return NextResponse.json({ error: canMakeRequest.error }, { status: 500 });
    }

    if (!canMakeRequest.canMake) {
      return NextResponse.json({ 
        error: 'You have reached your monthly review limit or your subscription is inactive' 
      }, { status: 403 });
    }

    // Create review request
    const result = await portalDatabase.createReviewRequest({
      client_id: clientId,
      request_type,
      title,
      description,
      priority
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Handle file uploads (for now, just log them - in production you'd save to cloud storage)
    if (attachments.length > 0) {
      console.log(`Received ${attachments.length} attachments for request ${result.id}:`);
      attachments.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }

    // Increment reviews used
    await portalDatabase.incrementReviewsUsed(clientId);

    return NextResponse.json({ 
      success: true, 
      requestId: result.id,
      attachments: attachments.length
    });

  } catch (error: any) {
    console.error('Review request creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
