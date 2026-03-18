import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🦉</span>
              </div>
              <span className="text-xl font-bold">Owl Coach</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Professional Training Plans
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover expertly crafted training programs from certified coaches. 
            Purchase individual plans or complete training packages.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/app/plans">
              <Button size="lg">Browse Plans</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">Start Coaching</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">📚</span>
                  <span>Expert Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access professionally designed training plans from certified coaches 
                  with years of experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🔒</span>
                  <span>Premium Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Purchase individual plans or complete packages. 
                  Access your content anytime, anywhere.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <span>Structured Learning</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Follow step-by-step modules with detailed exercises, 
                  instructions, and progress tracking.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Start Your Training Journey?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of athletes and fitness enthusiasts who trust our platform 
                for their training needs.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/register">
                  <Button size="lg">Create Account</Button>
                </Link>
                <Link href="/app/plans">
                  <Button size="lg" variant="outline">Explore Plans</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm">🦉</span>
              </div>
              <span className="font-semibold">Owl Coach</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Owl Coach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}