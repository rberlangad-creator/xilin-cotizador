// --- Constants & Data ---
const CONDITIONS = {
    venta: [
        "PRECIOS COTIZADOS SIN IVA. APLICA IVA DEL 16%.",
        "LA GARANTÍA DEL EQUIPO CONTRA DEFECTOS DE FABRICA ES DE 12 MESES O 2000 HORAS.",
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

// --- State ---
let state = {
    mode: 'venta', // 'venta' or 'renta'
    currency: 'USD', // Initialized in USD to match the image
    folio: 'COT #0071588',
    deliveryTime: '90 dias',
    client: {
        name: 'JOEL ROBLES',
        company: 'Xilin Monterrey',
        rfc: 'XAX010101000',
        email: 'test@example.com'
    },
    items: [
        {
            id: Date.now(),
            modelTitle: "EQUIPO XILIN",
            description: "Descripción general del equipo.",
            highlights: "Eficiencia superior | Bajo mantenimiento | Diseño ergonómico",
            salePrice: 0,
            rentPrice: 0,
            quantity: 1,
            discount: 0,
            mastHeight: '4.5m',
            forks: '42"',
            tireType: 'Sólida',
            battery: 'Lead-Acid / Lithium',
            image: ""
        }
    ],
    customConditions: ["", "", ""]
};

// --- Initial Render ---
window.onload = () => {
    updateDate();
    initEventListeners();
    renderItemsEditor();
    updatePreview();
};

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
            renderItemsEditor(); // Re-render editor to show correct prices
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
            if (id === 'folio-input') {
                state.folio = e.target.value;
            } else {
                state.client[targetPath] = e.target.value;
            }
            updatePreview();
        };
    };

    bindInput('folio-input');
    bindInput('client-name', 'name');
    bindInput('client-company', 'company');
    bindInput('client-rfc', 'rfc');
    bindInput('client-email', 'email');

    // Delivery Time
    document.getElementById('delivery-time-select').onchange = (e) => {
        state.deliveryTime = e.target.value;
        updatePreview();
    };

    // Custom Conditions
    document.querySelectorAll('.custom-cond-input').forEach(input => {
        input.oninput = (e) => {
            const index = parseInt(e.target.dataset.index);
            state.customConditions[index] = e.target.value;
            updatePreview();
        };
    });

    // Print
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
    
    state.items.forEach((item, index) => {
        const price = state.mode === 'venta' ? (item.salePrice || 0) : (item.rentPrice || 0);
        const div = document.createElement('div');
        div.className = 'item-edit-row';
        div.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-bottom: 8px;">
                <input type="text" placeholder="Modelo (Ej: FB16R)" value="${item.modelTitle || ''}" oninput="updateItem(${item.id}, 'modelTitle', this.value)" style="font-weight: 700;">
                <input type="text" placeholder="Descripción breve..." value="${item.description || ''}" oninput="updateItem(${item.id}, 'description', this.value)">
            </div>
            
            <textarea placeholder="Comentarios Profesionales / Plus (Sugerencia: use | para separar)" 
                      style="font-size: 0.8rem; height: 60px;"
                      oninput="updateItem(${item.id}, 'highlights', this.value)">${item.highlights || ''}</textarea>

            ${item.type === 'generic' ? `
                <div class="form-group" style="margin-top: 10px;">
                    <label style="font-size: 0.65rem;">Unidad de Medida / Adicional</label>
                    <input type="text" placeholder="Ej: 1 Pieza, Servicio, Lote, Hrs..." value="${item.unit || ''}" oninput="updateItem(${item.id}, 'unit', this.value)">
                </div>
            ` : `
                <div class="item-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px;">
                    <div>
                        <label style="font-size: 0.65rem;">Altura (m)</label>
                        <input type="text" placeholder="Ej: 4.5m" value="${item.mastHeight || ''}" oninput="updateItem(${item.id}, 'mastHeight', this.value)">
                    </div>
                    <div>
                        <label style="font-size: 0.65rem;">Cuchillas</label>
                        <input type="text" placeholder='Ej: 42"' value="${item.forks || ''}" oninput="updateItem(${item.id}, 'forks', this.value)">
                    </div>
                    <div>
                        <label style="font-size: 0.65rem;">Ruedas</label>
                        <select onchange="updateItem(${item.id}, 'tireType', this.value)" style="padding: 10px 5px; font-size: 0.8rem;">
                            <option value="Sólida" ${item.tireType === 'Sólida' ? 'selected' : ''}>Sólida</option>
                            <option value="Rudomática" ${item.tireType === 'Rudomática' ? 'selected' : ''}>Rudomática</option>
                            <option value="Poly" ${item.tireType === 'Poly' ? 'selected' : ''}>Poly</option>
                        </select>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 10px;">
                    <label style="font-size: 0.65rem;">Capacidad de Batería</label>
                    <input type="text" placeholder="Ej: 48V/270AH Litio" value="${item.battery || ''}" oninput="updateItem(${item.id}, 'battery', this.value)">
                </div>
            `}

            <div class="item-grid" style="margin-top: 10px;">
                <input type="number" placeholder="Precio ($)" value="${price}" oninput="updateItem(${item.id}, 'price', this.value)">
                <input type="number" placeholder="Cant" value="${item.quantity}" oninput="updateItem(${item.id}, 'quantity', this.value)">
                <input type="number" placeholder="Desc (%)" value="${item.discount}" oninput="updateItem(${item.id}, 'discount', this.value)">
            </div>
            
            <div style="margin-top: 10px; display: flex; gap: 10px; align-items: center;">
                <label class="btn" style="flex: 1; font-size: 0.7rem; background: #f1f5f9; color: #475569; padding: 8px;">
                    <i data-lucide="image"></i> Subir Imagen
                    <input type="file" style="display: none;" accept="image/*" onchange="handleImageUpload(${item.id}, this.files[0])">
                </label>
                <button class="btn" style="width: auto; padding: 8px; background: #fee2e2; color: #ef4444;" onclick="removeItem(${item.id})">
                   <i data-lucide="trash-2"></i>
                </button>
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
            item.image = e.target.result; // Base64 string
            updatePreview();
            renderItemsEditor(); // Re-render to show updated state (optional)
        }
    };
    reader.readAsDataURL(file);
}

function formatCurrency(val) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: state.currency,
    }).format(val);
}

function updatePreview() {
    // Header & Badges
    document.getElementById('folio-display').innerText = state.folio || 'COT #000000';
    
    const badges = document.getElementById('quote-badges');
    const modeText = state.mode === 'venta' ? 'VENTA' : 'RENTA';
    const currText = state.currency === 'MXN' ? 'MXN PESOS' : 'USD DÓLARES AMERICANOS';
    
    badges.innerHTML = `
        <span class="badge badge-mode">${modeText}</span>
        <span class="badge badge-curr">${currText}</span>
    `;
    
    // Client
    const billTo = document.getElementById('bill-to-content');
    billTo.innerHTML = `
        <strong>${state.client.name || 'CLIENTE PENDIENTE'}</strong><br>
        ${state.client.company || 'Empresa'}<br>
        RFC: ${state.client.rfc || 'XAX010101000'}<br>
        <span style="color: #3b82f6; text-transform: lowercase;">${state.client.email || 'correo@ejemplo.com'}</span>
    `;

    // Table
    const list = document.getElementById('items-list');
    list.innerHTML = '';
    let subtotal = 0;

    state.items.forEach(item => {
        const price = state.mode === 'venta' ? (item.salePrice || 0) : (item.rentPrice || 0);
        const itemSubtotal = price * item.quantity;
        const discAmount = itemSubtotal * (item.discount / 100);
        const itemTotal = itemSubtotal - discAmount;
        subtotal += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="product-row" style="display: flex; gap: 15px;">
                    <img src="${item.image || 'https://via.placeholder.com/80?text=No+Img'}" 
                         style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px; border: 1px solid #eee;">
                    <div class="product-desc" style="flex: 1;">
                        <strong style="display: block; margin-bottom: 4px; font-size: 0.95rem; text-transform: uppercase; color: #000;">${item.modelTitle || 'EQUIPO XILIN'}</strong>
                        <div style="font-size: 0.8rem; color: #444; margin-bottom: 8px; line-height: 1.3;">${item.description || ''}</div>
                        
                        ${item.highlights ? `
                        <div style="margin-bottom: 10px; padding: 5px 0;">
                            <div style="font-size: 0.8rem; color: #1e293b; font-weight: 500;">
                                <ul style="margin: 0; padding-left: 15px; display: flex; flex-direction: column; gap: 4px;">
                                    ${item.highlights.split('|').map(h => `<li>${h.trim()}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        ` : ''}

                        ${item.type === 'generic' ? `
                            ${item.unit ? `<div style="font-size: 0.72rem; color: #64748b; padding-top: 5px; border-top: 1px solid #f1f1f1;"><strong>Info:</strong> ${item.unit}</div>` : ''}
                        ` : `
                        <div style="font-size: 0.72rem; color: #64748b; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; padding-top: 5px; border-top: 1px solid #f1f1f1;">
                            <span><strong>Mástil:</strong> ${item.mastHeight || '-'}</span>
                            <span><strong>Horquillas:</strong> ${item.forks || '-'}</span>
                            <span><strong>Ruedas:</strong> ${item.tireType || '-'}</span>
                            <span><strong>Batería:</strong> ${item.battery || '-'}</span>
                        </div>
                        `}
                    </div>
                </div>
            </td>
            <td>${formatCurrency(price)}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(itemTotal)}</td>
        `;
        list.appendChild(row);
    });

    // Totals
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    document.getElementById('subtotal-val').innerText = formatCurrency(subtotal);
    document.getElementById('tax-val').innerText = formatCurrency(tax);
    document.getElementById('total-val').innerText = formatCurrency(total);

    // Conditions
    const condSection = document.getElementById('conditions-section');
    const dynamicConditions = [...CONDITIONS[state.mode]];
    
    // Delivery Time Condition
    const deliveryIndex = dynamicConditions.findIndex(c => c.includes("TIEMPO DE ENTREGA"));
    if (deliveryIndex !== -1) {
        dynamicConditions[deliveryIndex] = `TIEMPO DE ENTREGA: ${state.deliveryTime.toUpperCase()}.`;
    } else {
        dynamicConditions.push(`TIEMPO DE ENTREGA: ${state.deliveryTime.toUpperCase()}.`);
    }

    // Special China Payment Condition (only for Sales with lead time)
    if (state.mode === 'venta' && state.deliveryTime !== '3-5 días Stock') {
        dynamicConditions.push("SI EL EQUIPO SE VA A TIEMPO DE ENTREGA SE SOLICITA EL 50% DE ANTICIPO Y RESTO PREVIO A EMBARQUE DE PLANTA EN CHINA.");
    }

    // Custom Conditions
    state.customConditions.forEach(cond => {
        if (cond.trim()) {
            dynamicConditions.push(cond.toUpperCase());
        }
    });

    condSection.innerHTML = `
        <h4>CONDICIONES COMERCIALES DE ${state.mode.toUpperCase()}:</h4>
        <ul>
            ${dynamicConditions.map(c => `<li>${c}</li>`).join('')}
        </ul>
    `;
}

function saveToHistory() {
    const history = JSON.parse(localStorage.getItem('xilin_history') || '[]');
    history.unshift({
        folio: state.folio,
        date: new Date().toLocaleDateString(),
        client: state.client.name,
        total: document.getElementById('total-val').innerText,
        data: JSON.parse(JSON.stringify(state))
    });
    localStorage.setItem('xilin_history', JSON.stringify(history.slice(0, 10)));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('xilin_history') || '[]');
    const container = document.getElementById('folio-history');
    if (history.length === 0) {
        container.innerText = 'Sin folios guardados.';
        return;
    }
    
    container.innerHTML = history.map((h, i) => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0; cursor: pointer;" onclick="loadHistory(${i})">
            <strong>${h.folio}</strong> - ${h.client || 'S/N'}<br>
            <span style="font-size: 0.7rem;">${h.date} | ${h.total}</span>
        </div>
    `).join('');
}

function loadHistory(index) {
    const history = JSON.parse(localStorage.getItem('xilin_history') || '[]');
    const entry = history[index];
    if (entry) {
        state = entry.data;
        // Sync inputs
        document.getElementById('folio-input').value = state.folio;
        document.getElementById('client-name').value = state.client.name;
        document.getElementById('client-company').value = state.client.company;
        document.getElementById('client-rfc').value = state.client.rfc;
        document.getElementById('client-email').value = state.client.email;
        
        renderItemsEditor();
        updatePreview();
    }
}

// Initial history load
renderHistory();

// --- Catalog Logic ---
function openCatalog() {
    document.getElementById('catalog-modal').style.display = 'flex';
    renderCatalog();
}

function closeCatalog() {
    document.getElementById('catalog-modal').style.display = 'none';
}

function renderCatalog(filter = '') {
    const list = document.getElementById('catalog-list');
    const filtered = CATALOG.filter(p => 
        p.model.toLowerCase().includes(filter.toLowerCase()) || 
        p.description.toLowerCase().includes(filter.toLowerCase())
    );
    
    list.innerHTML = filtered.map((p, i) => `
        <div class="catalog-item" onclick="selectProduct(${CATALOG.indexOf(p)})">
            <strong>${p.model}</strong>
            <p>${p.description}</p>
            <div class="item-specs">${p.specs}</div>
        </div>
    `).join('');
}

function filterCatalog(val) {
    renderCatalog(val);
}

function selectProduct(index) {
    const p = CATALOG[index];
    const isGeneric = p.type === 'generic';
    const batteryInfo = p.specs.split('|').find(s => s.toLowerCase().includes('batería'))?.split(':')[1]?.trim() || 'Ver ficha técnica';
    const filteredHighlights = p.specs.split('|').filter(s => !s.toLowerCase().includes('batería')).map(s => s.trim()).join(' | ');
    
    state.items.push({
        id: Date.now(),
        type: isGeneric ? 'generic' : 'forklift',
        modelTitle: p.model,
        description: p.description,
        highlights: filteredHighlights,
        salePrice: p.price || 0,
        rentPrice: 0,
        quantity: 1,
        discount: 0,
        mastHeight: '4.5m',
        forks: '42"',
        tireType: 'Sólida',
        battery: batteryInfo,
        image: ""
    });
    renderItemsEditor();
    updatePreview();
    closeCatalog();
}

// Close modal on escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCatalog();
});
