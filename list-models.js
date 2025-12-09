// List available models
const API_KEY = "AIzaSyDRRmfCYt23t_A978CIC7vSoJvvcSsiiyI";

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            console.log("✅ Available models:");
            data.models.forEach(model => {
                console.log(`- ${model.name}`);
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`  ✓ Supports generateContent`);
                }
            });
        } else {
            console.log("❌ Failed to list models:");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
