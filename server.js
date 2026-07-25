 const http = require("http");
const fs = require("fs");
const path = require("path");

const API_KEY = "YOUR_API_KEY";

const filePath = path.join(__dirname, "random.html");


const server = http.createServer((req, res) => {


    if (req.method === "GET" && req.url === "/") {

        fs.readFile(filePath, "utf8", (err, data) => {

            if (err) {
                res.writeHead(500);
                res.end("File not found");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);

        });

    }


    else if (req.method === "POST" && req.url === "/ai") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });


        req.on("end", async () => {
            try {
            console.log("RAW BODY:", body);

             const params = new URLSearchParams(body);

    const userPrompt = params.get("prompt");
    console.log("Received Prompt:", userPrompt);
    

    

    if (!userPrompt || userPrompt.trim() === "") {

    res.writeHead(400, {
        "Content-Type": "text/plain"
    });

    res.end("Please enter a prompt");

    return;
}

    const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
},
body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    messages: [
        {
            role: "user",
            content: userPrompt
        }
    ]
})

    }
);

if (!response.ok) {

    const errorData = await response.text();

    throw new Error(
        `Groq API Error: ${errorData}`
    );

}

const data = await response.json();


if (!data.choices || !data.choices[0] || !data.choices[0].message) {

    throw new Error("Invalid AI response");

}


const aiText = data.choices[0].message.content;

fs.readFile(filePath, "utf8", (err, html) => {

    if (err) {
        throw err;
    }


    html = html.replace("RESULT", aiText);


    res.writeHead(200, {
        "Content-Type": "text/html"
    });


    res.end(html);

});

            } catch (error) {

            console.log(error.message);

            res.writeHead(500, {
                "Content-Type": "text/plain"
            });

            res.end("Something went wrong with AI service");

        }


        

        });

    }


});


server.listen(3000, () => {
    console.log("Server running on port 3000");
});





