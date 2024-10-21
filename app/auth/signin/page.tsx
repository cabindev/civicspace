"use client";

import { useState, FormEvent, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function SignIn() {
  const { data: session } = useSession();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard"); // หรือหน้าหลักหลังจาก login
    }
  }, [session, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.replace("/dashboard"); // หรือหน้าหลักหลังจาก login
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาด โปรดลองอีกครั้ง");
    }
  };

  return (
     
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="max-w-md w-full space-y-8 p-10 bg-[var(--primary-foreground)] rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--foreground)]">
            เข้าสู่ระบบ
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                อีเมล
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--muted)] placeholder-[var(--muted-foreground)] text-[var(--foreground)] rounded-t-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:z-10 sm:text-sm"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                รหัสผ่าน
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-[var(--muted)] placeholder-[var(--muted-foreground)] text-[var(--foreground)] rounded-b-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:z-10 sm:text-sm"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--muted)] rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-[var(--foreground)]"
              >
                จดจำฉัน
              </label>
            </div>

            <Link
              href="/auth/forgot-password"
              className="link-primary font-medium"
            >
              ลืมรหัสผ่าน?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="btn-primary group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-2 text-center text-sm text-red-600">{error}</p>
        )}

        <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
          ยังไม่เป็นสมาชิก?{" "}
          <Link href="/auth/form_signup" className="link-primary font-medium">
            สมัครสมาชิกเลย
          </Link>
        </p>
      </div>
    </div>
  );
}
