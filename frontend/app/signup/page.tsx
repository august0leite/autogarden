import { Navbar } from "@/components/navbar";
import { SignUpCard } from "@/components/signup-card";

export const metadata = {
  title: "Sign Up - Sprout",
  description: "Create a Sprout account to manage your cultivation automation.",
};

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <SignUpCard />
    </>
  );
}
