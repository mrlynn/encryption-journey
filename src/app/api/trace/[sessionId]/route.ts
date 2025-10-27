import { NextRequest, NextResponse } from 'next/server';
import { TraceSession } from '@/types/trace';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  try {
    // Map demo session to our seed data file
    const fileName = sessionId === 'demo' ? 'seed-create-then-read.json' : `${sessionId}.json`;
    
    // In a real application, this would fetch from a database or external API
    // For now, we'll read from the public directory
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/demo/sessions/${fileName}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Session not found: ${sessionId}` },
        { status: 404 }
      );
    }

    const rawData = await response.json();
    
    // Transform the data to match TraceSession interface
    const data: TraceSession = {
      sessionId: rawData.sessionId || rawData.id,
      events: rawData.events || [],
      createdAt: rawData.createdAt || new Date().toISOString(),
      description: rawData.description || 'Demo session',
    };
    
    // Verify signatures for demo purposes
    if (data.events) {
      const HMAC_SECRET = process.env.NEXT_PUBLIC_HMAC_SECRET || "super-secret-key";
      
      data.events = data.events.map((event) => {
        const { signature, ...eventWithoutSignature } = event;
        const dataToSign = JSON.stringify(eventWithoutSignature);
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', HMAC_SECRET);
        hmac.update(dataToSign);
        const expectedSignature = hmac.digest('hex');
        
        return {
          ...event,
          verified: expectedSignature === signature,
        };
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading session:', error);
    return NextResponse.json(
      { error: 'Failed to load session data' },
      { status: 500 }
    );
  }
}
