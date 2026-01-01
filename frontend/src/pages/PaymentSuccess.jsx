import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PaymentSuccess({ user }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async (attempt = 0) => {
    if (attempt >= 5) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/status/${sessionId}`);
      setPaymentDetails(response.data);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        toast.success('Payment successful!');
      } else if (response.data.status === 'expired') {
        setStatus('expired');
      } else {
        setTimeout(() => checkPaymentStatus(attempt + 1), 2000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setTimeout(() => checkPaymentStatus(attempt + 1), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === 'checking' && (
            <>
              <Loader2 data-testid="payment-checking" className="h-16 w-16 text-accent mx-auto mb-4 animate-spin" />
              <CardTitle>Processing Payment...</CardTitle>
              <CardDescription>Please wait while we verify your payment</CardDescription>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle data-testid="payment-success" className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle>Payment Successful!</CardTitle>
              <CardDescription>Your payment has been processed successfully</CardDescription>
            </>
          )}
          {status === 'timeout' && (
            <>
              <CardTitle>Payment Verification Timeout</CardTitle>
              <CardDescription>Please check your email for confirmation</CardDescription>
            </>
          )}
          {status === 'expired' && (
            <>
              <CardTitle>Payment Session Expired</CardTitle>
              <CardDescription>Please try again</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          {paymentDetails && (
            <div className="mb-6 text-left bg-secondary/30 p-4 rounded">
              <p className="text-sm text-muted-foreground mb-1">Amount: {paymentDetails.currency.toUpperCase()} {(paymentDetails.amount_total / 100).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Status: {paymentDetails.payment_status}</p>
            </div>
          )}
          <Button data-testid="go-to-dashboard-btn" onClick={() => navigate('/dashboard')} className="w-full rounded-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}