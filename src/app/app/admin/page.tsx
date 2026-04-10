'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AuthUser } from '@/types/auth';
import { TrainingPlan } from '@/types/training-plan';
import { TrainingPlanGroup } from '@/types/training-plan-group';
import { Purchase } from '@/types/purchase';

export default function AdminPage() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    users: 0,
    plans: 0,
    groups: 0,
    purchases: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load users stats
      const usersResponse = await fetch('/api/admin/users');
      const users = usersResponse.ok ? await usersResponse.json() : [];

      // Load plans stats
      const plansResponse = await fetch('/api/plans');
      const plans = plansResponse.ok ? await plansResponse.json() : [];

      // Load groups stats
      const groupsResponse = await fetch('/api/groups');
      const groups = groupsResponse.ok ? await groupsResponse.json() : [];

      // Load purchases stats
      const purchasesResponse = await fetch('/api/purchases');
      const purchases = purchasesResponse.ok ? await purchasesResponse.json() : [];

      const totalRevenue = purchases.reduce((sum: number, p: Purchase) => sum + p.amount, 0);

      setStats({
        users: users.length,
        plans: plans.length,
        groups: groups.length,
        purchases: purchases.length,
        revenue: totalRevenue,
      });

      // Recent activity (last 5 purchases)
      const recentPurchases = purchases
        .sort((a: Purchase, b: Purchase) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);

      setRecentActivity(recentPurchases);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div>Cargando panel de administración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
            <div className="text-xs text-muted-foreground">
              Registros en la plataforma
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Planes de Entrenamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.plans}</div>
            <div className="text-xs text-muted-foreground">
              Cursos individuales
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paquetes de Planes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.groups}</div>
            <div className="text-xs text-muted-foreground">
              Paquetes disponibles
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.purchases}</div>
            <div className="text-xs text-muted-foreground">
              Pedidos completados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue.toFixed(2)} €</div>
            <div className="text-xs text-muted-foreground">
              Ganancias totales
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Compras Recientes</CardTitle>
          <CardDescription>
            Últimas compras en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Sin actividad reciente
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((purchase: Purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      Compra #{purchase.id.slice(-8)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Usuario: {purchase.userId}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Producto: {purchase.productId} ({purchase.productType})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      ${purchase.amount.toFixed(2)}
                    </div>
                    <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                      {purchase.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Tareas administrativas comunes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <button className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium">Crear Plan de Entrenamiento</div>
              <div className="text-sm text-muted-foreground">Añadir nuevo contenido</div>
            </button>
            
            <button className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium">Crear Paquete de Planes</div>
              <div className="text-sm text-muted-foreground">Agrupar planes juntos</div>
            </button>
            
            <button className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium">Gestionar Usuarios</div>
              <div className="text-sm text-muted-foreground">Ver y editar cuentas de usuario</div>
            </button>
            
            <button className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="font-medium">Exportar Datos</div>
              <div className="text-sm text-muted-foreground">Descargar informes</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}