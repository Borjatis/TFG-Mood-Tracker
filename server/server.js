// server.js (servidor proxy a Hugging Face, OpenAI y DeepAI)

const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = 3000;

// Desactiva la política CSP completamente para desarrollo
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

// Permitir peticiones desde el frontend si se accede por separado
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// Endpoint IA adaptado a Hugging Face
app.post("/api/mood-response-hf", async (req, res) => {
  const { mood } = req.body;

  console.log(`Mood recibido: ${mood}`);

  try {
    const mensajeIA = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`, // Token de Hugging Face aquí
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `Dame una respuesta simpática en español para alguien que se siente ${mood} en tono cercano y agradable. Tambien sugierele si necesita algo.`
      })
    });
    
     // Verificar si la API devuelve un error
    const data = await mensajeIA.json();
    console.log("Respuesta completa de Hugging Face:", data);

    // Validación antes de acceder
    const mensaje = data?.[0]?.generated_text || "No se pudo generar la respuesta 😓";
    res.json({ mensaje });

  } catch (err) {
    console.error("Error llamando a Hugging Face:", err);
    res.status(500).json({ mensaje: "Error generando mensaje de la IA" });
  }
});


// Endpoint IA adaptado a OpenAI
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/mood-response-openai", async (req, res) => {
  const { mood } = req.body;
  console.log(`🧠 OpenAI - Estado recibido: ${mood}`);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres un asistente empático que responde en español con frases breves, simpáticas y con tono cercano." },
        { role: "user", content: `Una persona se siente ${mood}. Dale una respuesta simpática, en español, con una sugerencia útil si es posible.` }
      ],
      max_tokens: 60,      // Máximo de palabras, para que no se dispare el coste
      temperature: 0.8     // Creatividad moderada (0.7–0.9 es ideal para empatía)
    });

    const mensaje = completion.choices[0].message.content.trim();
    console.log("✅ OpenAI respondió:", mensaje);
    res.json({ mensaje });

  } catch (err) {
    console.error("❌ Error llamando a OpenAI:", err);
    res.status(500).json({ mensaje: "Error generando mensaje con OpenAI" });
  }
});


// Endpoint IA adaptado a DeepAI
app.post("/api/mood-response-deepai", async (req, res) => {
  const { mood } = req.body;

  try {
    const response = await fetch("https://api.deepai.org/api/text-generator", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEP_AI_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        text: `Dame una respuesta simpática en español para alguien que se siente ${mood}. También sugiérele si necesita algo.`
      })
    });

    const data = await response.json();
    const mensaje = data.output || "No se pudo generar la respuesta 😓";
    res.json({ mensaje });

  } catch (err) {
    console.error("Error llamando a DeepAI:", err);
    res.status(500).json({ mensaje: "Error generando mensaje con DeepAI" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor del Mood Tracker activo en http://localhost:${PORT}`);
});
