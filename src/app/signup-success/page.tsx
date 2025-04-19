'use client';

import Link from 'next/link';
import BaseLayout from '@/components/BaseLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignupSuccessPage() {
  return (
    <BaseLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-13rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">Sign Up Successful!</CardTitle>
            <CardDescription>
              Thank you for creating an account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <p className="font-medium">Please check your email</p>
              <p className="text-sm text-gray-500 mb-4">
                We&apos;ve sent a confirmation email to your inbox. Please click the link in the email to verify your account.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              If you don&apos;t see the email, please check your spam folder or contact support.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/login" passHref>
              <Button variant="outline">Back to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </BaseLayout>
  );
} 