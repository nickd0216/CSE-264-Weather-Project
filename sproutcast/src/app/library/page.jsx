import PlantCatalog from "@/components/PlantCatalog";
import { getCurrentUser } from "@/lib/session"; 

export default async function LibraryPage() {
  // Fetch the user on the server!
  const user = await getCurrentUser();
  const currentUserID = user?.userId || user?.id || user?.email || null;

  return (
    <main className="min-h-screen bg-green-50">
      <div className="max-w-6xl mx-auto px-8 pt-4">
        
        {/* Pass the ID down as a prop to your catalog! */}
        <PlantCatalog userId={currentUserID} /> 

      </div>
    </main>
  );
}