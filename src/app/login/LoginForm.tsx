"use client";

import { useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Ripple,
  AuthTabs,
  TechOrbitDisplay,
  WhatsAppIcon,
  CartaoDeTodosIcon,
  AmorSaudeIcon,
  type OrbitIcon,
} from "@/components/blocks/modern-animated-sign-in";

type DadosLogin = {
  email: string;
  senha: string;
};

const iconsArray: OrbitIcon[] = [
  {
    component: () => <WhatsAppIcon className="size-[34px]" />,
    className: "border-none bg-transparent shadow-none",
    duration: 18,
    delay: 0,
    radius: 90,
    reverse: false,
  },
  {
    component: () => <CartaoDeTodosIcon className="size-[46px] text-sm" />,
    className: "border-none bg-transparent shadow-none",
    duration: 24,
    delay: 8,
    radius: 170,
    reverse: true,
  },
  {
    component: () => <AmorSaudeIcon className="size-[46px]" />,
    className: "border-none bg-transparent shadow-none",
    duration: 22,
    delay: 4,
    radius: 250,
    reverse: false,
  },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [dados, setDados] = useState<DadosLogin>({ email: "", senha: "" });
  const [erro, setErro] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>, campo: keyof DadosLogin) {
    const value = event.target.value;
    setDados((atual) => ({ ...atual, [campo]: value }));
  }

  function goToForgotPassword(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setErro("Recuperação de senha ainda não disponível — fale com o administrador.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setPending(true);

    const resultado = await signIn("credentials", {
      email: dados.email,
      senha: dados.senha,
      redirect: false,
    });

    setPending(false);

    if (!resultado || resultado.error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  const formFields = {
    header: "CRM Cartão de Todos Guarabira",
    subHeader: "Entre com seu e-mail e senha.",
    fields: [
      {
        label: "E-mail",
        required: true,
        type: "email",
        placeholder: "seuemail@exemplo.com",
        onChange: (event: ChangeEvent<HTMLInputElement>) => handleInputChange(event, "email"),
      },
      {
        label: "Senha",
        required: true,
        type: "password",
        placeholder: "Sua senha",
        onChange: (event: ChangeEvent<HTMLInputElement>) => handleInputChange(event, "senha"),
      },
    ],
    submitButton: "Entrar",
    textVariantButton: "Esqueceu a senha?",
  };

  return (
    <section className="flex min-h-screen bg-[radial-gradient(circle_at_top,_#123f3b,_#0b2e2c_60%)] max-lg:justify-center">
      <span className="relative hidden h-screen w-1/2 flex-col items-center justify-center lg:flex">
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay iconsArray={iconsArray} />
      </span>

      <span className="flex h-screen w-1/2 flex-col items-center justify-center px-4 max-lg:w-full">
        <AuthTabs
          formFields={formFields}
          goTo={goToForgotPassword}
          handleSubmit={handleSubmit}
          erro={erro}
          pending={pending}
        />
      </span>
    </section>
  );
}
