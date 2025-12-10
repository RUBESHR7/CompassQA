// Test using v1beta REST API
const API_KEY = "AIzaSyAom0ZV28TSNrfkigNE4Y3SLXx4QrB6QAA";

async function testRESTAPI() {
    try {
        // Try v1beta with gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Say hello in one word"
                    }]
                }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ SUCCESS! gemini-1.5-flash works with v1beta!");
            console.log("Response:", data.candidates[0].content.parts[0].text);
        } else {
            console.log("❌ Failed:");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testRESTAPI();
