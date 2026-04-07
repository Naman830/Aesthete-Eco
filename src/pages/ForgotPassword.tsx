import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (!error) {
      setSubmitted(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | Aesthete</title>
        <meta name="description" content="Reset your Aesthete account password." />
      </Helmet>

      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1 pt-24">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="max-w-md mx-auto">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>

              <div className="bg-card rounded-lg shadow-sm border border-border p-8 animate-fade-in">
                {!submitted ? (
                  <>
                    <div className="text-center mb-8">
                      <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                          <Mail className="w-7 h-7 text-muted-foreground" />
                        </div>
                      </div>
                      <h1 className="text-2xl font-bold">Forgot your password?</h1>
                      <p className="text-muted-foreground mt-2 text-sm">
                        Enter your email address and we'll send you a link to reset it.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          autoFocus
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !email}
                      >
                        {isLoading ? 'Sending…' : 'Send Reset Link'}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="flex justify-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Mail className="w-7 h-7 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                      We've sent a password reset link to <strong>{email}</strong>.
                      The link expires in 1 hour.
                    </p>
                    <p className="text-xs text-muted-foreground mb-6">
                      Didn't receive it? Check your spam folder or{' '}
                      <button
                        onClick={() => setSubmitted(false)}
                        className="text-primary hover:underline"
                      >
                        try again
                      </button>.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/login">Back to Sign In</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ForgotPassword;
