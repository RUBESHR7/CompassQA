const apiKey = "AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function getModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log("No models found in response:", data);
            }
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

getModels();
