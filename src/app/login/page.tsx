'use client';

import { supabase } from '@/supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopStockLogo } from '@/components/icons';

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <ShopStockLogo className="w-12 h-12 text-primary" />
            </div>
          <CardTitle className="text-2xl font-bold font-headline">Welcome to ShopStock</CardTitle>
          <CardDescription>Sign in to access your inventory dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleLogin} className="w-full">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 62.3l-68.6 68.6c-20.5-19.1-46.8-30.8-76.3-30.8-59.8 0-108.3 49.3-108.3 109.9s48.5 109.9 108.3 109.9c68.3 0 97.9-53.2 101.8-79.6H248v-69.8h239.2c1.4 12.8 2.8 25.3 2.8 38.2z"></path></svg>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
