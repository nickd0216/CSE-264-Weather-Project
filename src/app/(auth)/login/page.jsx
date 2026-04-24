import { signIn } from "@/auth"

export default function LoginPage() {
    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-6">Sign In to SproutCast</h1>

            <form
                action={async (formData) => {
                    "use server"
                    await signIn("credentials", formData)
                }}
                className="flex flex-col gap-4"
            >
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="border p-2 rounded"
                    required
                />
                <button type="submit" className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                    Sign In
                </button>
            </form>
        </div>
    );
}