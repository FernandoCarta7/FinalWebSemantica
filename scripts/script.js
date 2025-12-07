// Simulación de la comunicación con el Agente Semántico y de
// Personalización (servidor) con soporte básico de localización
const semanticAgent = {
    adaptContent: async (elements, userProfile) => {
        const lang = (userProfile && userProfile.language) ? userProfile.language : 'es';
        console.log("Simulando adaptación de contenido por Agente Semántico (lang=", lang, ")...");
        console.log("Elementos a analizar:", elements);
        console.log("Perfil de usuario:", userProfile);

        const messages = {
            es: {
                adaptedFromTo: (from, to, condition) => `Adaptado desde ${from} a ${to} para ${condition}.`,
                barAdapted: (label, to, condition) => `Barra ${label} adaptada a ${to} para ${condition}.`,
                imageAdapted: (from, to, condition) => `Imagen adaptada desde ${from} a ${to} para ${condition}.`
            },
            en: {
                adaptedFromTo: (from, to, condition) => `Adapted from ${from} to ${to} for ${condition}.`,
                barAdapted: (label, to, condition) => `Bar ${label} adapted to ${to} for ${condition}.`,
                imageAdapted: (from, to, condition) => `Image adapted from ${from} to ${to} for ${condition}.`
            }
        };

        const colorNameMap = {
            es: { green: 'verde', brown: 'marrón', magenta: 'magenta', purple: 'púrpura', pink: 'rosa', orange: 'naranja', red: 'rojo', blue: 'azul' },
            en: { green: 'green', brown: 'brown', magenta: 'magenta', purple: 'purple', pink: 'pink', orange: 'orange', red: 'red', blue: 'blue' }
        };

        function colorIncludes(element, keyword) {
            const cname = (element.colorName || '').toString().toLowerCase();
            const oc = (element.originalColor || '').toString().toLowerCase();
            return cname.includes(keyword) || oc.includes(keyword) || oc === keyword;
        }

        const simulatedResponse = { adaptedElements: [] };

        elements.forEach(element => {
            let adaptedColor = element.originalColor || null;
            let adaptedLabel = null;
            let description = element.colorName || (lang === 'en' ? 'A visual element' : 'Un elemento visual');
            const type = element.type || 'unknown';
            const M = messages[lang] || messages['es'];
            const colorNames = colorNameMap[lang] || colorNameMap['es'];

            if (userProfile.daltonismType === 'protanopia') {
                if (colorIncludes(element, 'rojo') || colorIncludes(element, '#ff6347') || colorIncludes(element, 'ff0000')) {
                    adaptedColor = '#00FF00';
                    adaptedLabel = colorNames.green;
                    description = M.adaptedFromTo(element.colorName || colorNames.red, adaptedLabel, 'protanopia');
                } else if (type === 'chart-bar' && colorIncludes(element, '#ff6347')) {
                    adaptedColor = '#A52A2A';
                    adaptedLabel = colorNames.brown;
                    description = M.barAdapted(element.label || '', adaptedLabel, 'protanopia');
                }
            } else if (userProfile.daltonismType === 'deuteranopia') {
                if (colorIncludes(element, 'verde') || colorIncludes(element, '#3cb371') || colorIncludes(element, '#00ff00')) {
                    adaptedColor = '#FF00FF';
                    adaptedLabel = colorNames.magenta;
                    description = M.adaptedFromTo(element.colorName || colorNames.green, adaptedLabel, 'deuteranopia');
                } else if (type === 'chart-bar' && colorIncludes(element, '#3cb371')) {
                    adaptedColor = '#800080';
                    adaptedLabel = colorNames.purple;
                    description = M.barAdapted(element.label || '', adaptedLabel, 'deuteranopia');
                }
            } else if (userProfile.daltonismType === 'tritanopia') {
                if (colorIncludes(element, 'azul') || colorIncludes(element, '#4682b4') || colorIncludes(element, '#0000ff')) {
                    adaptedColor = '#FFC0CB';
                    adaptedLabel = colorNames.pink;
                    description = M.adaptedFromTo(element.colorName || colorNames.blue, adaptedLabel, 'tritanopia');
                } else if (type === 'chart-bar' && colorIncludes(element, '#4682b4')) {
                    adaptedColor = '#FFA500';
                    adaptedLabel = colorNames.orange;
                    description = M.barAdapted(element.label || '', adaptedLabel, 'tritanopia');
                }
            }

            const semanticMetadata = {
                "@context": "http://schema.org",
                "@type": "VisualElement",
                "colorInterpretation": `Adaptado para ${userProfile.daltonismType}`,
                "originalColor": element.originalColor || null,
                "adaptedColor": adaptedColor,
                "adaptedLabel": adaptedLabel || null,
                "description": description
            };

            simulatedResponse.adaptedElements.push({
                id: element.id,
                type: type,
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
    const applyAdaptationButton =
        document.getElementById('applyAdaptation');
    const langSelect = document.getElementById('langSelect');
    const contentArea = document.getElementById('content');
    // Función para añadir descripciones visuales
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
    // Función para quitar descripciones visuales
    function removeVisualDescription(element) {
        let descSpan = element.nextElementSibling;
        if (descSpan && descSpan.classList.contains('color-description')) {
            descSpan.remove();
        }
    }
    // Aplicar traducciones iniciales
    if (window.SimpleI18n && typeof window.SimpleI18n.applyTranslations === 'function') {
        const initialLang = (langSelect && langSelect.value) ? langSelect.value : 'es';
        window.SimpleI18n.applyTranslations(initialLang);
    }

    if (langSelect) {
        langSelect.addEventListener('change', () => {
            const newLang = langSelect.value || 'es';
            if (window.SimpleI18n && typeof window.SimpleI18n.applyTranslations === 'function') {
                window.SimpleI18n.applyTranslations(newLang);
            }
        });
    }

    applyAdaptationButton.addEventListener('click', async () => {
        const selectedDaltonismType = daltonismTypeSelect.value;
        const selectedLang = (langSelect && langSelect.value) ? langSelect.value : 'es';
        // Resetear adaptaciones previas
        contentArea.querySelectorAll('[data-adapted-color]').forEach(el => {
            if (el.dataset.originalColor) {
                el.style.backgroundColor = el.dataset.originalColor;
            }
            delete el.dataset.adaptedColor;
            removeVisualDescription(el);
        });
        contentArea.querySelectorAll('.image-gallery img').forEach(img => {
            img.style.filter = 'none'; // Quitar filtros CSS si se aplicaron
            if (img.dataset.originalColor) {
                // no-op for now; images typically don't have backgroundColor
            }
            removeVisualDescription(img);
        });
        if (selectedDaltonismType === 'none') {
            console.log("No se aplica adaptación.");
            return;
        }
        const userProfile = {
            daltonismType: selectedDaltonismType,
            language: selectedLang,
            preferences: {
                contrastLevel: 'high', // Ejemplo, se obtendría del perfil de usuario
                fontSize: 'medium'
            }
        };
        const elementsToAnalyze = [];
        // 1. Recolectar bloques de color
        document.querySelectorAll('.color-block').forEach(block => {
            const oc = getComputedStyle(block).backgroundColor;
            block.dataset.originalColor = oc; // Guardar para reset
            elementsToAnalyze.push({
                id: block.id,
                type: 'color-block',
                originalColor: oc,
                colorName: block.dataset.colorName || null
            });
        });
        // 2. Recolectar barras del gráfico
        document.querySelectorAll('#salesChart .bar').forEach(bar => {
            // Asegurarse de que la barra tenga un id estable
            if (!bar.id && bar.dataset.label) bar.id = `bar-${bar.dataset.label}`;
            // data-original-color ya existe en el HTML; asegurar copia a dataset
            if (bar.dataset.originalColor) bar.dataset.originalColor = bar.dataset.originalColor;
            elementsToAnalyze.push({
                id: bar.id,
                type: 'chart-bar',
                originalColor: bar.dataset.originalColor || null,
                label: bar.dataset.label || null
            });
        });
        // 3. Recolectar imágenes
        document.querySelectorAll('.image-gallery img').forEach(img => {

            // Guardar referencia visual simple si hace falta
            img.dataset.originalColor = img.dataset.originalColor || '';
            elementsToAnalyze.push({
                id: img.id,
                type: 'image',
                src: img.src,
                alt: img.alt,
                colorName: img.dataset.colorName || null
            });
        });
        // Simular la llamada al Agente Semántico del servidor
        const adaptationResponse = await
            semanticAgent.adaptContent(elementsToAnalyze, userProfile);
        // Aplicar las adaptaciones recibidas
        adaptationResponse.adaptedElements.forEach(adapted => {
            const element = document.getElementById(adapted.id);
            if (!element) return;
            if (adapted.type === 'image') {
                // Aplicar un filtro CSS de ejemplo para imágenes
                element.style.filter = `sepia(20%) saturate(120%)`;
                if (adapted.adaptedColor) element.dataset.adaptedColor = adapted.adaptedColor;
                addVisualDescription(element, adapted.description);
            } else if (adapted.type === 'chart-bar' || adapted.type === 'color-block') {
                if (adapted.adaptedColor) {
                    element.style.backgroundColor = adapted.adaptedColor;
                    element.dataset.adaptedColor = adapted.adaptedColor;
                }
                addVisualDescription(element, adapted.description);
            } else {
                // Por defecto, intentar aplicar color si existe
                if (adapted.adaptedColor) {
                    element.style.backgroundColor = adapted.adaptedColor;
                    element.dataset.adaptedColor = adapted.adaptedColor;
                    addVisualDescription(element, adapted.description);
                }
            }
            console.log(`Elemento ${adapted.id} adaptado:`, adapted.semanticMetadata);
        });
        // Actualizar la leyenda del gráfico si es necesario
        updateChartLegend(adaptationResponse.adaptedElements, selectedDaltonismType);

        // Aquí podrías añadir un SVG con filtros de color para aplicar a elementos generales
        // Esto sería más complejo, pero es una forma avanzada de adaptar
        visualmente.
            createSVGColorFilters(selectedDaltonismType);
    });
    function updateChartLegend(adaptedElements, daltonismType) {
        const chartLegend = document.getElementById('chartLegend');
        chartLegend.innerHTML = ''; // Limpiar leyenda actual
        const barElements = document.querySelectorAll('#salesChart .bar');
        barElements.forEach(bar => {
            const originalLabel = bar.dataset.label || bar.id || '';
            const adaptedData = adaptedElements.find(ae => ae.id === bar.id);
            let labelText = originalLabel;
            if (adaptedData && adaptedData.semanticMetadata && daltonismType !== 'none') {
                const sm = adaptedData.semanticMetadata;
                labelText = `${originalLabel} (${sm.originalColor || '--'} -> ${sm.adaptedColor || '--'})`;
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
    // --- Integración con SemanticDescriber: generar descripción textual del gráfico ---
    function generateChartData() {
        const points = [];
        document.querySelectorAll('#salesChart .bar').forEach(bar => {
            const label = bar.dataset.label || bar.id || '';
            let value = 0;
            if (bar.style && bar.style.height) {
                // altura en px -> número
                value = parseFloat(bar.style.height) || 0;
            } else {
                value = bar.clientHeight || 0;
            }
            points.push({ label: label, value: value });
        });
        return points;
    }

    const ontology = {
        seriesNameTranslations: { es: 'Ventas trimestrales', en: 'Quarterly sales' },
        conceptTranslations: { es: 'Ventas', en: 'Sales' },
        unit: 'px'
    };
    const genDescBtn = document.getElementById('gen-desc');
    const descriptionDiv = document.getElementById('description');
    if (genDescBtn && descriptionDiv) {
        genDescBtn.addEventListener('click', () => {
            const data = generateChartData();
            const selectedLang = (document.getElementById('langSelect') || {}).value || 'es';
            // Construir ontología localizada para el describer
            const localizedOntology = {
                seriesName: ontology.seriesNameTranslations[selectedLang] || ontology.seriesNameTranslations['es'],
                concept: ontology.conceptTranslations[selectedLang] || ontology.conceptTranslations['es'],
                unit: ontology.unit
            };
            let desc = selectedLang === 'en' ? 'Could not generate description.' : 'No se pudo generar la descripción.';
            if (window.SemanticDescriber && typeof window.SemanticDescriber.generateDescription === 'function') {
                desc = window.SemanticDescriber.generateDescription(data, localizedOntology, selectedLang);
            }
            descriptionDiv.textContent = desc;
        });
    }
});