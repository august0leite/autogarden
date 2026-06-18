import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - Sprout",
  description: "Reset your Sprout password.",
};

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
