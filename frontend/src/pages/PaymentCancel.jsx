import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <XCircle data-testid="payment-cancelled" className="h-16 w-16 text-destructive mx-auto mb-4" />
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>Your payment was cancelled. No charges were made.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link to="/dashboard">
            <Button data-testid="back-to-dashboard-btn" className="w-full rounded-full">
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}