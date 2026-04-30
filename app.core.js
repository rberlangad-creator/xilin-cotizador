// --- Constants & Data ---
const CONDITIONS = {
    venta: [
        "PRECIOS COTIZADOS SIN IVA. APLICA IVA DEL 16%.",
        "LA GARANTÍA EN EQUIPO (MONTACARGAS) CONTRA DEFECTOS DE FÁBRICA ES DE 12 MESES O 2000 HORAS.",
        "COTIZACIÓN VÁLIDA POR 15 DÍAS.",
        "LOS EQUIPOS SE PAGAN AL 100% ANTES DE ENTREGARLOS SI EL EQUIPO ESTÁ DISPONIBLE EN STOCK.",
        "EL PRECIO DEL FLETE EN MONTERREY Y ÁREA METROPOLITANA ES SIN COSTO.",
        "XILIN MONTERREY CUENTA CON REFACCIONES ORIGINALES Y CONOCIMIENTOS TÉCNICOS."
    ],
    renta: [
        "PAGO ANTICIPADO: LA RENTA SE PAGA POR ADELANTADO (2 MENSUALIDADES AL INICIO).",
        "SE SOLICITA ORDEN DE COMPRA POR EL TOTAL DEL PLAZO REQUERIDO.",
        "LOS PRECIOS NO INCLUYEN IVA; SE APLICARÁ UN 16% ADICIONAL.",
        "FIRMA DE CONTRATO OBLIGATORIA ANTES DE LA ENTREGA DE EQUIPO.",
        "VIGENCIA DE COTIZACIÓN: 15 DÍAS NATURALES.",
        "MANTENIMIENTOS PROGRAMADOS INCLUIDOS. NO CUBRE DAÑOS POR MAL USO.",
        "FLETE SIN COSTO EN MONTERREY PARA EQUIPOS DE HASTA 3.5 TONELADAS."
    ]
};

const CONFIG = {
    name: "Xilin Monterrey",
    historyKey: "xilin_v2_history",
    folioKey: "xilin_v2_folio_seq"
};

const ACCOUNTS = {
    'admin': { pass: 'xilin2026', role: 'admin', name: 'Administrador' },
    'ventas1': { pass: 'ventas123', role: 'user', name: 'Ventas 1' },
    'ventas2': { pass: 'ventas456', role: 'user', name: 'Ventas 2' }
};

// --- State ---
let state = {
    mode: 'venta',
    currency: 'USD',
    folio: 'COT #0071588',
    client: { name: 'JOEL ROBLES', company: 'Xilin Monterrey', rfc: 'XAX010101000', email: 'test@example.com' },
    items: [],
    conditions: [...CONDITIONS.venta]
};

// --- Initial Render ---
window.onload = () => {
    checkAccess();
    updateDate();
    initEventListeners();
};

function checkAccess() {
    const isLogged = sessionStorage.getItem('xilin_session');
    const role = sessionStorage.getItem('user_role');
    
    if (isLogged) {
        document.getElementById('login-screen').style.display = 'none';
        
        const btnReportes = document.getElementById('btn-reportes');
        if (btnReportes) btnReportes.style.display = (role === 'admin') ? 'flex' : 'none';
        
        startApp();
    }
}

function startApp() {
    try {
        document.getElementById('app').style.display = 'grid';
        // Load fresh data
        resetForm(false);
        renderHistory();
        updatePreview();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        } else {
            console.warn('Lucide not loaded yet');
        }
    } catch(err) {
        alert("Error crítico al iniciar: " + err.message + "\n\nPor favor, contacta a soporte o intenta refrescar.");
        console.error(err);
    }
}

function handleLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const errorMsg = document.getElementById('login-error');

    const account = ACCOUNTS[user];

    if (account && account.pass === pass) {
        sessionStorage.setItem('xilin_session', 'true');
        sessionStorage.setItem('user_role', account.role);
        sessionStorage.setItem('user_name', account.name);
        
        const btnReportes = document.getElementById('btn-reportes');
        if (btnReportes) btnReportes.style.display = (account.role === 'admin') ? 'flex' : 'none';

        document.getElementById('login-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            startApp();
        }, 300);
    } else {
        errorMsg.style.display = 'block';
    }
}

function logout() {
    sessionStorage.removeItem('xilin_session');
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('user_name');
    location.reload();
}

function updateDate() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('es-ES', options);
    document.getElementById('date-display').innerText = `Fecha: ${today}`;
}

function initEventListeners() {
    // Mode Toggles
    document.querySelectorAll('#op-mode span').forEach(span => {
        span.onclick = () => {
            document.querySelector('#op-mode .active').classList.remove('active');
            span.classList.add('active');
            state.mode = span.dataset.mode;
            state.conditions = [...CONDITIONS[state.mode]];
            renderConditionsEditor();
            renderItemsEditor();
            updatePreview();
        };
    });

    document.querySelectorAll('#currency-mode span').forEach(span => {
        span.onclick = () => {
            document.querySelector('#currency-mode .active').classList.remove('active');
            span.classList.add('active');
            state.currency = span.dataset.curr;
            updatePreview();
        };
    });

    // Inputs
    const bindInput = (id, targetPath) => {
        const el = document.getElementById(id);
        el.oninput = (e) => {
            const rawVal = e.target.value;
            const tVal = (id === 'folio-input' || id === 'client-rfc') ? rawVal.toUpperCase() : rawVal;
            
            if (id === 'folio-input') {
                state.folio = tVal;
                e.target.value = tVal;
            } else {
                state.client[targetPath] = tVal;
                if (id === 'client-rfc') e.target.value = tVal;
            }
            updatePreview();
        };
    };

    bindInput('folio-input');
    bindInput('client-name', 'name');
    bindInput('client-company', 'company');
    bindInput('client-rfc', 'rfc');
    bindInput('client-email', 'email');

    document.getElementById('print-btn').onclick = () => window.print();
}

function addNewItem() {
    state.items.push({
        id: Date.now(),
        type: 'forklift',
        modelTitle: "",
        description: "",
        highlights: "",
        salePrice: 0,
        rentPrice: 0,
        quantity: 1,
        discount: 0,
        mastHeight: '4.5m',
        forks: '42"',
        tireType: 'Sólida',
        battery: 'Lead-Acid / Lithium',
        image: ""
    });
    renderItemsEditor();
    updatePreview();
}

function removeItem(id) {
    state.items = state.items.filter(item => item.id !== id);
    renderItemsEditor();
    updatePreview();
}

function renderItemsEditor() {
    const container = document.getElementById('items-editor');
    container.innerHTML = '<label>Productos / Items</label>';
    
    state.items.forEach((item) => {
        const price = state.mode === 'venta' ? (item.salePrice || 0) : (item.rentPrice || 0);
        const div = document.createElement('div');
        div.className = 'item-edit-row';
        div.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 8px;">
                <input type="text" placeholder="Modelo" value="${item.modelTitle || ''}" oninput="updateItem(${item.id}, 'modelTitle', this.value)" style="font-weight: 700;">
                <input type="text" placeholder="Descripción..." value="${item.description || ''}" oninput="updateItem(${item.id}, 'description', this.value)">
            </div>
            
            <textarea placeholder="Características..." style="font-size: 0.8rem; height: 60px;" oninput="updateItem(${item.id}, 'highlights', this.value)">${item.highlights || ''}</textarea>

            ${item.type === 'generic' ? `
                <div class="form-group" style="margin-top: 10px;">
                    <label style="font-size: 0.65rem;">Unidad</label>
                    <input type="text" value="${item.unit || ''}" oninput="updateItem(${item.id}, 'unit', this.value)">
                </div>
            ` : `
                <div class="item-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px;">
                    <div><label style="font-size: 0.65rem;">Mástil</label><input type="text" value="${item.mastHeight || ''}" oninput="updateItem(${item.id}, 'mastHeight', this.value)"></div>
                    <div><label style="font-size: 0.65rem;">Cuchillas</label><input type="text" value="${item.forks || ''}" oninput="updateItem(${item.id}, 'forks', this.value)"></div>
                    <div><label style="font-size: 0.65rem;">Ruedas</label>
                        <select onchange="updateItem(${item.id}, 'tireType', this.value)">
                            <option value="Sólida" ${item.tireType === 'Sólida' ? 'selected' : ''}>Sólida</option>
                            <option value="Rudomática" ${item.tireType === 'Rudomática' ? 'selected' : ''}>Rudomática</option>
                            <option value="Poly" ${item.tireType === 'Poly' ? 'selected' : ''}>Poly</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" style="margin-top: 10px;">
                    <label style="font-size: 0.65rem;">Batería</label>
                    <input type="text" value="${item.battery || ''}" oninput="updateItem(${item.id}, 'battery', this.value)">
                </div>
            `}

            <div class="item-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px;">
                <input type="number" placeholder="Precio" value="${price}" oninput="updateItem(${item.id}, 'price', this.value)">
                <input type="number" placeholder="Cant" value="${item.quantity}" oninput="updateItem(${item.id}, 'quantity', this.value)">
                <input type="number" placeholder="Desc %" value="${item.discount}" oninput="updateItem(${item.id}, 'discount', this.value)">
            </div>
            
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <label class="btn" style="flex: 1; font-size: 0.7rem; background: #f1f5f9; cursor: pointer;">
                    <i data-lucide="image"></i> Imagen
                    <input type="file" style="display: none;" accept="image/*" onchange="handleImageUpload(${item.id}, this.files[0])">
                </label>
                <button class="btn" style="width: auto; background: #fee2e2; color: #ef4444;" onclick="removeItem(${item.id})"><i data-lucide="trash-2"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

function updateItem(id, field, value) {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    if (field === 'price') {
        const val = parseFloat(value) || 0;
        if (state.mode === 'venta') item.salePrice = val;
        else item.rentPrice = val;
    } else if (field === 'quantity' || field === 'discount') {
        item[field] = parseFloat(value) || 0;
    } else {
        item[field] = value;
    }
    updatePreview();
}

function handleImageUpload(id, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        // Compress image using Canvas
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 250;
            const MAX_HEIGHT = 250;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to WEBP with 0.7 quality to preserve transparency while keeping size small
            const dataUrl = canvas.toDataURL('image/webp', 0.7);

            const item = state.items.find(i => i.id === id);
            if (item) {
                item.image = dataUrl;
                updatePreview();
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function formatCurrency(val) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: state.currency }).format(val);
}

function renderConditionsEditor() {
    const container = document.getElementById('conditions-editor');
    container.innerHTML = '';
    state.conditions.forEach((cond, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex'; div.style.gap = '8px';
        div.innerHTML = `
            <textarea style="flex: 1; font-size: 0.75rem; height: 40px;" oninput="updateCondition(${index}, this.value)">${cond}</textarea>
            <button class="btn" style="width: auto; background: #fee2e2; color: #ef4444;" onclick="removeCondition(${index})"><i data-lucide="trash-2"></i></button>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

function updateCondition(index, value) { state.conditions[index] = value; updatePreview(); }
function removeCondition(index) { state.conditions.splice(index, 1); renderConditionsEditor(); updatePreview(); }
function addCondition() { state.conditions.push(""); renderConditionsEditor(); updatePreview(); }

function updatePreview() {
    document.getElementById('folio-display').innerText = state.folio || 'COT #000000';
    const badges = document.getElementById('quote-badges');
    badges.innerHTML = `<span class="badge badge-mode">${state.mode.toUpperCase()}</span><span class="badge badge-curr">${state.currency}</span>`;
    
    const userRef = document.getElementById('user-reference');
    if (userRef) {
        userRef.innerText = 'Preparado por: ' + (sessionStorage.getItem('user_name') || 'Ventas');
    }
    
    document.getElementById('bill-to-content').innerHTML = `
        <strong>${state.client.name || 'CLIENTE PENDIENTE'}</strong><br>
        ${state.client.company || 'Empresa'}<br>
        RFC: ${state.client.rfc || 'XAX010101000'}<br>
        <span style="color: #3b82f6; text-transform: lowercase;">${state.client.email || ''}</span>
    `;

    const table = document.getElementById('items-table');
    table.querySelectorAll('.item-tbody').forEach(tb => tb.remove());
    let subtotal = 0;

    state.items.forEach(item => {
        const price = state.mode === 'venta' ? (item.salePrice || 0) : (item.rentPrice || 0);
        const itemTotal = (price * item.quantity) * (1 - (item.discount / 100));
        subtotal += itemTotal;

        const tbody = document.createElement('tbody');
        tbody.className = 'item-tbody';
        tbody.innerHTML = `
            <tr>
                <td>
                    <div class="product-row" style="display: flex; gap: 15px;">
                        <img src="${item.image || 'https://via.placeholder.com/80?text=No+Img'}" style="width: 80px; height: 80px; object-fit: contain;">
                        <div class="product-desc" style="flex: 1;">
                            <strong style="display: block; font-size: 0.95rem; text-transform: uppercase;">${item.modelTitle || 'EQUIPO'}</strong>
                            <div style="font-size: 0.8rem; color: #444; margin-bottom: 5px;">${item.description || ''}</div>
                            ${item.highlights ? `<ul style="font-size: 0.75rem; color: #1e293b; padding-left: 15px;">${item.highlights.split('|').map(h => `<li>${h.trim()}</li>`).join('')}</ul>` : ''}
                            <div style="font-size: 0.7rem; color: #64748b; border-top: 1px solid #f1f1f1; padding-top: 5px; margin-top: 5px;">
                                ${item.type === 'generic' ? `Info: ${item.unit || '-'}` : `Mástil: ${item.mastHeight} | Horquillas: ${item.forks} | Ruedas: ${item.tireType} | Batería: ${item.battery}`}
                            </div>
                        </div>
                    </div>
                </td>
                <td>${formatCurrency(price)}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(itemTotal)}</td>
            </tr>
        `;
        table.appendChild(tbody);
    });

    const tax = subtotal * 0.16;
    document.getElementById('subtotal-val').innerText = formatCurrency(subtotal);
    document.getElementById('tax-val').innerText = formatCurrency(tax);
    document.getElementById('total-val').innerText = formatCurrency(subtotal + tax);

    const condSection = document.getElementById('conditions-section');
    condSection.innerHTML = `
        <h4>CONDICIONES COMERCIALES DE ${state.mode.toUpperCase()}:</h4>
        <ul>${state.conditions.filter(c => c).map(c => `<li>${c}</li>`).join('')}</ul>
    `;
}

function saveToHistory() {
    const history = JSON.parse(localStorage.getItem(CONFIG.historyKey) || '[]');
    const safeState = JSON.parse(JSON.stringify(state));
    // Images are now compressed inline, we can save them so they persist
    history.unshift({ 
        folio: state.folio, 
        date: new Date().toLocaleDateString(), 
        client: state.client.name, 
        total: document.getElementById('total-val').innerText, 
        status: "Pendiente",
        author: sessionStorage.getItem('user_name') || 'Desconocido',
        data: safeState 
    });
    localStorage.setItem(CONFIG.historyKey, JSON.stringify(history.slice(0, 30)));
    renderHistory();
}

function generateNextFolio() {
    const seqKey = CONFIG.folioKey;
    let seq = parseInt(localStorage.getItem(seqKey) || '71588');
    seq++;
    localStorage.setItem(seqKey, seq.toString());
    return 'COT #' + seq.toString().padStart(7, '0');
}

function resetForm(ask = true) {
    if (!ask || confirm("¿Borrar cotización actual y preparar nuevo folio?")) {
        state.items = [];
        state.client = { name: '', company: '', rfc: '', email: '' };
        state.folio = generateNextFolio();
        state.conditions = [...CONDITIONS[state.mode]];
        document.getElementById('folio-input').value = state.folio;
        renderConditionsEditor(); renderItemsEditor(); updatePreview();
    }
}

function renderHistory() {
    const key = CONFIG.historyKey;
    const allHistory = JSON.parse(localStorage.getItem(key) || '[]');
    const container = document.getElementById('folio-history');
    
    const role = sessionStorage.getItem('user_role');
    const myName = sessionStorage.getItem('user_name');
    const myHistory = (role === 'admin') ? allHistory : allHistory.filter(h => h.author === myName);
    
    if (myHistory.length === 0) {
        container.innerHTML = '<p style="padding: 10px; font-style: italic;">Sin historial.</p>';
        return;
    }
    
    container.innerHTML = myHistory.map(h => {
        const globalIndex = allHistory.indexOf(h);
        return `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div style="cursor: pointer;" onclick="loadHistory(${globalIndex})">
                    <strong>${h.folio}</strong><br>
                    <span style="font-size: 0.7rem;">${h.client} | ${h.total} ${role === 'admin' ? `| ✍️ ${h.author}` : ''}</span>
                </div>
                <div style="display: flex; gap: 5px; align-items: flex-start;">
                    <button onclick="copyHistory(${globalIndex})" style="background:none;border:none;color:#3b82f6;"><i data-lucide="copy" style="width:14px;"></i></button>
                    ${role === 'admin' ? `<button onclick="deleteHistory(${globalIndex})" style="background:none;border:none;color:#ef4444;"><i data-lucide="trash-2" style="width:14px;"></i></button>` : ''}
                </div>
            </div>
            <select class="status-select" onchange="updateHistoryStatus(${globalIndex}, this.value)">
                <option value="Pendiente" ${!h.status || h.status === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                <option value="Ganada" ${h.status === 'Ganada' ? 'selected' : ''}>✅ Ganada</option>
                <option value="Perdida" ${h.status === 'Perdida' ? 'selected' : ''}>❌ Perdida</option>
            </select>
        </div>
        `;
    }).join('');
    lucide.createIcons();
}

function updateHistoryStatus(i, status) {
    const key = CONFIG.historyKey;
    const history = JSON.parse(localStorage.getItem(key));
    history[i].status = status;
    localStorage.setItem(key, JSON.stringify(history));
}

function loadHistory(i) {
    const h = JSON.parse(localStorage.getItem(CONFIG.historyKey))[i];
    state = h.data;
    document.getElementById('folio-input').value = state.folio;
    renderConditionsEditor(); renderItemsEditor(); updatePreview();
}

function copyHistory(i) {
    loadHistory(i);
    state.folio += " (COPIA)";
    document.getElementById('folio-input').value = state.folio;
}

function deleteHistory(i) {
    if (confirm("¿Eliminar?")) {
        const key = CONFIG.historyKey;
        const h = JSON.parse(localStorage.getItem(key));
        h.splice(i, 1);
        localStorage.setItem(key, JSON.stringify(h));
        renderHistory();
    }
}

function exportData() {
    const data = {
        history: localStorage.getItem(CONFIG.historyKey) || '[]',
        clients: localStorage.getItem('xilin_clients') || '[]',
        folioSeq: localStorage.getItem(CONFIG.folioKey) || '71588'
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xilin_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.history) localStorage.setItem(CONFIG.historyKey, data.history);
            if (data.clients) localStorage.setItem('xilin_clients', data.clients);
            if (data.folioSeq) localStorage.setItem(CONFIG.folioKey, data.folioSeq);
            alert("¡Datos restaurados con éxito!");
            location.reload();
        } catch (err) {
            alert("Error al leer el archivo de respaldo.");
        }
    };
    reader.readAsText(file);
}

function openCatalog() { document.getElementById('catalog-modal').style.display = 'flex'; renderCatalog(); }
function closeCatalog() { document.getElementById('catalog-modal').style.display = 'none'; }
function renderCatalog(filter = '') {
    const filtered = CATALOG.filter(p => p.model.toLowerCase().includes(filter.toLowerCase()) || p.description.toLowerCase().includes(filter.toLowerCase()));
    document.getElementById('catalog-list').innerHTML = filtered.map(p => `
        <div class="catalog-item" onclick="selectProduct(${CATALOG.indexOf(p)})">
            <strong>${p.model}</strong><p>${p.description}</p><div class="item-specs">${p.specs}</div>
        </div>
    `).join('');
}
function filterCatalog(v) { renderCatalog(v); }
function selectProduct(i) {
    const p = CATALOG[i];
    state.items.push({
        id: Date.now(), type: p.type || 'forklift', modelTitle: p.model, description: p.description, highlights: p.specs.split('|').filter(s => !s.toLowerCase().includes('batería')).join(' | '),
        salePrice: p.price || 0, rentPrice: 0, quantity: 1, discount: 0, mastHeight: '4.5m', forks: '42"', tireType: 'Sólida', battery: p.specs.split('|').find(s => s.toLowerCase().includes('batería'))?.split(':')[1]?.trim() || '-', image: ""
    });
    renderItemsEditor(); updatePreview(); closeCatalog();
}
window.addEventListener('keydown', (e) => { 
    if (e.key === 'Escape') {
        closeCatalog();
        closeCRM();
        closeReports();
    }
});

// --- CRM Functions ---
function openCRM() {
    renderCRM();
    document.getElementById('crm-modal').style.display = 'flex';
}

function closeCRM() { document.getElementById('crm-modal').style.display = 'none'; }

function saveClientToCRM() {
    if (!state.client.name) {
        alert("Escribe al menos el nombre del cliente.");
        return;
    }
    const clients = JSON.parse(localStorage.getItem('xilin_clients') || '[]');
    // Avoid exact duplicates
    const exist = clients.findIndex(c => c.name === state.client.name && c.company === state.client.company);
    if(exist !== -1) {
        clients[exist] = { ...state.client };
    } else {
        clients.push({ ...state.client });
    }
    localStorage.setItem('xilin_clients', JSON.stringify(clients));
    alert("Cliente guardado en el directorio.");
}

function renderCRM(filter = '') {
    const clients = JSON.parse(localStorage.getItem('xilin_clients') || '[]');
    const text = filter.toLowerCase();
    const filtered = clients.filter(c => 
        (c.name || '').toLowerCase().includes(text) || 
        (c.company || '').toLowerCase().includes(text) ||
        (c.rfc || '').toLowerCase().includes(text)
    );

    const container = document.getElementById('crm-list');
    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:var(--muted); font-size:0.9rem;">No hay clientes guardados.</p>';
        return;
    }

    container.innerHTML = filtered.map((c, idx) => `
        <div class="catalog-item" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${c.name}</strong>
                <p>${c.company || 'Sin Empresa'}</p>
                <div class="item-specs">${c.rfc || 'Sin RFC'} | ${c.email || 'Sin correo'}</div>
            </div>
            <button class="btn btn-secondary" style="width: auto; padding: 8px 12px;" onclick='injectClient(${JSON.stringify(c).replace(/'/g, "&apos;")})'>
                Utilizar
            </button>
        </div>
    `).join('');
}

function filterCRM(val) { renderCRM(val); }

function injectClient(cli) {
    state.client.name = cli.name || '';
    state.client.company = cli.company || '';
    state.client.rfc = cli.rfc || '';
    state.client.email = cli.email || '';
    
    document.getElementById('client-name').value = state.client.name;
    document.getElementById('client-company').value = state.client.company;
    document.getElementById('client-rfc').value = state.client.rfc;
    document.getElementById('client-email').value = state.client.email;
    
    updatePreview();
    closeCRM();
}

// --- Report Functions ---
function openReports() {
    if (sessionStorage.getItem('user_role') !== 'admin') {
        alert("No tienes permisos para ver reportes.");
        return;
    }
    document.getElementById('report-modal').style.display = 'flex';
    renderReports();
}

function closeReports() { document.getElementById('report-modal').style.display = 'none'; }

function renderReports() {
    const key = CONFIG.historyKey;
    const allHistory = JSON.parse(localStorage.getItem(key) || '[]');
    const container = document.getElementById('report-content');

    let sumGanada = 0;
    let sumPerdida = 0;
    let sumPendiente = 0;

    allHistory.forEach(h => {
        // Clean total currency format
        const cleanTotal = parseFloat((h.total || "0").replace(/[^0-9.-]+/g,"")) || 0;
        const stat = h.status || 'Pendiente';
        if (stat === 'Ganada') sumGanada += cleanTotal;
        else if (stat === 'Perdida') sumPerdida += cleanTotal;
        else sumPendiente += cleanTotal;
    });

    const format = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: state.currency }).format(v);

    container.innerHTML = `
        <h4 style="margin-bottom: 10px; color: var(--accent);">Reporte General: ${CONFIG.name}</h4>
        <p style="font-size: 0.8rem; color: var(--muted); margin-bottom: 20px;">
            Este reporte agrupa los estatus de TODAS las cotizaciones generadas por TODOS los ejecutivos de la plataforma.
        </p>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Estado</th>
                    <th>Subtotal (Aprox. en ${state.currency})</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>✅ Cotizaciones Ganadas</td>
                    <td style="color: #16a34a; font-weight: 600;">${format(sumGanada)}</td>
                </tr>
                <tr>
                    <td>⏳ Cotizaciones Pendientes</td>
                    <td style="color: #ca8a04; font-weight: 600;">${format(sumPendiente)}</td>
                </tr>
                <tr>
                    <td>❌ Cotizaciones Perdidas</td>
                    <td style="color: #dc2626; font-weight: 600;">${format(sumPerdida)}</td>
                </tr>
            </tbody>
        </table>
    `;
}
