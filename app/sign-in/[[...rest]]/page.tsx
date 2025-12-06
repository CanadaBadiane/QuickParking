import { SignIn } from "@clerk/nextjs";

// Page de connexion
export default function PageSignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn redirectUrl="/inscription" />
    </div>
  );
}
