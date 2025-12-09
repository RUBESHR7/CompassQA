const API_KEY = "AIzaSyDRRmfCYt23t_A978CIC7vSoJvvcSsiiyI";

async function testV1() {
    console.log("🔍 Testing 'v1' API endpoint directly...");
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ SUCCESS on v1!`);
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(`❌ FAILED on v1: ${response.status} ${response.statusText}`);
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log("❌ Network Error: " + e.message);
    }
}

testV1();
