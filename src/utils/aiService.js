// Helper to convert File to Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64String = reader.result.split(',')[1];
      resolve({
        data: base64String,
        mimeType: file.type
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateTestCases = async (userStory, screenshots) => {
  try {
    // Convert screenshots to base64 if they exist
    let processedScreenshots = [];
    if (screenshots && screenshots.length > 0) {
      processedScreenshots = await Promise.all(screenshots.map(file => fileToBase64(file)));
    }

    const response = await fetch('/.netlify/functions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userStory,
        screenshots: processedScreenshots
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error generating test cases:", error);
    throw error;
  }
};

export const refineTestCases = async (currentTestCases, userInstructions) => {
  // TODO: Implement /api/refine endpoint for secure refinement
  // For now, this will fail if we don't have a backend endpoint.
  // We should create api/refine.js as well to be complete.

  try {
    const response = await fetch('/.netlify/functions/refine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testCases: currentTestCases,
        instructions: userInstructions
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error refining test cases:", error);
    throw error;
  }
};
