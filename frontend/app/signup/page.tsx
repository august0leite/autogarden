import { Navbar } from "@/components/navbar";
import { SignUpCard } from "@/components/signup-card";

export const metadata = {
  title: "Sign Up - Audiofy",
  description: "Create an Audiofy account to manage your music registry.",
};

export default function SignUpPage() {
  return (
    <>
      <Navbar />
      <SignUpCard />
    </>
  );
}
