export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-green-50">
      <h1 className="text-4xl font-bold text-green-800 mb-4">
        Welcome to SproutCast
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        The gardening weather platform!
      </p>
      
      {/* TODO: build these components next and put them here! */}
      <div className="border-4 border-dashed border-gray-300 p-8 text-center rounded-lg">
        <p>[Search Bar Component Goes Here]</p>
      </div>
      
      <div className="border-4 border-dashed border-gray-300 p-16 mt-8 text-center rounded-lg">
        <p>[Interactive Map Component Goes Here]</p>
      </div>
    </main>
  );
}