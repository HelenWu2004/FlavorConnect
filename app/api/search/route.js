export async function GET(req) {
  console.log("Search API called");
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
  try {
    // Create a larger pool of mock results 
    const allMockResults = [];
    for (let i = 1000; i < 1500; i++) {
      allMockResults.push(i.toString());
    }
    
    // Filter results based on query if needed
    let filteredResults = [...allMockResults]; // Clone array to avoid mutations
    if (query) {
      // This is a simple simulation - in a real app, this would be your search algorithm
      if (query.includes('burger')) {
        filteredResults = allMockResults.slice(0, 200);
      } else if (query.includes('salad')) {
        filteredResults = allMockResults.slice(0, 100);
      } else if (query.includes('chicken')) {
        filteredResults = allMockResults.slice(0, 300);
      }
    }
    
    // Shuffle the array to get random results
    const shuffledResults = filteredResults.sort(() => 0.5 - Math.random());
    
    // Return a random subset of the available results
    const randomResults = shuffledResults.slice(0, limit);
    
    // For demonstration, add total count to show how many total results exist
    const totalResults = filteredResults.length;
    
    return Response.json({ 
      result: randomResults,
      page,
      limit,
      total: totalResults,
      hasMore: filteredResults.length > 0 // Always true if there are results available
    });
  } catch (error) {
    console.error("Error in search:", error.message);
    
    return Response.json({ 
      result: [], 
      error: "An error occurred while searching",
      page,
      limit,
      total: 0,
      hasMore: false
    }, { status: 500 });
  }
} 