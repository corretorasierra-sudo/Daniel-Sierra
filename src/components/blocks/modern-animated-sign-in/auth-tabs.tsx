"use client";

import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CampoFormulario = {
  label: string;
  required?: boolean;
  type: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type AuthFormFields = {
  header: string;
  subHeader?: string;
  fields: CampoFormulario[];
  submitButton: string;
  textVariantButton?: string;
};

export function AuthTabs({
  formFields,
  goTo,
  handleSubmit,
  erro,
  pending,
}: {
  formFields: AuthFormFields;
  goTo?: (event: MouseEvent<HTMLButtonElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  erro?: string | null;
  pending?: boolean;
}) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-lg font-semibold text-slate-900">{formFields.header}</h1>
        {formFields.subHeader && <p className="text-sm text-slate-500">{formFields.subHeader}</p>}
      </div>

      {erro && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {formFields.fields.map((campo) => (
          <div key={campo.label} className="flex flex-col gap-1.5">
            <Label htmlFor={campo.label}>{campo.label}</Label>
            <Input
              id={campo.label}
              type={campo.type}
              placeholder={campo.placeholder}
              required={campo.required}
              onChange={campo.onChange}
              autoComplete={campo.type === "password" ? "current-password" : "email"}
              className="h-10 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        ))}

        {goTo && formFields.textVariantButton && (
          <button
            type="button"
            onClick={goTo}
            className="cursor-pointer self-end text-xs font-medium text-lime-700 underline-offset-2 transition-colors hover:text-lime-800 hover:underline active:scale-95"
          >
            {formFields.textVariantButton}
          </button>
        )}

        <Button type="submit" size="lg" className="mt-2 h-10" disabled={pending}>
          {pending ? "Entrando..." : formFields.submitButton}
        </Button>
      </form>
    </div>
  );
}
