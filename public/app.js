// Elementos do DOM
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('files');
const fileInputDisplay = document.getElementById('fileInputDisplay');
const selectedFilesContainer = document.getElementById('selectedFiles');
const submitBtn = document.getElementById('submitBtn');
const uploadSection = document.getElementById('uploadSection');
const successSection = document.getElementById('successSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const progressFill = document.getElementById('progressFill');
const newUploadBtn = document.getElementById('newUploadBtn');
const successMessage = document.getElementById('successMessage');
const uploadedFilesContainer = document.getElementById('uploadedFiles');

// Estado da aplicação
let selectedFiles = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Event listeners para o formulário
    uploadForm.addEventListener('submit', handleFormSubmit);
    fileInput.addEventListener('change', handleFileSelection);
    newUploadBtn.addEventListener('click', resetForm);
    
    // Drag and drop
    fileInputDisplay.addEventListener('dragover', handleDragOver);
    fileInputDisplay.addEventListener('dragleave', handleDragLeave);
    fileInputDisplay.addEventListener('drop', handleDrop);
}

// Manipulação de arquivos
function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    addFilesToSelection(files);
}

function addFilesToSelection(files) {
    files.forEach(file => {
        // Verificar se o arquivo já foi selecionado
        if (!selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
            selectedFiles.push(file);
        }
    });
    
    updateFileDisplay();
    updateSubmitButton();
}

function removeFileFromSelection(index) {
    selectedFiles.splice(index, 1);
    updateFileDisplay();
    updateSubmitButton();
}

function updateFileDisplay() {
    if (selectedFiles.length === 0) {
        selectedFilesContainer.classList.remove('show');
        fileInputDisplay.innerHTML = `
            <i class="fas fa-plus-circle"></i>
            <span>Clique para selecionar arquivos</span>
            <small>Fotos e vídeos até 50MB cada</small>
        `;
        return;
    }

    selectedFilesContainer.classList.add('show');
    fileInputDisplay.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${selectedFiles.length} arquivo(s) selecionado(s)</span>
        <small>Clique para adicionar mais arquivos</small>
    `;

    selectedFilesContainer.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <i class="fas ${getFileIcon(file.type)}"></i>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="remove-file" onclick="removeFileFromSelection(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function updateSubmitButton() {
    const guestName = document.getElementById('guestName').value.trim();
    const hasFiles = selectedFiles.length > 0;
    
    submitBtn.disabled = !guestName || !hasFiles;
}

// Drag and Drop
function handleDragOver(event) {
    event.preventDefault();
    fileInputDisplay.style.borderColor = '#5a67d8';
    fileInputDisplay.style.background = '#f0f4ff';
}

function handleDragLeave(event) {
    event.preventDefault();
    fileInputDisplay.style.borderColor = '#667eea';
    fileInputDisplay.style.background = '#f8f9ff';
}

function handleDrop(event) {
    event.preventDefault();
    fileInputDisplay.style.borderColor = '#667eea';
    fileInputDisplay.style.background = '#f8f9ff';
    
    const files = Array.from(event.dataTransfer.files);
    addFilesToSelection(files);
}

// Envio do formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const guestName = document.getElementById('guestName').value.trim();
    
    if (!guestName) {
        showError('Por favor, digite seu nome.');
        return;
    }
    
    if (selectedFiles.length === 0) {
        showError('Por favor, selecione pelo menos um arquivo.');
        return;
    }
    
    // Verificar tamanho dos arquivos
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
        showError(`Os seguintes arquivos excedem o limite de 50MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
    }
    
    await uploadFiles(guestName, selectedFiles);
}

async function uploadFiles(guestName, files) {
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('guestName', guestName);
        
        files.forEach(file => {
            formData.append('files', file);
        });
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Erro ao enviar arquivos');
        }
        
        showSuccess(result);
        
    } catch (error) {
        console.error('Erro no upload:', error);
        hideLoading();
        showError(error.message || 'Erro ao enviar arquivos. Tente novamente.');
    }
}

// Interface de feedback
function showLoading() {
    loadingOverlay.classList.remove('hidden');
    
    // Simular progresso
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressFill.style.width = progress + '%';
    }, 200);
    
    // Armazenar o interval para limpeza posterior
    loadingOverlay.dataset.interval = interval;
}

function hideLoading() {
    const interval = loadingOverlay.dataset.interval;
    if (interval) {
        clearInterval(interval);
    }
    
    progressFill.style.width = '100%';
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        progressFill.style.width = '0%';
    }, 500);
}

function showSuccess(result) {
    hideLoading();
    
    successMessage.textContent = result.message;
    
    if (result.files && result.files.length > 0) {
        uploadedFilesContainer.innerHTML = `
            <h4>Arquivos enviados para: ${result.event}</h4>
            ${result.files.map(file => `
                <div class="uploaded-file">
                    <div class="uploaded-file-info">
                        <i class="fas fa-check-circle"></i>
                        <span>${file.originalName}</span>
                        <small>(${formatFileSize(file.size)})</small>
                    </div>
                    <a href="${file.driveLink}" target="_blank" class="view-link">
                        <i class="fas fa-external-link-alt"></i>
                        Ver arquivo
                    </a>
                </div>
            `).join('')}
        `;
    }
    
    uploadSection.classList.add('hidden');
    successSection.classList.remove('hidden');
}

function showError(message) {
    alert('Erro: ' + message);
}

function resetForm() {
    selectedFiles = [];
    uploadForm.reset();
    updateFileDisplay();
    updateSubmitButton();
    
    successSection.classList.add('hidden');
    uploadSection.classList.remove('hidden');
}

// Utilitários
function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) {
        return 'fa-image';
    } else if (mimeType.startsWith('video/')) {
        return 'fa-video';
    } else {
        return 'fa-file';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Event listener para atualizar botão quando o nome for digitado
document.getElementById('guestName').addEventListener('input', updateSubmitButton);

// Prevenir envio do formulário com Enter no campo de nome
document.getElementById('guestName').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});
