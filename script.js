let attempts = 0; // Contador para realizar el seguimiento de los intentos
let mood = null; // Estado de ánimo

// Sonidos para cada estado de ánimo
const happySound = new Audio('sounds/happy.mp3');
const sadSound = new Audio('sounds/sad.mp3');
const anxiousSound = new Audio('sounds/anxious.mp3');
const relaxedSound = new Audio('sounds/relaxed.mp3');
const warningSound = new Audio('sounds/warning.mp3');

// Función para detener cualquier sonido que esté en reproducción
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

    history.push({
        mood: mood,
        icon: moodIcon,
        colorClass: moodColor,
        comment: moodComment || "", // Guardar comentario si existe
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


let isSoundEnabled = true; // Verificar si los sonidos están habilitados
let isParticlesEnabled = true; // Variable para controlar el fondo animado

// Asegurarse de que el checkbox de sonidos y fondo animado esté disponible
document.addEventListener('DOMContentLoaded', function () {
    // Control de sonido
    const soundToggle = document.getElementById('sound-toggle');
    soundToggle.addEventListener("change", function () {
        const isChecked = this.checked;
        isSoundEnabled = isChecked;
        if (isChecked) {
            // Reproduce el sonido correspondiente al estado actual
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

    // Establecer el volumen inicial al 40% y actualizar sonidos
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

    // Si los sonidos están habilitados, reproducir el sonido de clic al interactuar con el formulario
    if (isSoundEnabled && mood !== "") {
        stopCurrentSound(); // Detener cualquier sonido anterior
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

        // Detener cualquier sonido anterior antes de reproducir uno nuevo
        stopCurrentSound();

        // Aplicar la clase correspondiente según el estado seleccionado y reproducir el sonido adecuado
        // Y cambio de efectos de partículas según el estado de ánimo
        if (mood === "feliz") {
            document.body.classList.add("feliz");
            if (isSoundEnabled) happySound.play();
            moodIcon.textContent = "😃";

            config.particles.move.speed = 4; // Más rápido
        } else if (mood === "triste") {
            document.body.classList.add("triste");
            if (isSoundEnabled) sadSound.play();
            moodIcon.textContent = "😢";

            config.particles.opacity.value = 0.3; // Más opaco
        } else if (mood === "ansioso") {
            document.body.classList.add("ansioso");
            if (isSoundEnabled) anxiousSound.play();
            moodIcon.textContent = "😰";

            config.particles.move.speed = 5; // Movimiento más rápido
        } else if (mood === "relajado") {
            document.body.classList.add("relajado");
            if (isSoundEnabled) relaxedSound.play();
            moodIcon.textContent = "😌";

            config.particles.move.speed = 1; // Movimiento más lento
        }

        // Deshabilitar la opción "Selecciona un estado"
        moodSelect.querySelector('option[value=""]').disabled = true;
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

