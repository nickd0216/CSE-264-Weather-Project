import { auth } from "@/auth"

export default async function AdminDashboard() {
    const session = await auth();

    return (
        <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p>Welcome, {session?.user?.name}.</p>

            <div className="mt-8 border-2 border-dashed border-red-300 p-8 rounded-lg bg-red-50">
                <h2 className="text-xl text-red-400">NICK & CHRIS: Drop User Management Table Here</h2>
            </div>
        </div>
    )
}