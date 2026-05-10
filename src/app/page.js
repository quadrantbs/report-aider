"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (session) location.reload()
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <main className="p-6 bg-base-100 text-base-content text-center">
        <h1 className="text-4xl font-bold">Loading...</h1>
      </main>
    );
  }

  return (
    <main className="p-6 bg-base-100 text-base-content text-center">
      <h1 className="text-4xl font-bold">Welcome to Report AIder</h1>
      {session ? (
        <>
          <p>
            Welcome, {session?.user?.username}, with id {session.user.id}
          </p>
          <button className="btn btn-accent mt-4 ml-2">
            <Link href={"/reports"}>My Reports</Link>
          </button>
        </>
      ) : (
        <p>Redirecting to Login Page...</p>
      )}
    </main>
  );
}
