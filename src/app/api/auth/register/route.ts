import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  secret_phrase: z.string().min(1, 'Secret phrase is required'),
  full_name: z.string().min(2, 'Full name is required'),
});

// POST /api/auth/register - Register new user with secret phrase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check secret phrase
    const requiredSecret = process.env.REGISTRATION_SECRET_PHRASE;
    if (!requiredSecret) {
      return NextResponse.json(
        { error: 'Registration is currently disabled' },
        { status: 503 }
      );
    }
    
    if (validatedData.secret_phrase !== requiredSecret) {
      return NextResponse.json(
        { error: 'Invalid secret phrase' },
        { status: 403 }
      );
    }
    
    // Use service role client for admin operations
    const supabase = createServiceRoleClient();
    
    // Create user account
    const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: validatedData.full_name,
        role: 'gym_admin',
      },
    });
    
    if (signUpError) {
      console.error('User creation error:', signUpError);
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    // Manually create user profile since trigger might not exist
    if (user.user?.id) {
      const profileData = {
        id: user.user.id,
        full_name: validatedData.full_name,
        email: validatedData.email,
        role: 'gym_admin' as const,
        is_active: true,
      };
      
      const { error: profileError } = await (supabase
        .from('user_profiles') as any)
        .insert(profileData);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the registration if profile creation fails
        // The user was created successfully in auth.users
      }
    }
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.user?.id,
        email: user.user?.email,
        full_name: validatedData.full_name,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}