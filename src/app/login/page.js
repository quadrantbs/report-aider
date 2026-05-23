"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { set } from "mongoose";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username: formData.username,
      password: formData.password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      setError(null);
      router.replace("/");
    }
    setLoading(false);
  };

  return (
    <main className="p-6 bg-base-200 text-base-content h-screen flex justify-center items-center">
      <div className="max-w-md w-full bg-base-100 p-6 rounded-lg shadow-lg border border-base-content/20">
        <h1 className="text-4xl font-bold">Sign In</h1>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="username" className="label">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-2 flex items-center text-gray-600 hover:text-gray-800"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>
        <p className="text-center mt-4">
          Don&apos;t have an account?{" "}
          <Link href={"/register"} className="link-primary">
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}
