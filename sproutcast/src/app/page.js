import { getCurrentUser } from "@/lib/session";
import Dashboard from "@/components/Dashboard";

export default async function Home() {
  // Fetch the logged-in user securely on the server
  const user = await getCurrentUser();
  //console.log("THE LOGGED IN USER IS:", user); -- sanity/debugging check
  const currentUserID = user?.userId || user?.email || null;

  return (
    <main className="min-h-screen p-8 bg-green-50">
      <h1 className="text-4xl font-bold text-green-800 mb-4 text-center">
        Welcome to SproutCast
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        The gardening weather platform!
      </p>
      
      {/* Drop in our new Client Component Dashboard and pass it the user ID! */}
      <Dashboard currentUserID={currentUserID} />

    </main>
  );
}