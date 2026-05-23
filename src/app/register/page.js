"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/login");
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 bg-base-200 text-base-content h-screen flex justify-center items-center">
      <div className="max-w-md w-full bg-base-100 p-6 rounded-lg shadow-lg border border-base-content/20">
        <h1 className="text-4xl font-bold">Register</h1>
        {error && <div className="text-red-500 mt-2">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input input-bordered w-full"
              
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full"
              
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link href={"/login"} className="link-primary">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
}
