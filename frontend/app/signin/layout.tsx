import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Audiofy",
  description: "Sign in to your Audiofy account to manage your music registry.",
};

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
