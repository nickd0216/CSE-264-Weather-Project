"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Sending data to your team's API route
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                // If successful, send them to the login page
                router.push("/login");
            } else {
                const data = await res.json();
                setError(data.message || "Registration failed.");
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
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Join the Garden</h2>

                {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-2 rounded">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Name"
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                        {loading ? "Planting your account..." : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}