export const generateToBringList = async (): Promise<string[]> => {
  try {
    // This now calls our secure backend endpoint instead of Google's API directly.
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // We send the specific prompt for this feature to the backend.
      body: JSON.stringify({
        prompt: "Generate a comprehensive to-bring list for a fun-loving group of friends on a week-long vacation. Include items for clothing, toiletries, documents, electronics, and miscellaneous fun stuff. Provide a list of item names."
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred on the server.' }));
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // We expect the backend to return a JSON object like { items: ["...", "...", ...] }
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    
    console.warn("Received unexpected data structure from backend:", data);
    return [];

  } catch (error) {
    console.error("Error generating to-bring list:", error);
    // Re-throw the error so the UI component can catch it and display a message.
    throw error;
  }
};
