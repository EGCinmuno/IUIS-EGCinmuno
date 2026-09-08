// Application state
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let database = [];          // Current active dataset
let filteredData = [];      // Filtered rows
let activeFilters = {       // Active filter values
    global: '',
    gene: '',
    disease: '',
    inheritance: [],
    majorCategory: [],
    subcategory: [],
    tCell: [],
    bCell: [],
    immunoglobulins: [],
    neutrophils: [],
    features: '',
    omim: '',
    inheritanceText: '',
    majorCategoryText: ''
};

// Pagination state
let currentPage = 1;
let rowsPerPage = 20;

// Sorting state
let currentSortColumn = 'gene';
let currentSortDirection = 'asc'; // 'asc' or 'desc'

// Selectors for DOM elements
const selectWrappers = {};

// Default Fallback Database in case data.js is not loaded
const DEFAULT_DATABASE = typeof IUIS_DATA !== 'undefined' ? IUIS_DATA : [];

// Internationalization Dictionary (ES / EN)
const I18N_APP = {
    es: {
        langToggle: 'EN',
        subtitle: 'Base de Datos de Inmunodeficiencias y Errores Innatos de la Inmunidad (IUIS)',
        compareBtn: 'Comparar categorías',
        btnIgCalc: 'Ingresar valores',
        statGenesLabel: 'Genes Filtrados / Total',
        statActiveFiltersLabel: 'Filtros Activos',
        statDiseasesLabel: 'Enfermedades',
        advTriggerText: 'Filtros Clínicos y Avanzados',
        lblMajorCat: 'Categoría Mayor',
        lblInheritance: 'Herencia (Inheritance)',
        lblSubcat: 'Subcategoría (Subcategory)',
        lblFeatures: 'Manifestaciones Clínicas / Asociadas',
        phFeatures: 'Ej. microcephaly, deafness, albinism...',
        lblTCell: 'Recuento Células T',
        lblBCell: 'Recuento Células B',
        lblIgs: 'Inmunoglobulinas',
        lblNeutrophils: 'Neutrófilos',
        phGlobal: 'Búsqueda rápida en todas las columnas...',
        btnClearFilters: 'Limpiar Filtros',
        btnDownload: 'Descargar',
        btnCopyList: 'Copiar Genes Filtrados',
        btnDownloadTxt: 'Lista de Genes (.txt)',
        btnDownloadCsv: 'Tabla Filtrada (.csv)',
        chipsLabel: 'Filtros activos:',
        chipsClear: 'Limpiar',
        thGene: 'Gen',
        thDisease: 'Enfermedad',
        thInheritance: 'Herencia',
        thOmim: 'OMIM',
        thMajorCategory: 'Categoría Mayor',
        thSubcategory: 'Subtabla',
        thResources: 'Recursos',
        phFilterGene: 'Buscar gen...',
        phFilterDisease: 'Buscar enfermedad...',
        phFilterInheritance: 'Ej. AR, AD, XL...',
        phFilterOmim: 'Buscar OMIM...',
        phFilterCategory: 'Buscar categoría...',
        phFilterSubcategory: 'Buscar subtabla...',
        noResultsTitle: 'No se encontraron resultados',
        noResultsDesc: 'Intenta ajustar tus criterios de búsqueda o limpia los filtros activos.',
        noResultsResetBtn: 'Restaurar Filtros',
        rowsPerPage: 'Filas por página:',
        allRows: 'Todas',
        showingInfo: (start, end, total) => `Mostrando ${start} a ${end} de ${total} registros`,
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
        subtitle: 'Inborn Errors of Immunity & Immunodeficiencies Database (IUIS)',
        compareBtn: 'Compare categories',
        btnIgCalc: 'Enter values',
        statGenesLabel: 'Filtered Genes / Total',
        statActiveFiltersLabel: 'Active Filters',
        statDiseasesLabel: 'Diseases',
        advTriggerText: 'Clinical & Advanced Filters',
        lblMajorCat: 'Major Category',
        lblInheritance: 'Inheritance Mode',
        lblSubcat: 'Subcategory',
        lblFeatures: 'Clinical Manifestations / Associated',
        phFeatures: 'E.g., microcephaly, deafness, albinism...',
        lblTCell: 'T Cell Count',
        lblBCell: 'B Cell Count',
        lblIgs: 'Immunoglobulins',
        lblNeutrophils: 'Neutrophils',
        phGlobal: 'Quick search in all columns...',
        btnClearFilters: 'Clear Filters',
        btnDownload: 'Download',
        btnCopyList: 'Copy Filtered Genes',
        btnDownloadTxt: 'Gene List (.txt)',
        btnDownloadCsv: 'Filtered Table (.csv)',
        chipsLabel: 'Active filters:',
        chipsClear: 'Clear',
        thGene: 'Gene',
        thDisease: 'Disease',
        thInheritance: 'Inheritance',
        thOmim: 'OMIM',
        thMajorCategory: 'Major Category',
        thSubcategory: 'Subtable',
        thResources: 'Resources',
        phFilterGene: 'Search gene...',
        phFilterDisease: 'Search disease...',
        phFilterInheritance: 'E.g., AR, AD, XL...',
        phFilterOmim: 'Search OMIM...',
        phFilterCategory: 'Search category...',
        phFilterSubcategory: 'Search subtable...',
        noResultsTitle: 'No results found',
        noResultsDesc: 'Try adjusting your search criteria or clearing active filters.',
        noResultsResetBtn: 'Reset Filters',
        rowsPerPage: 'Rows per page:',
        allRows: 'All',
        showingInfo: (start, end, total) => `Showing ${start} to ${end} of ${total} records`,
        aboutTitle: 'About this tool',
        aboutWhoTitle: 'About Us',
        aboutWhoDesc: 'Developed by <strong>Lorenzo Erra</strong> — Clinical Genomicist / Bioinformatician, as an educational resource for precision medicine. Based on the <strong>IUIS report</strong>.',
        aboutContactTitle: 'Feedback & Contact',
        aboutContactDesc: 'Found a bug, have a suggestion, or want to collaborate? Your feedback helps improve this tool for the entire community.',
        aboutFeedbackBtn: 'Send Feedback',
        aboutCoffeeBtn: 'Buy me a coffee ☕'
    }
};

// Current Language State ('es' or 'en')
let currentLang = localStorage.getItem('iei.lang') || 'es';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Theme & Language
    initTheme();
    initLanguage();

    // 2. Setup Data
    if (DEFAULT_DATABASE.length > 0) {
        loadDataset(DEFAULT_DATABASE);
    } else {
        showNoDataState();
    }

    // 3. Setup UI Events & About Modal & Patient Entity
    initUiEvents();
    initAboutModal();
    initIgCalcModal();
    renderPatientEntityCardIndex();
});

/* --- Core Theme & Language Functions --- */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.className = `${savedTheme}-theme`;

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        document.body.className = `${newTheme}-theme`;
        localStorage.setItem('theme', newTheme);
    });
}

function initLanguage() {
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            localStorage.setItem('iei.lang', currentLang);
            applyLanguage();
            buildFilterSelects();
            applyFiltersAndRender();
        });
    }
    applyLanguage();
}

function applyLanguage() {
    const t = I18N_APP[currentLang] || I18N_APP.es;

    // Header
    const langText = document.getElementById('lang-toggle-text');
    if (langText) langText.textContent = t.langToggle;

    const subtitle = document.getElementById('hdr-subtitle');
    if (subtitle) subtitle.textContent = t.subtitle;

    const compareBtnText = document.getElementById('btn-compare-text');
    if (compareBtnText) compareBtnText.textContent = t.compareBtn;

    const igCalcBtnText = document.getElementById('btn-ig-calc-text');
    if (igCalcBtnText) igCalcBtnText.textContent = t.btnIgCalc;

    // Stats labels
    const statGenesLabel = document.querySelector('#stat-genes-count + p');
    if (statGenesLabel) statGenesLabel.textContent = t.statGenesLabel;

    const statActiveLabel = document.querySelector('#stat-active-filters + p');
    if (statActiveLabel) statActiveLabel.textContent = t.statActiveFiltersLabel;

    const lblStatDiseases = document.getElementById('lbl-stat-diseases');
    if (lblStatDiseases) lblStatDiseases.textContent = t.statDiseasesLabel;

    // Advanced filters panel
    const advTriggerSpan = document.querySelector('#advanced-filters-trigger .trigger-label span');
    if (advTriggerSpan) advTriggerSpan.textContent = t.advTriggerText;

    const labels = document.querySelectorAll('.advanced-filters-grid .filter-group label');
    if (labels.length >= 8) {
        labels[0].textContent = t.lblMajorCat;
        labels[1].textContent = t.lblInheritance;
        labels[2].textContent = t.lblSubcat;
        labels[3].textContent = t.lblFeatures;
        labels[4].textContent = t.lblTCell;
        labels[5].textContent = t.lblBCell;
        labels[6].textContent = t.lblIgs;
        labels[7].textContent = t.lblNeutrophils;
    }

    const filterFeatures = document.getElementById('filter-features');
    if (filterFeatures) filterFeatures.placeholder = t.phFeatures;

    // Global search and buttons
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) globalSearch.placeholder = t.phGlobal;

    const clearFiltersBtnSpan = document.querySelector('#clear-all-filters-btn span');
    if (clearFiltersBtnSpan) clearFiltersBtnSpan.textContent = t.btnClearFilters;

    const downloadTriggerSpan = document.querySelector('#download-btn-trigger > span');
    if (downloadTriggerSpan) downloadTriggerSpan.textContent = t.btnDownload;

    const copyGenesSpan = document.querySelector('#copy-genes-clipboard .btn-text');
    if (copyGenesSpan) copyGenesSpan.textContent = t.btnCopyList;

    const downloadTxtSpan = document.querySelector('#download-genes-txt span');
    if (downloadTxtSpan) downloadTxtSpan.textContent = t.btnDownloadTxt;

    const downloadCsvSpan = document.querySelector('#download-table-csv span');
    if (downloadCsvSpan) downloadCsvSpan.textContent = t.btnDownloadCsv;

    const chipsLabel = document.querySelector('.chips-label');
    if (chipsLabel) chipsLabel.textContent = t.chipsLabel;

    const chipsClearBtn = document.getElementById('chips-clear-btn');
    if (chipsClearBtn) chipsClearBtn.textContent = t.chipsClear;

    // Table Headers Translation
    const thGene = document.getElementById('th-gene');
    if (thGene) thGene.textContent = t.thGene;

    const thDisease = document.getElementById('th-disease');
    if (thDisease) thDisease.textContent = t.thDisease;

    const thInheritance = document.getElementById('th-inheritance');
    if (thInheritance) thInheritance.textContent = t.thInheritance;

    const thOmim = document.getElementById('th-omim');
    if (thOmim) thOmim.textContent = t.thOmim;

    const thMajorCat = document.getElementById('th-major-category');
    if (thMajorCat) thMajorCat.textContent = t.thMajorCategory;

    const thSubcat = document.getElementById('th-subcategory');
    if (thSubcat) thSubcat.textContent = t.thSubcategory;

    const thResources = document.getElementById('th-resources');
    if (thResources) thResources.textContent = t.thResources;

    // Table filter placeholders
    const fGene = document.getElementById('filter-gene');
    if (fGene) fGene.placeholder = t.phFilterGene;

    const fDisease = document.getElementById('filter-disease');
    if (fDisease) fDisease.placeholder = t.phFilterDisease;

    const fInheritance = document.getElementById('filter-inheritance-text');
    if (fInheritance) fInheritance.placeholder = t.phFilterInheritance;

    const fOmim = document.getElementById('filter-omim');
    if (fOmim) fOmim.placeholder = t.phFilterOmim;

    const fMajor = document.getElementById('filter-major-category-text');
    if (fMajor) fMajor.placeholder = t.phFilterCategory;

    const fSubcat = document.getElementById('filter-subcategory-text');
    if (fSubcat) fSubcat.placeholder = t.phFilterSubcategory;

    // No results state
    const noResultsH3 = document.querySelector('#no-results-state h3');
    if (noResultsH3) noResultsH3.textContent = t.noResultsTitle;

    const noResultsP = document.querySelector('#no-results-state p');
    if (noResultsP) noResultsP.textContent = t.noResultsDesc;

    const noResultsBtn = document.getElementById('no-results-clear-btn');
    if (noResultsBtn) noResultsBtn.textContent = t.noResultsResetBtn;

    // Page size label
    const pageSizeLabel = document.querySelector('.page-size-selector label');
    if (pageSizeLabel) pageSizeLabel.textContent = t.rowsPerPage;

    const pageSizeSelectAll = document.querySelector('#page-size-select option[value="all"]');
    if (pageSizeSelectAll) pageSizeSelectAll.textContent = t.allRows;

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
                cafecitoAliasBtn.innerHTML = `<i class="fa-solid fa-check" style="color:#ffffff;"></i> <span>Alias MP: <strong>loren.erra.mp</strong> (¡Copiado! ✓)</span>`;
            }).catch(err => {
                console.error("Error al copiar alias:", err);
            });
        });
    }

    // Auto-open on startup after brief delay
    setTimeout(openModal, 600);

    // Auto-open every 5 minutes (300,000 ms)
    setInterval(openModal, 5 * 60 * 1000);
}

function showNoDataState() {
    console.warn("IUIS_DATA is empty. Waiting for CSV upload.");
    document.getElementById('stat-genes-count').textContent = "0 / 0";
    document.getElementById('table-body').innerHTML = `
        <tr>
            <td colspan="6" class="text-center" style="padding: 40px;">
                <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
                    <i data-lucide="alert-circle" style="width:36px; height:36px; color:var(--text-muted);"></i>
                    <h3>Base de datos vacía</h3>
                    <p>Por favor carga un archivo CSV para empezar a explorar los genes.</p>
                </div>
            </td>
        </tr>
    `;
    lucide.createIcons();
}

/* --- Data Loading & Setup --- */
function loadDataset(data) {
    database = data;
    filteredData = [...database];
    currentPage = 1;

    // Check if redirected from categorias.html with active category selection
    checkStoredCategoryFilter();

    // Auto-discover distinct categories and build filters
    buildFilterSelects();

    // Run initial filter + stats + render
    applyFiltersAndRender();
}

function checkStoredCategoryFilter() {
    const isFilterActive = localStorage.getItem('iei.explorerFilterActive');
    const rawCategories = localStorage.getItem('iei.selectedCategories');
    const directFilterRaw = localStorage.getItem('iei.explorerDirectFilter');

    if (directFilterRaw) {
        localStorage.removeItem('iei.explorerDirectFilter');
        try {
            const parsed = JSON.parse(directFilterRaw);
            if (parsed.subcategory) {
                activeFilters.subcategory = [parsed.subcategory];
                activeFilters.subcategoryText = parsed.subcategory;
                const subInput = document.getElementById('filter-subcategory-text');
                if (subInput) subInput.value = parsed.subcategory;
            }
        } catch (e) {
            console.error("Error reading direct filter", e);
        }
    } else if (isFilterActive === 'true' && rawCategories) {
        localStorage.removeItem('iei.explorerFilterActive');
        try {
            const selectedList = JSON.parse(rawCategories);
            if (Array.isArray(selectedList) && selectedList.length > 0) {
                const matchingMajorCats = new Set();
                const matchingSubcats = new Set();
                database.forEach(row => {
                    const major = (row.major_category || '').trim();
                    const sub = (row.subcategory || '').trim();
                    selectedList.forEach(sel => {
                        const selLower = sel.toLowerCase();
                        if (major.toLowerCase().includes(selLower) || selLower.includes(major.toLowerCase())) {
                            matchingMajorCats.add(major);
                        }
                        if (sub.toLowerCase().includes(selLower) || selLower.includes(sub.toLowerCase())) {
                            matchingSubcats.add(sub);
                        }
                    });
                });
                if (matchingMajorCats.size > 0) {
                    activeFilters.majorCategory = Array.from(matchingMajorCats);
                }
                if (matchingSubcats.size > 0) {
                    activeFilters.subcategory = Array.from(matchingSubcats);
                }
            }
        } catch (e) {
            console.error("Error reading stored category filter", e);
        }
    }
}

function buildFilterSelects() {
    // Helper to get unique, sorted, non-empty values
    const getUniqueValues = (key) => {
        const vals = new Set();
        database.forEach(row => {
            if (row[key]) {
                const val = row[key].trim();
                if (val) vals.add(val);
            }
        });
        return Array.from(vals).sort();
    };

    // Extract unique categories
    const inheritances = getUniqueValues('inheritance');
    const majorCategories = getUniqueValues('major_category');
    const subcategories = getUniqueValues('subcategory');
    const tCells = getUniqueValues('t_cell');
    const bCells = getUniqueValues('b_cell');
    const igs = getUniqueValues('immunoglobulins');
    const neutrophils = getUniqueValues('neutrophils');

    // Create dropdown components
    setupMultiSelect('select-inheritance-wrapper', 'inheritance', inheritances, 'Cualquiera');
    setupMultiSelect('select-major-category-wrapper', 'majorCategory', majorCategories, 'Todas las Categorías');
    setupMultiSelect('select-subcategory-wrapper', 'subcategory', subcategories, 'Todas las Subcategorías');

    setupMultiSelect('select-tcell-wrapper', 'tCell', tCells, 'Cualquiera');
    setupMultiSelect('select-bcell-wrapper', 'bCell', bCells, 'Cualquiera');
    setupMultiSelect('select-igs-wrapper', 'immunoglobulins', igs, 'Cualquiera');
    setupMultiSelect('select-neutrophils-wrapper', 'neutrophils', neutrophils, 'Cualquiera');
}

/* --- Custom Multi-Select Dropdown Component --- */
function setupMultiSelect(wrapperId, filterKey, options, placeholder) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;

    selectWrappers[filterKey] = wrapper;

    // Clear wrapper
    wrapper.innerHTML = '';

    // Create header element
    const header = document.createElement('div');
    header.className = 'custom-select-header';
    header.innerHTML = `
        <span class="placeholder-text">${placeholder}</span>
        <i data-lucide="chevron-down"></i>
    `;
    wrapper.appendChild(header);

    // Create body element
    const body = document.createElement('div');
    body.className = 'custom-select-body';

    // Create search input inside dropdown if option count is large
    if (options.length > 5) {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'custom-select-search';
        searchInput.placeholder = 'Buscar opción...';
        body.appendChild(searchInput);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const optionElems = body.querySelectorAll('.custom-select-option');
            optionElems.forEach(opt => {
                const txt = opt.textContent.toLowerCase();
                opt.style.display = txt.includes(query) ? 'flex' : 'none';
            });
        });

        // Prevent click in search from closing dropdown
        searchInput.addEventListener('click', (e) => e.stopPropagation());
    }

    // Add "Select All" / "Clear" buttons
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.justifyContent = 'space-between';
    controls.style.padding = '4px 8px';
    controls.style.borderBottom = '1px solid var(--border-color)';
    controls.style.marginBottom = '6px';
    controls.innerHTML = `
        <button class="btn-text" style="font-size:0.75rem;" id="all-btn">Seleccionar Todos</button>
        <button class="btn-text text-danger" style="font-size:0.75rem;" id="none-btn">Ninguno</button>
    `;
    body.appendChild(controls);

    controls.querySelector('#all-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const checkboxes = body.querySelectorAll('.custom-select-option input');
        checkboxes.forEach(cb => {
            cb.checked = true;
            cb.closest('.custom-select-option').classList.add('selected');
        });
        updateSelectionState();
    });

    controls.querySelector('#none-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const checkboxes = body.querySelectorAll('.custom-select-option input');
        checkboxes.forEach(cb => {
            cb.checked = false;
            cb.closest('.custom-select-option').classList.remove('selected');
        });
        updateSelectionState();
    });

    // Create options list
    const optionsContainer = document.createElement('div');
    optionsContainer.style.maxHeight = '180px';
    optionsContainer.style.overflowY = 'auto';

    options.forEach(optVal => {
        const option = document.createElement('div');
        option.className = 'custom-select-option';
        option.dataset.value = optVal;

        const isSelected = activeFilters[filterKey].includes(optVal);
        if (isSelected) option.classList.add('selected');

        option.innerHTML = `
            <input type="checkbox" ${isSelected ? 'checked' : ''}>
            <span>${optVal}</span>
        `;

        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const cb = option.querySelector('input');
            cb.checked = !cb.checked;
            option.classList.toggle('selected', cb.checked);
            updateSelectionState();
        });

        option.querySelector('input').addEventListener('click', (e) => {
            e.stopPropagation();
            option.classList.toggle('selected', e.target.checked);
            updateSelectionState();
        });

        optionsContainer.appendChild(option);
    });

    body.appendChild(optionsContainer);
    wrapper.appendChild(body);

    // Click header triggers dropdown open
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
            wrapper.classList.add('open');
        }
    });

    // Update local state when options change
    function updateSelectionState() {
        const selected = [];
        body.querySelectorAll('.custom-select-option.selected').forEach(elem => {
            selected.push(elem.dataset.value);
        });

        activeFilters[filterKey] = selected;

        // Update header placeholder text
        const textSpan = header.querySelector('span');
        if (selected.length === 0) {
            textSpan.textContent = placeholder;
            textSpan.classList.remove('has-selection');
        } else if (selected.length === 1) {
            textSpan.textContent = selected[0];
            textSpan.classList.add('has-selection');
        } else {
            textSpan.textContent = `${selected.length} seleccionados`;
            textSpan.classList.add('has-selection');
        }

        applyFiltersAndRender();
    }

    // Render initial state
    updateSelectionState();
    lucide.createIcons({ attrs: { class: 'icon-svg' } });
}

function closeAllDropdowns() {
    document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    document.getElementById('download-dropdown-menu').classList.remove('open');
}

// Global click closes dropdowns
document.addEventListener('click', () => {
    closeAllDropdowns();
});

/* --- UI Controls & Event Listeners --- */
function initUiEvents() {
    // 0. Compare Categories Button
    const defaultBtn = document.getElementById('load-default-btn');
    if (defaultBtn) {
        defaultBtn.addEventListener('click', () => {
            window.location.href = 'categorias.html';
        });
    }

    // 1. Text Filters Search
    const searchInputs = [
        { id: 'filter-gene', key: 'gene' },
        { id: 'filter-disease', key: 'disease' },
        { id: 'filter-features', key: 'features' },
        { id: 'filter-omim', key: 'omim' },
        { id: 'filter-inheritance-text', key: 'inheritanceText' },
        { id: 'filter-major-category-text', key: 'majorCategoryText' },
        { id: 'filter-subcategory-text', key: 'subcategoryText' },
        { id: 'global-search-input', key: 'global' }
    ];

    searchInputs.forEach(inputObj => {
        const inputElem = document.getElementById(inputObj.id);
        if (inputElem) {
            inputElem.addEventListener('input', (e) => {
                activeFilters[inputObj.key] = e.target.value.trim();
                applyFiltersAndRender();
            });
        }
    });

    // 2. Clear All Filters Buttons
    const clearFilters = () => {
        // Clear text filters
        searchInputs.forEach(inputObj => {
            const inputElem = document.getElementById(inputObj.id);
            if (inputElem) inputElem.value = '';
            activeFilters[inputObj.key] = '';
        });

        // Clear array filters
        for (let key in activeFilters) {
            if (Array.isArray(activeFilters[key])) {
                activeFilters[key] = [];
            }
        }

        // Regenerate selects to reflect empty state
        buildFilterSelects();

        applyFiltersAndRender();
    };

    document.getElementById('clear-all-filters-btn').addEventListener('click', clearFilters);
    document.getElementById('no-results-clear-btn').addEventListener('click', clearFilters);
    document.getElementById('chips-clear-btn').addEventListener('click', clearFilters);

    // 3. Advanced filters panel toggle
    const advTrigger = document.getElementById('advanced-filters-trigger');
    const advContent = document.getElementById('advanced-filters-content');
    const advPanel = document.getElementById('advanced-filters-panel');
    if (advTrigger) {
        advTrigger.addEventListener('click', () => {
            advPanel.classList.toggle('open');
            const isOpen = advPanel.classList.contains('open');
            advContent.style.display = isOpen ? 'block' : 'none';
        });
    }

    // 4. Download actions
    const downloadTrigger = document.getElementById('download-btn-trigger');
    const downloadMenu = document.getElementById('download-dropdown-menu');
    downloadTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadMenu.classList.toggle('open');
    });

    document.getElementById('copy-genes-clipboard').addEventListener('click', () => {
        copyGenesToClipboard();
    });

    document.getElementById('download-genes-txt').addEventListener('click', () => {
        downloadGenesTxt();
    });

    document.getElementById('download-table-csv').addEventListener('click', () => {
        downloadTableCsv();
    });

    // Page Size Selector
    const pageSizeSelect = document.getElementById('page-size-select');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'all') {
                rowsPerPage = filteredData.length > 0 ? filteredData.length : 10000;
            } else {
                rowsPerPage = parseInt(val) || 20;
            }
            currentPage = 1;
            renderTableRows();
            renderPagination();
        });
    }

    // 5. Drawer Close Action
    const drawerOverlay = document.getElementById('detail-drawer-overlay');
    const drawer = document.getElementById('detail-drawer');
    const closeDrawerBtn = document.getElementById('detail-drawer-close');

    const closeDrawer = () => {
        drawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        // Unselect active rows
        document.querySelectorAll('#table-body tr').forEach(r => r.classList.remove('active-row'));
    };

    closeDrawerBtn.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    // 6. Column Sorting
    document.querySelectorAll('.data-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.column;
            if (currentSortColumn === column) {
                // Toggle direction
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortColumn = column;
                currentSortDirection = 'asc';
            }

            // Update table headers indicator
            updateSortIndicators();

            // Re-render
            sortAndRenderTable();
        });
    });
}

function updateSortIndicators() {
    document.querySelectorAll('.data-table th.sortable').forEach(th => {
        const iconWrapper = th.querySelector('.sort-icon-wrapper');
        if (iconWrapper) {
            if (th.dataset.column === currentSortColumn) {
                iconWrapper.innerHTML = currentSortDirection === 'asc' ? '<i data-lucide="chevron-up"></i>' : '<i data-lucide="chevron-down"></i>';
            } else {
                iconWrapper.innerHTML = '<i data-lucide="chevrons-up-down"></i>';
            }
        }
    });
    lucide.createIcons();
}

/* --- Filtering Logic --- */
function applyFiltersAndRender() {
    showLoading(true);

    setTimeout(() => { // Async block to allow UI to show spinner
        const globalSearch = activeFilters.global.toLowerCase();
        const geneSearch = activeFilters.gene.toLowerCase();
        const diseaseSearch = activeFilters.disease.toLowerCase();
        const featuresSearch = activeFilters.features.toLowerCase();
        const omimSearch = activeFilters.omim.toLowerCase();
        const inheritanceTextSearch = activeFilters.inheritanceText.toLowerCase();
        const majorCategoryTextSearch = activeFilters.majorCategoryText.toLowerCase();

        filteredData = database.filter(row => {
            // 1. Global search (across all fields)
            if (globalSearch) {
                const combinedText = `
                    ${row.gene} ${row.disease} ${row.inheritance} 
                    ${row.major_category} ${row.subcategory} ${row.associated_features} 
                    ${row.omim} ${row.t_cell} ${row.b_cell} ${row.immunoglobulins} ${row.neutrophils}
                `.toLowerCase();
                if (!combinedText.includes(globalSearch)) return false;
            }

            // 2. Specific Column Text Filters
            if (geneSearch && !row.gene.toLowerCase().includes(geneSearch)) return false;
            if (diseaseSearch && !row.disease.toLowerCase().includes(diseaseSearch)) return false;
            if (featuresSearch && !row.associated_features.toLowerCase().includes(featuresSearch)) return false;
            if (omimSearch && !row.omim.toLowerCase().includes(omimSearch)) return false;
            if (inheritanceTextSearch && !row.inheritance.toLowerCase().includes(inheritanceTextSearch)) return false;
            if (majorCategoryTextSearch && !row.major_category.toLowerCase().includes(majorCategoryTextSearch)) return false;

            // 3. Dropdowns Multi-Select Filters
            if (activeFilters.inheritance.length > 0 && !activeFilters.inheritance.includes(row.inheritance)) return false;
            if (activeFilters.majorCategory.length > 0 && !activeFilters.majorCategory.includes(row.major_category)) return false;
            if (activeFilters.subcategory.length > 0 && !activeFilters.subcategory.includes(row.subcategory)) return false;

            // 4. Immunological Profile Multi-Select Filters
            if (activeFilters.tCell.length > 0 && !activeFilters.tCell.includes(row.t_cell)) return false;
            if (activeFilters.bCell.length > 0 && !activeFilters.bCell.includes(row.b_cell)) return false;
            if (activeFilters.immunoglobulins.length > 0 && !activeFilters.immunoglobulins.includes(row.immunoglobulins)) return false;
            if (activeFilters.neutrophils.length > 0 && !activeFilters.neutrophils.includes(row.neutrophils)) return false;

            return true;
        });

        currentPage = 1;

        // Update dashboard counters
        updateStats();

        // Update active filters chip UI
        renderActiveChips();

        // Render current data
        sortAndRenderTable();

        showLoading(false);
    }, 100);
}

function showLoading(show) {
    const loading = document.getElementById('table-loading-overlay');
    loading.style.display = show ? 'flex' : 'none';
}

/* --- Dashboard Statistics --- */
function animateGeneCount(targetCount) {
    const countElem = document.getElementById('stat-genes-count');
    const progressElem = document.getElementById('stat-genes-progress');
    const impactBadge = document.getElementById('stat-impact-badge');
    const statCard = document.getElementById('stat-card-genes');
    if (!countElem) return;

    const total = database.length;
    let startVal = parseInt(countElem.dataset.currentVal, 10);
    if (isNaN(startVal)) {
        const textParts = countElem.textContent.split('/');
        startVal = parseInt(textParts[0].trim(), 10);
        if (isNaN(startVal)) startVal = total;
    }
    countElem.dataset.currentVal = targetCount;

    // Trigger stat card pulse animation
    if (statCard) {
        statCard.classList.remove('updated');
        void statCard.offsetWidth; // trigger reflow
        statCard.classList.add('updated');
    }

    // Progress bar width
    const percentage = total > 0 ? (targetCount / total) * 100 : 0;
    if (progressElem) {
        progressElem.style.width = `${percentage}%`;
    }

    // Impact Badge calculation (Reduction %)
    if (impactBadge) {
        if (targetCount < total && targetCount > 0) {
            const reductionPct = Math.round((1 - targetCount / total) * 100);
            impactBadge.innerHTML = `<i data-lucide="sparkles" style="width:12px;height:12px;"></i> -${reductionPct}% (${targetCount} genes)`;
            impactBadge.style.display = 'inline-flex';
            lucide.createIcons();
        } else if (targetCount === 0) {
            impactBadge.innerHTML = `<i data-lucide="alert-triangle" style="width:12px;height:12px;"></i> 0 genes`;
            impactBadge.style.display = 'inline-flex';
            lucide.createIcons();
        } else {
            impactBadge.style.display = 'none';
        }
    }

    // Smooth counter animation
    const duration = 350;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progressRatio, 3);
        const currentVal = Math.round(startVal + (targetCount - startVal) * easeOut);

        countElem.textContent = `${currentVal} / ${total}`;

        if (progressRatio < 1) {
            requestAnimationFrame(step);
        } else {
            countElem.textContent = `${targetCount} / ${total}`;
        }
    }

    requestAnimationFrame(step);
}

function updateStats() {
    // 1. Animated Count & Impact Badge
    animateGeneCount(filteredData.length);

    // 2. Active filters count
    let activeFiltersCount = 0;
    for (let key in activeFilters) {
        if (activeFilters[key]) {
            if (Array.isArray(activeFilters[key])) {
                activeFiltersCount += activeFilters[key].length;
            } else if (activeFilters[key].trim() !== '') {
                activeFiltersCount += 1;
            }
        }
    }
    const statActiveElem = document.getElementById('stat-active-filters');
    if (statActiveElem) statActiveElem.textContent = activeFiltersCount;

    // Toggle visibility of clear filters button in actions bar
    const clearBtn = document.getElementById('clear-all-filters-btn');
    if (clearBtn) {
        clearBtn.style.display = activeFiltersCount > 0 ? 'inline-flex' : 'none';
    }

    // 3. Unique Diseases
    const uniqueDiseases = new Set(
        filteredData
            .map(row => row.disease ? row.disease.trim() : '')
            .filter(Boolean)
    ).size;
    const statDiseasesElem = document.getElementById('stat-diseases-count');
    if (statDiseasesElem) statDiseasesElem.textContent = uniqueDiseases;
}

/* --- Active Filters Chips Render --- */
function renderActiveChips() {
    const chipContainer = document.getElementById('active-chips-container');
    const chipList = document.getElementById('chips-list');
    const countBadge = document.getElementById('chips-count-badge');

    chipList.innerHTML = '';
    let totalChips = 0;

    // Helper to add a chip
    const addChip = (label, filterKey, value, isArray = false) => {
        totalChips++;
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `
            <span><strong>${label}:</strong> ${value}</span>
            <button class="remove-chip-btn" data-key="${filterKey}" data-val="${value}" data-array="${isArray}">
                <i data-lucide="x"></i>
            </button>
        `;

        chip.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFilter(filterKey, value, isArray);
        });

        chipList.appendChild(chip);
    };
    // Text search chips
    if (activeFilters.global) addChip('Global', 'global', activeFilters.global);
    if (activeFilters.gene) addChip('Gen', 'gene', activeFilters.gene);
    if (activeFilters.disease) addChip('Enfermedad', 'disease', activeFilters.disease);
    if (activeFilters.features) addChip('Clinica', 'features', activeFilters.features);
    if (activeFilters.omim) addChip('OMIM', 'omim', activeFilters.omim);
    if (activeFilters.inheritanceText) addChip('Herencia (Cabecera)', 'inheritanceText', activeFilters.inheritanceText);
    if (activeFilters.majorCategoryText) addChip('Categoría (Cabecera)', 'majorCategoryText', activeFilters.majorCategoryText);

    // Array selection chips
    const arrayLabels = {
        inheritance: 'Herencia',
        majorCategory: 'Cat. Mayor',
        subcategory: 'Subcat.',
        tCell: 'Células T',
        bCell: 'Células B',
        immunoglobulins: 'Igs',
        neutrophils: 'Neutrófilos'
    };

    for (let key in arrayLabels) {
        if (activeFilters[key] && activeFilters[key].length > 0) {
            activeFilters[key].forEach(val => {
                addChip(arrayLabels[key], key, val, true);
            });
        }
    }

    if (countBadge) countBadge.textContent = totalChips;
    chipContainer.style.display = totalChips > 0 ? 'block' : 'none';

    // Setup collapse button listener once
    const collapseBtn = document.getElementById('chips-toggle-collapse-btn');
    if (collapseBtn && !collapseBtn.dataset.bound) {
        collapseBtn.dataset.bound = "true";
        collapseBtn.addEventListener('click', () => {
            chipContainer.classList.toggle('collapsed');
            const icon = document.getElementById('chips-collapse-icon');
            const isCollapsed = chipContainer.classList.contains('collapsed');
            if (icon) {
                icon.setAttribute('data-lucide', isCollapsed ? 'chevron-down' : 'chevron-up');
                lucide.createIcons();
            }
        });
    }

    lucide.createIcons();
}

function removeFilter(key, value, isArray) {
    if (isArray) {
        // Remove item from filter list
        activeFilters[key] = activeFilters[key].filter(v => v !== value);
        // Refresh the specific multi-select UI selection state
        buildFilterSelects();
    } else {
        // Clear text field
        activeFilters[key] = '';
        const inputMap = {
            global: 'global-search-input',
            gene: 'filter-gene',
            disease: 'filter-disease',
            features: 'filter-features',
            omim: 'filter-omim',
            inheritanceText: 'filter-inheritance-text',
            majorCategoryText: 'filter-major-category-text'
        };
        const inputElem = document.getElementById(inputMap[key]);
        if (inputElem) inputElem.value = '';
    }

    applyFiltersAndRender();
}

/* --- Table Sorting & Render --- */
function sortAndRenderTable() {
    // 1. Sort data
    const column = currentSortColumn;
    const dir = currentSortDirection;

    filteredData.sort((a, b) => {
        let valA = a[column] || '';
        let valB = b[column] || '';

        // Handle numeric sorting for OMIM
        if (column === 'omim') {
            const numA = parseInt(valA.replace(/[^0-9]/g, '')) || 0;
            const numB = parseInt(valB.replace(/[^0-9]/g, '')) || 0;
            return dir === 'asc' ? numA - numB : numB - numA;
        }

        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();

        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
    });

    // 2. Render table contents
    renderTableRows();

    // 3. Render pagination
    renderPagination();
}

function renderTableRows() {
    const tbody = document.getElementById('table-body');
    const noResults = document.getElementById('no-results-state');
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        noResults.style.display = 'flex';
        document.getElementById('footer-info-text').textContent = 'Mostrando 0 registros';
        return;
    }
    noResults.style.display = 'none';

    // Get start/end indices for current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);

    document.getElementById('footer-info-text').textContent = `Mostrando ${startIndex + 1} a ${endIndex} de ${filteredData.length} registros`;

    const pageData = filteredData.slice(startIndex, endIndex);

    pageData.forEach((row, idx) => {
        const tr = document.createElement('tr');

        // Clean gene name for links
        const cleanGene = cleanGeneSymbol(row.gene);

        // Form external link HTML block
        const omimHtml = row.omim
            ? `<a href="https://www.omim.org/entry/${row.omim.replace(/[*+]/g, '').trim()}" target="_blank" class="badge-omim" onclick="event.stopPropagation();">${row.omim}</a>`
            : '<span class="text-muted">-</span>';

        const inheritanceClass = getInheritanceClass(row.inheritance);

        // Limit major category size
        let catText = row.major_category;
        if (catText.length > 50) {
            catText = catText.substring(0, 50) + '...';
        }

        tr.innerHTML = `
            <td>
                <span class="gene-badge">${row.gene}</span>
            </td>
            <td>
                <div style="font-weight: 500;">${row.disease}</div>
            </td>
            <td>
                <span class="badge-inheritance ${inheritanceClass}">${row.inheritance || 'N/A'}</span>
            </td>
            <td>${omimHtml}</td>
            <td class="hidden-tablet cat-cell-clickable" onclick="event.stopPropagation(); filterByMajorCategory('${row.major_category.replace(/'/g, "\\'")}');">
                <span class="badge-category-click">${catText}</span>
            </td>
            <td class="hidden-tablet subcat-cell-clickable" onclick="event.stopPropagation(); filterBySubcategory('${(row.subcategory || '').replace(/'/g, "\\'")}');">
                <span class="badge-subcategory-click">${row.subcategory || '-'}</span>
            </td>
            <td class="text-center">
                <div class="links-cell">
                    ${createResourceLink('pubmed', cleanGene, 'PubMed Search')}
                    ${row.omim ? createResourceLink('omim', row.omim, 'OMIM Entry') : createResourceLink('omim_search', cleanGene, 'Search OMIM')}
                    ${createResourceLink('decipher', cleanGene, 'Decipher Gene')}
                    ${createResourceLink('alphafold', cleanGene, 'AlphaFold Structure')}
                    ${createResourceLink('uniprot', cleanGene, 'UniProt Entry')}
                    ${createResourceLink('gnomad', cleanGene, 'gnomAD Browser')}
                </div>
            </td>
        `;

        // Click on row to open drawer
        tr.addEventListener('click', () => {
            // Clear prior active rows
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('active-row'));
            tr.classList.add('active-row');
            openDetailDrawer(row);
        });

        tbody.appendChild(tr);
    });

    lucide.createIcons();
}

function cleanGeneSymbol(defect) {
    if (!defect) return '';
    let gene = defect.trim();
    // Common mappings if defects contain text like: ADA (AR) or deletion details
    gene = gene.replace(/[*+]/g, '');
    // If it contains spaces or deletion descriptors (like '11q23del'), trim and return the first part or return full
    // But for searches, we usually just need the clean alphanumeric token
    const parts = gene.split(/[\s,]+/);
    if (parts.length > 0) {
        // If it's a deletion containing 'del' we can pass it, but for gene specific things we return it
        return parts[0];
    }
    return gene;
}

function filterByMajorCategory(category) {
    if (!category) return;
    activeFilters.majorCategory = [category];

    // Clear text filter
    activeFilters.majorCategoryText = '';
    const majorInput = document.getElementById('filter-major-category-text');
    if (majorInput) majorInput.value = '';

    // Refresh multi-select filters UI
    buildFilterSelects();
    // Run filters and render
    applyFiltersAndRender();
}

function filterBySubcategory(subcategory) {
    if (!subcategory) return;
    activeFilters.subcategory = [subcategory];

    activeFilters.subcategoryText = '';
    const subInput = document.getElementById('filter-subcategory-text');
    if (subInput) subInput.value = '';

    buildFilterSelects();
    applyFiltersAndRender();
}

/* --- Ig Reference Calculator Modal --- */
/* --- Ig & Immunological Reference Calculator Modal --- */
const IG_REFERENCE_RANGES = {
    '0-3m': { igg: [300, 1000], iga: [5, 50], igm: [15, 100], tcell: [2500, 5500], bcell: [600, 3000], neutrophils: [1000, 6000] },
    '4-6m': { igg: [200, 600], iga: [10, 70], igm: [20, 100], tcell: [2200, 4800], bcell: [700, 2500], neutrophils: [1000, 6000] },
    '7-12m': { igg: [300, 900], iga: [15, 100], igm: [30, 120], tcell: [1900, 4500], bcell: [600, 2000], neutrophils: [1500, 8000] },
    '1-3y': { igg: [400, 1000], iga: [20, 150], igm: [40, 150], tcell: [1400, 3700], bcell: [500, 1500], neutrophils: [1500, 8000] },
    '4-6y': { igg: [500, 1200], iga: [30, 200], igm: [45, 180], tcell: [1200, 3000], bcell: [300, 1000], neutrophils: [1500, 8000] },
    '7-11y': { igg: [600, 1400], iga: [50, 250], igm: [50, 200], tcell: [900, 2600], bcell: [200, 600], neutrophils: [1500, 8000] },
    '12-16y': { igg: [600, 1500], iga: [60, 300], igm: [50, 220], tcell: [800, 2300], bcell: [200, 500], neutrophils: [1500, 8000] },
    'adult': { igg: [700, 1600], iga: [70, 400], igm: [40, 230], tcell: [700, 2100], bcell: [100, 500], neutrophils: [1500, 8000] }
};

function initIgCalcModal() {
    const calcBtn = document.getElementById('ig-calc-toggle-btn');
    const modal = document.getElementById('ig-calc-modal');
    const closeBtn = document.getElementById('ig-calc-modal-close');
    const ageSelect = document.getElementById('ig-calc-age');
    const iggInput = document.getElementById('ig-calc-igg');
    const igaInput = document.getElementById('ig-calc-iga');
    const igmInput = document.getElementById('ig-calc-igm');
    const tcellInput = document.getElementById('ig-calc-tcell');
    const bcellInput = document.getElementById('ig-calc-bcell');
    const neutInput = document.getElementById('ig-calc-neutrophils');
    const resetBtn = document.getElementById('ig-calc-reset-btn');
    const applyBtn = document.getElementById('ig-calc-apply-btn');

    if (!calcBtn || !modal) return;

    const openModal = () => {
        const profile = getPatientProfile();
        if (profile) {
            if (ageSelect && profile.age) ageSelect.value = profile.age;
            if (iggInput && profile.igg !== undefined) iggInput.value = isNaN(profile.igg) ? '' : profile.igg;
            if (igaInput && profile.iga !== undefined) igaInput.value = isNaN(profile.iga) ? '' : profile.iga;
            if (igmInput && profile.igm !== undefined) igmInput.value = isNaN(profile.igm) ? '' : profile.igm;
            if (tcellInput && profile.tcell !== undefined) tcellInput.value = isNaN(profile.tcell) ? '' : profile.tcell;
            if (bcellInput && profile.bcell !== undefined) bcellInput.value = isNaN(profile.bcell) ? '' : profile.bcell;
            if (neutInput && profile.neutrophils !== undefined) neutInput.value = isNaN(profile.neutrophils) ? '' : profile.neutrophils;
        }
        modal.classList.add('open');
        updateIgCalcTable();
    };

    const closeModal = () => {
        modal.classList.remove('open');
    };

    calcBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    [ageSelect, iggInput, igaInput, igmInput, tcellInput, bcellInput, neutInput].forEach(elem => {
        if (elem) elem.addEventListener('input', updateIgCalcTable);
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            [iggInput, igaInput, igmInput, tcellInput, bcellInput, neutInput].forEach(i => {
                if (i) i.value = '';
            });
            savePatientProfile(null);
            updateIgCalcTable();
            renderPatientEntityCardIndex();
        });
    }

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const ageKey = ageSelect ? ageSelect.value : 'adult';
            const ref = IG_REFERENCE_RANGES[ageKey] || IG_REFERENCE_RANGES.adult;
            const iggVal = parseFloat(iggInput ? iggInput.value : '');
            const igaVal = parseFloat(igaInput ? igaInput.value : '');
            const igmVal = parseFloat(igmInput ? igmInput.value : '');
            const tcellVal = parseFloat(tcellInput ? tcellInput.value : '');
            const bcellVal = parseFloat(bcellInput ? bcellInput.value : '');
            const neutVal = parseFloat(neutInput ? neutInput.value : '');

            // Helper to get unique options from current dataset
            const getUniqueOptions = (key) => {
                const set = new Set();
                database.forEach(r => { if (r[key]) set.add(r[key].trim()); });
                return Array.from(set);
            };

            const allIgs = getUniqueOptions('immunoglobulins');
            const allTCells = getUniqueOptions('t_cell');
            const allBCells = getUniqueOptions('b_cell');
            const allNeutrophils = getUniqueOptions('neutrophils');

            // 1. Immunoglobulins (Low / Decreased)
            const isIgLow = (!isNaN(iggVal) && iggVal < ref.igg[0]) ||
                (!isNaN(igaVal) && igaVal < ref.iga[0]) ||
                (!isNaN(igmVal) && igmVal < ref.igm[0]);
            if (isIgLow) {
                const lowIgs = allIgs.filter(v => {
                    const l = v.toLowerCase();
                    return l.includes('low') || l.includes('disminuid') || l.includes('ausenc') || l.includes('agammaglobulin') || l.includes('hypo') || l.includes('reduced') || l.includes('decrease');
                });
                activeFilters.immunoglobulins = lowIgs.length > 0 ? lowIgs : allIgs;
            }

            // 2. T-Cells (Low / Decreased)
            const isTLow = !isNaN(tcellVal) && tcellVal < ref.tcell[0];
            if (isTLow) {
                const lowT = allTCells.filter(v => {
                    const l = v.toLowerCase();
                    return l.includes('low') || l.includes('disminuid') || l.includes('ausenc') || l.includes('profound') || l.includes('decrease') || l.includes('lack');
                });
                activeFilters.tCell = lowT.length > 0 ? lowT : allTCells;
            }

            // 3. B-Cells (Low / Decreased)
            const isBLow = !isNaN(bcellVal) && bcellVal < ref.bcell[0];
            if (isBLow) {
                const lowB = allBCells.filter(v => {
                    const l = v.toLowerCase();
                    return l.includes('low') || l.includes('disminuid') || l.includes('ausenc') || l.includes('decrease') || l.includes('absent') || l.includes('rare');
                });
                activeFilters.bCell = lowB.length > 0 ? lowB : allBCells;
            }

            // 4. Neutrophils (Low / Decreased)
            const isNeutLow = !isNaN(neutVal) && neutVal < ref.neutrophils[0];
            if (isNeutLow) {
                const lowNeut = allNeutrophils.filter(v => {
                    const l = v.toLowerCase();
                    return l.includes('low') || l.includes('neutropenia') || l.includes('disminuid') || l.includes('ausenc') || l.includes('decrease');
                });
                activeFilters.neutrophils = lowNeut.length > 0 ? lowNeut : allNeutrophils;
            }

            const currentProfile = getPatientProfile() || {};
            const catsSet = new Set(currentProfile.categories || []);

            if (isIgLow) {
                catsSet.add('Hipo');
                catsSet.add('LB_Antibody');
            }
            if (isTLow) {
                catsSet.add('Linfopenia T');
            }
            if (isBLow) {
                catsSet.add('Linfopenia B');
            }
            if (isNeutLow) {
                catsSet.add('Infecciones');
            }

            // Save patient lab profile to localStorage for comparison view
            savePatientProfile({
                ...currentProfile,
                age: ageKey,
                igg: isNaN(iggVal) ? undefined : iggVal,
                iga: isNaN(igaVal) ? undefined : igaVal,
                igm: isNaN(igmVal) ? undefined : igmVal,
                tcell: isNaN(tcellVal) ? undefined : tcellVal,
                bcell: isNaN(bcellVal) ? undefined : bcellVal,
                neutrophils: isNaN(neutVal) ? undefined : neutVal,
                isIgLow: isIgLow,
                isTLow: isTLow,
                isBLow: isBLow,
                isNeutLow: isNeutLow,
                categories: Array.from(catsSet)
            });

            closeModal();
            buildFilterSelects();
            applyFiltersAndRender();
            renderPatientEntityCardIndex();
        });
    }
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

function renderPatientEntityCardIndex() {
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
    tagsContainer.innerHTML = buildPatientEntityTags(profile, 'removePatientTagIndex');

    const clearBtn = document.getElementById('clear-patient-btn');
    if (clearBtn && !clearBtn.dataset.bound) {
        clearBtn.dataset.bound = "true";
        clearBtn.addEventListener('click', () => {
            savePatientProfile(null);
            resetAllFilters();
            renderPatientEntityCardIndex();
        });
    }
}

function buildPatientEntityTags(profile, onRemoveFnName) {
    if (!profile) return '';
    const tags = [];

    const AGE_LABELS = {
        '0-1m': 'Neonato (0-1m)',
        '2-5m': 'Lactante (2-5m)',
        '6-12m': 'Lactante (6-12m)',
        '1-3y': 'Infante (1-3a)',
        '4-6y': 'Infante (4-6a)',
        '7-11y': 'Escolar (7-11a)',
        '12-16y': 'Adolescente (12-16a)',
        'adult': 'Adulto (≥18a)'
    };

    if (profile.age) {
        const label = AGE_LABELS[profile.age] || profile.age;
        tags.push(`<span class="patient-tag-chip"><i class="fa-solid fa-calendar-day"></i> Edad: ${escapeHtml(label)}</span>`);
    }

    if (profile.igg !== undefined && !isNaN(profile.igg)) {
        const st = profile.isIgLow ? 'Bajo' : 'Normal';
        const icon = profile.isIgLow ? 'fa-arrow-down' : 'fa-check';
        tags.push(`<span class="patient-tag-chip tag-removeable" onclick="${onRemoveFnName}('igg');" title="Clic para remover IgG"><i class="fa-solid ${icon}"></i> IgG: ${profile.igg} mg/dL (${st}) <span class="patient-tag-remove-btn">×</span></span>`);
    }

    if (profile.iga !== undefined && !isNaN(profile.iga)) {
        const st = profile.isIgLow ? 'Bajo' : 'Normal';
        const icon = profile.isIgLow ? 'fa-arrow-down' : 'fa-check';
        tags.push(`<span class="patient-tag-chip tag-removeable" onclick="${onRemoveFnName}('iga');" title="Clic para remover IgA"><i class="fa-solid ${icon}"></i> IgA: ${profile.iga} mg/dL (${st}) <span class="patient-tag-remove-btn">×</span></span>`);
    }

    if (profile.tcell !== undefined && !isNaN(profile.tcell)) {
        const st = profile.isTLow ? 'Disminuido' : 'Normal';
        const icon = profile.isTLow ? 'fa-arrow-down' : 'fa-check';
        tags.push(`<span class="patient-tag-chip tag-removeable" onclick="${onRemoveFnName}('tcell');" title="Clic para remover T-CD3+"><i class="fa-solid ${icon}"></i> Linfocitos T: ${profile.tcell}/mm³ (${st}) <span class="patient-tag-remove-btn">×</span></span>`);
    }

    if (profile.bcell !== undefined && !isNaN(profile.bcell)) {
        const st = profile.isBLow ? 'Disminuido' : 'Normal';
        const icon = profile.isBLow ? 'fa-arrow-down' : 'fa-check';
        tags.push(`<span class="patient-tag-chip tag-removeable" onclick="${onRemoveFnName}('bcell');" title="Clic para remover B-CD19+"><i class="fa-solid ${icon}"></i> Linfocitos B: ${profile.bcell}/mm³ (${st}) <span class="patient-tag-remove-btn">×</span></span>`);
    }

    if (profile.neutrophils !== undefined && !isNaN(profile.neutrophils)) {
        const st = profile.isNeutLow ? 'Neutropenia' : 'Normal';
        const icon = profile.isNeutLow ? 'fa-arrow-down' : 'fa-check';
        tags.push(`<span class="patient-tag-chip tag-removeable" onclick="${onRemoveFnName}('neutrophils');" title="Clic para remover Neutrófilos"><i class="fa-solid ${icon}"></i> Neutrófilos: ${profile.neutrophils}/mm³ (${st}) <span class="patient-tag-remove-btn">×</span></span>`);
    }

    if (profile.categories && profile.categories.length > 0) {
        profile.categories.forEach(cat => {
            tags.push(`<span class="patient-tag-chip tag-removeable" onclick="${onRemoveFnName}('cat_${escapeHtml(cat)}');" title="Clic para desmarcar categoría"><i class="fa-solid fa-layer-group"></i> ${escapeHtml(cat)} <span class="patient-tag-remove-btn">×</span></span>`);
        });
    }

    return tags.join('');
}

function removePatientTagIndex(key) {
    const profile = getPatientProfile();
    if (!profile) return;

    if (key.startsWith('cat_')) {
        const catName = key.replace('cat_', '');
        profile.categories = (profile.categories || []).filter(c => c !== catName);
    } else if (key === 'igg') {
        profile.igg = undefined;
    } else if (key === 'iga') {
        profile.iga = undefined;
    } else if (key === 'tcell') {
        profile.tcell = undefined;
        profile.isTLow = false;
        activeFilters.tCell = [];
    } else if (key === 'bcell') {
        profile.bcell = undefined;
        profile.isBLow = false;
        activeFilters.bCell = [];
    } else if (key === 'neutrophils') {
        profile.neutrophils = undefined;
        profile.isNeutLow = false;
        activeFilters.neutrophils = [];
    }

    savePatientProfile(profile);
    buildFilterSelects();
    applyFiltersAndRender();
    renderPatientEntityCardIndex();
}

window.removePatientTagIndex = removePatientTagIndex;

function updateIgCalcTable() {
    const ageSelect = document.getElementById('ig-calc-age');
    const iggInput = document.getElementById('ig-calc-igg');
    const igaInput = document.getElementById('ig-calc-iga');
    const igmInput = document.getElementById('ig-calc-igm');
    const tcellInput = document.getElementById('ig-calc-tcell');
    const bcellInput = document.getElementById('ig-calc-bcell');
    const neutInput = document.getElementById('ig-calc-neutrophils');
    const tbody = document.getElementById('ig-calc-table-body');
    if (!tbody || !ageSelect) return;

    const ageKey = ageSelect.value;
    const ref = IG_REFERENCE_RANGES[ageKey] || IG_REFERENCE_RANGES.adult;

    const params = [
        { name: 'IgG', range: ref.igg, val: parseFloat(iggInput ? iggInput.value : ''), unit: 'mg/dL' },
        { name: 'IgA', range: ref.iga, val: parseFloat(igaInput ? igaInput.value : ''), unit: 'mg/dL' },
        { name: 'IgM', range: ref.igm, val: parseFloat(igmInput ? igmInput.value : ''), unit: 'mg/dL' },
        { name: 'Células T CD3+', range: ref.tcell, val: parseFloat(tcellInput ? tcellInput.value : ''), unit: '/mm³' },
        { name: 'Células B CD19+', range: ref.bcell, val: parseFloat(bcellInput ? bcellInput.value : ''), unit: '/mm³' },
        { name: 'Neutrófilos', range: ref.neutrophils, val: parseFloat(neutInput ? neutInput.value : ''), unit: '/mm³' }
    ];

    tbody.innerHTML = params.map(p => {
        let statusBadge = '<span class="ig-badge-status neutral">Sin ingresar</span>';
        if (!isNaN(p.val)) {
            if (p.val < p.range[0]) {
                statusBadge = '<span class="ig-badge-status low">📉 Disminuido (Hipo)</span>';
            } else if (p.val > p.range[1]) {
                statusBadge = '<span class="ig-badge-status high">📈 Elevado (Hiper)</span>';
            } else {
                statusBadge = '<span class="ig-badge-status normal">✅ Normal</span>';
            }
        }
        return `
            <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.range[0]} – ${p.range[1]} ${p.unit}</td>
                <td>${!isNaN(p.val) ? p.val + ' ' + p.unit : '<span style="color:var(--text-muted);">-</span>'}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join('');
}

function getInheritanceClass(pattern) {
    if (!pattern) return 'other';
    const p = pattern.toUpperCase();
    if (p.includes('AR')) return 'ar';
    if (p.includes('AD')) return 'ad';
    if (p.includes('XL')) return 'xl';
    return 'other';
}

function createResourceLink(type, identifier, tooltip) {
    let url = '#';
    let label = '';
    const cleanId = typeof identifier === 'string' ? identifier.replace(/[*+]/g, '').trim() : identifier;

    switch (type) {
        case 'pubmed':
            url = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(cleanId)}+AND+(%22inborn+errors+of+immunity%22+OR+%22immunodeficiency%22)`;
            label = 'PM';
            break;
        case 'omim':
            url = `https://www.omim.org/entry/${cleanId}`;
            label = 'OM';
            break;
        case 'omim_search':
            url = `https://www.omim.org/search/?search=${encodeURIComponent(cleanId)}`;
            label = 'OM';
            break;
        case 'decipher':
            url = `https://www.deciphergenomics.org/gene/${cleanId}`;
            label = 'DC';
            break;
        case 'alphafold':
            url = `https://alphafold.ebi.ac.uk/search/text/${cleanId}`;
            label = 'AF';
            break;
        case 'uniprot':
            url = `https://www.uniprot.org/uniprotkb?query=gene:${encodeURIComponent(cleanId)}+AND+organism_id:9606`;
            label = 'UP';
            break;
        case 'gnomad':
            url = `https://gnomad.broadinstitute.org/gene/${encodeURIComponent(cleanId)}`;
            label = 'GN';
            break;
    }

    return `
        <a href="${url}" target="_blank" class="link-pill ${type.replace('_search', '')}" 
           title="${tooltip}" onclick="event.stopPropagation();">
            ${label}
        </a>
    `;
}

/* --- Pagination Controls --- */
function renderPagination() {
    const container = document.getElementById('pagination-controls');
    container.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (totalPages <= 1) return; // No pagination needed

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.disabled = currentPage === 1;
    prevBtn.innerHTML = '<i data-lucide="chevron-left" style="width:14px; height:14px;"></i>';
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTableRows();
            renderPagination();
        }
    });
    container.appendChild(prevBtn);

    // Page Numbers logic
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const btn = document.createElement('button');
        btn.className = 'pagination-btn';
        btn.textContent = '1';
        btn.addEventListener('click', () => {
            currentPage = 1;
            renderTableRows();
            renderPagination();
        });
        container.appendChild(btn);

        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.margin = '0 4px';
            dots.style.color = 'var(--text-muted)';
            container.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderTableRows();
            renderPagination();
        });
        container.appendChild(btn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.margin = '0 4px';
            dots.style.color = 'var(--text-muted)';
            container.appendChild(dots);
        }

        const btn = document.createElement('button');
        btn.className = 'pagination-btn';
        btn.textContent = totalPages;
        btn.addEventListener('click', () => {
            currentPage = totalPages;
            renderTableRows();
            renderPagination();
        });
        container.appendChild(btn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.innerHTML = '<i data-lucide="chevron-right" style="width:14px; height:14px;"></i>';
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTableRows();
            renderPagination();
        }
    });
    container.appendChild(nextBtn);

    lucide.createIcons();
}

/* --- Detail Drawer Implementation --- */
function openDetailDrawer(row) {
    const drawer = document.getElementById('detail-drawer');
    const drawerOverlay = document.getElementById('detail-drawer-overlay');
    const body = document.getElementById('detail-drawer-body');

    // Header setup
    document.getElementById('drawer-gene-title').textContent = row.gene;
    document.getElementById('drawer-disease-subtitle').textContent = row.disease;

    const catBadge = document.getElementById('drawer-category-badge');
    const match = row.major_category ? row.major_category.match(/Table \d+/i) : null;
    catBadge.textContent = match ? match[0] : 'Categoría';

    const cleanGene = cleanGeneSymbol(row.gene);
    const cleanOmim = row.omim ? row.omim.replace(/[*+]/g, '').trim() : '';

    // Render Drawer Content
    body.innerHTML = `
        <!-- General Category Details -->
        <div class="drawer-section">
            <h4 class="drawer-section-title">Clasificación</h4>
            <div class="detail-item" style="margin-bottom:12px;">
                <span class="detail-label">Categoría Mayor</span>
                <span class="detail-value">${row.major_category || 'N/A'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Subcategoría</span>
                <span class="detail-value">${row.subcategory || 'N/A'}</span>
            </div>
        </div>

        <!-- Genetics and Inheritance -->
        <div class="drawer-section">
            <h4 class="drawer-section-title">Genética & Códigos</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Herencia</span>
                    <span class="detail-value">
                        <span class="badge-inheritance ${getInheritanceClass(row.inheritance)}">${row.inheritance || 'N/A'}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">GOF/DN</span>
                    <span class="detail-value">${row.gof_dn || 'LOF / Defecto Convencional'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">OMIM ID</span>
                    <span class="detail-value">${row.omim ? `#${row.omim}` : 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ICD9 / ICD10</span>
                    <span class="detail-value">${row.icd9 || '-'}&nbsp;/&nbsp;${row.icd10 || '-'}</span>
                </div>
            </div>
        </div>

        <!-- Immunological Profile -->
        <div class="drawer-section">
            <h4 class="drawer-section-title">Perfil Inmunológico</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Recuento de Células T</span>
                    <span class="detail-value">${row.t_cell || 'Normal / No especificado'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Recuento de Células B</span>
                    <span class="detail-value">${row.b_cell || 'Normal / No especificado'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Inmunoglobulinas</span>
                    <span class="detail-value">${row.immunoglobulins || 'Normal / No especificado'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Recuento Neutrófilos</span>
                    <span class="detail-value">${row.neutrophils || 'Normal / No especificado'}</span>
                </div>
            </div>
            ${row.other_cells ? `
                <div class="detail-item" style="margin-top:10px;">
                    <span class="detail-label">Otras Células Afectadas</span>
                    <span class="detail-value">${row.other_cells}</span>
                </div>
            ` : ''}
        </div>

        <!-- Clinical Manifestations -->
        <div class="drawer-section">
            <h4 class="drawer-section-title">Manifestaciones Clínicas Asociadas</h4>
            <div class="associated-features-box">
                ${row.associated_features || 'No se detallan manifestaciones clínicas específicas.'}
            </div>
        </div>

        <!-- Human Phenotype Ontology Links -->
        ${row.hpo_ids && row.hpo_ids.length > 0 ? `
            <div class="drawer-section">
                <h4 class="drawer-section-title">Fenotipos HPO (${row.hpo_ids.length})</h4>
                <div class="hpo-list">
                    ${row.hpo_ids.map(hp => `
                        <a href="https://hpo.jax.org/app/browse/term/${hp}" target="_blank" class="hpo-link">
                            <i data-lucide="external-link"></i> ${hp}
                        </a>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        <!-- Databases Integration Links Grid -->
        <div class="drawer-section">
            <h4 class="drawer-section-title">Enlaces a Bases de Datos</h4>
            <div class="drawer-links-grid">
                <a href="https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(cleanGene)}+AND+(%22inborn+errors+of+immunity%22+OR+%22immunodeficiency%22)" target="_blank" class="drawer-link-btn pubmed">
                    <i data-lucide="search"></i> PubMed Search
                </a>
                
                ${cleanOmim ? `
                    <a href="https://www.omim.org/entry/${cleanOmim}" target="_blank" class="drawer-link-btn omim">
                        <i data-lucide="database"></i> OMIM Entry
                    </a>
                ` : `
                    <a href="https://www.omim.org/search/?search=${encodeURIComponent(cleanGene)}" target="_blank" class="drawer-link-btn omim">
                        <i data-lucide="search"></i> Search OMIM
                    </a>
                `}
                
                <a href="https://www.deciphergenomics.org/gene/${cleanGene}" target="_blank" class="drawer-link-btn decipher">
                    <i data-lucide="dna"></i> Decipher Gene
                </a>
                
                <a href="https://alphafold.ebi.ac.uk/search/text/${cleanGene}" target="_blank" class="drawer-link-btn alphafold">
                    <i data-lucide="box"></i> AlphaFold Protein
                </a>
                
                <a href="https://www.uniprot.org/uniprotkb?query=gene:${cleanGene}+AND+organism_id:9606" target="_blank" class="drawer-link-btn uniprot">
                    <i data-lucide="database"></i> UniProt Protein
                </a>
                
                <a href="https://gnomad.broadinstitute.org/gene/${cleanGene}" target="_blank" class="drawer-link-btn gnomad">
                    <i data-lucide="search"></i> gnomAD Browser
                </a>
                
                <a href="https://www.ncbi.nlm.nih.gov/clinvar/?term=${cleanGene}[gene]" target="_blank" class="drawer-link-btn clinvar" style="grid-column: span 2; justify-content: center;">
                    <i data-lucide="git-branch"></i> ClinVar Mutations Explorer
                </a>
            </div>
        </div>
    `;

    // Open drawer transitions
    drawerOverlay.classList.add('open');
    drawer.classList.add('open');
    lucide.createIcons();
}

/* --- Downloads Actions Implementation --- */
function downloadGenesTxt() {
    if (filteredData.length === 0) return;

    // Extract unique, clean gene symbols sorted alphabetically
    const genes = new Set();
    filteredData.forEach(row => {
        const gene = cleanGeneSymbol(row.gene);
        if (gene) genes.add(gene);
    });

    const geneList = Array.from(genes).sort();
    const content = geneList.join('\n');

    triggerBlobDownload(content, 'iei_filtered_genes.txt', 'text/plain');
}

function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                resolve();
            } else {
                reject(new Error("document.execCommand('copy') failed"));
            }
        } catch (err) {
            reject(err);
        }
    });
}

function copyGenesToClipboard() {
    if (filteredData.length === 0) return;

    // Extract unique, clean gene symbols sorted alphabetically
    const genes = new Set();
    filteredData.forEach(row => {
        const gene = cleanGeneSymbol(row.gene);
        if (gene) genes.add(gene);
    });

    const geneList = Array.from(genes).sort();
    const content = geneList.join(', ');

    copyTextToClipboard(content).then(() => {
        const btn = document.getElementById('copy-genes-clipboard');
        const textSpan = btn.querySelector('.btn-text');
        const iconWrapper = btn.querySelector('.icon-wrapper');

        const origText = textSpan.textContent;

        textSpan.textContent = '¡Copiado!';
        iconWrapper.innerHTML = '<i data-lucide="check"></i>';
        lucide.createIcons();
        btn.style.color = 'var(--color-pubmed)';

        setTimeout(() => {
            textSpan.textContent = origText;
            iconWrapper.innerHTML = '<i data-lucide="copy"></i>';
            lucide.createIcons();
            btn.style.color = '';
        }, 1500);
    }).catch(err => {
        console.error('No se pudo copiar el texto: ', err);
        alert('Error al copiar al portapapeles.');
    });
}

function downloadTableCsv() {
    if (filteredData.length === 0) return;

    // Define headers
    const csvHeaders = [
        'Disease', 'Genetic defect', 'Inheritance', 'GOF/DN', 'OMIM',
        'T cell count', 'B cell count', 'Immunoglobulin levels', 'Neutrophil count',
        'Other affected cells', 'Associated features', 'Major category', 'Subcategory',
        'ICD9', 'ICD10', 'HPO IDs'
    ];

    const csvRows = [csvHeaders.join(',')];

    filteredData.forEach(row => {
        const hpos = row.hpo_ids ? row.hpo_ids.join(';') : '';
        const values = [
            row.disease, row.gene, row.inheritance, row.gof_dn, row.omim,
            row.t_cell, row.b_cell, row.immunoglobulins, row.neutrophils,
            row.other_cells, row.associated_features, row.major_category, row.subcategory,
            row.icd9, row.icd10, hpos
        ];

        // Escape commas and double quotes for clean CSV syntax
        const escaped = values.map(val => {
            if (!val) return '""';
            let s = val.toString().replace(/"/g, '""');
            // If it contains spaces, commas or double quotes, surround in double quotes
            if (s.includes(',') || s.includes('\n') || s.includes('"') || s.includes(';')) {
                return `"${s}"`;
            }
            return `"${s}"`;
        });

        csvRows.push(escaped.join(','));
    });

    const content = '\uFEFF' + csvRows.join('\n'); // Prepend UTF-8 BOM for correct Excel characters rendering
    triggerBlobDownload(content, 'iei_filtered_database.csv', 'text/csv;charset=utf-8;');
}

function triggerBlobDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/* --- Drag and Drop / Custom File Upload --- */
function initFileUpload() {
    const dropOverlay = document.getElementById('drag-drop-overlay');
    const fileInput = document.getElementById('csv-file-input');
    const uploadBtn = document.getElementById('upload-trigger-btn');
    const defaultBtn = document.getElementById('load-default-btn');

    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    if (defaultBtn) {
        defaultBtn.addEventListener('click', () => {
            window.location.href = 'categorias.html';
        });
    }

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleUploadedFile(e.target.files[0]);
        }
    });

    // Drag Over highlights
    window.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dropOverlay.classList.add('drag-active');
    });

    dropOverlay.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    dropOverlay.addEventListener('dragleave', (e) => {
        e.preventDefault();
        // Only remove if we actually leave window
        if (e.relatedTarget === null) {
            dropOverlay.classList.remove('drag-active');
        }
    });

    dropOverlay.addEventListener('drop', (e) => {
        e.preventDefault();
        dropOverlay.classList.remove('drag-active');

        if (e.dataTransfer.files.length > 0) {
            handleUploadedFile(e.dataTransfer.files[0]);
        }
    });
}

function handleUploadedFile(file) {
    if (!file.name.endsWith('.csv')) {
        alert("Error: Por favor selecciona un archivo en formato CSV (.csv)");
        return;
    }

    showLoading(true);

    Papa.parse(file, {
        header: false, // Parse rows as arrays to let us resolve headers flexibly
        skipEmptyLines: true,
        complete: function (results) {
            const rows = results.data;
            if (rows.length < 2) {
                alert("Error: El archivo CSV está vacío o no contiene suficientes registros.");
                showLoading(false);
                return;
            }

            // Analyze the first row to perform fuzzy column mapping
            const rawHeaders = rows[0].map(h => h.toString().toLowerCase().trim());
            const mapping = getHeaderMapping(rawHeaders);

            // Map remaining rows into database structure
            const newDatabase = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                // Pad row if it has fewer cells than rawHeaders
                while (row.length < rawHeaders.length) {
                    row.push('');
                }

                const item = {
                    disease: getMappedValue(row, mapping.disease),
                    gene: getMappedValue(row, mapping.gene),
                    inheritance: getMappedValue(row, mapping.inheritance),
                    gof_dn: getMappedValue(row, mapping.gof_dn),
                    omim: getMappedValue(row, mapping.omim),
                    t_cell: getMappedValue(row, mapping.t_cell),
                    b_cell: getMappedValue(row, mapping.b_cell),
                    immunoglobulins: getMappedValue(row, mapping.immunoglobulins),
                    neutrophils: getMappedValue(row, mapping.neutrophils),
                    other_cells: getMappedValue(row, mapping.other_cells),
                    associated_features: getMappedValue(row, mapping.associated_features),
                    major_category: getMappedValue(row, mapping.major_category),
                    subcategory: getMappedValue(row, mapping.subcategory),
                    categorias_desglosed: getMappedValue(row, mapping.categorias_desglosed),
                    icd9: getMappedValue(row, mapping.icd9),
                    icd10: getMappedValue(row, mapping.icd10),
                    hpo_ids: []
                };

                // Collect HPOs from any mapped HPO columns
                const hpoSet = new Set();
                mapping.hpoCols.forEach(idx => {
                    const cellVal = row[idx];
                    if (cellVal) {
                        const matches = cellVal.toString().match(/HP:\d+/g);
                        if (matches) {
                            matches.forEach(hp => hpoSet.add(hp));
                        }
                    }
                });
                item.hpo_ids = Array.from(hpoSet).sort();

                newDatabase.push(item);
            }

            // Load this new dataset into application
            loadDataset(newDatabase);
            alert(`Base de datos cargada con éxito! Se importaron ${newDatabase.length} registros.`);
        },
        error: function (err) {
            alert("Error al analizar el archivo CSV: " + err.message);
            showLoading(false);
        }
    });
}

function getHeaderMapping(headers) {
    const map = {
        disease: -1,
        gene: -1,
        inheritance: -1,
        gof_dn: -1,
        omim: -1,
        t_cell: -1,
        b_cell: -1,
        immunoglobulins: -1,
        neutrophils: -1,
        other_cells: -1,
        associated_features: -1,
        major_category: -1,
        subcategory: -1,
        categorias_desglosed: -1,
        icd9: -1,
        icd10: -1,
        hpoCols: [] // Multiple columns can hold HPO codes
    };

    // Fuzzy searches headers
    headers.forEach((h, idx) => {
        if (h.includes('disease') || h.includes('enfermedad')) map.disease = idx;
        else if (h.includes('defect') || h.includes('defecto') || h.includes('gene') || h.includes('gen')) map.gene = idx;
        else if (h.includes('inheritance') || h.includes('herencia') || h.includes('patrón')) map.inheritance = idx;
        else if (h.includes('gof') || h.includes('dn')) map.gof_dn = idx;
        else if (h.includes('omim')) map.omim = idx;
        else if (h.includes('t cell') || h.includes('celulas t') || h.includes('células t') || h.includes('t_cell')) map.t_cell = idx;
        else if (h.includes('b cell') || h.includes('celulas b') || h.includes('células b') || h.includes('b_cell')) map.b_cell = idx;
        else if (h.includes('immunoglobulin') || h.includes('inmunoglobulina') || h.includes('ig')) map.immunoglobulins = idx;
        else if (h.includes('neutrophil') || h.includes('neutrofilo') || h.includes('neutrófilo')) map.neutrophils = idx;
        else if (h.includes('other') || h.includes('otras') || h.includes('otros')) map.other_cells = idx;
        else if (h.includes('feature') || h.includes('asociado') || h.includes('associated') || h.includes('clinica') || h.includes('clínica') || h.includes('manifestacion')) map.associated_features = idx;
        else if (h.includes('major') || h.includes('categoria mayor') || h.includes('categoría mayor') || h.includes('table') || h.includes('tabla')) map.major_category = idx;
        else if (h.includes('subcat') || h.includes('sub-table') || h.includes('subtabla')) map.subcategory = idx;
        else if (h.includes('categorias_desglosed') || h.includes('categorias desglosed') || h.includes('category breakdown') || h.includes('desglosed')) map.categorias_desglosed = idx;
        else if (h.includes('icd9') || h.includes('icd-9') || h.includes('cie9')) map.icd9 = idx;
        else if (h.includes('icd10') || h.includes('icd-10') || h.includes('cie10')) map.icd10 = idx;

        // HPO columns check
        if (h.includes('hpo') || h.includes('phenotype') || h.includes('fenotipo')) {
            map.hpoCols.push(idx);
        }
    });

    // Fallbacks if not found (assigning positional indices from standard table)
    if (map.disease === -1) map.disease = 0;
    if (map.gene === -1) map.gene = 1;
    if (map.inheritance === -1) map.inheritance = 2;
    if (map.gof_dn === -1) map.gof_dn = 3;
    if (map.omim === -1) map.omim = 4;
    if (map.t_cell === -1) map.t_cell = 5;
    if (map.b_cell === -1) map.b_cell = 6;
    if (map.immunoglobulins === -1) map.immunoglobulins = 7;
    if (map.neutrophils === -1) map.neutrophils = 8;
    if (map.other_cells === -1) map.other_cells = 9;
    if (map.associated_features === -1) map.associated_features = 10;
    if (map.major_category === -1) map.major_category = 11;
    if (map.subcategory === -1) map.subcategory = 12;
    if (map.categorias_desglosed === -1) map.categorias_desglosed = -1;
    if (map.icd9 === -1) map.icd9 = 13;
    if (map.icd10 === -1) map.icd10 = 14;

    // If no HPO columns found by headers, assume columns 15 to end contain HPOs
    if (map.hpoCols.length === 0) {
        for (let idx = 15; idx < headers.length; idx++) {
            map.hpoCols.push(idx);
        }
    }

    return map;
}

function getMappedValue(row, index) {
    if (index >= 0 && index < row.length) {
        return row[index] ? row[index].toString().trim() : '';
    }
    return '';
}
