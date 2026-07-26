import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getSessionUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (isDemoMode()) redirect("/plan"); // 로컬 모드는 로그인 불필요
  const user = await getSessionUser();
  if (user) redirect("/plan");

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <LoginForm />
    </div>
  );
}
