"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TrainingPlan {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  coverImage: string;
  coachId: string;
  coachName: string;
  difficulty: string;
  duration: number;
  price: number;
  currency: string;
  isPublished: boolean;
  categoryIds: string[];
  previewModules: any[];
  fullModules: any[];
  createdAt: string;
  updatedAt: string;
}

const PlanEditPage = ({ params }: { params: { slug: string } }) => {
  const router = useRouter();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/plans/${params.slug}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("No se pudo cargar el plan");
        const data = await res.json();
        setPlan(data.plan);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchPlan();
  }, [params.slug]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!plan) return <div>No se encontró el plan.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Plan: {plan.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-2">
          <Input label="Título" value={plan.title} readOnly />
          <Input label="Descripción corta" value={plan.shortDescription} readOnly />
          <Input label="Descripción completa" value={plan.fullDescription} readOnly />
          {/* Agrega aquí más campos y lógica de edición según necesidad */}
        </div>
        {/* Botones para guardar cambios, publicar, etc. */}
      </CardContent>
    </Card>
  );
};

export default PlanEditPage;
