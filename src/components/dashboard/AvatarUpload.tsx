"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

async function redimensionarImagem(file: File, tamanho = 256): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");

  const escala = Math.max(tamanho / bitmap.width, tamanho / bitmap.height);
  const w = bitmap.width * escala;
  const h = bitmap.height * escala;
  ctx.drawImage(bitmap, (tamanho - w) / 2, (tamanho - h) / 2, w, h);

  return canvas.toDataURL("image/jpeg", 0.85);
}

function iniciaisDe(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

/** Avatar circular com upload de foto — usado no topo das homes de cada papel. */
export function AvatarUpload({
  fotoUrl,
  nome,
  onUpload,
  tamanho = 56,
}: {
  fotoUrl: string | null;
  nome: string;
  onUpload: (dataUrl: string) => Promise<{ erro?: string } | void>;
  tamanho?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(fotoUrl);
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setErro(null);
    setPending(true);
    try {
      const dataUrl = await redimensionarImagem(file);
      setPreview(dataUrl);
      const resultado = await onUpload(dataUrl);
      if (resultado?.erro) setErro(resultado.erro);
    } catch {
      setErro("Não foi possível processar a imagem.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        className="group relative shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-card shadow-sm ring-1 ring-border transition-transform hover:ring-2 hover:ring-lime-400 active:scale-95"
        style={{ width: tamanho, height: tamanho }}
        title="Trocar foto"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={nome} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-[var(--sidebar-primary)] text-sm font-semibold text-[var(--sidebar-primary-foreground)]">
            {iniciaisDe(nome) || "?"}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {pending ? (
            <Loader2 className="size-4 animate-spin text-white" />
          ) : (
            <Camera className="size-4 text-white" />
          )}
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  );
}
