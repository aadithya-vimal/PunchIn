export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { messages } = body;

    // Check if key exists in Cloudflare Environment
    if (!env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "Server Error: Missing API Key" }), { status: 500 });
    }

    // Call Groq securely from the server
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.1,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    
    // Check for rate limits or errors from Groq
    if (data.error) {
        return new Response(JSON.stringify({ error: "AI Busy", details: data.error }), { status: 429 });
    }

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch response" }), { status: 500 });
  }
}