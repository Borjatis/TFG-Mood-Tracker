// server.js (servidor proxy a Hugging Face, OpenAI y DeepAI)

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Desactiva la política CSP completamente para desarrollo
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});
// app.use((req, res, next) => {
//   res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;");
//   next();
// });

// Permitir peticiones desde el frontend si se accede por separado
app.use(cors());
app.use(express.static("public"));
app.use(express.json());


// Fallback local para mensajes por mood. En el caso de no disponer de IA 
const fallbackMensajePorMood = (mood) => {
  const respuestas = {  //(No se utiliza por incorporación de recomendaciones)
    feliz: "¡Qué alegría verte feliz! 😄 Sigue disfrutando tu día.",
    triste: "Siento que estés triste. Aquí estoy para acompañarte. 💙",
    ansioso: "Respira hondo, todo va a estar bien. Estoy contigo. 🤗",
    relajado: "Me alegra que estés tranquilo. ¡Sigue así! 🌿"
  };
  return respuestas[mood] || "No funciona correctamente este proveedor de IA, aun así gracias por compartir cómo te sientes. Estoy aquí para ti. 🤍";
};

// Endpoint IA adaptado a OpenAI
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/chat-openai", async (req, res) => {
  const { historial, mensajeUsuario, mood } = req.body;
  console.log(`🧠 OpenAI - Mood recibido: ${mood}`);

  if (!mensajeUsuario || typeof mensajeUsuario !== "string") {
    return res.status(400).json({ error: "Mensaje inválido del usuario" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("Falta API Key");

    let mensajesContexto = [
      {
        role: "system",
        content: `Eres una IA empática y amable. Responde en español, de forma cercana, natural y breve. Estás hablando con alguien que se siente '${mood}'. Adapta tu tono a su estado de ánimo.`
      }
    ];

    if (Array.isArray(historial)) {
      const historialRecortado = historial.slice(-10);
      historialRecortado.forEach(m => {
        mensajesContexto.push({
          role: m.sender === "usuario" ? "user" : "assistant",
          content: m.texto
        });
      });
    }

    mensajesContexto.push({ role: "user", content: mensajeUsuario });

    const totalPalabras = mensajesContexto.reduce((acc, msg) => acc + msg.content.split(" ").length, 0);
    const limitePalabras = 1200;

    if (totalPalabras > limitePalabras) {
      const resumenPrompt = mensajesContexto
        .filter(m => m.role !== "system")
        .map(m => `${m.role === "user" ? "Usuario" : "IA"}: ${m.content}`)
        .join("\n");

      const resumenRespuesta = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Resume brevemente esta conversación en español, manteniendo el contexto emocional." },
          { role: "user", content: resumenPrompt }
        ],
        max_tokens: 150,
        temperature: 0.5
      });

      const resumen = resumenRespuesta.choices[0].message.content.trim();

      mensajesContexto = [
        {
          role: "system",
          content: `Eres una IA empática. Estás continuando una conversación que hasta ahora ha sido esta: \"${resumen}\"`
        },
        {
          role: "user",
          content: mensajeUsuario
        }
      ];
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: mensajesContexto,
      max_tokens: 120,
      temperature: 0.8
    });

    const respuesta = completion.choices[0].message.content.trim();
    res.json({ mensaje: respuesta });

  } catch (err) {
    console.warn("⚠️ Error en /api/chat-openai:", err.message);
    res.status(500).json({ mensaje: fallbackMensajePorMood(mood) });
  }
});

// Endpoint IA adaptado a Hugging Face
app.post("/api/mood-response-hf", async (req, res) => {
  const { mood } = req.body;
  console.log(`💬 Hugging Face - Mood recibido: ${mood}`);

  try {
    if (!process.env.HF_API_KEY) throw new Error("Falta API Key");

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `Dame una respuesta breve, simpática y cercana en español para alguien que se siente ${mood}. Sugiere si necesita algo de forma amable y natural. No expliques este texto.`
      })
    });

	// Verificar si la API devuelve un error
    const data = await response.json();
    const raw = data?.[0]?.generated_text || "";
    
    // Filtrar el prompt del input en caso de que se haya repetido en la respuesta
    const cleaned = raw.replace(/.*Dame.*texto\./i, "").trim();
    res.json({ mensaje: cleaned || fallbackMensajePorMood(mood) });
    
    // Crear la expresión regular dinámicamente con el mood
    // const promptPattern = new RegExp(`.*Dame una respuesta breve, simpática y cercana en español para alguien que se siente ${mood}. Sugiere si necesita algo de forma amable y natural. No expliques este texto.*`, "i");

    // Filtrar el prompt del input en caso de que se haya repetido en la respuesta
    // const filteredMessage = mensaje.replace(promptPattern, "").trim();

    // res.json({ mensaje: filteredMessage });


  } catch (err) {
    console.warn("⚠️ Error con Hugging Face:", err.message);
    res.json({ mensaje: fallbackMensajePorMood(mood) });
  }
});

// Endpoint IA adaptado a DeepAI
app.post("/api/mood-response-deepai", async (req, res) => {
  const { mood } = req.body;
  console.log(`🤖 DeepAI - Mood recibido: ${mood}`);

  try {
    if (!process.env.DEEP_AI_API_KEY) throw new Error("Falta API Key");

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
    const mensaje = data.output?.trim() || "";
    res.json({ mensaje: mensaje || fallbackMensajePorMood(mood) });

  } catch (err) {
    console.warn("⚠️ Error con DeepAI:", err.message);
    res.json({ mensaje: fallbackMensajePorMood(mood) });
  }
});

// Resumen emocional con fallback si no hay IA
app.post("/api/analisis-emocional", async (req, res) => {
  const { historial } = req.body;

  if (!historial || !Array.isArray(historial) || historial.length === 0) {
    return res.status(400).json({ mensaje: "Historial inválido o vacío" });
  }

  // Formatear historial como texto
  const resumenHistorial = historial.map(entry => {
    const fecha = new Date(entry.fecha).toLocaleDateString("es-ES");
    return `• El ${fecha} te sentiste ${entry.mood}${entry.comentario ? ` y comentaste: "${entry.comentario}"` : ""}.`;
  }).join("\n");

  const prompt = `Este es el historial emocional de un usuario:\n${resumenHistorial}\n\nGenera un párrafo breve y empático que resuma cómo se ha sentido últimamente. Usa un tono cercano, reconfortante y en español. Puedes hacer una pequeña sugerencia positiva si es necesario, pero sin dar lecciones.`;

  try {
    //  Primero intenta con OpenAI
    if (process.env.OPENAI_API_KEY) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un asistente empático que ofrece resúmenes emocionales en español." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.75
      });

      const mensaje = completion.choices[0].message.content.trim();
      return res.json({ mensaje });
    }

    // Luego intenta con Hugging Face
    if (process.env.HF_API_KEY) {
      const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      });

      const data = await response.json();
      const raw = data?.[0]?.generated_text || "";
      const cleaned = raw.replace(/.*historial.*\n?/i, "").trim();
      return res.json({ mensaje: cleaned || "Aquí tienes un pequeño resumen de tus emociones recientes." });
    }

    // 🔸 Luego intenta con DeepAI
    if (process.env.DEEP_AI_API_KEY) {
      const response = await fetch("https://api.deepai.org/api/text-generator", {
        method: "POST",
        headers: {
          "Api-Key": process.env.DEEP_AI_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ text: prompt })
      });

      const data = await response.json();
      const mensaje = data.output?.trim();
      return res.json({ mensaje: mensaje || "Aquí tienes un pequeño resumen de tus emociones recientes." });
    }

    throw new Error("No hay proveedor IA disponible");
  } catch (err) {
    console.warn("⚠️ Fallback resumen emocional - sin IA:", err.message);

    // Fallback local: análisis básico del mood más repetido
    const conteo = historial.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});
    const moodMasRepetido = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

    const mensajeAlternativo = `Últimamente, te has sentido principalmente "${moodMasRepetido}". Recuerda que está bien sentirte así y que cada día es una nueva oportunidad para cuidarte. 💚`;
    res.json({ mensaje: mensajeAlternativo });
  }
});


// Lanzar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor del Mood Tracker activo en http://localhost:${PORT}`);
});
