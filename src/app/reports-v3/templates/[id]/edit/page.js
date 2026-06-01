"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TemplateForm from "@/components/reports-v3/TemplateForm";

export default function EditTemplatePage() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/v3/templates/${id}`);
        if (res.ok) setTemplate(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!template) return <div className="p-10 text-center">Format not found. <Link href="/reports-v3/templates" className="link">Back</Link></div>;

  return <TemplateForm initial={template} templateId={id} />;
}
