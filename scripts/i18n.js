// Simple i18n helper for browser
(function () {
    const translations = {
        es: {
            title: 'Color Sense - Adaptación para Daltonismo',
            header_title: 'Color Sense',
            header_sub: 'Una experiencia web adaptativa para personas con daltonismo',
            label_daltonism: 'Tipo de Daltonismo:',
            opt_none: 'Sin Adaptación',
            opt_protanopia: 'Protanopia (Ceguera al Rojo)',
            opt_deuteranopia: 'Deuteranopia (Ceguera al Verde)',
            opt_tritanopia: 'Tritanopia (Ceguera al Azul)',
            btn_apply: 'Aplicar Adaptación',
            section_news: 'Sección de Noticias y Gráficos',
            article_title: 'Artículo Importante con Colores',
            article_p: 'Este párrafo contiene texto normal. A continuación, verás un bloque de color.',
            chart_title: 'Gráfico de Barras de Ventas',
            chart_p: 'Este gráfico muestra las ventas trimestrales con barras de diferentes colores.',
            legend_q1: 'Q1',
            legend_q2: 'Q2',
            legend_q3: 'Q3',
            legend_q4: 'Q4',
            label_lang: 'Idioma:',
            lang_es: 'Español',
            lang_en: 'English',
            btn_generate: 'Generar descripción',
            gallery_title: 'Galería de Imágenes'
        },
        en: {
            title: 'Color Sense - Color Accessibility',
            header_title: 'Color Sense',
            header_sub: 'An adaptive web experience for people with color vision deficiency',
            label_daltonism: 'Type of Color Vision Deficiency:',
            opt_none: 'No adaptation',
            opt_protanopia: 'Protanopia (Red deficiency)',
            opt_deuteranopia: 'Deuteranopia (Green deficiency)',
            opt_tritanopia: 'Tritanopia (Blue deficiency)',
            btn_apply: 'Apply Adaptation',
            section_news: 'News and Charts Section',
            article_title: 'Important Article with Colors',
            article_p: 'This paragraph contains normal text. Below you will see a color block.',
            chart_title: 'Sales Bar Chart',
            chart_p: 'This chart shows quarterly sales with bars in different colors.',
            legend_q1: 'Q1',
            legend_q2: 'Q2',
            legend_q3: 'Q3',
            legend_q4: 'Q4',
            label_lang: 'Language:',
            lang_es: 'Español',
            lang_en: 'English',
            btn_generate: 'Generate description',
            gallery_title: 'Image Gallery'
        }
    };

    function applyTranslations(lang) {
        lang = lang || (document.getElementById('langSelect') || {}).value || 'es';
        const dict = translations[lang] || translations['es'];

        // Title
        const titleEl = document.querySelector('title[data-i18n]');
        if (titleEl && dict[titleEl.dataset.i18n]) document.title = dict[titleEl.dataset.i18n];

        // Elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });
    }

    window.SimpleI18n = {
        applyTranslations,
        translations
    };
})();
