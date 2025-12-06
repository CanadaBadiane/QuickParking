import { SignUp } from "@clerk/nextjs";

// Page d'inscription
export default function PageSignUp() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp redirectUrl="/inscription" />
    </div>
  );
}
