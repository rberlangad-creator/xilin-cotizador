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

const COMPANIES = {
    xilin: {
        name: "Xilin Monterrey",
        theme: "theme-xilin",
        historyKey: "xilin_history",
        headerHtml: `
            <div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 3rem; line-height: 0.8; color: #000; letter-spacing: -2px;">xilin</div>
            <div class="company-info" style="margin-top: 15px;">
                <strong>Xilin Monterrey</strong><br>
                Melchor Ocampo 330, Centro, 64000 Monterrey, N.L.<br>
                www.xilinmonterrey.com | Tel. 81-3121-1403
            </div>
        `
    },
    bsservices: {
        name: "BS Services",
        theme: "theme-bsservices",
        historyKey: "bsservices_history",
        headerHtml: `
            <img src="bsservices_logo.png" style="width: 220px; margin-bottom: 5px;" onerror="this.src='https://via.placeholder.com/220x60?text=BS+Services'">
            <div class="company-info">
                <strong>BS Services - Consultoría Industrial</strong><br>
                Monterrey, Nuevo León, México.<br>
                www.bsservices.com.mx | contacto@bsservices.com
            </div>
        `
    }
};

// --- State ---
let state = {
    currentCompany: null,
    mode: 'venta',
    currency: 'USD',
    folio: 'COT #0071588',
    deliveryTime: '90 dias',
    client: {
        name: 'JOEL ROBLES',
        company: 'Xilin Monterrey',
        rfc: 'XAX010101000',
        email: 'test@example.com'
    },
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
    const savedCompany = sessionStorage.getItem('current_company');
    
    if (isLogged) {
        document.getElementById('login-screen').style.display = 'none';
        if (savedCompany) {
            selectCompany(savedCompany);
        } else {
            showSelector();
        }
    }
}

function showSelector() {
    document.getElementById('company-selector').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
}

function selectCompany(companyId) {
    state.currentCompany = companyId;
    sessionStorage.setItem('current_company', companyId);
    
    const config = COMPANIES[companyId];
    document.body.className = config.theme;
    document.getElementById('company-selector').style.display = 'none';
    document.getElementById('app').style.display = 'grid';
    
    document.getElementById('company-header').innerHTML = config.headerHtml;
    
    resetForm(false);
    renderHistory();
    updatePreview();
    lucide.createIcons();
}

function handleLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const errorMsg = document.getElementById('login-error');

    if (user === 'admin' && pass === 'xilin2026') {
        sessionStorage.setItem('xilin_session', 'true');
        document.getElementById('login-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            showSelector();
        }, 300);
    } else {
        errorMsg.style.display = 'block';
    }
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

    document.getElementById('delivery-time-select').onchange = (e) => {
        state.deliveryTime = e.target.value;
        const deliveryIndex = state.conditions.findIndex(c => c.toUpperCase().includes("TIEMPO DE ENTREGA"));
        if (deliveryIndex !== -1) {
            state.conditions[deliveryIndex] = `TIEMPO DE ENTREGA: ${state.deliveryTime.toUpperCase()}.`;
        } else {
            state.conditions.push(`TIEMPO DE ENTREGA: ${state.deliveryTime.toUpperCase()}.`);
        }
        
        if (state.mode === 'venta' && state.deliveryTime !== '3-5 días Stock') {
            const chinaMsg = "EQUIPO (MONTACARGAS) A TIEMPO DE ENTREGA SE SOLICITA 50% DE ANTICIPO Y RESTO PREVIO CONFIRMACIÓN DE EMBARQUE EN CHINA.";
            if(!state.conditions.includes(chinaMsg)) state.conditions.push(chinaMsg);
        }
        renderConditionsEditor();
        updatePreview();
    };

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
        const item = state.items.find(i => i.id === id);
        if (item) {
            item.image = e.target.result;
            updatePreview();
        }
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
    const config = COMPANIES[state.currentCompany];
    const history = JSON.parse(localStorage.getItem(config.historyKey) || '[]');
    const safeState = JSON.parse(JSON.stringify(state));
    safeState.items.forEach(i => i.image = "");
    history.unshift({ folio: state.folio, date: new Date().toLocaleDateString(), client: state.client.name, total: document.getElementById('total-val').innerText, data: safeState });
    localStorage.setItem(config.historyKey, JSON.stringify(history.slice(0, 15)));
    renderHistory();
}

function resetForm(ask = true) {
    if (!ask || confirm("¿Borrar cotización actual?")) {
        state.items = [];
        state.client = { name: '', company: '', rfc: '', email: '' };
        state.folio = 'COT #';
        state.conditions = [...CONDITIONS[state.mode]];
        document.getElementById('folio-input').value = state.folio;
        renderConditionsEditor(); renderItemsEditor(); updatePreview();
    }
}

function renderHistory() {
    const key = COMPANIES[state.currentCompany].historyKey;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const container = document.getElementById('folio-history');
    if (history.length === 0) {
        container.innerHTML = '<p style="padding: 10px; font-style: italic;">Sin historial.</p>';
        return;
    }
    container.innerHTML = history.map((h, i) => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
            <div style="cursor: pointer;" onclick="loadHistory(${i})"><strong>${h.folio}</strong><br><span style="font-size: 0.7rem;">${h.client} | ${h.total}</span></div>
            <div style="display: flex; gap: 5px;">
                <button onclick="copyHistory(${i})" style="background:none;border:none;color:#3b82f6;"><i data-lucide="copy" style="width:14px;"></i></button>
                <button onclick="deleteHistory(${i})" style="background:none;border:none;color:#ef4444;"><i data-lucide="trash-2" style="width:14px;"></i></button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function loadHistory(i) {
    const h = JSON.parse(localStorage.getItem(COMPANIES[state.currentCompany].historyKey))[i];
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
        const key = COMPANIES[state.currentCompany].historyKey;
        const h = JSON.parse(localStorage.getItem(key));
        h.splice(i, 1);
        localStorage.setItem(key, JSON.stringify(h));
        renderHistory();
    }
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
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCatalog(); });
