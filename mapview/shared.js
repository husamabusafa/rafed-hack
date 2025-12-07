/**
 * Rafed Dashboard Shared Utilities
 * Common functions for API calls, formatting, UI components, and Iconify icons
 */

// ============================================
// Configuration
// ============================================
const RAFED_CONFIG = {
    CH_API: 'http://localhost:8155',
    CH_USER: 'viewer',
    CH_PASS: 'rafed_view',
    MAP_STYLE: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    MAP_STYLE_LIGHT: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    DEFAULT_CENTER: [46.7, 24.7], // Riyadh
    DEFAULT_ZOOM: 10
};

// Allow overriding ClickHouse endpoint via URL param (?ch_api=http://host:port)
const CH_BASE =
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('ch_api')) ||
    RAFED_CONFIG.CH_API;

// Try a secondary port (8123 is ClickHouse default) if the primary returns 404
async function fetchClickHouse(url, options) {
    const res = await fetch(url, options);
    if (res.status !== 404 || !CH_BASE.includes('8155')) return res;
    const fallbackUrl = url.replace('8155', '8123');
    return fetch(fallbackUrl, options);
}

// ============================================
// Iconify Icon Mapping
// ============================================
const ICONS = {
    // Navigation
    home: 'solar:home-2-bold',
    back: 'solar:arrow-left-linear',
    menu: 'solar:hamburger-menu-linear',
    close: 'solar:close-circle-linear',
    refresh: 'solar:refresh-bold',
    settings: 'solar:settings-bold',
    
    // Dashboard categories
    dashboard: 'solar:chart-square-bold',
    executive: 'solar:case-round-bold',
    financial: 'solar:wallet-money-bold',
    operations: 'solar:settings-minimalistic-bold',
    analytics: 'solar:graph-up-bold',
    social: 'solar:users-group-rounded-bold',
    data: 'solar:database-bold',
    
    // KPI icons
    users: 'solar:users-group-rounded-bold',
    students: 'solar:square-academic-cap-bold',
    bus: 'solar:bus-bold',
    route: 'solar:route-bold',
    school: 'solar:buildings-2-bold',
    map: 'solar:map-bold',
    location: 'solar:map-point-bold',
    distance: 'solar:ruler-angular-bold',
    time: 'solar:clock-circle-bold',
    calendar: 'solar:calendar-bold',
    
    // Metrics
    chartUp: 'solar:graph-up-bold',
    chartDown: 'solar:graph-down-bold',
    target: 'solar:target-bold',
    percent: 'solar:chart-bold',
    money: 'solar:dollar-minimalistic-bold',
    growth: 'solar:trending-up-bold',
    decline: 'solar:trending-down-bold',
    
    // Status
    success: 'solar:check-circle-bold',
    warning: 'solar:danger-triangle-bold',
    error: 'solar:close-circle-bold',
    info: 'solar:info-circle-bold',
    
    // Actions
    add: 'solar:add-circle-bold',
    edit: 'solar:pen-bold',
    delete: 'solar:trash-bin-trash-bold',
    download: 'solar:download-bold',
    upload: 'solar:upload-bold',
    filter: 'solar:filter-bold',
    search: 'solar:magnifer-bold',
    export: 'solar:export-bold',
    
    // Content
    document: 'solar:document-bold',
    folder: 'solar:folder-bold',
    table: 'solar:widget-4-bold',
    list: 'solar:list-bold',
    grid: 'solar:widget-2-bold',
    
    // Specific dashboards
    demand: 'solar:graph-down-new-bold',
    capacity: 'solar:full-battery-bold',
    equity: 'solar:scale-bold',
    environment: 'solar:leaf-bold',
    customer: 'solar:star-bold',
    special: 'solar:accessibility-bold',
    market: 'solar:pie-chart-2-bold',
    forecast: 'solar:graph-new-bold',
    regional: 'solar:flag-bold',
    coverage: 'solar:radar-2-bold'
};

// Icon helper function
function icon(name, size = 20) {
    const iconName = ICONS[name] || name;
    return `<iconify-icon icon="${iconName}" width="${size}" height="${size}"></iconify-icon>`;
}

// ============================================
// API Helpers
// ============================================
// Returns data array directly for convenience
// Note: max_result_rows=0 removes the 10,000 row default limit
async function queryClickHouse(sql, options = {}) {
    const { timeout = 30000, maxRows = 0 } = options;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        // Add settings to bypass row limits
        const settings = `max_result_rows=${maxRows}&result_overflow_mode=throw`;
        const url = `${CH_BASE}/?user=${RAFED_CONFIG.CH_USER}&password=${RAFED_CONFIG.CH_PASS}&${settings}`;
        const response = await fetchClickHouse(url, {
            method: 'POST',
            body: sql + ' FORMAT JSON',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Query failed: ${response.status}`);
        }
        
        const json = await response.json();
        return json.data || [];
    } catch (error) {
        console.error('ClickHouse query error:', error);
        return [];
    }
}

// Full response version with success/meta info
async function queryClickHouseFull(sql, options = {}) {
    const { timeout = 30000, maxRows = 0 } = options;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        // Add settings to bypass row limits
        const settings = `max_result_rows=${maxRows}&result_overflow_mode=throw`;
        const url = `${CH_BASE}/?user=${RAFED_CONFIG.CH_USER}&password=${RAFED_CONFIG.CH_PASS}&${settings}`;
        const response = await fetchClickHouse(url, {
            method: 'POST',
            body: sql + ' FORMAT JSON',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Query failed: ${response.status}`);
        }
        
        const json = await response.json();
        return { success: true, data: json.data || [], meta: json.meta };
    } catch (error) {
        console.error('ClickHouse query error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Batch query helper
async function batchQueries(queries) {
    const results = await Promise.allSettled(
        queries.map(q => queryClickHouse(q.sql))
    );
    
    return results.map((r, i) => ({
        name: queries[i].name,
        ...(r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
    }));
}

// ============================================
// Formatters
// ============================================
const fmt = {
    number: (n, decimals = 0) => {
        if (n === null || n === undefined || isNaN(n)) return '-';
        return Number(n).toLocaleString('en-US', { 
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals 
        });
    },
    
    compact: (n) => {
        if (n === null || n === undefined || isNaN(n)) return '-';
        const num = Number(n);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },
    
    percent: (n, decimals = 1) => {
        if (n === null || n === undefined || isNaN(n)) return '-';
        return Number(n).toFixed(decimals) + '%';
    },
    
    currency: (n) => {
        if (n === null || n === undefined || isNaN(n)) return '-';
        return fmt.number(n) + ' SAR';
    },
    
    distance: (meters) => {
        if (meters === null || meters === undefined || isNaN(meters)) return '-';
        const km = Number(meters) / 1000;
        return km.toFixed(1) + ' km';
    }
};

// ============================================
// UI Components (as template strings)
// ============================================
const UI = {
    // Loading skeleton for KPI cards
    kpiSkeleton: () => `
        <div class="skeleton" style="height: 80px;"></div>
    `,
    
    // Loading spinner
    spinner: (size = 'md') => {
        const sizes = { sm: '16', md: '24', lg: '32' };
        return `
            <div class="flex items-center justify-center p-4">
                <iconify-icon icon="solar:spinner-bold" class="animate-spin text-emerald-500" width="${sizes[size]}" height="${sizes[size]}"></iconify-icon>
            </div>
        `;
    },
    
    // Error state
    error: (message = 'Failed to load data') => `
        <div class="empty-state">
            <div class="empty-state-icon" style="background: var(--danger-light);">
                <iconify-icon icon="solar:danger-triangle-bold" width="24" height="24" style="color: var(--danger);"></iconify-icon>
            </div>
            <p class="empty-state-title" style="color: var(--danger);">${message}</p>
            <button onclick="location.reload()" class="btn btn-secondary btn-sm" style="margin-top: 12px;">
                <iconify-icon icon="solar:refresh-bold" width="14" height="14"></iconify-icon>
                Retry
            </button>
        </div>
    `,
    
    // Empty state
    empty: (message = 'No data available') => `
        <div class="empty-state">
            <div class="empty-state-icon">
                <iconify-icon icon="solar:inbox-linear" width="24" height="24"></iconify-icon>
            </div>
            <p class="empty-state-description">${message}</p>
        </div>
    `,
    
    // Badge component
    badge: (text, variant = 'default') => {
        return `<span class="badge badge-${variant}">${text}</span>`;
    },
    
    // Progress bar
    progress: (value, max = 100, color = 'info') => {
        const pct = Math.min(100, Math.max(0, (value / max) * 100));
        return `
            <div class="progress">
                <div class="progress-bar ${color}" style="width: ${pct}%"></div>
            </div>
        `;
    },
    
    // KPI Card component
    kpiCard: (label, value, iconName, options = {}) => {
        const { color = 'info', description = '', trend = null } = options;
        const colorVars = {
            success: { bg: 'var(--success-light)', color: 'var(--success)' },
            warning: { bg: 'var(--warning-light)', color: 'var(--warning)' },
            danger: { bg: 'var(--danger-light)', color: 'var(--danger)' },
            info: { bg: 'var(--info-light)', color: 'var(--info)' }
        };
        const c = colorVars[color] || colorVars.info;
        
        let trendHtml = '';
        if (trend) {
            const trendIcon = trend.direction === 'up' ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold';
            const trendClass = trend.direction === 'up' ? 'text-success' : 'text-danger';
            trendHtml = `
                <div class="kpi-trend ${trendClass}">
                    <iconify-icon icon="${trendIcon}" width="12" height="12"></iconify-icon>
                    <span>${trend.value}</span>
                </div>
            `;
        }
        
        return `
            <div class="kpi-card" style="--kpi-accent: ${c.color}; --kpi-bg: ${c.bg}; --kpi-color: ${c.color};">
                <div class="kpi-header">
                    <span class="kpi-label">${label}</span>
                    <div class="kpi-icon">
                        <iconify-icon icon="${ICONS[iconName] || iconName}" width="20" height="20"></iconify-icon>
                    </div>
                </div>
                <div class="kpi-value ${color}" id="kpi-${label.toLowerCase().replace(/\s+/g, '-')}">${value}</div>
                ${description ? `<p class="kpi-description">${description}</p>` : ''}
                ${trendHtml}
            </div>
        `;
    },
    
    // Card header
    cardHeader: (title, iconName = null, actions = '') => `
        <div class="card-header">
            <h3 class="card-title">
                ${iconName ? `<iconify-icon icon="${ICONS[iconName] || iconName}" width="18" height="18"></iconify-icon>` : ''}
                ${title}
            </h3>
            ${actions}
        </div>
    `,
    
    // Dashboard header
    dashboardHeader: (title, subtitle, backLink = 'index.html') => `
        <header class="dashboard-header">
            <div>
                <h1 class="dashboard-title">${title}</h1>
                <p class="dashboard-subtitle">${subtitle}</p>
            </div>
            <div class="flex items-center gap-3">
                <a href="${backLink}" class="btn btn-secondary btn-sm">
                    <iconify-icon icon="solar:arrow-left-linear" width="16" height="16"></iconify-icon>
                    Back
                </a>
                <button onclick="refreshData()" id="refreshBtn" class="btn btn-primary btn-sm">
                    <iconify-icon icon="solar:refresh-bold" width="16" height="16" id="refreshIcon"></iconify-icon>
                    Refresh
                </button>
            </div>
        </header>
    `
};

// ============================================
// Chart Defaults
// ============================================
const chartDefaults = {
    dark: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#94a3b8', font: { size: 11 } }
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { color: '#334155', drawBorder: false },
                ticks: { color: '#94a3b8' }
            },
            y: {
                grid: { color: '#334155', drawBorder: false },
                ticks: { color: '#94a3b8' }
            }
        }
    },
    
    light: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#475569', font: { size: 11 } }
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1e293b',
                bodyColor: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { color: '#64748b' }
            },
            y: {
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { color: '#64748b' }
            }
        }
    }
};

// Merge chart options with defaults
function getChartOptions(customOptions = {}, theme = 'dark') {
    return {
        ...chartDefaults[theme],
        ...customOptions,
        plugins: {
            ...chartDefaults[theme].plugins,
            ...(customOptions.plugins || {})
        },
        scales: {
            ...chartDefaults[theme].scales,
            ...(customOptions.scales || {})
        }
    };
}

// ============================================
// Map Helpers
// ============================================
function initMap(containerId, options = {}) {
    const {
        center = RAFED_CONFIG.DEFAULT_CENTER,
        zoom = RAFED_CONFIG.DEFAULT_ZOOM,
        style = RAFED_CONFIG.MAP_STYLE,
        pitch = 0
    } = options;
    
    // Ensure mapboxgl alias exists
    if (!window.mapboxgl && window.maplibregl) {
        window.mapboxgl = window.maplibregl;
    }
    
    return new maplibregl.Map({
        container: containerId,
        style: style,
        center: center,
        zoom: zoom,
        pitch: pitch
    });
}

// Color scale helper for maps
function getColorScale(value, min, max, colors) {
    const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const index = Math.floor(normalized * (colors.length - 1));
    return colors[Math.min(index, colors.length - 1)];
}

// Common color palettes
const COLOR_PALETTES = {
    sequential: {
        green: [[240, 253, 244], [187, 247, 208], [74, 222, 128], [34, 197, 94], [21, 128, 61]],
        blue: [[239, 246, 255], [147, 197, 253], [59, 130, 246], [37, 99, 235], [29, 78, 216]],
        red: [[254, 242, 242], [254, 202, 202], [248, 113, 113], [239, 68, 68], [185, 28, 28]]
    },
    categorical: [
        [59, 130, 246],   // Blue
        [16, 185, 129],   // Emerald
        [245, 158, 11],   // Amber
        [139, 92, 246],   // Purple
        [236, 72, 153],   // Pink
        [6, 182, 212],    // Cyan
        [249, 115, 22],   // Orange
        [168, 85, 247]    // Violet
    ]
};

// ============================================
// Animation Helpers
// ============================================
function animateValue(elementOrId, start, end, duration = 1000, formatter = fmt.number) {
    // Accept either element or string ID
    const element = typeof elementOrId === 'string' 
        ? document.getElementById(elementOrId) 
        : elementOrId;
    
    if (!element) {
        console.warn('animateValue: element not found:', elementOrId);
        return;
    }
    
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * eased;
        
        element.textContent = formatter(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ============================================
// Utility Functions
// ============================================

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage helpers
const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(`rafed_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(`rafed_${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage not available');
        }
    }
};

// ============================================
// CSS Classes (for consistent styling)
// ============================================
const STYLES = {
    card: 'bg-slate-800 border border-slate-700 rounded-xl shadow-lg',
    cardLight: 'bg-white border border-gray-200 rounded-xl shadow-sm',
    kpiCard: 'p-5 relative overflow-hidden bg-slate-800 border border-slate-700 rounded-xl transition-transform hover:scale-[1.02]',
    button: {
        primary: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors',
        secondary: 'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors',
        danger: 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors'
    },
    input: 'px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
    table: {
        header: 'px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider bg-slate-800',
        cell: 'px-4 py-3 text-sm text-slate-300',
        row: 'hover:bg-slate-800/50 transition-colors'
    }
};

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RAFED_CONFIG,
        queryClickHouse,
        batchQueries,
        fmt,
        UI,
        chartDefaults,
        getChartOptions,
        initMap,
        getColorScale,
        COLOR_PALETTES,
        animateValue,
        debounce,
        storage,
        STYLES
    };
}
