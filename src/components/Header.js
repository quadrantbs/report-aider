"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Header = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = (e) => {
    setLoading(true);
    e.preventDefault();
    signOut();
    setLoading(false);
    router.push("/");
  };

  return (
    <header className="bg-base-200 p-4 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-primary">
          <Link href="/" className="hover:text-primary-focus">
            Report Aider
          </Link>
        </h1>

        <nav className="flex items-center">
          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-4">
            {session && (
              <>
                <li>
                  <Link href="/reports" className="btn btn-primary btn-outline">
                    Reports
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reports/create"
                    className="btn btn-primary btn-outline"
                  >
                    Create Report
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => signOut()}
                    className="btn btn-error"
                    disabled={loading}
                  >
                    {loading ? "Logging out..." : "Logout"}
                  </button>
                </li>
              </>
            )}
            {!session && (
              <li>
                <Link
                  href="/login"
                  className="btn btn-primary w-full text-left"
                >
                  Login
                </Link>
              </li>
            )}
          </ul>

          {/* Dropdown Menu for Mobile */}
          <div className="md:hidden dropdown">
            <div
              tabIndex={0}
              className="btn btn-outline btn-primary"
              role="button"
            >
              Menu
            </div>

            <ul
              tabIndex={0}
              className="absolute bg-base-200 p-4 rounded-lg shadow-lg right-0 mt-2 space-y-2 w-48 dropdown-content z-50"
            >
              {session && (
                <>
                  <li>
                    <Link href="/reports" className="block text-primary">
                      Reports
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports/create" className="block text-primary">
                      Create Report
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="btn btn-error w-full text-left"
                      disabled={loading}
                    >
                      {loading ? "Logging out..." : "Logout"}
                    </button>
                  </li>
                </>
              )}
              {!session && (
                <li>
                  <Link
                    href="/login"
                    className="btn btn-primary w-full text-left"
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
