const semanticAgent = {
    // Esto sería una llamada a una API real en un proyecto completo
    adaptContent: async (elements, userProfile) => {
        console.log("Simulando adaptación de contenido por Agente Semántico...");
        console.log("Elementos a analizar:", elements);
        console.log("Perfil de usuario:", userProfile);
        // Aquí iría la lógica para enviar los elementos al servidor,
        // el servidor procesaría con ontologías y metadatos,
        // y devolvería las adaptaciones.
        // Datos de ejemplo simulados que el servidor devolvería
        const simulatedResponse = {
            adaptedElements: []
        };
        // Lógica de adaptación muy simplificada para demostración
        elements.forEach(element => {
            let adaptedColor = element.originalColor;
            let description = element.colorName || "Un elemento visual";
            // Descripción por defecto
            if (userProfile.daltonismType === 'protanopia') {
                if (element.originalColor === 'red') {
                    adaptedColor = '#00FF00'; // Simular rojo adaptado a
                    verde
                    description = `Un bloque que originalmente era rojo, ahora adaptado a verde para protanopia.`;
                } else if (element.originalColor === '#FF6347') { //
                    Tomate
                    adaptedColor = '#A52A2A'; // Simular un cambio a un tono más marrón para protanopia
                    description = `Barra Q1 (originalmente rojo  anaranjado), ahora adaptado a marrón.`;
                }
            } else if (userProfile.daltonismType === 'deuteranopia') {
                if (element.originalColor === 'green') {
                    adaptedColor = '#FF00FF'; // Simular verde adaptado a magenta
                    description = `Un bloque que originalmente era verde, ahora adaptado a magenta para deuteranopia.`;

                } else if (element.originalColor === '#3CB371') { //Verde mar
                    adaptedColor = '#800080'; // Simular un cambio a púrpura para deuteranopia
                    description = `Barra Q3 (originalmente verde), ahora adaptado a púrpura.`;
                }
            } else if (userProfile.daltonismType === 'tritanopia') {
                if (element.originalColor === 'blue') {
                    adaptedColor = '#FFC0CB'; // Simular azul adaptado a rosa
                    description = `Un bloque que originalmente era azul, ahora adaptado a rosa para tritanopia.`;
                } else if (element.originalColor === '#4682B4') { // Azul acero
                    adaptedColor = '#FFA500'; // Simular un cambio a naranja para tritanopia
                    description = `Barra Q2 (originalmente azul), ahora adaptado a naranja.`;
                }
            }


            // Añadir metadatos semánticos simulados
            const semanticMetadata = {
                "@context": "http://schema.org",
                "@type": "VisualElement",
                "colorInterpretation": `Adaptado para
                ${userProfile.daltonismType}.`,
                "originalColorHex": element.originalColor,
                "adaptedColorHex": adaptedColor,
                "description": description
            };
            simulatedResponse.adaptedElements.push({
                id: element.id,
                adaptedColor: adaptedColor,
                description: description,
                semanticMetadata: semanticMetadata
            });
        });
        return simulatedResponse;
    }
};

// Agente Local (JavaScript en el navegador)
document.addEventListener('DOMContentLoaded', () => {
    const daltonismTypeSelect = document.getElementById('daltonismType');
    const applyAdaptationButton = document.getElementById('applyAdaptation');
    const contentArea = document.getElementById('content');

    // ---- AL CARGAR LA PAGINA RECUPERA LA ULTIMA PREFERENCIA DEL USUARIO ----
    const storedPreference = localStorage.getItem('daltonismPreference');
    if (storedPreference) {
        daltonismTypeSelect.value = storedPreference;
        console.log(`Preferencia de daltonismo cargada: ${storedPreference}`);
    }

    // Función para añadir descripciones visuales
    function addVisualDescription(element, description) {
        let descSpan = element.nextElementSibling;
        if (!descSpan || !descSpan.classList.contains('colordescription')) {
            descSpan = document.createElement('span');
            descSpan.classList.add('color-description');
            element.parentNode.insertBefore(descSpan,
                element.nextSibling);
        }
        descSpan.textContent = description;
        descSpan.style.opacity = '1'; // Asegurar que la descripción sea
        visible
    }
    // Función para quitar descripciones visuales
    function removeVisualDescription(element) {
        let descSpan = element.nextElementSibling;
        if (descSpan && descSpan.classList.contains('color-description')) {
            descSpan.remove();
        }
    }
    applyAdaptationButton.addEventListener('click', async () => {
        const selectedDaltonismType = daltonismTypeSelect.value;

        // ----- GUARDAR SELECCION EN LOCALSTORAGE PARA APRENDIZAJE DEL USUARIO -----
        localStorage.setItem('daltonismPreference', selectedDaltonismType);

        // Resetear adaptaciones previas
        contentArea.querySelectorAll('[data-adapted-color]').forEach(el => {
            el.style.backgroundColor = el.dataset.originalColor;
            delete el.dataset.adaptedColor;
            removeVisualDescription(el);
        });
        contentArea.querySelectorAll('.adapted-textdescription').forEach(el => el.remove());
        contentArea.querySelectorAll('.image-gallery img').forEach(img => {

            img.style.filter = 'none'; // Quitar filtros CSS si se aplicaron
            removeVisualDescription(img);
        });
        if (selectedDaltonismType === 'none') {
            console.log("No se aplica adaptación.");
            return;
        }
        const userProfile = {
            daltonismType: selectedDaltonismType,
            preferences: {
                contrastLevel: 'high', // Ejemplo, se obtendría del perfil de usuario
                fontSize: 'medium'
            }
        };
    // --- DETECCIÓN AUTOMÁTICA DE ELEMENTOS CON COLOR ---
    function detectarElementosConColor() {
        const elementosDetectados = []; // Lista donde se almacenarán todos los elementos visuales detectados

        // --- 1. DETECTAR ELEMENTOS CON COLOR DE FONDO ---
        document.querySelectorAll('*').forEach(el => { // Recorre TODOS los elementos del DOM
            const style = getComputedStyle(el);        // Obtiene el estilo computado del elemento
            const bg = style.backgroundColor;          // Extrae su color de fondo actual

            // Se descartan colores irrelevantes: transparentes, invisibles o blancos
            if (
                bg !== "rgba(0, 0, 0, 0)" &&
                bg !== "transparent" &&
                bg !== "rgb(255, 255, 255)"
            ) {
                elementosDetectados.push({
                    id: el.id || (`elem-${Math.random().toString(36).substr(2, 9)}`), // Si no tiene ID, se genera uno único
                    type: "color-element",                // Se marca como un elemento con color
                    originalColor: bg,                    // Se guarda su color original
                    colorName: el.dataset.colorName || "Elemento con color detectado" // Si tiene un nombre definido, se guarda (opcional)
                });
            }
        });

        // --- 2. DETECTAR IMÁGENES ---
        document.querySelectorAll("img").forEach(img => { // Recorre todas las etiquetas <img>
            elementosDetectados.push({
                id: img.id || `img-${Math.random().toString(36).substr(2, 9)}`, // Genera ID si no tiene
                type: "image",                          // Se marca como imagen
                src: img.src,                           // Guarda la URL de la imagen
                alt: img.alt,                           // Guarda el texto alternativo
                colorName: img.dataset.colorName || "Imagen detectada" // Se extrae nombre si está definido
            });
        });

        // --- 3. DETECTAR BARRAS DE GRÁFICO ---
        document.querySelectorAll(".bar").forEach(bar => { // Busca todas las barras con clase .bar (gráfico)
            elementosDetectados.push({
                id: bar.id || `bar-${bar.dataset.label}`, // Usa ID o genera uno con la etiqueta del dato
                type: "chart-bar",                        // Marca como barra de gráfico
                originalColor: bar.dataset.originalColor || getComputedStyle(bar).backgroundColor, // Usa color original definido o lo extrae directamente
                label: bar.dataset.label                  // Guarda la etiqueta (Q1, Q2, etc.)
            });
        });

        return elementosDetectados; // Devuelve el array completo de elementos encontrados
    }

    // Llama a la función y guarda los elementos detectados
    const elementsToAnalyze = detectarElementosConColor();

    // Muestra en consola todos los elementos detectados
    console.log("Elementos detectados automáticamente:", elementsToAnalyze);
    // --- FIN DE LA DETECCIÓN AUTOMÁTICA DE ELEMENTOS CON COLOR ---

        // Simular la llamada al Agente Semántico del servidor
        const adaptationResponse = await
            semanticAgent.adaptContent(elementsToAnalyze, userProfile);
        // Aplicar las adaptaciones recibidas
        adaptationResponse.adaptedElements.forEach(adapted => {
            const element = document.getElementById(adapted.id);
            if (element) {
                if (adapted.type === 'image') {
                    // Ejemplo: Aplicar filtro CSS o cambiar src por una imagen adaptada
                    // Para una implementación real, el servidor podría devolver un 'adaptedSrc'
                    // o un filtro SVG complejo. Aquí solo aplicamos un filtro básico.
                    element.style.filter = `sepia(100%) hue-rotate(90deg)
saturate(200%)`; // Filtro genérico de ejemplo
                    addVisualDescription(element, adapted.description);
                } else {
                    // Adaptar color de fondo
                    element.style.backgroundColor = adapted.adaptedColor;
                    element.dataset.adaptedColor = adapted.adaptedColor;
                    // Guardar el color adaptado
                    // Añadir descripción textual junto al elemento
                    addVisualDescription(element, adapted.description);
                }
                console.log(`Elemento ${adapted.id} adaptado:`,
                    adapted.semanticMetadata);
            }
        });
        // Actualizar la leyenda del gráfico si es necesario
        updateChartLegend(adaptationResponse.adaptedElements,
            selectedDaltonismType);

        // Aquí podrías añadir un SVG con filtros de color para aplicar a elementos generales
        // Esto sería más complejo, pero es una forma avanzada de adaptar
        visualmente.
            createSVGColorFilters(selectedDaltonismType);
    });
    function updateChartLegend(adaptedElements, daltonismType) {
        const chartLegend = document.getElementById('chartLegend');
        chartLegend.innerHTML = ''; // Limpiar leyenda actual
        const barElements = document.querySelectorAll('.data-chart.bar');
        barElements.forEach(bar => {
            const originalLabel = bar.dataset.label;
            const adaptedData = adaptedElements.find(ae => ae.id ===
                `bar-${originalLabel}`); // Buscar por ID construido
            let labelText = originalLabel;
            if (adaptedData && adaptedData.semanticMetadata &&
                daltonismType !== 'none') {
                // Si hay metadatos, usar la descripción adaptada o parte de ella
                labelText = `${originalLabel}
(${adaptedData.semanticMetadata.originalColorHex} ->
${adaptedData.semanticMetadata.adaptedColorHex})`;
            }
            const span = document.createElement('span');
            span.textContent = labelText;
            chartLegend.appendChild(span);
        });
    }
    function createSVGColorFilters(daltonismType) {
        // Esta es una demostración de cómo se podrían añadir filtros SVG.
        // En una implementación real, estos filtros serían mucho más complejos
        // y se basarían en matrices de transformación de color específicas para cada tipo de daltonismo.
        let svgFilters = document.getElementById('svgFilters');
        if (!svgFilters) {
            svgFilters =
                document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgFilters.setAttribute("width", "0");

            svgFilters.setAttribute("height", "0");
            svgFilters.setAttribute("style", "position: absolute;");
            svgFilters.id = "svgFilters";
            document.body.appendChild(svgFilters);
        }
        svgFilters.innerHTML = ''; // Limpiar filtros anteriores
        let filter =
            document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", daltonismType);
        let feColorMatrix =
            document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
        feColorMatrix.setAttribute("type", "matrix");
        // Matrices de ejemplo (simples, no son científicamente precisas para daltonismo)
        let matrix = "";
        if (daltonismType === 'protanopia') {
            matrix = "0.567 0.433 0 0 0 " +
                "0.558 0.442 0 0 0 " +
                "0 0 1 0 0 " +
                "0 0 0 1 0 ";
        } else if (daltonismType === 'deuteranopia') {
            matrix = "0.625 0.375 0 0 0 " +
                "0.7 0.3 0 0 0 " +
                "0 0 1 0 0 " +
                "0 0 0 1 0 ";
        } else if (daltonismType === 'tritanopia') {
            matrix = "1 0 0 0 0 " +
                "0 1 0 0 0 " +
                "0 0.083 0.917 0 0 " +
                "0 0 0 1 0 ";
        }
        feColorMatrix.setAttribute("values", matrix);
        filter.appendChild(feColorMatrix);
        svgFilters.appendChild(filter);
        // Aplicar el filtro a un elemento contenedor principal si se desea una adaptación global
        // Por ahora, lo aplicaremos a elementos individuales vía JS paramayor control.
    }
});