"use client";

import TemplateForm from "@/components/reports-v3/TemplateForm";
import { getPreset } from "@/utils/reports-v3/presets";

export default function NewTemplatePage() {
  // Seed a new template from the built-in LMG preset so the user has a base.
  const preset = getPreset("v1");
  const initial = {
    name: "",
    description: "",
    isPublic: false,
    defaultVariables: preset.defaultVariables,
    blocks: structuredClone(preset.blocks),
  };
  return <TemplateForm initial={initial} />;
}
