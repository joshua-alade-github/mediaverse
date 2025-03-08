import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Enable two-factor authentication
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { factorType = 'totp' } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType,
    });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      factorId: data.id,
      qrCode: data.totp.qr_code, 
      secret: data.totp.secret,
      uri: data.totp.uri
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to enable two-factor authentication' },
      { status: 500 }
    );
  }
}

// Verify a factor
export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { factorId, code } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify factor' },
      { status: 500 }
    );
  }
}

// Disable two-factor authentication
export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { factorId } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase.auth.mfa.unenroll({
      factorId,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to disable two-factor authentication' },
      { status: 500 }
    );
  }
}