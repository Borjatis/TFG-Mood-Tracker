# 🎭 Mood Tracker - Seguimiento emocional interactivo mediante IA generativa

Este es un proyecto de seguimiento del estado de ánimo que adapta su interfaz visual y sonora según la emoción seleccionada. Incluye una interfaz adaptativa, historial emocional, integración con IA generativa y servidor Node.js para proteger las claves y manejar las peticiones.

---

## 🌟 Características principales

- 🌈 Interfaz personalizada según el estado de ánimo
- 🔊 Interacción por voz (entrada y salida)
- 🗓️ Historial de emociones con comentarios
- 📊 Gráfico con la evolución de las emociones
- 🤖 Conexión con IA generativa (OpenAI)
- 🔧 Panel de configuración personalizable
- 🛡️ Servidor Node.js para proteger claves privadas (OpenAI)

---

## 📦 Requisitos para usarlo

Antes de empezar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión recomendada: 18 o superior)
- [Npm](https://www.npmjs.com/) (se instala automáticamente con Node.js)
- Una cuenta de [OpenAI](https://platform.openai.com/) para obtener tu propia API Key


---

## 🚀 Cómo ejecutar el proyecto en local

### 1. Clona este repositorio 
Abre la terminal (o Git Bash) y ejecuta:

    ```bash
    git clone https://github.com/Borjatis/TFG-Mood-Tracker.git
    cd TFG-Mood-Tracker


### 2. Instala las dependencias
En la misma terminal introduce:
    npm install
    Esto descargará automáticamente todos los paquetes necesarios (guardados en package.json).


### 3. Crea el archivo .env con tu clave de la IA
El proyecto usa un archivo .env para proteger claves privadas. Crea uno en la raíz del servidor o del proyecto con este contenido:
    HF_API_KEY=tu_clave_de_ia_aquí
    PORT=3000

Aquí tienes algunos enlaces donde puedes registrarte para obtener claves API de distintas IA generativas:
- OpenAI (ChatGPT, GPT-4, DALL·E, Whisper):
    https://platform.openai.com/signup

- Hugging Face (Modelos Transformers y Spaces):
    https://huggingface.co/settings/tokens

- Azure AI (OpenAI Service, Cognitive Services):
    https://portal.azure.com/ (buscar "OpenAI" o "Cognitive Services")

- Google Cloud AI (Vertex AI, PaLM, Speech-to-Text):
    https://console.cloud.google.com/apis/credentials

- IBM Watson (NLP, Speech-to-Text, Visual Recognition):
    https://cloud.ibm.com/apikeys

- AssemblyAI (Transcripción de voz a texto):
    https://app.assemblyai.com/signup

- DeepAI (Imagen, texto, traducción, etc.):
    https://deepai.org/api-key

- Eleven Labs (Generación de voz realista):
    https://elevenlabs.io/sign-up


#### 🧪 ¿No tienes clave de OpenAI? Usa el modo de prueba
Si no dispones de una clave de OpenAI, puedes probar la app igualmente gracias a un modo de simulación.

🔄 Instrucciones:

- Abre el archivo: /server/public/js/script.js
- En él encontraras un apartado al final, en el que pone: CÓDIGO A COMENTAR EN CASO DE NO DISPONER DE UNA CLAVE API
- Comenta ese código o borralo
- Tambien encontraras otro apartado donde pone: CÓDIGO A DESCOMENTAR EN CASO DE NO DISPONER DE UNA CLAVE API
- Descomenta ese código

⚠️ Importante: Nunca tengas las dos funciones activas a la vez. Solo debe existir una función llamada generarMensajeIA.

De esta manera, cuando selecciones un estado de ánimo, recibirás un mensaje predefinido en lugar de una respuesta generada por IA.


### 4. Ejecuta el servidor
    cd server
    node server.js

O si tienes un script start definido en package.json, puedes usar:
    npm start


### 5. Abre la aplicación en tu navegador
    http://localhost:3000


¡Y listo! Ya puedes empezar a usar el Mood Tracker 🎉


✍️ Autor
    Borja, Estudiante de Ingeniería de Telecomunicaciones – Especialidad Audiovisual

    TFG: Mood Tracker con interacción adaptativa mediante IA generativa

¡Gracias por probar el proyecto! Si tienes sugerencias o encuentras algún fallo, puedes abrir un issue en este repositorio o contactar conmigo.