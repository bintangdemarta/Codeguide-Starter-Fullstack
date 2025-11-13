import { auth } from "@/lib/auth";

// API Key authentication for devices
export async function authenticateDevice(request: Request) {
  const apiKey = request.headers.get('Authorization');
  
  if (!apiKey || !apiKey.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or invalid API key' };
  }
  
  const token = apiKey.substring(7); // Remove 'Bearer ' prefix
  
  // In a real implementation, you would verify the token against a database
  // For now, we'll simulate device authentication
  // This should check against stored API keys for registered devices
  
  // Placeholder: In a real app, validate token against stored device API keys
  return { authenticated: true, deviceId: 'simulated-device' };
}

// User authentication for dashboard access
export async function authenticateUser(request: Request) {
  try {
    // Using the existing better-auth system
    const session = await auth();
    
    if (!session || !session.user) {
      return { authenticated: false, error: 'User not authenticated' };
    }
    
    return { authenticated: true, user: session.user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { authenticated: false, error: 'Authentication error' };
  }
}

// Middleware function to check if user is authenticated
export async function requireUserAuth(request: Request) {
  const authResult = await authenticateUser(request);
  
  if (!authResult.authenticated) {
    return Response.json(
      { error: authResult.error || 'Authentication required' },
      { status: 401 }
    );
  }
  
  return { success: true, user: authResult.user };
}

// Middleware function to check if device is authenticated
export async function requireDeviceAuth(request: Request) {
  const authResult = await authenticateDevice(request);
  
  if (!authResult.authenticated) {
    return Response.json(
      { error: authResult.error || 'Device authentication required' },
      { status: 401 }
    );
  }
  
  return { success: true, deviceId: authResult.deviceId };
}