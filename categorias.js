const CATEGORY_SELECTION_KEY = 'iei.selectedCategories';

const CATEGORY_DEFINITIONS = [
    { label: 'Linfopenia T', csvKeys: ['LT'] },
    { label: 'Linfopenia B', csvKeys: ['LB_Compromiso'] },
    { label: 'LB_Antibody', csvKeys: ['LB_Antibody'] },
    { label: 'Hipo', csvKeys: ['LB_Antibody'] },
    { label: 'Hipo (Hipogammaglobulinemia)', csvKeys: ['LB_Antibody'] },
    { label: 'Hiper', csvKeys: ['LB_Antibody'] },
    { label: 'NK', csvKeys: ['NK'] },
    { label: 'Inf_Resp_Bajas', csvKeys: ['Broncopulmonares'] },
    { label: 'Infecciones', csvKeys: ['Infecciones'] },
    { label: 'Infecciones virales severas', csvKeys: ['Infecciones virales severas'] },
    { label: 'Afecciones celulares', csvKeys: ['Afecciones celulares'] },
    { label: 'Autoinmunidad', csvKeys: ['Autoinmunidad'] },
    { label: 'Autoinflamatorias (fever)', csvKeys: ['Autoinflamatorias'] },
    { label: 'Compromiso_Pulmonar', csvKeys: ['Broncopulmonares'] },
    { label: 'Diarrea/Gastrointestinal', csvKeys: ['Diarrea/Gastrointestinal'] },
    { label: 'Hepatica/Biliar/Renal', csvKeys: ['Hepática/Biliar'] },
    { label: 'Neurológicas', csvKeys: ['Neurológicas'] },
    { label: 'Neoplasias', csvKeys: ['Neoplasias'] },
    { label: 'Dermatológicas', csvKeys: ['Dermatológicas'] },
    { label: 'Esplenomegalia', csvKeys: ['Adeno/Espleno'] },
    { label: 'Adenomegalia', csvKeys: ['Adeno/Espleno'] },
    { label: 'HLH / Linfohistiocitosis', csvKeys: ['HLH / Linfohistiocitosis'] },
    { label: 'Sindrómico/Defectos Innatos/Desarrollo', csvKeys: ['Sindrómico/Defectos Innatos/Desarrollo'] },
    { label: 'Cardio', csvKeys: ['Cardio'] },
    { label: 'Other', csvKeys: [] }
];

const PRESETS = {
    lymphopenia: ['Linfopenia T', 'Linfopenia B', 'NK'],
    infections: ['Inf_Resp_Bajas', 'Infecciones', 'Infecciones virales severas', 'Compromiso_Pulmonar'],
    autoimmune: ['Autoinmunidad', 'Autoinflamatorias (fever)', 'HLH / Linfohistiocitosis'],
    systemic: ['Sindrómico/Defectos Innatos/Desarrollo', 'Cardio', 'Hepatica/Biliar/Renal']
};

const CATEGORY_LOOKUP = new Map(CATEGORY_DEFINITIONS.map((item) => [item.label, item]));
const CSV_ROWS = Array.isArray(window.CATEGORIAS_DESGLOSED_DATA) ? window.CATEGORIAS_DESGLOSED_DATA : [];

let selectedCategories = new Set();
let currentLang = localStorage.getItem('iei.lang') || 'es';

const I18N_CATEGORIAS = {
    es: {
        langToggle: 'EN',
        hdrTitle: 'Selector de Categorías',
        hdrSubtitle: 'Haz clic en las categorías desglosadas para preparar una comparación',
        backBtn: 'Volver al explorador',
        heroKicker: 'Base predefinida',
        heroTitle: 'Categorías del comparador',
        heroCopy: 'Selecciona una o varias categorías y pulsa comparar para ver el versus.',
        metaCategories: 'Categorías',
        metaSelected: 'Seleccionadas',
        presetLabel: 'Presets rápidos:',
        presets: {
            lymphopenia: '🧬 Linfopenias',
            infections: '🦠 Infecciones / Resp.',
            autoimmune: '💥 Autoinmune / HLH',
            systemic: '🫀 Sistémico / Sindrómico'
        },
        searchPlaceholder: 'Buscar categoría o subtipo',
        btnClearSelection: 'Limpiar selección',
        btnCompare: 'Comparar',
        btnFilterExplorer: 'Filtrar en el Explorador',
        emptyTitle: 'No hay categorías para mostrar',
        emptyDesc: 'La lista fija no pudo renderizarse correctamente.',
        selectionTitle: 'Selección actual',
        selectionCounter: (count) => `${count} elegidas`,
        selectionHelp: 'La selección se usa como filtro de comparación contra la matriz del CSV.',
        selectionEmpty: 'No hay categorías seleccionadas todavía.',
        resultsTitle: 'Resultado de comparación',
        phMatrixSearch: 'Filtrar resultados...',
        matrixDownloadBtn: 'Exportar CSV',
        btnHideResults: 'Ocultar resultado',
        summaryPrompt: 'Selecciona categorías y pulsa comparar.',
        mapped: 'mapeada',
        unmapped: 'sin mapeo',
        selectedBadge: 'Seleccionada',
        unselectedBadge: 'Tocar para seleccionar',
        noDirectMapping: 'Sin columna directa en el CSV',
        tableNameCol: 'Nombre',
        noComparableCols: 'No hay columnas comparables para la selección actual.',
        noDirectMapNotice: (list) => `Las categorías ${list} no tienen mapeo directo al CSV.`,
        noCompatibleCols: 'La selección no tiene columnas compatibles en el CSV.',
        detailsSelected: (n) => `${n} categorías seleccionadas`,
        detailsCompared: (n) => `${n} columnas comparadas`,
        detailsMissing: (n) => `${n} sin mapeo directo`,
        aboutTitle: 'Acerca de la herramienta',
        aboutWhoTitle: 'Quiénes somos',
        aboutWhoDesc: 'Desarrollado por <strong>Lorenzo Erra</strong> — Bioinformático / Genómico Clínico, como recurso educativo de genómica y medicina de precisión. Basado en el <strong>reporte de la IUIS</strong>.',
        aboutContactTitle: 'Feedback & Contacto',
        aboutContactDesc: '¿Encontraste un error, tenés una sugerencia o querés colaborar con el proyecto? Tu feedback ayuda a mejorar la herramienta para toda la comunidad.',
        aboutFeedbackBtn: 'Enviar Feedback',
        aboutCoffeeBtn: 'Invitarme un cafecito ☕'
    },
    en: {
        langToggle: 'ES',
        hdrTitle: 'Category Selector',
        hdrSubtitle: 'Click on itemized categories to prepare a comparison',
        backBtn: 'Back to explorer',
        heroKicker: 'Predefined Dataset',
        heroTitle: 'Comparator Categories',
        heroCopy: 'Select one or more categories and click compare to view the matrix breakdown.',
        metaCategories: 'Categories',
        metaSelected: 'Selected',
        presetLabel: 'Quick Presets:',
        presets: {
            lymphopenia: '🧬 Lymphopenias',
            infections: '🦠 Infections / Resp.',
            autoimmune: '💥 Autoimmune / HLH',
            systemic: '🫀 Systemic / Syndromic'
        },
        searchPlaceholder: 'Search category or subtype',
        btnClearSelection: 'Clear selection',
        btnCompare: 'Compare',
        btnFilterExplorer: 'Filter in Explorer',
        emptyTitle: 'No categories to display',
        emptyDesc: 'The fixed category list could not be rendered.',
        selectionTitle: 'Current Selection',
        selectionCounter: (count) => `${count} selected`,
        selectionHelp: 'The selection is used as a comparison filter against the CSV matrix.',
        selectionEmpty: 'No categories selected yet.',
        resultsTitle: 'Comparison Results',
        phMatrixSearch: 'Filter results...',
        matrixDownloadBtn: 'Export CSV',
        btnHideResults: 'Hide results',
        summaryPrompt: 'Select categories and click compare.',
        mapped: 'mapped',
        unmapped: 'unmapped',
        selectedBadge: 'Selected',
        unselectedBadge: 'Click to select',
        noDirectMapping: 'No direct column in CSV',
        tableNameCol: 'Name',
        noComparableCols: 'No comparable columns for current selection.',
        noDirectMapNotice: (list) => `Categories ${list} have no direct mapping to CSV.`,
        noCompatibleCols: 'Selection has no compatible columns in CSV.',
        detailsSelected: (n) => `${n} categories selected`,
        detailsCompared: (n) => `${n} columns compared`,
        detailsMissing: (n) => `${n} without direct mapping`,
        aboutTitle: 'About this tool',
        aboutWhoTitle: 'About Us',
        aboutWhoDesc: 'Developed by <strong>Lorenzo Erra</strong> — Clinical Genomicist / Bioinformatician, as an educational resource for the <strong>Escuela de Genómica Clínica (EGC)</strong>, an advanced training institute in genomics, bioinformatics, and precision medicine.',
        aboutContactTitle: 'Feedback & Contact',
        aboutContactDesc: 'Found a bug, have a suggestion, or want to collaborate? Your feedback helps improve this tool for the entire community.',
        aboutFeedbackBtn: 'Send Feedback',
        aboutCoffeeBtn: 'Buy me a coffee ☕'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initAboutModal();
    initNavigation();
    initBrowser();
    renderComparisonResults();
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = `${savedTheme}-theme comparison-page`;

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        document.body.className = `${newTheme}-theme comparison-page`;
        localStorage.setItem('theme', newTheme);
        lucide.createIcons();
    });
}

function getPatientProfile() {
    let profile = {};
    const raw = localStorage.getItem('iei.patientProfile');
    if (raw) {
        try { profile = JSON.parse(raw) || {}; } catch (e) { }
    }

    const rawSel = localStorage.getItem('iei_category_selection');
    if (rawSel) {
        try {
            const arr = JSON.parse(rawSel);
            if (Array.isArray(arr) && arr.length > 0) {
                profile.categories = arr;
            }
        } catch (e) { }
    }

    return profile;
}

function savePatientProfile(profile) {
    if (!profile) {
        localStorage.removeItem('iei.patientProfile');
        localStorage.removeItem('iei_category_selection');
    } else {
        if (profile.categories !== undefined) {
            localStorage.setItem('iei_category_selection', JSON.stringify(profile.categories));
        }
        localStorage.setItem('iei.patientProfile', JSON.stringify(profile));
    }
}

function renderPatientEntityCard() {
    const card = document.getElementById('patient-entity-card');
    const tagsContainer = document.getElementById('patient-entity-tags');
    if (!card || !tagsContainer) return;

    const profile = getPatientProfile();
    const hasData = profile && (profile.age || !isNaN(profile.igg) || !isNaN(profile.iga) || !isNaN(profile.tcell) || !isNaN(profile.bcell) || !isNaN(profile.neutrophils) || (profile.categories && profile.categories.length > 0));

    if (!hasData) {
        card.style.display = 'none';
        tagsContainer.innerHTML = '';
        return;
    }

    card.style.display = 'block';
    tagsContainer.innerHTML = buildPatientEntityTags(profile, 'removePatientTag');

    const clearBtn = document.getElementById('clear-patient-btn');
    if (clearBtn && !clearBtn.dataset.bound) {
        clearBtn.dataset.bound = "true";
        clearBtn.addEventListener('click', () => {
            savePatientProfile(null);
            selectedCategories.clear();
            renderBrowser();
            renderSelectionPanel();
            renderPatientEntityCard();
            renderComparisonResults();
        });
    }
}

const PARAM_DEFINITIONS_CAT = [
    { id: 'igg', name: 'IgG', unit: 'mg/dL' },
    { id: 'iga', name: 'IgA', unit: 'mg/dL' },
    { id: 'igm', name: 'IgM', unit: 'mg/dL' },
    { id: 'leukocytes', name: 'Leucocitos (Absoluto)', unit: '/µL' },
    { id: 'neutrophils', name: 'Neutrófilos (Absoluto)', unit: '/µL' },
    { id: 'neutrophils_pct', name: 'Neutrófilos (%)', unit: '%' },
    { id: 'lymphocytes', name: 'Linfocitos (Absoluto)', unit: '/µL' },
    { id: 'lymphocytes_pct', name: 'Linfocitos (%)', unit: '%' },
    { id: 'monocytes', name: 'Monocitos (Absoluto)', unit: '/µL' },
    { id: 'monocytes_pct', name: 'Monocitos (%)', unit: '%' },
    { id: 'eosinophils', name: 'Eosinófilos (Absoluto)', unit: '/µL' },
    { id: 'eosinophils_pct', name: 'Eosinófilos (%)', unit: '%' },
    { id: 'basophils', name: 'Basófilos (Absoluto)', unit: '/µL' },
    { id: 'basophils_pct', name: 'Basófilos (%)', unit: '%' },
    { id: 'tcell', name: 'Linfocitos T CD3+ (Absoluto)', unit: 'cel/mm³' },
    { id: 'tcell_pct', name: '% Linfocitos T CD3+', unit: '%' },
    { id: 'tcd4', name: 'Linfocitos T CD4+ (Absoluto)', unit: 'cel/mm³' },
    { id: 'tcd4_pct', name: '% Linfocitos T CD4+', unit: '%' },
    { id: 'tcd8', name: 'Linfocitos T CD8+ (Absoluto)', unit: 'cel/mm³' },
    { id: 'tcd8_pct', name: '% Linfocitos T CD8+', unit: '%' },
    { id: 'bcell', name: 'Linfocitos B CD19+ (Absoluto)', unit: 'cel/mm³' },
    { id: 'bcell_pct', name: '% Linfocitos B CD19+', unit: '%' },
    { id: 'nkcell', name: 'NK CD3-CD56+ (Absoluto)', unit: 'cel/mm³' },
    { id: 'nkcell_pct', name: '% Células NK CD3-CD56+', unit: '%' },
    { id: 'tcr_ab', name: 'Linfocitos TCR αβ+ (Absoluto)', unit: 'cel/mm³' },
    { id: 'tcr_ab_pct', name: '% Linfocitos TCR αβ+', unit: '%' },
    { id: 'tcr_gd', name: 'Linfocitos TCR γδ+ (Absoluto)', unit: 'cel/mm³' },
    { id: 'tcr_gd_pct', name: '% Linfocitos TCR γδ+', unit: '%' }
];

const IG_REF_CAT = {
    'cord': { label: 'Cordón / Neonato (0-1 m)', igg: [600, 1600], iga: [0, 15], igm: [5, 30], leukocytes: [9000, 30000], neutrophils: [6000, 26000], neutrophils_pct: [50, 80], eosinophils: [100, 1000], eosinophils_pct: [1, 5], basophils: [0, 300], basophils_pct: [0, 2], lymphocytes: [2000, 11000], lymphocytes_pct: [20, 50], monocytes: [400, 3000], monocytes_pct: [3, 12], tcell: [2052, 4298], tcell_pct: [58.5, 72.5], tcd4: [1572, 3286], tcd4_pct: [40.0, 52.0], tcd8: [848, 1912], tcd8_pct: [24.3, 35.5], bcell: [263, 764], bcell_pct: [8.0, 13.0], nkcell: [321, 1197], nkcell_pct: [8.0, 24.0], tcr_ab: [2096, 4527], tcr_ab_pct: [56.5, 71.5], tcr_gd: [36, 88], tcr_gd_pct: [1.0, 2.0] },
    '2-6m': { label: '2 - 6 meses', igg: [200, 600], iga: [10, 70], igm: [20, 100], leukocytes: [5000, 19500], neutrophils: [1000, 8500], neutrophils_pct: [15, 45], eosinophils: [100, 1000], eosinophils_pct: [1, 6], basophils: [0, 200], basophils_pct: [0, 2], lymphocytes: [2500, 11500], lymphocytes_pct: [45, 75], monocytes: [200, 1200], monocytes_pct: [3, 10], tcell: [3302, 4050], tcell_pct: [50.0, 64.5], tcd4: [2059, 2932], tcd4_pct: [34.5, 43.0], tcd8: [850, 1394], tcd8_pct: [16.0, 20.5], bcell: [1080, 2144], bcell_pct: [23.0, 32.0], nkcell: [336, 897], nkcell_pct: [7.0, 13.0], tcr_ab: [2721, 4020], tcr_ab_pct: [48.5, 60.0], tcr_gd: [104, 190], tcr_gd_pct: [2.0, 3.5] },
    '6-12m': { label: '6 - 12 meses', igg: [300, 900], iga: [15, 100], igm: [30, 120], leukocytes: [6000, 17500], neutrophils: [1500, 8500], neutrophils_pct: [20, 50], eosinophils: [100, 800], eosinophils_pct: [1, 5], basophils: [0, 200], basophils_pct: [0, 2], lymphocytes: [4000, 10500], lymphocytes_pct: [50, 75], monocytes: [200, 1200], monocytes_pct: [3, 10], tcell: [3668, 4740], tcell_pct: [59.0, 78.0], tcd4: [1741, 3402], tcd4_pct: [33.0, 45.0], tcd8: [810, 1351], tcd8_pct: [16.0, 29.0], bcell: [900, 1540], bcell_pct: [15.0, 30.0], nkcell: [336, 860], nkcell_pct: [6.0, 14.0], tcr_ab: [3367, 4719], tcr_ab_pct: [50.0, 75.0], tcr_gd: [139, 214], tcr_gd_pct: [2.0, 3.0] },
    '12-24m': { label: '12 - 24 meses (1 - 2 años)', igg: [400, 1000], iga: [20, 150], igm: [40, 150], leukocytes: [6000, 17000], neutrophils: [1500, 8500], neutrophils_pct: [25, 55], eosinophils: [100, 800], eosinophils_pct: [1, 5], basophils: [0, 200], basophils_pct: [0, 2], lymphocytes: [3000, 9500], lymphocytes_pct: [45, 70], monocytes: [200, 1000], monocytes_pct: [3, 9], tcell: [3430, 4147], tcell_pct: [62.0, 73.5], tcd4: [1716, 2550], tcd4_pct: [32.0, 47.5], tcd8: [882, 1534], tcd8_pct: [18.0, 26.0], bcell: [756, 1260], bcell_pct: [15.0, 24.0], nkcell: [245, 803], nkcell_pct: [5.0, 13.0], tcr_ab: [3138, 4088], tcr_ab_pct: [59.0, 69.0], tcr_gd: [123, 280], tcr_gd_pct: [2.5, 5.5] },
    '24-36m': { label: '24 - 36 meses (2 - 3 años)', igg: [450, 1050], iga: [25, 160], igm: [40, 160], leukocytes: [5500, 15500], neutrophils: [1500, 8000], neutrophils_pct: [30, 60], eosinophils: [100, 700], eosinophils_pct: [1, 5], basophils: [0, 200], basophils_pct: [0, 2], lymphocytes: [2500, 8500], lymphocytes_pct: [35, 65], monocytes: [200, 900], monocytes_pct: [3, 9], tcell: [2210, 4017], tcell_pct: [62.5, 73.0], tcd4: [1275, 2295], tcd4_pct: [30.0, 40.5], tcd8: [878, 1450], tcd8_pct: [21.0, 24.5], bcell: [648, 1178], bcell_pct: [14.0, 22.0], nkcell: [420, 630], nkcell_pct: [9.0, 12.0], tcr_ab: [2741, 3798], tcr_ab_pct: [60.0, 67.0], tcr_gd: [127, 385], tcr_gd_pct: [3.0, 7.0] },
    '36-80m': { label: '36 - 80 meses (3 - 6.6 años)', igg: [500, 1200], iga: [30, 200], igm: [45, 180], leukocytes: [5000, 14500], neutrophils: [1500, 8000], neutrophils_pct: [35, 65], eosinophils: [100, 700], eosinophils_pct: [1, 5], basophils: [0, 200], basophils_pct: [0, 2], lymphocytes: [1800, 7000], lymphocytes_pct: [30, 55], monocytes: [200, 800], monocytes_pct: [3, 8], tcell: [2054, 3169], tcell_pct: [67.0, 75.0], tcd4: [1129, 1581], tcd4_pct: [33.0, 43.5], tcd8: [711, 1121], tcd8_pct: [22.5, 29.5], bcell: [411, 658], bcell_pct: [11.0, 18.0], nkcell: [246, 461], nkcell_pct: [6.0, 14.0], tcr_ab: [1943, 2923], tcr_ab_pct: [63.0, 68.0], tcr_gd: [123, 257], tcr_gd_pct: [4.0, 7.0] },
    '80-210m': { label: '80 - 210 meses (6.6 - 17.5 años)', igg: [600, 1450], iga: [50, 280], igm: [50, 220], leukocytes: [4500, 13000], neutrophils: [1800, 7500], neutrophils_pct: [40, 70], eosinophils: [50, 600], eosinophils_pct: [0, 6], basophils: [0, 200], basophils_pct: [0, 2], lymphocytes: [1500, 5200], lymphocytes_pct: [25, 45], monocytes: [200, 800], monocytes_pct: [2, 8], tcell: [1543, 2484], tcell_pct: [65.0, 72.0], tcd4: [771, 1180], tcd4_pct: [32.0, 38.5], tcd8: [629, 1128], tcd8_pct: [25.0, 32.5], bcell: [278, 481], bcell_pct: [10.0, 16.0], nkcell: [241, 555], nkcell_pct: [10.0, 19.0], tcr_ab: [1407, 2187], tcr_ab_pct: [54.0, 66.0], tcr_gd: [113, 237], tcr_gd_pct: [5.0, 8.0] },
    'adult': { label: 'Adulto (> 18 años)', igg: [700, 1600], iga: [70, 400], igm: [40, 230], leukocytes: [4000, 11000], neutrophils: [2000, 6900], neutrophils_pct: [37.0, 80.8], eosinophils: [0, 700], eosinophils_pct: [0.0, 7.0], basophils: [0, 200], basophils_pct: [0.0, 2.0], lymphocytes: [600, 3400], lymphocytes_pct: [10.0, 50.0], monocytes: [0, 900], monocytes_pct: [0.0, 12.0], tcell: [690, 2540], tcell_pct: [55.0, 84.0], tcd4: [410, 1590], tcd4_pct: [31.0, 60.0], tcd8: [190, 1140], tcd8_pct: [13.0, 41.0], bcell: [100, 500], bcell_pct: [6.0, 24.0], nkcell: [90, 600], nkcell_pct: [6.0, 35.0], tcr_ab: [500, 2000], tcr_ab_pct: [50.0, 70.0], tcr_gd: [50, 300], tcr_gd_pct: [1.0, 10.0] }
};

function buildPatientEntityTags(profile, onRemoveFnName) {
    if (!profile) return '';
    const tags = [];

    const ageObj = IG_REF_CAT[profile.age] || IG_REF_CAT.adult;
    const ageLabel = ageObj ? ageObj.label : (profile.age || 'Paciente');

    tags.push(`<span class="patient-tag-chip tag-age" title="Grupo etario"><i class="fa-solid fa-child"></i> ${ageLabel}</span>`);

    PARAM_DEFINITIONS_CAT.forEach(p => {
        const val = profile[p.id];
        if (val !== undefined && val !== null && !isNaN(val)) {
            const range = ageObj[p.id];
            let st = 'Normal';
            let icon = 'fa-check';
            if (range) {
                if (val < range[0]) { st = 'Disminuido'; icon = 'fa-arrow-down'; }
                else if (val > range[1]) { st = 'Elevado'; icon = 'fa-arrow-up'; }
            }
            tags.push(`<span class="patient-tag-chip tag-removeable" onclick="${onRemoveFnName}('${p.id}');" title="Clic para remover ${p.name}">
                <i class="fa-solid ${icon}"></i> ${p.name}: ${val} ${p.unit} (${st}) 
                <span class="patient-tag-remove-btn">x</span>
            </span>`);
        }
    });

    if (profile.categories && Array.isArray(profile.categories)) {
        profile.categories.forEach(cat => {
            tags.push(`<span class="patient-tag-chip tag-category tag-removeable" onclick="${onRemoveFnName}('cat_${cat}');" title="Categoría diagnóstica mapeada">
                <i class="fa-solid fa-tags"></i> ${cat} <span class="patient-tag-remove-btn">x</span>
            </span>`);
        });
    }

    return tags.join('');
}
function removePatientTag(key) {
    const profile = getPatientProfile();
    if (!profile) return;

    if (key.startsWith('cat_')) {
        const catName = key.replace('cat_', '');
        profile.categories = (profile.categories || []).filter(c => c !== catName);
        selectedCategories.delete(catName);
    } else if (key === 'igg') {
        profile.igg = undefined;
    } else if (key === 'iga') {
        profile.iga = undefined;
    } else if (key === 'tcell') {
        profile.tcell = undefined;
        profile.isTLow = false;
    } else if (key === 'bcell') {
        profile.bcell = undefined;
        profile.isBLow = false;
    } else if (key === 'neutrophils') {
        profile.neutrophils = undefined;
        profile.isNeutLow = false;
    }

    savePatientProfile(profile);
    renderBrowser();
    renderSelectionPanel();
    renderPatientEntityCard();
    renderComparisonResults();
}

window.removePatientTag = removePatientTag;

function initLanguage() {
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            localStorage.setItem('iei.lang', currentLang);
            applyLanguage();
            renderBrowser(document.getElementById('category-search').value.trim().toLowerCase());
            renderSelectionPanel();
            renderComparisonResults();
        });
    }
    applyLanguage();
}

function applyLanguage() {
    const t = I18N_CATEGORIAS[currentLang] || I18N_CATEGORIAS.es;

    const langText = document.getElementById('lang-toggle-text');
    if (langText) langText.textContent = t.langToggle;

    const catHdrTitle = document.getElementById('cat-hdr-title');
    if (catHdrTitle) catHdrTitle.textContent = t.hdrTitle;

    const catHdrSub = document.getElementById('cat-hdr-subtitle');
    if (catHdrSub) catHdrSub.textContent = t.hdrSubtitle;

    const backBtnText = document.getElementById('cat-back-btn-text');
    if (backBtnText) backBtnText.textContent = t.backBtn;

    const heroKicker = document.getElementById('cat-hero-kicker');
    if (heroKicker) heroKicker.textContent = t.heroKicker;

    const heroTitle = document.getElementById('cat-hero-title');
    if (heroTitle) heroTitle.textContent = t.heroTitle;

    const heroCopy = document.getElementById('cat-hero-copy');
    if (heroCopy) heroCopy.innerHTML = t.heroCopy;

    const metaCategories = document.getElementById('cat-meta-categories');
    if (metaCategories) metaCategories.textContent = t.metaCategories;

    const metaSelected = document.getElementById('cat-meta-selected');
    if (metaSelected) metaSelected.textContent = t.metaSelected;

    const presetLabelText = document.getElementById('preset-label-text');
    if (presetLabelText) presetLabelText.textContent = t.presetLabel;

    const catSearch = document.getElementById('category-search');
    if (catSearch) catSearch.placeholder = t.searchPlaceholder;

    const clearSelBtn = document.getElementById('clear-selection-btn');
    if (clearSelBtn) clearSelBtn.textContent = t.btnClearSelection;

    const catCompareBtnText = document.getElementById('cat-compare-btn-text');
    if (catCompareBtnText) catCompareBtnText.textContent = t.btnCompare;

    const emptyTitle = document.getElementById('cat-empty-title');
    if (emptyTitle) emptyTitle.textContent = t.emptyTitle;

    const emptyDesc = document.getElementById('cat-empty-desc');
    if (emptyDesc) emptyDesc.textContent = t.emptyDesc;

    const selTitle = document.getElementById('cat-selection-title');
    if (selTitle) selTitle.textContent = t.selectionTitle;

    const selHelp = document.getElementById('cat-selection-help');
    if (selHelp) selHelp.textContent = t.selectionHelp;

    const resultsTitle = document.getElementById('cat-results-title');
    if (resultsTitle) resultsTitle.textContent = t.resultsTitle;

    const matrixSearchInput = document.getElementById('matrix-search-input');
    if (matrixSearchInput) matrixSearchInput.placeholder = t.phMatrixSearch;

    const matrixDownloadText = document.getElementById('matrix-download-text');
    if (matrixDownloadText) matrixDownloadText.textContent = t.matrixDownloadBtn;

    const filterExplorerText = document.getElementById('cat-filter-explorer-text');
    if (filterExplorerText) filterExplorerText.textContent = t.btnFilterExplorer;

    const resetResultsBtn = document.getElementById('reset-results-btn');
    if (resetResultsBtn) resetResultsBtn.textContent = t.btnHideResults;

    // Translate preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        const key = btn.dataset.preset;
        if (t.presets && t.presets[key]) {
            btn.textContent = t.presets[key];
        }
    });

    // About modal
    const aboutTitle = document.getElementById('about-modal-title');
    if (aboutTitle) aboutTitle.textContent = t.aboutTitle;

    const aboutWhoTitle = document.getElementById('about-who-title');
    if (aboutWhoTitle) aboutWhoTitle.textContent = t.aboutWhoTitle;

    const aboutWhoDesc = document.getElementById('about-who-desc');
    if (aboutWhoDesc) aboutWhoDesc.innerHTML = t.aboutWhoDesc;

    const aboutContactTitle = document.getElementById('about-contact-title');
    if (aboutContactTitle) aboutContactTitle.textContent = t.aboutContactTitle;

    const aboutContactDesc = document.getElementById('about-contact-desc');
    if (aboutContactDesc) aboutContactDesc.textContent = t.aboutContactDesc;

    const aboutFeedbackBtn = document.getElementById('about-feedback-btn');
    if (aboutFeedbackBtn) aboutFeedbackBtn.textContent = t.aboutFeedbackBtn;

    const aboutCoffeeBtn = document.getElementById('about-coffee-btn');
    if (aboutCoffeeBtn) aboutCoffeeBtn.textContent = t.aboutCoffeeBtn;
}

function initAboutModal() {
    const aboutBtn = document.getElementById('about-toggle');
    const aboutModal = document.getElementById('about-modal');
    const closeBtn = document.getElementById('about-modal-close');

    if (!aboutModal) return;

    const resetCafecitoBtn = () => {
        const cafecitoAliasBtn = document.getElementById('cafecito-alias-btn');
        if (cafecitoAliasBtn) {
            cafecitoAliasBtn.innerHTML = `
                <i class="fa-solid fa-mug-hot" id="cafecito-icon"></i>
                <span id="cafecito-btn-text">Invitarme un cafecito ☕</span>
            `;
            cafecitoAliasBtn.style.borderColor = '';
            cafecitoAliasBtn.style.backgroundColor = '';
        }
    };

    const openModal = () => {
        resetCafecitoBtn();
        aboutModal.classList.add('open');
    };

    const closeModal = () => {
        aboutModal.classList.remove('open');
        resetCafecitoBtn();
    };

    if (aboutBtn) aboutBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutModal.classList.contains('open')) {
            closeModal();
        }
    });

    const cafecitoAliasBtn = document.getElementById('cafecito-alias-btn');
    if (cafecitoAliasBtn) {
        cafecitoAliasBtn.addEventListener('click', () => {
            const aliasText = 'lorenzo.erra.mp';
            navigator.clipboard.writeText(aliasText).then(() => {
                cafecitoAliasBtn.style.backgroundColor = '#10b981';
                cafecitoAliasBtn.style.color = '#ffffff';
                cafecitoAliasBtn.innerHTML = `<i class="fa-solid fa-check" style="color:#ffffff;"></i> <span>Alias MP: <strong>loren.egc.mp</strong> (¡Copiado! ✓)</span>`;
            }).catch(err => {
                console.error("Error al copiar alias:", err);
            });
        });
    }

    // Auto-open on load
    setTimeout(openModal, 600);

    // Auto-open every 5 minutes
    setInterval(openModal, 5 * 60 * 1000);
}

let radarChartInstance = null;

const RADAR_AXIS_KEYS = [
    { key: 'LT', label: 'Compromiso T (LT)' },
    { key: 'LB_Compromiso', label: 'Compromiso B (LB)' },
    { key: 'LB_Antibody', label: 'Defecto Anticuerpos' },
    { key: 'NK', label: 'Compromiso NK' },
    { key: 'Infecciones', label: 'Infecciones' },
    { key: 'Infecciones virales severas', label: 'Inf. Virales Severas' },
    { key: 'Afecciones celulares', label: 'Afección Celular' },
    { key: 'Autoinmunidad', label: 'Autoinmunidad' },
    { key: 'Autoinflamatorias', label: 'Autoinflamatorias' },
    { key: 'Broncopulmonares', label: 'Broncopulmonares' },
    { key: 'Diarrea/Gastrointestinal', label: 'Gastrointestinal' },
    { key: 'Neurológicas', label: 'Neurológicas' },
    { key: 'Neoplasias', label: 'Neoplasias' },
    { key: 'Dermatológicas', label: 'Dermatológicas' },
    { key: 'Sindrómico/Defectos Innatos/Desarrollo', label: 'Sindrómico' }
];

const RADAR_COLORS = [
    { border: 'rgba(99, 102, 241, 1)', fill: 'rgba(99, 102, 241, 0.25)' },
    { border: 'rgba(236, 72, 153, 1)', fill: 'rgba(236, 72, 153, 0.25)' },
    { border: 'rgba(16, 185, 129, 1)', fill: 'rgba(16, 185, 129, 0.25)' },
    { border: 'rgba(245, 158, 11, 1)', fill: 'rgba(245, 158, 11, 0.25)' },
    { border: 'rgba(168, 85, 247, 1)', fill: 'rgba(168, 85, 247, 0.25)' },
    { border: 'rgba(14, 165, 233, 1)', fill: 'rgba(14, 165, 233, 0.25)' }
];

function renderComparisonRadarChart(rowsToCompare, patientProfile) {
    const canvas = document.getElementById('comparisonRadarCanvas');
    const radarCard = document.getElementById('radar-chart-card');
    if (!canvas || typeof Chart === 'undefined') return;

    if ((!rowsToCompare || rowsToCompare.length === 0) && !patientProfile) {
        if (radarCard) radarCard.style.display = 'none';
        return;
    }

    if (radarCard) radarCard.style.display = 'block';

    const labels = RADAR_AXIS_KEYS.map(a => a.label);
    const displayRows = rowsToCompare || [];

    const datasets = [];

    // Add Patient Profile Dataset if present
    if (patientProfile) {
        const patientCats = (patientProfile.categories || []).map(c => c.toLowerCase().trim());

        const patientDataValues = RADAR_AXIS_KEYS.map(axis => {
            const key = axis.key;
            const keyLower = key.toLowerCase();
            const labelLower = axis.label.toLowerCase();

            // 1. Check lab findings
            if (key === 'LT' && patientProfile.isTLow) return 100;
            if ((key === 'LB_Compromiso' || key === 'LB_Antibody') && (patientProfile.isBLow || patientProfile.isIgLow)) return 100;
            if (key === 'Infecciones' && patientProfile.isNeutLow) return 100;

            // 2. Check selected categories
            for (let cat of patientCats) {
                if (cat === keyLower || cat === labelLower || cat.includes(keyLower) || keyLower.includes(cat) || cat.includes(labelLower)) {
                    return 100;
                }
            }

            return 0;
        });

        datasets.push({
            label: `📌 PACIENTE (${patientProfile.age || 'Lab'})`,
            data: patientDataValues,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.25)',
            borderWidth: 3,
            borderDash: [6, 4],
            pointBackgroundColor: '#fbbf24',
            pointBorderColor: '#ffffff',
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.1
        });
    }

    displayRows.forEach((row, idx) => {
        let color;
        if (displayRows.length <= RADAR_COLORS.length) {
            color = RADAR_COLORS[idx];
        } else {
            const hue = Math.round((idx * 360) / displayRows.length);
            color = {
                border: `hsl(${hue}, 85%, 60%)`,
                fill: `hsla(${hue}, 85%, 60%, 0.15)`
            };
        }

        const dataValues = RADAR_AXIS_KEYS.map(axis => {
            const raw = row[axis.key] || '0';
            const num = parseFloat(raw.replace(',', '.')) || 0;
            return num;
        });

        datasets.push({
            label: row.Nombre || `Subtabla ${idx + 1}`,
            data: dataValues,
            borderColor: color.border,
            backgroundColor: color.fill,
            borderWidth: 2.5,
            pointBackgroundColor: color.border,
            pointBorderColor: '#ffffff',
            pointHoverRadius: 6,
            tension: 0.15
        });
    });

    if (radarChartInstance) {
        radarChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 600,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
                        padding: 14,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#f8fafc',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    pointLabels: {
                        color: '#cbd5e1',
                        font: { family: 'Outfit', size: 11, weight: '600' }
                    },
                    ticks: {
                        color: '#64748b',
                        backdropColor: 'transparent',
                        stepSize: 25,
                        font: { size: 9 }
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

function initNavigation() {
    document.getElementById('back-to-explorer-btn').addEventListener('click', () => {
        persistSelection();
        window.location.href = 'index.html';
    });

    document.getElementById('use-selection-btn').addEventListener('click', () => {
        persistSelection();
        renderComparisonResults();
        scrollToResults();
    });

    const filterInExplorerBtn = document.getElementById('filter-in-explorer-btn');
    if (filterInExplorerBtn) {
        filterInExplorerBtn.addEventListener('click', () => {
            filterInExplorer();
        });
    }

    document.getElementById('clear-selection-btn').addEventListener('click', () => {
        selectedCategories.clear();
        persistSelection();
        renderBrowser();
        renderSelectionPanel();
        renderComparisonResults();
    });

    document.getElementById('reset-results-btn').addEventListener('click', () => {
        document.getElementById('comparison-results').style.display = 'none';
    });

    document.getElementById('category-search').addEventListener('input', (event) => {
        renderBrowser(event.target.value.trim().toLowerCase());
    });

    // Preset buttons listeners
    document.querySelectorAll('.preset-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const presetKey = btn.dataset.preset;
            const categories = PRESETS[presetKey] || [];
            categories.forEach((cat) => selectedCategories.add(cat));
            persistSelection();
            renderBrowser(document.getElementById('category-search').value.trim().toLowerCase());
            renderSelectionPanel();
            renderComparisonResults();
            scrollToResults();
        });
    });

    // Matrix search listener
    const matrixSearchInput = document.getElementById('matrix-search-input');
    if (matrixSearchInput) {
        matrixSearchInput.addEventListener('input', () => {
            renderComparisonResults();
        });
    }

    // Matrix export CSV listener
    const downloadCsvBtn = document.getElementById('download-matrix-csv');
    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener('click', () => {
            exportComparisonCsv();
        });
    }
}

function scrollToResults() {
    const resultsPanel = document.getElementById('comparison-results');
    if (resultsPanel && selectedCategories.size > 0) {
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function filterInExplorer() {
    persistSelection();
    if (selectedCategories.size > 0) {
        localStorage.setItem('iei.explorerFilterActive', 'true');
    }
    window.location.href = 'index.html';
}

function initBrowser() {
    const profile = getPatientProfile();
    const storedSelection = readStoredSelection();
    let initialSet = new Set(storedSelection.filter((value) => CATEGORY_LOOKUP.has(value)));

    if (profile && profile.categories && profile.categories.length > 0) {
        profile.categories.forEach(c => {
            if (CATEGORY_LOOKUP.has(c)) initialSet.add(c);
        });
    }

    selectedCategories = initialSet;

    document.getElementById('category-total').textContent = CATEGORY_DEFINITIONS.length;
    renderBrowser();
    renderSelectionPanel();
    renderPatientEntityCard();
    lucide.createIcons();
}

function readStoredSelection() {
    try {
        const raw = localStorage.getItem(CATEGORY_SELECTION_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function persistSelection() {
    localStorage.setItem(CATEGORY_SELECTION_KEY, JSON.stringify(Array.from(selectedCategories)));
    const profile = getPatientProfile() || {};
    profile.categories = Array.from(selectedCategories);
    savePatientProfile(profile);
}

function renderBrowser(query = '') {
    const t = I18N_CATEGORIAS[currentLang] || I18N_CATEGORIAS.es;
    const grid = document.getElementById('categories-grid');
    const emptyState = document.getElementById('categories-empty');
    const normalizedQuery = query.toLowerCase();

    const filtered = CATEGORY_DEFINITIONS.filter((category) => {
        if (!normalizedQuery) return true;
        return category.label.toLowerCase().includes(normalizedQuery);
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';

    filtered.forEach((category) => {
        const card = document.createElement('button');
        const isSelected = selectedCategories.has(category.label);
        const mappedText = category.csvKeys.length > 0 ? category.csvKeys.join(', ') : t.noDirectMapping;

        card.type = 'button';
        card.className = `category-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="category-card-header">
                <span class="category-group">${t.metaCategories.slice(0, -1)}</span>
                <span class="category-count">${category.csvKeys.length ? t.mapped : t.unmapped}</span>
            </div>
            <h3>${escapeHtml(category.label)}</h3>
            <p>${escapeHtml(mappedText)}</p>
            <div class="category-card-footer">
                <span class="category-selected-badge">${isSelected ? t.selectedBadge : t.unselectedBadge}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            if (selectedCategories.has(category.label)) {
                selectedCategories.delete(category.label);
            } else {
                selectedCategories.add(category.label);
            }
            persistSelection();
            renderBrowser(query);
            renderSelectionPanel();
            renderPatientEntityCard();
            renderComparisonResults();
        });

        grid.appendChild(card);
    });

    updateSelectionCounters();
    lucide.createIcons();
}

function renderSelectionPanel() {
    const t = I18N_CATEGORIAS[currentLang] || I18N_CATEGORIAS.es;
    const list = document.getElementById('selection-list');
    const labels = Array.from(selectedCategories).sort((a, b) => a.localeCompare(b));

    list.innerHTML = '';

    if (labels.length === 0) {
        list.innerHTML = `<div class="selection-empty">${t.selectionEmpty}</div>`;
        updateSelectionCounters();
        return;
    }

    labels.forEach((label) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'selection-pill';
        pill.innerHTML = `
            <span>${escapeHtml(label)}</span>
            <i data-lucide="x"></i>
        `;
        pill.addEventListener('click', () => {
            selectedCategories.delete(label);
            persistSelection();
            renderBrowser(document.getElementById('category-search').value.trim().toLowerCase());
            renderSelectionPanel();
            renderComparisonResults();
        });
        list.appendChild(pill);
    });

    updateSelectionCounters();
    lucide.createIcons();
}

function updateSelectionCounters() {
    const t = I18N_CATEGORIAS[currentLang] || I18N_CATEGORIAS.es;
    const count = selectedCategories.size;
    document.getElementById('selected-total').textContent = count;
    document.getElementById('selection-counter').textContent = t.selectionCounter(count);
}

function formatCellBadge(val) {
    if (!val || val === '-' || val === '0' || val === '0,00' || val.toLowerCase() === 'no') {
        return `<span class="matrix-badge neutral">0,00%</span>`;
    }
    const cleanNum = parseFloat(val.toString().replace(',', '.'));
    if (!isNaN(cleanNum)) {
        if (cleanNum === 0) {
            return `<span class="matrix-badge neutral">0,00%</span>`;
        }
        if (cleanNum >= 40) {
            return `<span class="matrix-badge positive high">${escapeHtml(val)}%</span>`;
        }
        return `<span class="matrix-badge positive mid">${escapeHtml(val)}%</span>`;
    }
    const lower = val.toLowerCase();
    if (lower.includes('+') || lower.includes('si') || lower.includes('sí') || lower.includes('disminuid') || lower.includes('elevad') || lower.includes('ausenc') || lower.includes('fiebre')) {
        return `<span class="matrix-badge positive high">${escapeHtml(val)}</span>`;
    }
    return `<span class="matrix-badge positive mid">${escapeHtml(val)}</span>`;
}

let showOnlyTopMatch = true;

function calculateSubtableScore(row, patientProfile, availableColumns) {
    const getNum = (key) => parseFloat((row[key] || '0').replace(',', '.')) || 0;

    // 1. If categories are selected, rank strictly by positivity across selected columns
    if (availableColumns && availableColumns.length > 0) {
        let colSum = 0;
        availableColumns.forEach(col => {
            colSum += getNum(col);
        });
        return colSum / availableColumns.length;
    }

    // 2. Fallback to patient lab profile match if present
    if (patientProfile) {
        let pMatch = 0;
        let pChecks = 0;
        if (patientProfile.isTLow) {
            pChecks++;
            if (getNum('LT') >= 40) pMatch += 100;
        }
        if (patientProfile.isBLow) {
            pChecks++;
            if (getNum('LB_Compromiso') >= 40 || getNum('LB_Antibody') >= 40) pMatch += 100;
        }
        if (patientProfile.isIgLow) {
            pChecks++;
            if (getNum('LB_Antibody') >= 40) pMatch += 100;
        }
        if (patientProfile.isNeutLow) {
            pChecks++;
            if (getNum('Infecciones') >= 40) pMatch += 100;
        }
        if (pChecks > 0) return pMatch / pChecks;
    }

    let sum = 0;
    let count = 0;
    for (let k in row) {
        if (k !== 'Nombre') {
            sum += getNum(k);
            count++;
        }
    }
    return count > 0 ? sum / count : 0;
}

function renderComparisonResults() {
    const t = I18N_CATEGORIAS[currentLang] || I18N_CATEGORIAS.es;
    const resultsPanel = document.getElementById('comparison-results');
    const table = document.getElementById('comparison-table');
    const summary = document.getElementById('comparison-summary');
    const selected = Array.from(selectedCategories);

    if (selected.length === 0) {
        resultsPanel.style.display = 'none';
        table.innerHTML = '';
        summary.textContent = t.summaryPrompt;
        return;
    }

    const mappedColumns = selected.flatMap((label) => {
        const definition = CATEGORY_LOOKUP.get(label);
        return definition ? definition.csvKeys : [];
    });

    const uniqueColumns = Array.from(new Set(mappedColumns));
    const availableColumns = uniqueColumns.filter((column) => CSV_ROWS.length > 0 && Object.prototype.hasOwnProperty.call(CSV_ROWS[0], column));
    const missingLabels = selected.filter((label) => (CATEGORY_LOOKUP.get(label)?.csvKeys || []).length === 0);

    resultsPanel.style.display = 'block';

    if (availableColumns.length === 0) {
        table.innerHTML = `
            <tbody>
                <tr>
                    <td>
                        ${t.noComparableCols}
                    </td>
                </tr>
            </tbody>
        `;
        summary.textContent = missingLabels.length > 0
            ? t.noDirectMapNotice(missingLabels.join(', '))
            : t.noCompatibleCols;
        return;
    }

    // Patient profile matching & rendering
    renderPatientEntityCard();
    const patientProfile = getPatientProfile();

    // Rank subtables dynamically based on selected columns & patient profile
    const scoredRows = CSV_ROWS.map(row => ({
        row: row,
        score: calculateSubtableScore(row, patientProfile, availableColumns)
    }));
    scoredRows.sort((a, b) => b.score - a.score);

    // Setup similarity toggle button
    const toggleBtn = document.getElementById('toggle-similarity-mode-btn');
    if (toggleBtn) {
        toggleBtn.style.display = 'inline-flex';
        const toggleText = document.getElementById('similarity-mode-text');
        if (toggleText) {
            toggleText.textContent = showOnlyTopMatch
                ? `Ver todas las subtables (${scoredRows.length})`
                : `Ver sólo la más similar (Top 1)`;
        }
        if (!toggleBtn.dataset.bound) {
            toggleBtn.dataset.bound = "true";
            toggleBtn.addEventListener('click', () => {
                showOnlyTopMatch = !showOnlyTopMatch;
                renderComparisonResults();
            });
        }
    }

    const finalRows = showOnlyTopMatch && scoredRows.length > 0 ? [scoredRows[0].row] : scoredRows.map(s => s.row);

    // Render patient row at top of table if available
    let patientRowHtml = '';
    if (patientProfile) {
        patientRowHtml = `
            <tr style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.15)); border: 1px solid rgba(245, 158, 11, 0.4);">
                <td style="font-weight: 700; color: #fbbf24;">
                    📌 PACIENTE INGRESADO (${patientProfile.age || 'Lab'})
                </td>
                ${availableColumns.map(col => {
            let val = 'Sin datos';
            const cLower = col.toLowerCase();
            if (cLower.includes('t') && patientProfile.isTLow) val = 'Disminuido';
            else if (cLower.includes('b') && patientProfile.isBLow) val = 'Disminuido';
            else if (cLower.includes('anti') && patientProfile.isIgLow) val = 'Disminuido';
            else if (cLower.includes('neut') && patientProfile.isNeutLow) val = 'Disminuido';
            else if (patientProfile.isIgLow) val = 'Alterado';
            return `<td><span class="matrix-badge positive high">${val}</span></td>`;
        }).join('')}
            </tr>
        `;
    }

    const headerCells = [t.tableNameCol, ...availableColumns];
    table.innerHTML = `
        <thead>
            <tr>${headerCells.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>
            ${patientRowHtml}
            ${finalRows.map((row) => `
                <tr>
                    <td style="cursor:pointer;" title="Filtrar esta subtabla en el explorador" onclick="navigateToExplorerWithSubtable('${escapeHtml(row.Nombre || '').replace(/'/g, "\\'")}');">
                        <span class="badge-subcategory-click">${escapeHtml(row.Nombre || '')}</span>
                    </td>
                    ${availableColumns.map((column) => `
                        <td style="cursor:pointer;" title="Filtrar esta subtabla en el explorador" onclick="navigateToExplorerWithSubtable('${escapeHtml(row.Nombre || '').replace(/'/g, "\\'")}');">
                            ${formatCellBadge(row[column] || '')}
                        </td>
                    `).join('')}
                </tr>
            `).join('')}
        </tbody>
    `;

    // Render interactive radar chart overlay with dynamic axes matching availableColumns
    renderComparisonRadarChart(finalRows, patientProfile, availableColumns);

    const details = [];
    if (patientProfile) details.push(`📌 Paciente: ${patientProfile.age}`);
    if (showOnlyTopMatch && scoredRows.length > 0) details.push(`🎯 Subtabla más similar: ${scoredRows[0].row.Nombre}`);
    if (selected.length > 0) details.push(t.detailsSelected(selected.length));
    if (availableColumns.length > 0) details.push(t.detailsCompared(availableColumns.length));
    if (missingLabels.length > 0) details.push(t.detailsMissing(missingLabels.length));
    summary.textContent = details.join(' · ');
}

function navigateToExplorerWithSubtable(subtableName) {
    persistSelection();
    localStorage.setItem('iei.explorerDirectFilter', JSON.stringify({ subcategory: subtableName }));
    window.location.href = 'index.html';
}

function exportComparisonCsv() {
    const selected = Array.from(selectedCategories);
    if (selected.length === 0) return;

    const mappedColumns = selected.flatMap((label) => (CATEGORY_LOOKUP.get(label)?.csvKeys || []));
    const availableColumns = Array.from(new Set(mappedColumns)).filter((col) => CSV_ROWS.length > 0 && Object.prototype.hasOwnProperty.call(CSV_ROWS[0], col));

    if (availableColumns.length === 0) return;

    const headers = ['Nombre', ...availableColumns];
    const rows = CSV_ROWS.map(row => [
        `"${(row.Nombre || '').replace(/"/g, '""')}"`,
        ...availableColumns.map(col => `"${(row[col] || '').replace(/"/g, '""')}"`)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matriz_comparativa_iei.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}