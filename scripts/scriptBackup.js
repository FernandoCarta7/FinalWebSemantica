


// ======================================================
//   AGENTE SEMÁNTICO (Simulado - tu versión original)
// ======================================================

const semanticAgent = {

    adaptContent: async (elements, userProfile) => {

        console.log("Simulando adaptación de contenido por Agente Semántico...");
        const simulatedResponse = { adaptedElements: [] };

        function colorIncludes(element, keyword) {
            const cname = (element.colorName || '').toLowerCase();
            const oc = (element.originalColor || '').toLowerCase();
            return cname.includes(keyword) || oc.includes(keyword) || oc === keyword;
        }

        elements.forEach(element => {

            let adaptedColor = element.originalColor || null;
            let description = element.colorName || 'Un elemento visual';
            const type = element.type || 'unknown';

            // ===========================================
            // 1. Aplicar APRENDIZAJE antes de reglas
            // ===========================================
            if (element.learnedAdaptation) {
                adaptedColor = element.learnedAdaptation;
                description = `Adaptación aprendida por preferencias del usuario.`;
            }

            // ===========================================
            // 2. Adaptación basada en daltonismo
            // ===========================================
            if (!element.learnedAdaptation) {

                if (userProfile.daltonismType === 'protanopia') {
                    if (colorIncludes(element, 'rojo') || colorIncludes(element, '#ff6347')) {
                        adaptedColor = '#00FF00';
                        description = `Adaptado desde rojo a verde para protanopia.`;
                    }
                }

                else if (userProfile.daltonismType === 'deuteranopia') {
                    if (colorIncludes(element, 'verde') || colorIncludes(element, '#3cb371')) {
                        adaptedColor = '#FF00FF';
                        description = `Adaptado desde verde a magenta para deuteranopia.`;
                    }
                }

                else if (userProfile.daltonismType === 'tritanopia') {
                    if (colorIncludes(element, 'azul') || colorIncludes(element, '#4682b4')) {
                        adaptedColor = '#FFC0CB';
                        description = `Adaptado desde azul a rosa para tritanopia.`;
                    }
                }
            }

            simulatedResponse.adaptedElements.push({
                id: element.id,
                type: type,
                originalColor: element.originalColor,
                adaptedColor: adaptedColor,
                description: description,
                semanticMetadata: {
                    "@context": "http://schema.org",
                    "@type": "VisualElement",
                    "originalColor": element.originalColor,
                    "adaptedColor": adaptedColor,
                    "colorInterpretation": `Adaptado para ${userProfile.daltonismType}`,
                    "description": description
                }
            });

        });

        return simulatedResponse;
    }
};



// ======================================================
//       GOOGLE VISION API - ANÁLISIS DE IMÁGENES
// ======================================================

async function analyzeImageWithVisionAPI(imageUrl) {
    try {
        const resp = await fetch("http://localhost:3000/analyze-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl })
        });

        if (!resp.ok) {
            console.warn("Vision API error:", resp.status);
            return null;
        }

        const data = await resp.json();
        console.log("Vision API response:", data);
        return data;

    } catch (err) {
        console.error("Vision API call failed:", err);
        return null;
    }
}



// ================================================
//            AGENTE LOCAL (FRONTEND)
// ================================================

document.addEventListener('DOMContentLoaded', () => {

    const daltonismTypeSelect = document.getElementById('daltonismType');
    const applyAdaptationButton = document.getElementById('applyAdaptation');
    const contentArea = document.getElementById('content');


    // ===========================================
    //  CARGA PERFIL APRENDIDO
    // ===========================================
    const savedProfile = personalizationAgent.loadUserProfile();
    if (savedProfile) {
        daltonismTypeSelect.value = savedProfile.daltonismType;
    }


    function addVisualDescription(element, description) {
        let descSpan = element.nextElementSibling;
        if (!descSpan || !descSpan.classList.contains('color-description')) {
            descSpan = document.createElement('span');
            descSpan.classList.add('color-description');
            element.parentNode.insertBefore(descSpan, element.nextSibling);
        }
        descSpan.textContent = description;
        descSpan.style.opacity = '1';
    }

    function removeVisualDescription(element) {
        let descSpan = element.nextElementSibling;
        if (descSpan && descSpan.classList.contains('color-description')) {
            descSpan.remove();
        }
    }


    // ====================================================
    //          APLICAR ADAPTACIÓN
    // ====================================================
    applyAdaptationButton.addEventListener('click', async () => {

        const selectedDaltonismType = daltonismTypeSelect.value;

        personalizationAgent.saveUserProfile({
            daltonismType: selectedDaltonismType,
            preferences: { contrastLevel: 'high', fontSize: 'medium' }
        });


        contentArea.querySelectorAll('[data-adapted-color]').forEach(el => {
            if (el.dataset.originalColor) {
                el.style.backgroundColor = el.dataset.originalColor;
            }
            delete el.dataset.adaptedColor;
            removeVisualDescription(el);
        });

        contentArea.querySelectorAll('.image-gallery img').forEach(img => {
            img.style.filter = 'none';
            removeVisualDescription(img);
        });


        if (selectedDaltonismType === 'none') return;


        const userProfile = {
            daltonismType: selectedDaltonismType,
            preferences: { contrastLevel: 'high', fontSize: 'medium' }
        };


        const elementsToAnalyze = [];

        // ===========================================
        // BLOQUES DE COLOR
        // ===========================================
        document.querySelectorAll('.color-block').forEach(block => {

            const oc = getComputedStyle(block).backgroundColor;
            block.dataset.originalColor = oc;

            elementsToAnalyze.push({
                id: block.id,
                type: "color-block",
                originalColor: oc,
                colorName: block.dataset.colorName,
                learnedAdaptation: personalizationAgent.getLearnedCorrection(oc)
            });

        });


        // ===========================================
        // BARRAS DE GRÁFICO
        // ===========================================
        document.querySelectorAll('#salesChart .bar').forEach(bar => {

            if (!bar.id && bar.dataset.label) {
                bar.id = `bar-${bar.dataset.label}`;
            }

            elementsToAnalyze.push({
                id: bar.id,
                type: "chart-bar",
                originalColor: bar.dataset.originalColor,
                label: bar.dataset.label,
                learnedAdaptation: personalizationAgent.getLearnedCorrection(
                    bar.dataset.originalColor
                )
            });

        });


        // ===========================================
        // IMÁGENES + GOOGLE VISION
        // ===========================================

        const imagePromises = [];

        document.querySelectorAll('.image-gallery img').forEach(img => {

            const elObj = {
                id: img.id,
                type: "image",
                src: img.src,
                alt: img.alt,
                colorName: img.dataset.colorName,
                learnedAdaptation: null
            };

            const p = analyzeImageWithVisionAPI(img.src)
                .then(data => {
                    elObj.semanticData = data;
                    elementsToAnalyze.push(elObj);
                })
                .catch(() => {
                    elObj.semanticData = null;
                    elementsToAnalyze.push(elObj);
                });

            imagePromises.push(p);
        });

        await Promise.all(imagePromises);



        // ====================================================
        //      APLICAR RESPUESTA DEL AGENTE SEMÁNTICO
        // ====================================================
        const adaptationResponse = await semanticAgent.adaptContent(elementsToAnalyze, userProfile);


        adaptationResponse.adaptedElements.forEach(adapted => {

            const element = document.getElementById(adapted.id);
            if (!element) return;

            if (adapted.type === "image") {
                element.style.filter = "sepia(20%) saturate(120%)";
                addVisualDescription(element, adapted.description);
            }

            else {

                if (adapted.adaptedColor) {
                    element.style.backgroundColor = adapted.adaptedColor;
                    element.dataset.adaptedColor = adapted.adaptedColor;
                }

                addVisualDescription(element, adapted.description);

                if (adapted.originalColor && adapted.adaptedColor) {
                    personalizationAgent.learnColorCorrection(
                        adapted.originalColor,
                        adapted.adaptedColor
                    );
                }
            }

        });

        updateChartLegend(adaptationResponse.adaptedElements, selectedDaltonismType);
        createSVGColorFilters(selectedDaltonismType);

    });


    // ===========================================
    // LEYENDA
    // ===========================================
    function updateChartLegend(adaptedElements, daltonismType) {

        const legend = document.getElementById('chartLegend');
        legend.innerHTML = "";

        document.querySelectorAll('#salesChart .bar').forEach(bar => {

            const span = document.createElement('span');
            const ae = adaptedElements.find(e => e.id === bar.id);

            if (ae && daltonismType !== 'none') {
                span.textContent = `${bar.dataset.label} (${ae.semanticMetadata.originalColor} -> ${ae.semanticMetadata.adaptedColor})`;
            } else {
                span.textContent = bar.dataset.label;
            }

            legend.appendChild(span);
        });

    }


    // ===========================================
    // FILTROS SVG
    // ===========================================
    function createSVGColorFilters(daltonismType) {

        let svgFilters = document.getElementById("svgFilters");

        if (!svgFilters) {
            svgFilters = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgFilters.id = "svgFilters";
            svgFilters.style.position = "absolute";
            svgFilters.style.width = "0";
            svgFilters.style.height = "0";
            document.body.appendChild(svgFilters);
        }

        svgFilters.innerHTML = "";

        let filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", daltonismType);

        let matrix = "";
        if (daltonismType === "protanopia") {
            matrix = "0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0 1 0 0  0 0 0 1 0";
        }
        else if (daltonismType === "deuteranopia") {
            matrix = "0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0 1 0 0  0 0 0 1 0";
        }
        else if (daltonismType === "tritanopia") {
            matrix = "1 0 0 0 0  0 1 0 0 0  0 0.083 0.917 0 0  0 0 0 1 0";
        }

        let fe = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
        fe.setAttribute("type", "matrix");
        fe.setAttribute("values", matrix);

        filter.appendChild(fe);
        svgFilters.appendChild(filter);
    }

});
