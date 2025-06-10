let attempts = 0; // Contador para realizar el seguimiento de los intentos
let mood = null; // Estado de ánimo

//Función para saber que se ha aceptado la Politica de Privacidad
function privacidadAceptada() {
    const lastAccepted = localStorage.getItem('privacyAcceptedAt');
    const oneDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    return lastAccepted && now - parseInt(lastAccepted) <= oneDay;
}

// Logica para la capa de bloqueo
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('privacy-modal');
    const checkbox = document.getElementById('accept-checkbox');
    const button = document.getElementById('accept-button');
    const blocker = document.getElementById('ui-blocker');

    const oneDay = 24 * 60 * 60 * 1000;
    const lastAccepted = localStorage.getItem('privacyAcceptedAt');
    const now = Date.now();

    if (!lastAccepted || now - parseInt(lastAccepted) > oneDay) {
        modal.classList.remove('hidden');
        blocker.classList.remove('hidden');

        checkbox.addEventListener('change', () => {
        button.disabled = !checkbox.checked;
        });

        button.addEventListener('click', () => {
        localStorage.setItem('privacyAcceptedAt', Date.now());
        modal.classList.add('hidden');
        blocker.classList.add('hidden');
        });
    }
});
  
// Audiciones para cada estado de ánimo
const happySound = new Audio('sounds/happy.mp3');
const sadSound = new Audio('sounds/sad.mp3');
const anxiousSound = new Audio('sounds/anxious.mp3');
const relaxedSound = new Audio('sounds/relaxed.mp3');
const warningSound = new Audio('sounds/warning.mp3');

// Función para detener cualquier audición que esté en reproducción
function stopCurrentSound() {
    happySound.pause();
    sadSound.pause();
    anxiousSound.pause();
    relaxedSound.pause();
    happySound.currentTime = 0;
    sadSound.currentTime = 0;
    anxiousSound.currentTime = 0;
    relaxedSound.currentTime = 0;
}

// Función para manejar la vibración en dispositivos móviles
function vibrateOnMoodChange(mood) {
    if ("vibrate" in navigator) {
        switch (mood) {
            case "feliz":
                navigator.vibrate([200, 100, 200]); // Vibración corta con pausa
                break;
            case "triste":
                navigator.vibrate(500); // Vibración larga
                break;
            case "ansioso":
                navigator.vibrate([300, 100, 300, 100, 300]); // Vibraciones repetitivas
                break;
            case "relajado":
                navigator.vibrate(100); // Vibración leve
                break;
            default:
                navigator.vibrate(0); // Sin vibración
        }
    }
}

// Definir iconos por estado de ánimo
const moodIcons = {
    "feliz": "😃",
    "triste": "😢",
    "ansioso": "😰",
    "relajado": "😌"
};

//HISTORIAL
// Función para guardar el estado de ánimo y comentario en el historial
function saveMoodToHistory(mood) {
    let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
    
    const moodComment = document.getElementById("mood-comment").value.trim(); // Obtener comentario
    const moodIcon = moodIcons[mood] || "❓";
    const moodColor = mood === "feliz" ? "mood-happy" :
                      mood === "triste" ? "mood-sad" :
                      mood === "ansioso" ? "mood-anxious" : "mood-relaxed";
    
    // Nuevo campo para almacenar el mensaje de la IA
    let iaMessage = "";

    // Si hay un mensaje generado por la IA, guardarlo
    if (mood) {
        iaMessage = localStorage.getItem('iaMessage') || ""; // Obtener mensaje de IA del localStorage
    }

    history.push({
        mood: mood,
        icon: moodIcon,
        colorClass: moodColor,
        comment: moodComment || "", // Guardar comentario si existe
        iaMessage: iaMessage, // Guardar mensaje generado por la IA
        date: new Date().toLocaleString()
    });

    localStorage.setItem("moodHistory", JSON.stringify(history));
    updateMoodHistoryUI();

    // Limpiar el campo de comentario después de guardar
    document.getElementById("mood-comment").value = "";
}

// Función para actualizar la interfaz del historial
function updateMoodHistoryUI() {
    const historyContainer = document.getElementById("mood-history");
    if (!historyContainer) return;

    let history = JSON.parse(localStorage.getItem("moodHistory")) || [];

    if (!Array.isArray(history)) {
        history = [];
        localStorage.setItem("moodHistory", JSON.stringify(history));
    }

    let groupedHistory = {};

    history.forEach(entry => {
        let date = entry.date.split(",")[0]; // Solo la fecha sin la hora
        if (!groupedHistory[date]) {
            groupedHistory[date] = [];
        }
        groupedHistory[date].push(entry);
    });

    historyContainer.innerHTML = Object.keys(groupedHistory).map(date => {
        return `<h3>📅 ${date}</h3>` + groupedHistory[date]
            .map(entry => {
                let commentHTML = entry.comment ? `<br><em>✍ ${entry.comment}</em>` : "";
                return `<p class="${entry.colorClass}">${entry.icon} ${entry.date.split(',')[1]} - ${entry.mood}${commentHTML}</p>`;
            })
            .join("");
    }).join("<hr>");
}

// Función para limpiar el historial
document.addEventListener("DOMContentLoaded", function () {
    const clearHistoryBtn = document.getElementById("clear-history");
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", function () {
            localStorage.removeItem("moodHistory");
            updateMoodHistoryUI();
        });
    }
    updateMoodHistoryUI();
});

// Funcion para descargar historial de estados de ánimo en formatos estándar como CSV o JSON
function exportarJSON() {
    const historial = JSON.parse(localStorage.getItem("moodHistory")) || [];
    if (historial.length === 0) {
      alert('El historial está vacío. No hay datos para exportar.');
      return;
    }
  
    const dataStr = JSON.stringify(historial, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_emocional.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  
  function exportarCSV() {
    const historial = JSON.parse(localStorage.getItem("moodHistory")) || [];
    if (historial.length === 0) {
      alert('El historial está vacío. No hay datos para exportar.');
      return;
    }
  
    const encabezados = ['fecha', 'estado', 'comentario', 'mensaje_IA'];
    const filas = historial.map(e =>
      encabezados.map(key => {
        if (key === 'fecha') return `"${e.date || ''}"`;
        if (key === 'estado') return `"${e.mood || ''}"`;
        if (key === 'comentario') return `"${(e.comment || '').replace(/"/g, '""')}"`;
        if (key === 'mensaje_IA') return `"${(e.iaMessage || '').replace(/"/g, '""')}"`;
        return '""';
      }).join(',')
    );
  
    const csvContent = [encabezados.join(','), ...filas].join('\r\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_emocional.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  
  // Conectar botones con funciones exportar
  document.addEventListener('DOMContentLoaded', () => {
    const btnJSON = document.getElementById('export-json-btn');
    const btnCSV = document.getElementById('export-csv-btn');
  
    btnJSON.addEventListener('click', exportarJSON);
    btnCSV.addEventListener('click', exportarCSV);
  });
  
  

let isSoundEnabled = true; // Verificar si las audiciones están habilitados
let isParticlesEnabled = true; // Variable para controlar el fondo animado

// Asegurarse de que el checkbox de audiciones y fondo animado esté disponible
document.addEventListener('DOMContentLoaded', function () {
    // Activar bucles para que las audiciones se repitan automáticamente
    happySound.loop = true;
    sadSound.loop = true;
    anxiousSound.loop = true;
    relaxedSound.loop = true;
    
    // Control de audición
    const soundToggle = document.getElementById('sound-toggle');
    soundToggle.addEventListener("change", function () {
        const isChecked = this.checked;
        isSoundEnabled = isChecked;
        if (isChecked) {
            // Reproduce la audición correspondiente al estado actual
            if (mood === "feliz") happySound.play();
            else if (mood === "triste") sadSound.play();
            else if (mood === "ansioso") anxiousSound.play();
            else if (mood === "relajado") relaxedSound.play();
        } else {
            stopCurrentSound();
        }
    });

    // Control de fondo animado
    const particlesToggle = document.getElementById('background-toggle');
    particlesToggle.addEventListener("change", function () {
        isParticlesEnabled = this.checked;
        aplicarFondoAnimado();
    });

    //// CONTROL DEL VOLUMEN
    const volumeSlider = document.getElementById('volume-slider');
    const volumeLevel = document.getElementById('volume-level');

    // Establecer el volumen inicial al 40% y actualizar audiciones
    const setVolume = (volume) => {
        volumeLevel.textContent = `${Math.round(volume * 100)}%`;
        [happySound, sadSound, anxiousSound, relaxedSound, warningSound].forEach(sound => sound.volume = volume);
    };

    // Volumen inicial al 40%
    setVolume(0.4);
    volumeSlider.value = 0.4;

    // Control del volumen con el slider
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => setVolume(volumeSlider.value));
    }
});

document.getElementById('mood-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Evitar que se recargue la página al enviar el formulario

    mood = document.getElementById('mood').value;
    const warning = document.getElementById('warning');
    const warning2 = document.getElementById('warning2');
    const warning3 = document.getElementById('warning3');
    const moodSelect = document.getElementById('mood');
    const moodIcon = document.getElementById("mood-icon");

    // Si las audiciones están habilitadas, reproducir el sonido de clic al interactuar con el formulario
    if (isSoundEnabled && mood !== "") {
        stopCurrentSound(); // Detener cualquier audición anterior
    }

    // Guardar en el historial
    if (mood) {
        saveMoodToHistory(mood);
    }

    // Activar vibración según el estado de ánimo seleccionado
    vibrateOnMoodChange(mood);

    // Evitar que se envíe el formulario si no se ha seleccionado un estado
    if (!mood) {
        if (attempts === 0) {
            warning.style.display = 'block';
            warning.textContent = "¡Vamos, no seas tímido! Elige un estado de ánimo 😄";
            if (isSoundEnabled) warningSound.play(); // Reproducir sonido de advertencia
        } else if (attempts === 1) {
            warning.style.display = 'none';
            warning2.style.display = 'block';
            if (isSoundEnabled) warningSound.play();
        } else if (attempts === 2) {
            warning2.style.display = 'none';
            warning3.style.display = 'block';
            document.getElementById('mood').value = "triste";
            moodSelect.querySelector('option[value=""]').disabled = true;
            attempts++;
            return;
        }
        attempts++;
    } else {
        // Ocultar las advertencias
        warning.style.display = 'none'; 
        warning2.style.display = 'none'; 
        warning3.style.display = 'none'; 

        // Limpiar cualquier clase de estado de ánimo anterior
        document.body.classList.remove("feliz", "triste", "ansioso", "relajado");

        // Detener cualquier audición anterior antes de reproducir uno nuevo
        stopCurrentSound();

        // Aplicar la clase correspondiente según el estado seleccionado, reproducir la audición adecuada
        // Y cambio de efectos de partículas según el estado de ánimo
        if (mood === "feliz") {
            document.body.classList.add("feliz");
            if (isSoundEnabled) happySound.play();
            moodIcon.textContent = "😃";

            config.particles.move.speed = 4;
        
        } else if (mood === "triste") {
            document.body.classList.add("triste");
            if (isSoundEnabled) sadSound.play();
            moodIcon.textContent = "😢";

            config.particles.opacity.value = 0.3;
        
        } else if (mood === "ansioso") {
            document.body.classList.add("ansioso");
            if (isSoundEnabled) anxiousSound.play();
            moodIcon.textContent = "😰";

            config.particles.move.speed = 5;
        
        } else if (mood === "relajado") {
            document.body.classList.add("relajado");
            if (isSoundEnabled) relaxedSound.play();
            moodIcon.textContent = "😌";

            config.particles.move.speed = 1;
        }
        

        // Deshabilitar la opción "Selecciona un estado"
        moodSelect.querySelector('option[value=""]').disabled = true;

        // Habilita el chat IA tras elegir un estado de ánimo
        onMoodSelected(mood);
    }
    
    aplicarFondoAnimado();
});

// CONFIGURACIÓN PARTICULAS DEL FONDO ANIMADO
// Configuración inicial de partículas
let config = {
    particles: {
        number: { value: 100 }, // Número de partículas
        size: { value: 3 }, // Tamaño de partículas
        move: { speed: 2 }, // Velocidad de movimiento
        opacity: { value: 0.7 }, // Opacidad de partículas
        line_linked: { enable: true }, // Desactivar líneas entre partículas
        //color: { value: "#ffffff" }, // Color de partículas
        //shape: { type: "circle", stroke: { width: 1, color: "#000000" } }, // Partículas circulares con borde negro
    }
};

// Activar o desactivar el fondo de partículas
function aplicarFondoAnimado() {
    const particlesContainer = document.getElementById("particles-js");

    // Elimina el canvas anterior si existe (reinicia partículas)
    if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom[0].pJS.fn.vendors.destroypJS();
        window.pJSDom = [];
    }

    if (isParticlesEnabled) {
        particlesContainer.style.display = "block";
        particlesJS('particles-js', config);
    } else {
        particlesContainer.style.display = "none";
    }
}

// CONFIGURACIÓN DEL GRÁFICO
// Cargar historial y actualizar gráfico
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('moodChart');
    if (!ctx) {
        console.error("No se encontró el elemento #moodChart");
        return;
    }

    const moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: "Evolución emocional",
                data: [], // Datos de los estados de ánimo
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: 'black', // Color de la leyenda
                        font: {
                            size: 20     // Tamaño de fuente de la leyenda
                        }
                    }
                },
                tooltip: {
                    enabled: false // 🔹 Oculta los tooltips al pasar el mouse
                }
            },
            scales: {
                x: {
                    display: false // Oculta el eje X
                },
                y: {
                    ticks: {
                        color: 'black', // Color del texto de las etiquetas
                        font: {
                            size: 16     // Tamaño del texto de las etiquetas
                        },
                        callback: function(value) {
                            const moods = ["Triste", "Ansioso", "Relajado", "Feliz"];
                            return moods[value] || "";
                        },
                        stepSize: 1, // Asegura que solo se muestren los valores enteros
                        min: 0,
                        max: 3,
                        padding: 30 // Aumenta el espacio entre las etiquetas y el gráfico
                    }
                }
            }
        }
    });    

    // Mapeo de estados de ánimo a valores numéricos
    const moodValues = {
        "feliz": 3,
        "relajado": 2,
        "ansioso": 1,
        "triste": 0
    };

    // Función para cargar historial desde localStorage y actualizar gráfico
    function loadMoodHistory() {
        let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
        
        // Asegurarse de que el historial sea un array
        if (!Array.isArray(history)) {
            history = [];
            localStorage.setItem("moodHistory", JSON.stringify(history));
        }

        // Vaciar los datos actuales del gráfico
        moodChart.data.labels = [];
        moodChart.data.datasets[0].data = [];

        // Añadir los datos del historial al gráfico
        history.forEach(entry => {
            const time = new Date(entry.date).toLocaleTimeString(); // Usamos la hora
            moodChart.data.labels.push(time); // Etiqueta de tiempo
            moodChart.data.datasets[0].data.push(moodValues[entry.mood] || 0); // Datos de estado de ánimo
        });

        moodChart.update(); // Actualizar el gráfico
    }

    // Llamar a la función para cargar el historial cuando se carga la página
    loadMoodHistory();

    // Función para actualizar el gráfico con nuevos datos (usada al guardar un nuevo estado de ánimo)
    function updateMoodChart(mood) {
        if (!moodValues.hasOwnProperty(mood)) {
            console.warn("Estado de ánimo no válido:", mood);
            return;
        }

        const now = new Date().toLocaleTimeString(); // Hora actual
        moodChart.data.labels.push(now); // Etiqueta de tiempo
        moodChart.data.datasets[0].data.push(moodValues[mood]); // Datos de estado de ánimo

        // Actualizar gráfico
        moodChart.update();
    }

    // Modificar la función que guarda estados de ánimo para actualizar el gráfico
    document.getElementById('mood-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const mood = document.getElementById('mood').value;
        if (mood) {
            updateMoodChart(mood);
        }
    });
});


// INTEGRACIÓN DE IA GENERATIVA
let voiceEnabled = true; // Voz de la IA activada por defecto
const historialChat = []; // Aquí se acumularán los mensajes del usuario e IA
let estadoSeleccionado = null;

// Elementos DOM que se usan en varias funciones
const input = document.getElementById("user-input");
const sendButton = document.querySelector("#chat-form button");
const chatMessages = document.getElementById('chat-messages');
const voiceButton = document.getElementById('voice-button');

// Desactivar el input y los botones del chat hasta que se seleccione el estado de ánimo
input.disabled = true;
sendButton.disabled = true;
voiceButton.disabled = true;

// Mostrar mensaje inicial una vez al día
document.addEventListener("DOMContentLoaded", () => {
    if (!privacidadAceptada()) return;
    
    const lastShownDate = localStorage.getItem("lastMoodPromptDate");
    const today = new Date().toLocaleDateString("es-ES");

    if (lastShownDate !== today) {
        const mensajeInicial = "Recuerda que puedes registrar tu estado de ánimo cada día para recibir apoyo personalizado 😊";
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            const message = document.createElement('div');
            message.classList.add('chat-message', 'ia');
            message.textContent = mensajeInicial;
            chatMessages.appendChild(message);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Que también lo diga en voz alta si está activado
            speak(mensajeInicial);
        }

        // Guardar fecha actual para no volver a mostrar hoy
        localStorage.setItem("lastMoodPromptDate", today);

        // Obtener historial y convertir al formato esperado por el backend
        const rawHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];

        const historial = rawHistory.map(entry => ({
            date: entry.date,
            mood: entry.mood,
            comment: entry.comment
        }));

        // Solo si hay al menos 2 registros, generar resumen emocional
        if (historial.length >= 2) {
            fetch("/api/analisis-emocional", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ historial })
            })
            .then(res => {
                if (!res.ok) throw new Error("Error en la respuesta del servidor");
                return res.json();
            })
            .then(data => {
                const chatMessages = document.getElementById('chat-messages');
                if (data.mensaje && chatMessages) {
                    const resumen = document.createElement('div');
                    resumen.classList.add('chat-message', 'ia');
                    resumen.textContent = data.mensaje;
                    chatMessages.appendChild(resumen);
                    chatMessages.scrollTop = chatMessages.scrollHeight;

                    speak(data.mensaje);
                } else {
                    throw new Error("Respuesta sin mensaje");
                }
            })
            .catch(err => {
                console.error("❌ Error al generar resumen emocional:", err);
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) {
                    const errorMsg = document.createElement('div');
                    errorMsg.classList.add('chat-message', 'ia');
                    errorMsg.textContent = "Lo siento, ahora mismo no puedo responder 😕";
                    chatMessages.appendChild(errorMsg);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    speak("Lo siento, ahora mismo no puedo responder");
                }
            });
        }
    }
});


// Control del interruptor de voz de la IA
document.getElementById('voice-toggle')?.addEventListener('change', (e) => {
    voiceEnabled = e.target.checked;
});

// Función para que la IA hable en voz alta 
function speak(text) {
    if (!voiceEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    speechSynthesis.speak(utterance);
}

// Reconocimiento de voz del usuario
const recognition = window.SpeechRecognition || window.webkitSpeechRecognition
   ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
   : null;

if (recognition) {
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    voiceButton.addEventListener('click', () => {
        recognition.start();
        voiceButton.disabled = true;
        voiceButton.textContent = "🎙️...";
    });

    recognition.addEventListener('result', (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        input.dispatchEvent(new Event('input')); // Para activar el botón de enviar
    });

    recognition.addEventListener('end', () => {
        voiceButton.disabled = false;
        voiceButton.textContent = "🎤";
    });

    recognition.addEventListener('error', (e) => {
        console.error("Error de reconocimiento de voz:", e.error);
        voiceButton.disabled = false;
        voiceButton.textContent = "🎤";
    });
} else {
    voiceButton.style.display = "none";
    console.warn("Reconocimiento de voz no compatible con este navegador.");
}

// SELECTOR DE IA
// IA Seleccionada local storage
const iaProvider = localStorage.getItem("iaProvider") || "hf";
document.getElementById("iaProviderSelect").value = iaProvider;

document.getElementById("iaProviderSelect").addEventListener("change", (e) => {
    localStorage.setItem("iaProvider", e.target.value);
});

// Cargar valor guardado en localStorage (si existe)
document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("iaProviderSelect");
    const saved = localStorage.getItem("iaProvider");

    if (saved && (saved === "openai" || saved === "hf" || saved === "deepai")) {
        select.value = saved;
    }

    // Guardar en localStorage cuando el usuario cambia de proveedor
    select.addEventListener("change", () => {
    localStorage.setItem("iaProvider", select.value);
    });
});


// Añadir mensajes al contenedor de chat
function addMessage(sender, text) {
    if (sender === "ia" && !privacidadAceptada()) return;

    const message = document.createElement('div');
    message.classList.add('chat-message', sender);
    message.textContent = text;
    chatMessages.appendChild(message);

    // Desplazar hacia abajo en caso de scroll
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Guardar en el historial
    const role = sender === "user" ? "user" : "assistant";
    historialChat.push({ role, content: text });

    // Solo leer si se indica
    if (sender === "ia" && speak) {
        speak(text);
    }
}

// Enviar mensaje del usuario y recibir respuesta IA
async function enviarMensaje() {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    addMessage("user", userMessage);
    sendButton.disabled = true;

    // Enfoque en el chat
    input.value = "";
    input.focus();

    // Seleccionar proveedor (igual que en generarMensajeIA)
    const iaProvider = document.getElementById("iaProviderSelect")?.value || "hf";
    if (iaProvider === "openai") {
        const historialFormateado = historialChat.map(msg => ({
        sender: msg.role === "user" ? "usuario" : "ia",
        texto: msg.content
        }));

        try {
            const res = await fetch("/api/chat-openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                historial: historialFormateado,
                mensajeUsuario: userMessage,
                mood: estadoSeleccionado
                })
            });

            const data = await res.json();
            const iaReply = data.mensaje || "Lo siento, ahora mismo no puedo responder 😕";
            
            addMessage("ia", iaReply);

        } catch (err) {
            console.error("❌ Error con OpenAI:", err);
            addMessage("ia", "Ocurrió un error al contactar con OpenAI 🙈");
        } finally {
            sendButton.disabled = false;
        }
    } else {
        // Proveedores Hugging Face o DeepAI
        const endpoint = iaProvider === "deepai"
        ? "/api/mood-response-deepai"
        : "/api/mood-response-hf";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mood: userMessage })
            });

            const data = await res.json();
            const iaReply = data.mensaje || "Lo siento, ahora mismo no puedo responder 😕";
            addMessage("ia", iaReply);

        } catch (err) {
            console.error("❌ Error al obtener respuesta de la IA:", err);
            addMessage("ia", "Ocurrió un error al contactar con la IA 🙈");
        } finally {
            sendButton.disabled = false;
        }
    }
}

// Al seleccionar un estado de ánimo
function onMoodSelected(mood) {
    estadoSeleccionado = mood;
    // Activar input y micro, pero mantener botón desactivado hasta que se escriba algo
    input.disabled = false;
    sendButton.disabled = true;
    voiceButton.disabled = false;

    // Scroll automático con enfoque en el chat
    input.focus();
    setTimeout(() => {
        window.scrollBy({ top: -250, behavior: "smooth" });
    }, 100);

    // Añadir mensaje inicial como IA en el chat (solo si aún no está)
    if (!chatMessages.querySelector('.chat-message.ia')) {
        addMessage("ia", "¡Hola! ¿Cómo te sientes hoy? 😊");
    }

    // Añadir el estado de ánimo como mensaje del usuario
    addMessage("user", `Me siento ${mood}`);

    // Mostrar recomendación adaptativa usando funciones auxiliares
    cargarRecomendaciones().then(recomendaciones => {
        const recomendacion = obtenerRecomendacion(mood, recomendaciones);
        mostrarRecomendacion(recomendacion);
    });

    // Generar respuesta IA adaptativa, por si no se quisiera mostrar la recomendación primero
    //generarMensajeIA(mood);
}

// Función para cargar recomendaciones desde JSON externo
async function cargarRecomendaciones() {
    const res = await fetch("recomendaciones.json");
    return await res.json();
}

// Función para seleccionar recomendación
function obtenerRecomendacion(mood, recomendaciones) {
    const opciones = recomendaciones[mood];
    if (!opciones || opciones.length === 0) return null;

    //Elige aleatoriamente una recomendacion del array json
    const randomIndex = Math.floor(Math.random() * opciones.length);
    return opciones[randomIndex];
}

// Función para mostrar recomendación y permitir seguir chateando
function mostrarRecomendacion(recomendacion) {
    if (recomendacion) {
        // Añadir el mensaje principal
        addMessage("ia", recomendacion.mensaje);

        // Añadir el recurso como enlace clicable (si lo hay)
        if (recomendacion.recurso) {
            const linkElement = document.createElement("a");
            linkElement.href = recomendacion.recurso;
            linkElement.target = "_blank";
            linkElement.rel = "noopener noreferrer";
            linkElement.textContent = "Enlace";
            linkElement.classList.add("chat-link");

            const wrapper = document.createElement("div");
            wrapper.classList.add("chat-message", "ia");
            wrapper.appendChild(linkElement);

            chatMessages.appendChild(wrapper);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

// Prevenir envío con Enter si input desactivado o vacío
document.getElementById("chat-form").addEventListener("submit", function(e) {
    e.preventDefault();
    if (!input.disabled && input.value.trim() !== "") {
        enviarMensaje();
    }
});

// Deshabilitar botón Enviar si el input está vacío
input.addEventListener("input", () => {
    sendButton.disabled = input.value.trim() === "";
});


// Esto genera automáticamente un mensaje IA al seleccionar el estado de ánimo
function generarMensajeIA(mood) {
    const iaProvider = document.getElementById("iaProviderSelect")?.value || "hf"; // Default: Hugging Face
    const endpoint = iaProvider === "openai"
        ? "http://localhost:3000/api/mood-response-openai"
        : "http://localhost:3000/api/mood-response-hf";

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
    })
    .then(res => res.json())
    .then(data => {
        const mensaje = data.mensaje || "No he podido generar un mensaje ahora mismo 😕";

        // Guardar mensaje en localStorage
        localStorage.setItem('iaMessage', mensaje);

        // Mostrar en el chat adaptativo
        addMessage("ia", mensaje);

        // Mostrar también en el mensaje grande animado (si existe)
        const mensajeElemento = document.getElementById('mensajeIATexto');
        const mensajeContenedor = document.getElementById('mensajeIA');
        if (mensajeElemento && mensajeContenedor) {
            mensajeElemento.innerHTML = mensaje;
            mensajeContenedor.classList.add('visible');
        }
    })
    .catch(err => {
        console.error("Error al generar mensaje:", err);

        const fallback = "No he podido generar un mensaje ahora mismo 😕";
        localStorage.setItem('iaMessage', fallback);
        addMessage("ia", fallback);

        const mensajeElemento = document.getElementById('mensajeIATexto');
        const mensajeContenedor = document.getElementById('mensajeIA');
        if (mensajeElemento && mensajeContenedor) {
            mensajeElemento.innerHTML = fallback;
            mensajeContenedor.classList.add('visible');
        }
    });
}
