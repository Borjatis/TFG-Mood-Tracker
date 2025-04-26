// server.js (servidor proxy a Hugging Face)

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
app.post("/api/mood-response", async (req, res) => {
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

     // 🔹 Verificar si la API devuelve un error
    const data = await mensajeIA.json();
    console.log("Respuesta completa de Hugging Face:", data);

    // ✅ Validación antes de acceder
    const mensaje = data?.[0]?.generated_text || "No se pudo generar la respuesta 😓";
    res.json({ mensaje });

  } catch (err) {
    console.error("Error llamando a Hugging Face:", err);
    res.status(500).json({ mensaje: "Error generando mensaje de la IA" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor del Mood Tracker activo en http://localhost:${PORT}`);
});
