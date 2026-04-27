"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    // Added confirmPassword to the state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Helper function to check password rules
    const validatePassword = (password) => {
        if (password.length < 12) return "Password must be at least 12 characters long.";
        if (!/[A-Z]/.test(password)) return "Password must contain at least one capital letter.";
        if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
        // Checks for any character that is NOT a letter or number
        if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one symbol.";
        return null; // Passes all checks
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Run validations BEFORE calling the API
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        try {
            // We strip out confirmPassword so we don't send it to the backend
            const { confirmPassword, ...apiData } = formData;

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(apiData),
            });

            if (res.ok) {
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
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-400"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
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
                    {/* New Confirm Password Field */}
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-400"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white font-bold py-3 mt-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                        {loading ? "Planting your account..." : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}