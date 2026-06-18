import { Navbar } from "@/components/navbar";
import { SignInCard } from "@/components/signin-card";

export const metadata = {
  title: "Sign In - Sprout",
  description: "Sign in to your Sprout account to manage your cultivation automation.",
};

export default function SignInPage() {
  return (
    <>
      <Navbar />
      <SignInCard />
    </>
  );
}
