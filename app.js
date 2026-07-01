// Application state
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup Theme
    initTheme();
    
    // 2. Setup Data
    if (DEFAULT_DATABASE.length > 0) {
        loadDataset(DEFAULT_DATABASE);
    } else {
        showNoDataState();
    }
    
    // 3. Setup UI Events
    initUiEvents();
    
    // 4. Setup File upload / Drag & Drop
    initFileUpload();
});

/* --- Core Theme Functions --- */
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
    
    // Auto-discover distinct categories and build filters
    buildFilterSelects();
    
    // Run initial filter + stats + render
    applyFiltersAndRender();
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
    // 1. Text Filters Search
    const searchInputs = [
        { id: 'filter-gene', key: 'gene' },
        { id: 'filter-disease', key: 'disease' },
        { id: 'filter-features', key: 'features' },
        { id: 'filter-omim', key: 'omim' },
        { id: 'filter-inheritance-text', key: 'inheritanceText' },
        { id: 'filter-major-category-text', key: 'majorCategoryText' },
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
function updateStats() {
    // 1. Count statistic
    const countText = document.getElementById('stat-genes-count');
    countText.textContent = `${filteredData.length} / ${database.length}`;
    
    const progress = document.getElementById('stat-genes-progress');
    const percentage = database.length > 0 ? (filteredData.length / database.length) * 100 : 0;
    progress.style.width = `${percentage}%`;
    
    // 2. Active filters count
    let activeFiltersCount = 0;
    for (let key in activeFilters) {
        if (activeFilters[key]) {
            if (Array.isArray(activeFilters[key])) {
                activeFiltersCount += activeFilters[key].length;
            } else {
                activeFiltersCount += 1;
            }
        }
    }
    document.getElementById('stat-active-filters').textContent = activeFiltersCount;
    
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
    document.getElementById('stat-diseases-count').textContent = uniqueDiseases;
    
    // 4. Unique HPO Terms
    const uniqueHpos = new Set(
        filteredData.flatMap(row => row.hpo_ids || [])
    ).size;
    document.getElementById('stat-hpos-count').textContent = uniqueHpos;
}

/* --- Active Filters Chips Render --- */
function renderActiveChips() {
    const chipContainer = document.getElementById('active-chips-container');
    const chipList = document.getElementById('chips-list');
    
    chipList.innerHTML = '';
    let hasChips = false;
    
    // Helper to add a chip
    const addChip = (label, filterKey, value, isArray = false) => {
        hasChips = true;
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
    
    chipContainer.style.display = hasChips ? 'flex' : 'none';
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
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">${row.subcategory}</div>
            </td>
            <td>
                <span class="badge-inheritance ${inheritanceClass}">${row.inheritance || 'N/A'}</span>
            </td>
            <td>${omimHtml}</td>
            <td class="hidden-tablet cat-cell-clickable" onclick="event.stopPropagation(); filterByMajorCategory('${row.major_category.replace(/'/g, "\\'")}');">
                <span class="badge-category-click">${catText}</span>
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
    
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
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
        complete: function(results) {
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
        error: function(err) {
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
