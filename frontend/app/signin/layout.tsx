import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Sprout",
  description: "Sign in to your Sprout account to manage your cultivation automation.",
};

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
