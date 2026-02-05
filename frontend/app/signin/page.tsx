import { Navbar } from "@/components/navbar";
import { SignInCard } from "@/components/signin-card";

export const metadata = {
  title: "Sign In - Audiofy",
  description: "Sign in to your Audiofy account to manage your music registry.",
};

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <SignInCard />
    </>
  );
}
