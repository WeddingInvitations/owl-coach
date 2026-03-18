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
                <Button variant="ghost">Iniciar sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Comenzar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Planes de Entrenamiento Profesionales
            <br />
            <span className="text-primary">Simples y Efectivos</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Descubre programas de entrenamiento diseñados por coaches certificados.
            Compra planes individuales o paquetes completos de entrenamiento.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/app/plans">
              <Button size="lg">Ver Planes</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">Empezar a Entrenar</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Todo lo que Necesitas para Triunfar
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">📚</span>
                  <span>Contenido Experto</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Accede a planes de entrenamiento diseñados por coaches certificados
                  con años de experiencia.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🔒</span>
                  <span>Acceso Premium</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compra planes individuales o paquetes completos.
                  Accede a tu contenido en cualquier momento y lugar.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <span>Aprendizaje Estructurado</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sigue módulos paso a paso con ejercicios detallados,
                  instrucciones y seguimiento del progreso.
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
                ¿Listo para Comenzar tu Viaje de Entrenamiento?
              </h3>
              <p className="text-muted-foreground mb-6">
                Únete a miles de atletas y entusiastas del fitness que confían en nuestra
                plataforma para sus necesidades de entrenamiento.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/register">
                  <Button size="lg">Crear Cuenta</Button>
                </Link>
                <Link href="/app/plans">
                  <Button size="lg" variant="outline">Explorar Planes</Button>
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
              © 2026 Owl Coach. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}