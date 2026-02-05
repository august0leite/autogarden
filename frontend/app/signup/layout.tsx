import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Audiofy",
  description: "Create an Audiofy account to manage your music registry.",
};

export default function SignUpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
