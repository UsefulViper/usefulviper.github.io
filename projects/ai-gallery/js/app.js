// AI Gallery Application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    const app = new AIGalleryApp();
    app.init();
});

class AIGalleryApp {
    constructor() {
        // Elements
        this.fileUpload = document.getElementById('file-upload');
        this.dropZone = document.getElementById('drop-zone');
        this.galleryGrid = document.getElementById('gallery-grid');
        this.initialMessage = document.getElementById('initial-message');
        this.processingLoader = document.getElementById('processing-loader');
        this.processingDetails = document.getElementById('processing-details');
        this.noResults = document.getElementById('no-results');
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.categoryFilter = document.getElementById('category-filter');
        this.colorFilters = document.querySelectorAll('.color-filter');
        this.sortFilter = document.getElementById('sort-filter');
        this.resetFiltersBtn = document.getElementById('reset-filters');
        this.themeSwitch = document.getElementById('theme-switch');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.navLinks = document.querySelector('.nav-links');
        
        // Image viewer elements
        this.imageViewer = document.getElementById('image-viewer');
        this.viewerImage = document.getElementById('viewer-image');
        this.objectsImage = document.getElementById('objects-image');
        this.objectsCanvas = document.getElementById('objects-canvas');
        this.closeViewer = document.getElementById('close-viewer');
        this.prevImage = document.getElementById('prev-image');
        this.nextImage = document.getElementById('next-image');
        this.imageFilename = document.getElementById('image-filename');
        this.imageSize = document.getElementById('image-size');
        this.imageDate = document.getElementById('image-date');
        this.predictionsList = document.getElementById('predictions-list');
        this.detectedObjects = document.getElementById('detected-objects');
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // AI Models
        this.mobilenetModel = null;
        this.cocoSsdModel = null;
        
        // State
        this.images = [];
        this.filteredImages = [];
        this.currentImageIndex = 0;
        this.activeColorFilter = null;
        this.modelsLoaded = {
            mobilenet: false,
            cocoSsd: false
        };
        this.isProcessing = false;
    }
    
    init() {
        // Show initial message
        this.showElement(this.initialMessage);
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load AI models
        this.loadAIModels();
        
        // Initialize theme
        this.initTheme();
    }
    
    initEventListeners() {
        // File upload
        this.fileUpload.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files);
            }
        });
        
        // Drag and drop
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('active');
        });
        
        document.addEventListener('dragleave', (e) => {
            if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
                this.dropZone.classList.remove('active');
            }
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('active');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files);
            }
        });
        
        // Search and filters
        this.searchInput.addEventListener('input', () => this.applyFilters());
        this.searchBtn.addEventListener('click', () => this.applyFilters());
        this.categoryFilter.addEventListener('change', () => this.applyFilters());
        this.sortFilter.addEventListener('change', () => this.applyFilters());
        this.resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        
        // Color filters
        this.colorFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                if (this.activeColorFilter === filter) {
                    // Deselect current filter
                    filter.classList.remove('active');
                    this.activeColorFilter = null;
                } else {
                    // Remove active class from all filters
                    this.colorFilters.forEach(f => f.classList.remove('active'));
                    // Add active class to clicked filter
                    filter.classList.add('active');
                    this.activeColorFilter = filter;
                }
                this.applyFilters();
            });
        });
        
        // Image viewer
        this.closeViewer.addEventListener('click', () => this.closeImageViewer());
        this.prevImage.addEventListener('click', () => this.navigateImage(-1));
        this.nextImage.addEventListener('click', () => this.navigateImage(1));
        
        // Tab navigation in image viewer
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.activateTab(tabName);
            });
        });
        
        // Theme switch
        this.themeSwitch.addEventListener('change', () => {
            this.toggleTheme();
        });
        
        // Mobile menu
        this.mobileMenuBtn.addEventListener('click', () => {
            this.navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                this.navLinks.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-menu-btn') && !e.target.closest('.nav-links')) {
                this.navLinks.classList.remove('active');
            }
        });
        
        // Key navigation in image viewer
        document.addEventListener('keydown', (e) => {
            if (this.imageViewer.classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closeImageViewer();
                } else if (e.key === 'ArrowLeft') {
                    this.navigateImage(-1);
                } else if (e.key === 'ArrowRight') {
                    this.navigateImage(1);
                }
            }
        });
    }
    
    async loadAIModels() {
        try {
            // Load MobileNet model
            this.mobilenetModel = await mobilenet.load();
            this.modelsLoaded.mobilenet = true;
            console.log('MobileNet model loaded');
            
            // Load COCO-SSD model
            this.cocoSsdModel = await cocoSsd.load();
            this.modelsLoaded.cocoSsd = true;
            console.log('COCO-SSD model loaded');
        } catch (error) {
            console.error('Error loading AI models:', error);
            alert('Failed to load AI models. Please refresh the page and try again.');
        }
    }
    
    initTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.themeSwitch.checked = savedTheme === 'dark';
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    async handleFileUpload(files) {
        if (this.isProcessing) {
            alert('Please wait until current processing is complete.');
            return;
        }
        
        if (!this.modelsLoaded.mobilenet || !this.modelsLoaded.cocoSsd) {
            alert('AI models are still loading. Please try again in a moment.');
            return;
        }
        
        // Show processing loader
        this.isProcessing = true;
        this.showElement(this.processingLoader);
        this.hideElement(this.initialMessage);
        this.hideElement(this.noResults);
        
        // Process each file
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            this.processingDetails.textContent = `Analyzing image ${i + 1} of ${imageFiles.length}...`;
            
            try {
                // Create image object
                const imageObj = {
                    file: file,
                    filename: file.name,
                    size: {
                        width: 0,
                        height: 0,
                        bytes: file.size
                    },
                    date: new Date(),
                    url: URL.createObjectURL(file),
                    category: '',
                    colors: [],
                    predictions: [],
                    objects: []
                };
                
                // Load image
                const img = await this.loadImage(imageObj.url);
                imageObj.size.width = img.width;
                imageObj.size.height = img.height;
                
                // Analyze image with MobileNet
                const predictions = await this.mobilenetModel.classify(img);
                imageObj.predictions = predictions;
                
                // Set primary category from top prediction
                if (predictions.length > 0) {
                    const topCategory = predictions[0].className.split(',')[0].toLowerCase();
                    if (topCategory.includes('food')) {
                        imageObj.category = 'food';
                    } else if (topCategory.includes('person') || topCategory.includes('people') || topCategory.includes('face')) {
                        imageObj.category = 'people';
                    } else if (topCategory.includes('animal') || topCategory.includes('dog') || topCategory.includes('cat') || topCategory.includes('bird')) {
                        imageObj.category = 'animals';
                    } else if (topCategory.includes('building') || topCategory.includes('house') || topCategory.includes('tower')) {
                        imageObj.category = 'architecture';
                    } else if (topCategory.includes('tree') || topCategory.includes('flower') || topCategory.includes('mountain') || topCategory.includes('sky') || topCategory.includes('water')) {
                        imageObj.category = 'nature';
                    } else {
                        imageObj.category = 'other';
                    }
                }
                
                // Detect objects with COCO-SSD
                const objects = await this.cocoSsdModel.detect(img);
                imageObj.objects = objects;
                
                // Extract dominant colors
                imageObj.colors = this.extractDominantColors(img);
                
                // Add to images array
                this.images.push(imageObj);
                
                // Add to UI
                this.addImageToGallery(imageObj);
                
            } catch (error) {
                console.error('Error processing image:', error);
            }
        }
        
        // Hide loader after processing
        this.isProcessing = false;
        this.hideElement(this.processingLoader);
        
        // Show no results message if no images were added
        if (this.images.length === 0) {
            this.showElement(this.noResults);
        }
    }
    
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
        });
    }
    
    extractDominantColors(img) {
        // Create a canvas to sample colors
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale down for faster processing
        const scale = Math.min(1, 100 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Sample colors
        const colorMap = {};
        const colorNames = {
            red: { r: 230, g: 76, b: 76 },
            blue: { r: 52, g: 152, b: 219 },
            green: { r: 46, g: 204, b: 113 },
            yellow: { r: 241, g: 196, b: 15 },
            purple: { r: 155, g: 89, b: 182 },
            black: { r: 52, g: 73, b: 94 },
            white: { r: 236, g: 240, b: 241 }
        };
        
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            
            // Skip transparent pixels
            if (pixels[i + 3] < 128) continue;
            
            // Find closest named color
            let closestColor = null;
            let closestDistance = Infinity;
            
            for (const [name, color] of Object.entries(colorNames)) {
                const distance = Math.sqrt(
                    Math.pow(r - color.r, 2) +
                    Math.pow(g - color.g, 2) +
                    Math.pow(b - color.b, 2)
                );
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestColor = name;
                }
            }
            
            if (closestColor) {
                colorMap[closestColor] = (colorMap[closestColor] || 0) + 1;
            }
        }
        
        // Convert to array and sort
        const colors = Object.entries(colorMap).map(([name, count]) => ({
            name,
            count
        })).sort((a, b) => b.count - a.count);
        
        // Return top colors
        return colors.slice(0, 3).map(color => color.name);
    }
    
    addImageToGallery(imageObj) {
        // Create gallery item
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', this.images.indexOf(imageObj));
        
        // Create item content
        const content = `
            <img src="${imageObj.url}" alt="${imageObj.filename}" class="gallery-image">
            <div class="gallery-info">
                <h3 class="gallery-title">${imageObj.filename}</h3>
                <div class="gallery-tags">
                    <span class="gallery-tag">${imageObj.category}</span>
                    ${imageObj.predictions[0] ? `<span class="gallery-tag">${imageObj.predictions[0].className.split(',')[0]}</span>` : ''}
                </div>
                <div class="gallery-confidence">${imageObj.predictions[0] ? `${Math.round(imageObj.predictions[0].probability * 100)}% confidence` : ''}</div>
            </div>
        `;
        
        galleryItem.innerHTML = content;
        
        // Add click event
        galleryItem.addEventListener('click', () => {
            const index = parseInt(galleryItem.getAttribute('data-index'));
            this.openImageViewer(index);
        });
        
        // Add to gallery
        this.galleryGrid.appendChild(galleryItem);
        
        // Update filtered images
        this.filteredImages = [...this.images];
    }
    
    applyFilters() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const category = this.categoryFilter.value;
        const sortBy = this.sortFilter.value;
        const colorFilter = this.activeColorFilter ? this.activeColorFilter.getAttribute('data-color') : null;
        
        // Filter images
        this.filteredImages = this.images.filter(image => {
            // Search term filter
            const matchesSearch = searchTerm === '' || 
                image.filename.toLowerCase().includes(searchTerm) ||
                image.predictions.some(p => p.className.toLowerCase().includes(searchTerm)) ||
                image.objects.some(o => o.class.toLowerCase().includes(searchTerm));
            
            // Category filter
            const matchesCategory = category === 'all' || image.category === category;
            
            // Color filter
            const matchesColor = !colorFilter || image.colors.includes(colorFilter);
            
            return matchesSearch && matchesCategory && matchesColor;
        });
        
        // Sort images
        this.filteredImages.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return b.date - a.date;
                case 'oldest':
                    return a.date - b.date;
                case 'name':
                    return a.filename.localeCompare(b.filename);
                case 'confidence':
                    const confidenceA = a.predictions[0] ? a.predictions[0].probability : 0;
                    const confidenceB = b.predictions[0] ? b.predictions[0].probability : 0;
                    return confidenceB - confidenceA;
                default:
                    return 0;
            }
        });
        
        // Update UI
        this.updateGalleryUI();
    }
    
    resetFilters() {
        this.searchInput.value = '';
        this.categoryFilter.value = 'all';
        this.sortFilter.value = 'newest';
        
        if (this.activeColorFilter) {
            this.activeColorFilter.classList.remove('active');
            this.activeColorFilter = null;
        }
        
        this.filteredImages = [...this.images];
        this.updateGalleryUI();
    }
    
    updateGalleryUI() {
        // Clear gallery
        this.galleryGrid.innerHTML = '';
        
        // Show no results message if no images match filters
        if (this.filteredImages.length === 0) {
            this.showElement(this.noResults);
        } else {
            this.hideElement(this.noResults);
            
            // Add filtered images to gallery
            this.filteredImages.forEach(image => {
                const index = this.images.indexOf(image);
                
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.setAttribute('data-index', index);
                
                const content = `
                    <img src="${image.url}" alt="${image.filename}" class="gallery-image">
                    <div class="gallery-info">
                        <h3 class="gallery-title">${image.filename}</h3>
                        <div class="gallery-tags">
                            <span class="gallery-tag">${image.category}</span>
                            ${image.predictions[0] ? `<span class="gallery-tag">${image.predictions[0].className.split(',')[0]}</span>` : ''}
                        </div>
                        <div class="gallery-confidence">${image.predictions[0] ? `${Math.round(image.predictions[0].probability * 100)}% confidence` : ''}</div>
                    </div>
                `;
                
                galleryItem.innerHTML = content;
                
                galleryItem.addEventListener('click', () => {
                    this.openImageViewer(index);
                });
                
                this.galleryGrid.appendChild(galleryItem);
            });
        }
    }
    
    openImageViewer(index) {
        if (index < 0 || index >= this.images.length) return;
        
        this.currentImageIndex = index;
        const image = this.images[index];
        
        // Set image
        this.viewerImage.src = image.url;
        this.objectsImage.src = image.url;
        
        // Set details
        this.imageFilename.textContent = image.filename;
        
        // Format size
        const formattedSize = `${image.size.width} x ${image.size.height} px (${this.formatBytes(image.size.bytes)})`;
        this.imageSize.textContent = formattedSize;
        
        // Format date
        this.imageDate.textContent = image.date.toLocaleDateString();
        
        // Set predictions
        this.predictionsList.innerHTML = '';
        image.predictions.forEach(prediction => {
            const item = document.createElement('div');
            item.className = 'prediction-item';
            item.innerHTML = `
                <span class="prediction-label">${prediction.className}</span>
                <span class="prediction-confidence">${Math.round(prediction.probability * 100)}%</span>
            `;
            this.predictionsList.appendChild(item);
        });
        
        // Set detected objects
        this.detectedObjects.innerHTML = '';
        image.objects.forEach(object => {
            const item = document.createElement('div');
            item.className = 'object-item';
            item.innerHTML = `
                <span class="object-label">${object.class}</span>
                <span class="object-confidence">${Math.round(object.score * 100)}%</span>
            `;
            this.detectedObjects.appendChild(item);
        });
        
        // Draw bounding boxes on canvas
        this.drawObjectBoxes(image);
        
        // Show viewer
        this.imageViewer.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Reset to details tab
        this.activateTab('details');
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }
    
    closeImageViewer() {
        this.imageViewer.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    navigateImage(direction) {
        const newIndex = this.currentImageIndex + direction;
        
        if (newIndex >= 0 && newIndex < this.images.length) {
            this.openImageViewer(newIndex);
        }
    }
    
    updateNavigationButtons() {
        this.prevImage.disabled = this.currentImageIndex === 0;
        this.nextImage.disabled = this.currentImageIndex === this.images.length - 1;
    }
    
    activateTab(tabName) {
        // Remove active class from all tabs
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab
        document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    drawObjectBoxes(image) {
        const canvas = this.objectsCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match image
        this.loadImage(image.url).then(img => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw bounding boxes
            image.objects.forEach(object => {
                const [x, y, width, height] = object.bbox;
                
                // Draw rectangle
                ctx.strokeStyle = '#9c27b0';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);
                
                // Draw label background
                ctx.fillStyle = '#9c27b0';
                const label = `${object.class} ${Math.round(object.score * 100)}%`;
                const textWidth = ctx.measureText(label).width;
                ctx.fillRect(x, y - 20, textWidth + 10, 20);
                
                // Draw label text
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText(label, x + 5, y - 5);
            });
        });
    }
    
    showElement(element) {
        element.classList.add('active');
    }
    
    hideElement(element) {
        element.classList.remove('active');
    }
    
    formatBytes(bytes, decimals = 1) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
} 