import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - Audiofy",
  description: "Reset your Audiofy password.",
};

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
