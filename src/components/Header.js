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
    <header className="bg-base-300 p-4 shadow-md">
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
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-primary btn-outline">Reports V2</div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><Link href="/reports-v2">All Reports</Link></li>
                      <li><Link href="/reports-v2/schemas">Formats</Link></li>
                      <li><Link href="/reports-v2/sources">Text Sources</Link></li>
                      <li><Link href="/reports-v2/tokoh">Figures</Link></li>
                    </ul>
                  </div>
                </li>
                <li>
                  <Link href="/reports-v3" className="btn btn-primary btn-outline">
                    Reports V3
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reports/create"
                    className="btn btn-primary btn-outline"
                  >
                    Create V1 Report
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => signOut()}
                    className="btn btn-error"
                    disabled={loading}
                  >
                    {loading ? "Signing out..." : "Sign Out"}
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
                  Sign In
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
              className="absolute bg-base-100 p-4 rounded-lg shadow-lg right-0 mt-2 space-y-2 w-48 dropdown-content z-50"
            >
              {session && (
                <>
                  <li>
                    <Link href="/reports" className="block text-primary">
                      Reports
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports-v2" className="block text-primary">
                      Reports V2
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports-v3" className="block text-primary">
                      Reports V3
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports/create" className="block text-primary">
                      Create V1 Report
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="btn btn-error w-full text-left"
                      disabled={loading}
                    >
                      {loading ? "Signing out..." : "Sign Out"}
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
                    Masuk
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
