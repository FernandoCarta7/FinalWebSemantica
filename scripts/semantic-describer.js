// Módulo browser-friendly para generar descripciones semánticas en español
(function () {
    function summarizeNumbers(values) {
        const n = values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = n ? sum / n : 0;
        const max = values.length ? Math.max(...values) : 0;
        const min = values.length ? Math.min(...values) : 0;
        return { n, sum, mean, max, min };
    }

    function detectTrend(values) {
        if (values.length < 2) return 'estable';
        const first = values[0], last = values[values.length - 1];
        const denom = Math.max(Math.abs(first), 1);
        const change = (last - first) / denom;
        if (change > 0.05) return 'sube';
        if (change < -0.05) return 'baja';
        return 'estable';
    }

    function findPeaks(points) {
        const values = points.map(p => Number(p.value));
        if (!values.length) return { peaks: [], drops: [] };
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const peaks = points.filter(p => Number(p.value) > mean * 1.25);
        const drops = points.filter(p => Number(p.value) < mean * 0.75);
        return { peaks, drops };
    }

    function sanitizeLabel(lbl) {
        if (lbl === undefined || lbl === null) return '';
        return String(lbl);
    }

    function generateDescription(points, ontology, options) {
        options = options || {};
        ontology = ontology || {};
        const labels = points.map(p => sanitizeLabel(p.label));
        const values = points.map(p => Number(p.value) || 0);
        const stats = summarizeNumbers(values);
        const trend = detectTrend(values);
        const { peaks, drops } = findPeaks(points);

        const name = ontology.seriesName || 'la serie';
        const unit = ontology.unit ? ' ' + ontology.unit : '';
        const concept = ontology.concept || '';

        const lines = [];
        if (concept) {
            lines.push(`${concept}: resumen de ${name}.`);
        } else {
            lines.push(`Resumen de ${name}.`);
        }

        lines.push(`Se analizaron ${stats.n} valores. Valor medio ${stats.mean.toFixed(2)}${unit}, máximo ${stats.max}${unit}, mínimo ${stats.min}${unit}.`);

        if (trend === 'sube') lines.push('Tendencia general: aumenta hacia el final del periodo.');
        else if (trend === 'baja') lines.push('Tendencia general: disminuye hacia el final del periodo.');
        else lines.push('Tendencia general: se mantiene relativamente estable.');

        if (peaks.length) {
            const pLabels = peaks.slice(0, 3).map(p => `${sanitizeLabel(p.label)} (${p.value}${unit})`).join(', ');
            lines.push(`Picos notables en: ${pLabels}.`);
        }
        if (drops.length) {
            const dLabels = drops.slice(0, 3).map(p => `${sanitizeLabel(p.label)} (${p.value}${unit})`).join(', ');
            lines.push(`Caídas notables en: ${dLabels}.`);
        }

        lines.push('Interpretación: revisar puntos con picos o caídas para entender causas subyacentes.');
        return lines.join(' ');
    }

    // Exponer al global
    window.SemanticDescriber = {
        generateDescription
    };
})();
