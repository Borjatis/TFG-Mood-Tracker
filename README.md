# 🎭 Mood Tracker - Seguimiento emocional interactivo mediante IA generativa

Este es un proyecto de seguimiento del estado de ánimo que adapta su interfaz visual y sonora según la emoción seleccionada. Incluye una interfaz adaptativa, historial emocional, integración con IA generativa y servidor Node.js para proteger las claves y manejar las peticiones.

---

## 🌟 Características principales

- 🌈 Interfaz personalizada según el estado de ánimo
- 🔊 Interacción por voz (entrada y salida)
- 🗓️ Historial de emociones con comentarios
- 📊 Gráfico con la evolución de las emociones
- 🤖 Conexión con IA generativa (OpenAI o Hugging Face o DeepAI)
- 🔧 Panel de configuración personalizable
- 🛡️ Servidor Node.js para proteger claves privadas (OpenAI)

---

## 📦 Requisitos para usarlo

Antes de empezar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión recomendada: 18 o superior)
- [Npm](https://www.npmjs.com/) (se instala automáticamente con Node.js)


---

## 🚀 Cómo ejecutar el proyecto en local

### 1. Clona este repositorio 
Abre la terminal (o Git Bash) y ejecuta:

    ```bash
    git clone https://github.com/Borjatis/TFG-Mood-Tracker.git
    cd TFG-Mood-Tracker
    cd server


### 2. Instala las dependencias
En la misma terminal introduce:

    npm install

Esto descargará automáticamente todos los paquetes necesarios (guardados en package.json).


### 3. Crea el archivo .env con tu clave de la IA
El proyecto usa un archivo .env para proteger claves privadas. Crea uno en la raíz del servidor o del proyecto con tu IA utilizada en cada caso:

    HF_API_KEY=tu_clave_api_huggingface
    OPENAI_API_KEY=tu_clave_api_openai
    DEEP_AI_API_KEY=tu_clave_api_deepai

Aquí tienes algunos enlaces donde puedes registrarte para obtener claves API de distintas IA generativas:
- OpenAI (Recomendado para mantener un flujo conversacional más natural y coherente):
    https://platform.openai.com/account/api-keys

- Hugging Face (Ideal para respuestas simples y contextuales en español):
    https://huggingface.co/settings/tokens

- DeepAI (Sencillo y rápido, ideal para respuestas cortas y directas):
    https://deepai.org/


#### 🧪 ¿No dispones de ninguna clave API? Usa el modo de prueba
Si no dispones de una clave API de cualquiera de las IA generativas, puedes probar la app igualmente gracias a un modo de simulación.


### 4. Ejecuta el servidor
    cd server
    node server.js

O si tienes un script start definido en package.json, puedes usar:

    npm start


### 5. Abre la aplicación en tu navegador
    http://localhost:3000


#### ¡Y listo! Ya puedes empezar a usar el Mood Tracker 🎉



🛑 Si deseas detener el servidor local, puedes hacerlo de la siguiente manera:
    Presiona Ctrl + C en la terminal donde esté ejecutándose el servidor.
    Esto finalizará el proceso y el servidor dejará de estar activo.

---

### ✍️ *Autor*

*Borja*  
*Estudiante de Ingeniería de Telecomunicaciones – Especialidad en Audiovisual*

**TFG**: *Mood Tracker con interacción adaptativa mediante IA generativa*

---

¡Gracias por probar el proyecto!  
Si tienes sugerencias o encuentras algún fallo, no dudes en [abrir un issue](#) en este repositorio o contactar conmigo directamente.
