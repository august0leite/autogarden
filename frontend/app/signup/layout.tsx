import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Sprout",
  description: "Create a Sprout account to manage your cultivation automation.",
};

export default function SignUpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
