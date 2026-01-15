const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const grid = document.getElementById('daysGrid');
const sundayContainer = document.getElementById('sundayContainer');
const pdfInput = document.getElementById('pdfInput');

// --- LÓGICA DE BASE DE DATOS (IndexedDB) ---
let db;
const request = indexedDB.open("CMC_Liturgy_DB", 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    db.createObjectStore("files");
};

request.onsuccess = (e) => {
    db = e.target.result;
    loadSavedData();
};

// Renderizar Interfaz
function renderDays() {
    grid.innerHTML = '';
    days.forEach(day => {
        grid.innerHTML += `
            <div class="day-card p-6">
                <h2 class="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-3">${day}</h2>
                <div class="flex gap-3">
                    <span class="text-[#f8ad9d] font-bold">—</span>
                    <textarea id="input-${day.toLowerCase()}" placeholder="Cantos..."></textarea>
                </div>
            </div>`;
    });
    sundayContainer.innerHTML = `
        <div class="day-card p-8 sunday-highlight mt-6 border-dashed border-2 border-slate-200">
            <h2 class="text-2xl font-black text-slate-800 italic uppercase mb-4">DOMINGO</h2>
            <textarea id="input-domingo" class="min-h-[150px]" placeholder="Entrada, Gloria, Salmo..."></textarea>
        </div>`;
}

// Manejo de PDF con Blob (Más eficiente)
pdfInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function(event) {
            const blob = new Blob([event.target.result], {type: 'application/pdf'});
            const transaction = db.transaction(["files"], "readwrite");
            transaction.objectStore("files").put(blob, "current_pdf");
            localStorage.setItem('cmc_pdf_name', file.name);
            
            const url = URL.createObjectURL(blob);
            showPDF(file.name, url);
        };
        reader.readAsArrayBuffer(file);
    }
});

function showPDF(name, url) {
    document.getElementById('pdfPrompt').classList.add('hidden');
    document.getElementById('pdfInfo').classList.remove('hidden');
    document.getElementById('pdfPreviewContainer').classList.remove('hidden');
    document.getElementById('pdfName').innerText = name;
    document.getElementById('pdfLink').href = url;
}

function removePDF() {
    const transaction = db.transaction(["files"], "readwrite");
    transaction.objectStore("files").delete("current_pdf");
    localStorage.removeItem('cmc_pdf_name');
    location.reload();
}

function saveAll() {
    const data = {};
    [...days, 'Domingo'].forEach(d => {
        data[d.toLowerCase()] = document.getElementById(`input-${d.toLowerCase()}`).value;
    });
    localStorage.setItem('cmc_liturgy_data', JSON.stringify(data));
    alert('✅ Plan y texto guardados.');
}

function loadSavedData() {
    renderDays();
    // Cargar Texto
    const savedText = JSON.parse(localStorage.getItem('cmc_liturgy_data'));
    if (savedText) {
        Object.keys(savedText).forEach(key => {
            const el = document.getElementById(`input-${key}`);
            if (el) el.value = savedText[key];
        });
    }
    // Cargar PDF desde IndexedDB
    const transaction = db.transaction(["files"], "readonly");
    const getRequest = transaction.objectStore("files").get("current_pdf");
    getRequest.onsuccess = () => {
        if (getRequest.result) {
            const url = URL.createObjectURL(getRequest.result);
            const name = localStorage.getItem('cmc_pdf_name') || "Archivo.pdf";
            showPDF(name, url);
        }
    };
}

function clearAll() {
    if (confirm("¿Limpiar toda la semana?")) {
        localStorage.clear();
        const transaction = db.transaction(["files"], "readwrite");
        transaction.objectStore("files").clear();
        location.reload();
    }
}

function sendWhatsApp() {
    let message = "🎼 *PLANIFICACIÓN - CMC MUSIC* 🎼\n\n";
    [...days, 'Domingo'].forEach(d => {
        const val = document.getElementById(`input-${d.toLowerCase()}`).value.trim();
        if (val) message += `*${d.toUpperCase()}*:\n${val}\n\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}
