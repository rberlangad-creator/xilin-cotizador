const CATALOG = [
    // --- Serie FB-R (4 Ruedas) ---
    {
        model: "FB16R",
        description: "Montacargas eléctrico de 4 ruedas, capacidad 1.6t. Eje motriz tipo H, motor AC libre de mantenimiento y centro de gravedad bajo para máxima estabilidad.",
        specs: "Capacidad: 1,600kg | Batería: 48V/375Ah | Motor: AC",
        price: 0
    },
    {
        model: "FB20R",
        description: "Montacargas eléctrico de 4 ruedas, capacidad 2.0t. Excelente maniobrabilidad con sistema de amortiguación inteligente en el mástil y frenos regenerativos.",
        specs: "Capacidad: 2,000kg | Batería: 48V/500Ah | Motor: AC",
        price: 0
    },
    {
        model: "FB25R",
        description: "Montacargas eléctrico de 4 ruedas, capacidad 2.5t. Diseñado para turnos intensivos con ergonomía superior y visibilidad amplia a través del mástil.",
        specs: "Capacidad: 2,500kg | Batería: 48V/500Ah | Motor: AC",
        price: 0
    },
    {
        model: "FB30R",
        description: "Montacargas eléctrico de 4 ruedas robusto, capacidad 3.0t. Sistema de 80V para alta potencia y eficiencia en operaciones de carga pesada.",
        specs: "Capacidad: 3,000kg | Batería: 80V/400Ah | Motor: AC",
        price: 0
    },
    {
        model: "FB35R",
        description: "Montacargas eléctrico de 4 ruedas gran capacidad, 3.5t. El modelo más potente de la serie FB-R, ideal para logística industrial pesada.",
        specs: "Capacidad: 3,500kg | Batería: 80V/400Ah | Motor: AC",
        price: 0
    },

    // --- Serie CPD-SA (3 Ruedas Dual Drive) ---
    {
        model: "CPD16SA",
        description: "Montacargas de 3 ruedas con tracción delantera doble. Radio de giro ultra pequeño, ideal para pasillos muy estrechos.",
        specs: "Capacidad: 1,600kg | Batería: 48V/480Ah | Tracción: Dual Drive",
        price: 0
    },
    {
        model: "CPD18SA",
        description: "Montacargas de 3 ruedas equilibrado. Combina potencia con la maniobrabilidad de un equipo compacto para carga/descarga eficiente.",
        specs: "Capacidad: 1,800kg | Batería: 48V/480Ah | Tracción: Dual Drive",
        price: 0
    },
    {
        model: "CPD20SA",
        description: "Montacargas de 3 ruedas de alta capacidad. Máximo rendimiento en su clase con estabilidad superior para 2 toneladas.",
        specs: "Capacidad: 2,000kg | Batería: 48V/560Ah | Tracción: Dual Drive",
        price: 0
    },

    // --- Serie CPD-S/E (3 Ruedas Compacto) ---
    {
        model: "CPD10S-E",
        description: "Montacargas ultra compacto de 3 ruedas. Cabe en elevadores y pasillos mínimos, perfecto para almacenes pequeños.",
        specs: "Capacidad: 1,000kg | Batería: 24V/200-360Ah | Radio giro: Mínimo",
        price: 0
    },
    {
        model: "CPD15S-E",
        description: "Montacargas compacto de 3 ruedas, 1.5t. Eficiencia energética superior y motor AC para bajo costo de mantenimiento.",
        specs: "Capacidad: 1,500kg | Batería: 24V/400Ah | Radio giro: Mínimo",
        price: 0
    },

    // --- Transpaletas y Apiladores ---
    {
        model: "CBD18KD",
        description: "Transpaleta eléctrica Walkie ultraligera. Mango ergonómico con controles de fácil acceso, ideal para logística retail.",
        specs: "Capacidad: 1,800kg | Batería: 24V/160Ah | Tipo: Walkie",
        price: 0
    },
    {
        model: "CBD25T",
        description: "Transpaleta eléctrica Rider con plataforma. Diseñada para transporte de larga distancia con alta velocidad y seguridad.",
        specs: "Capacidad: 2,500kg | Batería: 24V/300Ah | Tipo: Rider",
        price: 0
    },
    {
        model: "CBD30T",
        description: "Transpaleta eléctrica Rider de gran capacidad, 3.0t. Chasis reforzado para el movimiento de cargas industriales más exigentes.",
        specs: "Capacidad: 3,000kg | Batería: 24V/300Ah | Tipo: Rider",
        price: 0
    },
    {
        model: "CDDK20",
        description: "Apilador eléctrico de conductor a bordo. Dirección electrónica EPS y mástil robusto para apilamiento preciso de hasta 2 toneladas.",
        specs: "Capacidad: 2,000kg | Batería: 24V/280Ah | Dirección: EPS",
        price: 0
    },
    {
        model: "CDDR15",
        description: "Apilador eléctrico tipo Rider. Ofrece confort para el operador en turnos largos y excelente visibilidad panorámica.",
        specs: "Capacidad: 1,500kg | Batería: 24V/280Ah | Tipo: Rider",
        price: 0
    },

    // --- Equipos Especializados ---
    {
        model: "CQDH18C",
        description: "Montacargas Reach Truck para pasillo angosto. Mástil con desplazamiento frontal para optimizar el espacio de estantería.",
        specs: "Capacidad: 1,800kg | Batería: 36V/700Ah | Tipo: Reach",
        price: 0
    },
    {
        model: "CQDH20C",
        description: "Montacargas Reach Truck alta capacidad. Estabilidad excepcional en alturas elevadas con sistema de control Curtis AC.",
        specs: "Capacidad: 2,000kg | Batería: 36V/700Ah | Tipo: Reach",
        price: 0
    },
    {
        model: "OPD15 / OPD15Z",
        description: "Apilador Trilateral VNA. Horquillas rotativas de 180° para operar en pasillos de solo 1.6m de ancho.",
        specs: "Capacidad: 1,500kg | Batería: 48V/500Ah | Pasillo: VNA",
        price: 0
    },
    {
        model: "OPS15-BD",
        description: "Order Picker (Preparador de pedidos). Elevación de cabina para que el operador realice picking manual en rack de nivel medio/alto.",
        specs: "Capacidad: 1,500kg | Batería: 48V/500Ah | Uso: Picking",
        price: 0
    },

    // --- Servicios y Refacciones ---
    {
        model: "ARTÍCULO GENÉRICO / VARIOS",
        description: "Artículo configurable. Ideal para cotizar refacciones, servicios de mantenimiento, mano de obra, capacitaciones o accesorios.",
        specs: "Uso: Cotización Libre",
        price: 0,
        type: "generic"
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CATALOG;
}
