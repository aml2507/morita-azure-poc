import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Morita",
  description: "Inicia sesión en tu cuenta de Morita",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 