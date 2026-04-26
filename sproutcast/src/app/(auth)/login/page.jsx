"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Sending data to your team's API route
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                // If successful, send them to the homepage or garden
                router.push("/");
            } else {
                const data = await res.json();
                setError(data.message || "Invalid credentials.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md border-2 border-blue-100 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>

                {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-400"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-400"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>
            </div>
        </div>
    );
}