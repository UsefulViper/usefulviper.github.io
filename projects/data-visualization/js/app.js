// Data Visualization Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    const app = new DashboardApp();
    app.init();
});

class DashboardApp {
    constructor() {
        // Elements
        this.themeSwitch = document.getElementById('theme-switch');
        this.datasetSelect = document.getElementById('dataset-select');
        this.viewSelect = document.getElementById('view-select');
        this.timeRange = document.getElementById('time-range');
        this.timeValue = document.getElementById('time-value');
        this.downloadBtn = document.getElementById('download-btn');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.infoBtn = document.getElementById('info-btn');
        this.searchInput = document.getElementById('search-input');
        this.filterBtn = document.getElementById('filter-btn');
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.pageInfo = document.getElementById('page-info');
        this.tableBody = document.getElementById('table-body');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Charts
        this.primaryChart = null;
        this.categoryChart = null;
        this.regionalChart = null;
        
        // Data
        this.currentDataset = 'sales';
        this.currentView = 'bar';
        this.timeRangeValue = 100;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredData = [];
        this.sortColumn = 'revenue';
        this.sortDirection = 'desc';
        
        // Data sources
        this.datasets = {
            sales: this.generateSalesData(),
            population: this.generatePopulationData(),
            climate: this.generateClimateData()
        };
        
        // Color schemes
        this.colorSchemes = {
            light: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0'],
            dark: ['#4cc9f0', '#4361ee', '#7209b7', '#f72585', '#ff9e00']
        };
    }
    
    init() {
        // Initialize event listeners
        this.initEventListeners();
        
        // Initialize theme
        this.initTheme();
        
        // Initialize charts
        this.initCharts();
        
        // Initialize table
        this.initTable();
        
        // Hide loading overlay
        this.loadingOverlay.style.display = 'none';
    }
    
    initEventListeners() {
        // Theme toggle
        this.themeSwitch.addEventListener('change', () => {
            this.toggleTheme();
        });
        
        // Dataset change
        this.datasetSelect.addEventListener('change', () => {
            this.currentDataset = this.datasetSelect.value;
            this.showLoading();
            setTimeout(() => {
                this.updateCharts();
                this.updateTable();
                this.hideLoading();
            }, 500);
        });
        
        // View change
        this.viewSelect.addEventListener('change', () => {
            this.currentView = this.viewSelect.value;
            this.showLoading();
            setTimeout(() => {
                this.updateCharts();
                this.hideLoading();
            }, 500);
        });
        
        // Time range change
        this.timeRange.addEventListener('input', () => {
            this.timeRangeValue = parseInt(this.timeRange.value);
            this.updateTimeRangeLabel();
            this.updateCharts();
        });
        
        // Download button
        this.downloadBtn.addEventListener('click', () => {
            this.downloadData();
        });
        
        // Refresh button
        this.refreshBtn.addEventListener('click', () => {
            this.refreshData();
        });
        
        // Fullscreen button
        this.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Info button
        this.infoBtn.addEventListener('click', () => {
            this.showChartInfo();
        });
        
        // Search input
        this.searchInput.addEventListener('input', () => {
            this.filterTable();
        });
        
        // Filter button
        this.filterBtn.addEventListener('click', () => {
            this.showFilterDialog();
        });
        
        // Pagination
        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateTable();
            }
        });
        
        this.nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.updateTable();
            }
        });
        
        // Table header sorting
        document.querySelectorAll('th').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.textContent.trim().toLowerCase().split(' ')[0];
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                this.updateTable();
            });
        });
        
        // Window resize event for responsive charts
        window.addEventListener('resize', () => {
            if (this.primaryChart) this.primaryChart.resize();
            if (this.categoryChart) this.categoryChart.resize();
            if (this.regionalChart) this.regionalChart.resize();
        });
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
        
        // Update charts with new theme colors
        this.updateCharts();
    }
    
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }
    
    initCharts() {
        this.createPrimaryChart();
        this.createCategoryChart();
        this.createRegionalChart();
        this.updateMetrics();
    }
    
    updateCharts() {
        this.updatePrimaryChart();
        this.updateCategoryChart();
        this.updateRegionalChart();
        this.updateMetrics();
    }
    
    createPrimaryChart() {
        const container = document.getElementById('primary-chart');
        const dataset = this.datasets[this.currentDataset];
        const filteredData = this.getFilteredDataByTimeRange(dataset);
        
        // Set chart title based on dataset and view
        document.getElementById('primary-chart-title').textContent = 
            this.getChartTitle(this.currentDataset, this.currentView);
        
        // Create D3.js chart based on current view
        this.primaryChart = new D3Chart(
            container, 
            filteredData, 
            this.currentView, 
            this.getColorScheme(),
            this.getChartConfig()
        );
    }
    
    updatePrimaryChart() {
        const dataset = this.datasets[this.currentDataset];
        const filteredData = this.getFilteredDataByTimeRange(dataset);
        
        // Update chart title
        document.getElementById('primary-chart-title').textContent = 
            this.getChartTitle(this.currentDataset, this.currentView);
        
        // Update chart
        if (this.primaryChart) {
            this.primaryChart.updateData(
                filteredData, 
                this.currentView,
                this.getColorScheme(),
                this.getChartConfig()
            );
        }
    }
    
    createCategoryChart() {
        const container = document.getElementById('category-chart');
        const dataset = this.datasets[this.currentDataset];
        const categoryData = this.getCategoryData(dataset);
        
        this.categoryChart = new D3Chart(
            container, 
            categoryData, 
            'pie', 
            this.getColorScheme(),
            this.getChartConfig()
        );
    }
    
    updateCategoryChart() {
        const dataset = this.datasets[this.currentDataset];
        const categoryData = this.getCategoryData(dataset);
        
        if (this.categoryChart) {
            this.categoryChart.updateData(
                categoryData, 
                'pie',
                this.getColorScheme(),
                this.getChartConfig()
            );
        }
    }
    
    createRegionalChart() {
        const container = document.getElementById('regional-chart');
        const dataset = this.datasets[this.currentDataset];
        const regionalData = this.getRegionalData(dataset);
        
        this.regionalChart = new D3Chart(
            container, 
            regionalData, 
            'bar', 
            this.getColorScheme(),
            this.getChartConfig()
        );
    }
    
    updateRegionalChart() {
        const dataset = this.datasets[this.currentDataset];
        const regionalData = this.getRegionalData(dataset);
        
        if (this.regionalChart) {
            this.regionalChart.updateData(
                regionalData, 
                'bar',
                this.getColorScheme(),
                this.getChartConfig()
            );
        }
    }
    
    updateMetrics() {
        const dataset = this.datasets[this.currentDataset];
        const totalRevenue = dataset.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = dataset.reduce((sum, item) => sum + item.orders, 0);
        const totalCustomers = new Set(dataset.map(item => item.customerId)).size;
        const conversionRate = (totalOrders / (totalCustomers * 5)) * 100; // Just a simplified formula
        
        // Format numbers with commas
        document.getElementById('total-revenue').textContent = this.formatNumber(totalRevenue);
        document.getElementById('total-orders').textContent = this.formatNumber(totalOrders);
        document.getElementById('total-customers').textContent = this.formatNumber(totalCustomers);
        document.getElementById('conversion-rate').textContent = conversionRate.toFixed(1);
    }
    
    initTable() {
        this.filteredData = [...this.datasets[this.currentDataset]];
        this.sortData();
        this.updateTable();
    }
    
    updateTable() {
        // Clear table
        this.tableBody.innerHTML = '';
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = this.filteredData.slice(startIndex, endIndex);
        
        // Update table rows
        paginatedData.forEach(item => {
            const row = document.createElement('tr');
            
            // ID cell
            const idCell = document.createElement('td');
            idCell.textContent = item.id;
            row.appendChild(idCell);
            
            // Date cell
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(item.date).toLocaleDateString();
            row.appendChild(dateCell);
            
            // Category cell
            const categoryCell = document.createElement('td');
            categoryCell.textContent = item.category;
            row.appendChild(categoryCell);
            
            // Region cell
            const regionCell = document.createElement('td');
            regionCell.textContent = item.region;
            row.appendChild(regionCell);
            
            // Revenue cell
            const revenueCell = document.createElement('td');
            revenueCell.textContent = `$${this.formatNumber(item.revenue)}`;
            row.appendChild(revenueCell);
            
            // Orders cell
            const ordersCell = document.createElement('td');
            ordersCell.textContent = item.orders;
            row.appendChild(ordersCell);
            
            // Status cell
            const statusCell = document.createElement('td');
            const statusSpan = document.createElement('span');
            statusSpan.textContent = item.status;
            statusSpan.className = `status status-${item.status.toLowerCase()}`;
            statusCell.appendChild(statusSpan);
            row.appendChild(statusCell);
            
            this.tableBody.appendChild(row);
        });
        
        // Update pagination info
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        this.pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        
        // Update pagination buttons state
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === totalPages;
    }
    
    filterTable() {
        const searchTerm = this.searchInput.value.toLowerCase();
        
        if (searchTerm === '') {
            this.filteredData = [...this.datasets[this.currentDataset]];
        } else {
            this.filteredData = this.datasets[this.currentDataset].filter(item => {
                return (
                    item.id.toString().includes(searchTerm) ||
                    item.category.toLowerCase().includes(searchTerm) ||
                    item.region.toLowerCase().includes(searchTerm) ||
                    item.status.toLowerCase().includes(searchTerm)
                );
            });
        }
        
        this.currentPage = 1;
        this.sortData();
        this.updateTable();
    }
    
    sortData() {
        this.filteredData.sort((a, b) => {
            let valueA = a[this.sortColumn];
            let valueB = b[this.sortColumn];
            
            // Handle string values
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();
            
            // Compare values
            if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    showFilterDialog() {
        // In a real app, this would show a modal dialog with filter options
        alert('Filter functionality would be implemented here in a real application.');
    }
    
    toggleFullscreen() {
        const chartContainer = document.querySelector('.chart-container.primary');
        
        if (!document.fullscreenElement) {
            chartContainer.requestFullscreen().catch(err => {
                alert(`Error attempting to enable fullscreen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    showChartInfo() {
        // In a real app, this would show information about the chart
        alert('Chart information would be displayed here in a real application.');
    }
    
    downloadData() {
        const dataStr = JSON.stringify(this.datasets[this.currentDataset], null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${this.currentDataset}-data.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        linkElement.remove();
    }
    
    refreshData() {
        this.showLoading();
        
        // Simulate data refresh
        setTimeout(() => {
            // Regenerate data
            this.datasets = {
                sales: this.generateSalesData(),
                population: this.generatePopulationData(),
                climate: this.generateClimateData()
            };
            
            // Update UI
            this.updateCharts();
            this.initTable();
            this.hideLoading();
        }, 1000);
    }
    
    getFilteredDataByTimeRange(data) {
        if (this.timeRangeValue === 100) return data;
        
        // Sort data by date
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Calculate how many items to include based on time range
        const itemCount = Math.ceil((sortedData.length * this.timeRangeValue) / 100);
        
        // Return the most recent items
        return sortedData.slice(-itemCount);
    }
    
    updateTimeRangeLabel() {
        if (this.timeRangeValue === 100) {
            this.timeValue.textContent = 'All Time';
        } else {
            this.timeValue.textContent = `Last ${this.timeRangeValue}%`;
        }
    }
    
    getChartTitle(dataset, view) {
        const datasetNames = {
            'sales': 'Sales Performance',
            'population': 'Population Growth',
            'climate': 'Climate Change Data'
        };
        
        const viewNames = {
            'bar': 'Bar Chart',
            'line': 'Trend Line',
            'pie': 'Distribution',
            'scatter': 'Correlation'
        };
        
        return `${datasetNames[dataset]} - ${viewNames[view]}`;
    }
    
    getColorScheme() {
        const theme = this.getCurrentTheme();
        return this.colorSchemes[theme];
    }
    
    getChartConfig() {
        return {
            margin: { top: 20, right: 20, bottom: 40, left: 60 },
            animationDuration: 750,
            theme: this.getCurrentTheme()
        };
    }
    
    getCategoryData(data) {
        // Group data by category and calculate total revenue
        const categoryMap = new Map();
        
        data.forEach(item => {
            if (categoryMap.has(item.category)) {
                categoryMap.set(item.category, categoryMap.get(item.category) + item.revenue);
            } else {
                categoryMap.set(item.category, item.revenue);
            }
        });
        
        // Convert to array of objects
        return Array.from(categoryMap, ([category, revenue]) => ({ 
            category, 
            revenue 
        }));
    }
    
    getRegionalData(data) {
        // Group data by region and calculate total revenue
        const regionMap = new Map();
        
        data.forEach(item => {
            if (regionMap.has(item.region)) {
                regionMap.set(item.region, regionMap.get(item.region) + item.revenue);
            } else {
                regionMap.set(item.region, item.revenue);
            }
        });
        
        // Convert to array of objects
        return Array.from(regionMap, ([region, revenue]) => ({ 
            region, 
            revenue 
        }));
    }
    
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }
    
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }
    
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Data generation methods
    generateSalesData() {
        const categories = ['Electronics', 'Clothing', 'Home Goods', 'Books', 'Food'];
        const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa'];
        const statuses = ['Completed', 'Pending', 'Cancelled'];
        
        const data = [];
        
        for (let i = 1; i <= 100; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            
            data.push({
                id: i,
                date: date.toISOString(),
                category: categories[Math.floor(Math.random() * categories.length)],
                region: regions[Math.floor(Math.random() * regions.length)],
                revenue: Math.floor(Math.random() * 10000) + 1000,
                orders: Math.floor(Math.random() * 100) + 10,
                customerId: Math.floor(Math.random() * 1000) + 1,
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        
        return data;
    }
    
    generatePopulationData() {
        const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa'];
        const categories = ['Urban', 'Suburban', 'Rural'];
        const statuses = ['Growing', 'Stable', 'Declining'];
        
        const data = [];
        
        for (let i = 1; i <= 100; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            
            data.push({
                id: i,
                date: date.toISOString(),
                category: categories[Math.floor(Math.random() * categories.length)],
                region: regions[Math.floor(Math.random() * regions.length)],
                revenue: Math.floor(Math.random() * 1000000) + 100000, // Population count
                orders: Math.floor(Math.random() * 1000) + 100, // Growth rate * 100
                customerId: Math.floor(Math.random() * 1000) + 1, // Just for data structure consistency
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        
        return data;
    }
    
    generateClimateData() {
        const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa'];
        const categories = ['Temperature', 'Precipitation', 'CO2 Levels', 'Sea Level'];
        const statuses = ['Increasing', 'Stable', 'Decreasing'];
        
        const data = [];
        
        for (let i = 1; i <= 100; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            
            data.push({
                id: i,
                date: date.toISOString(),
                category: categories[Math.floor(Math.random() * categories.length)],
                region: regions[Math.floor(Math.random() * regions.length)],
                revenue: Math.floor(Math.random() * 100) + 10, // Climate measurement
                orders: Math.floor(Math.random() * 100) - 50, // Change rate
                customerId: Math.floor(Math.random() * 1000) + 1, // Just for data structure consistency
                status: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        
        return data;
    }
}

// D3 Chart Class
class D3Chart {
    constructor(container, data, type, colorScheme, config) {
        this.container = container;
        this.data = data;
        this.type = type;
        this.colorScheme = colorScheme;
        this.config = config;
        
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        this.initChart();
        this.draw();
    }
    
    initChart() {
        // Remove existing SVG if any
        d3.select(this.container).selectAll('svg').remove();
        
        // Create SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
            
        // Create chart group with margin
        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.config.margin.left},${this.config.margin.top})`);
            
        // Calculate inner dimensions
        this.innerWidth = this.width - this.config.margin.left - this.config.margin.right;
        this.innerHeight = this.height - this.config.margin.top - this.config.margin.bottom;
    }
    
    draw() {
        switch (this.type) {
            case 'bar':
                this.drawBarChart();
                break;
            case 'line':
                this.drawLineChart();
                break;
            case 'pie':
                this.drawPieChart();
                break;
            case 'scatter':
                this.drawScatterChart();
                break;
            default:
                this.drawBarChart();
        }
    }
    
    updateData(newData, newType, newColorScheme, newConfig) {
        this.data = newData;
        this.type = newType;
        this.colorScheme = newColorScheme;
        this.config = newConfig;
        
        this.initChart();
        this.draw();
    }
    
    resize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        this.initChart();
        this.draw();
    }
    
    drawBarChart() {
        // Create scales
        const x = d3.scaleBand()
            .domain(this.data.map(d => d.category || d.region || d.id))
            .range([0, this.innerWidth])
            .padding(0.2);
            
        const y = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.revenue || d.orders || 0) * 1.1])
            .range([this.innerHeight, 0]);
            
        // Create axes
        const xAxis = d3.axisBottom(x)
            .tickSize(0);
            
        const yAxis = d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d => `$${d3.format(",.0f")(d)}`);
            
        // Add axes
        this.chart.append('g')
            .attr('transform', `translate(0,${this.innerHeight})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');
            
        this.chart.append('g')
            .call(yAxis);
            
        // Add bars
        this.chart.selectAll('.bar')
            .data(this.data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.category || d.region || d.id))
            .attr('width', x.bandwidth())
            .attr('y', this.innerHeight)
            .attr('height', 0)
            .attr('fill', (d, i) => this.colorScheme[i % this.colorScheme.length])
            .transition()
            .duration(this.config.animationDuration)
            .attr('y', d => y(d.revenue || d.orders || 0))
            .attr('height', d => this.innerHeight - y(d.revenue || d.orders || 0));
    }
    
    drawLineChart() {
        // Sort data by date
        const sortedData = [...this.data].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Create scales
        const x = d3.scaleTime()
            .domain(d3.extent(sortedData, d => new Date(d.date)))
            .range([0, this.innerWidth]);
            
        const y = d3.scaleLinear()
            .domain([0, d3.max(sortedData, d => d.revenue || d.orders || 0) * 1.1])
            .range([this.innerHeight, 0]);
            
        // Create axes
        const xAxis = d3.axisBottom(x)
            .ticks(5);
            
        const yAxis = d3.axisLeft(y)
            .ticks(5)
            .tickFormat(d => `$${d3.format(",.0f")(d)}`);
            
        // Add axes
        this.chart.append('g')
            .attr('transform', `translate(0,${this.innerHeight})`)
            .call(xAxis);
            
        this.chart.append('g')
            .call(yAxis);
            
        // Create line generator
        const line = d3.line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.revenue || d.orders || 0))
            .curve(d3.curveMonotoneX);
            
        // Add line path
        const path = this.chart.append('path')
            .datum(sortedData)
            .attr('fill', 'none')
            .attr('stroke', this.colorScheme[0])
            .attr('stroke-width', 2)
            .attr('d', line);
            
        // Animate line
        const pathLength = path.node().getTotalLength();
        path.attr('stroke-dasharray', pathLength + ' ' + pathLength)
            .attr('stroke-dashoffset', pathLength)
            .transition()
            .duration(this.config.animationDuration)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);
            
        // Add dots
        this.chart.selectAll('.dot')
            .data(sortedData)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(new Date(d.date)))
            .attr('cy', d => y(d.revenue || d.orders || 0))
            .attr('r', 0)
            .attr('fill', this.colorScheme[0])
            .transition()
            .delay((d, i) => i * (this.config.animationDuration / sortedData.length))
            .duration(this.config.animationDuration / 2)
            .attr('r', 4);
    }
    
    drawPieChart() {
        // Calculate radius
        const radius = Math.min(this.innerWidth, this.innerHeight) / 2;
        
        // Move origin to center
        this.chart.attr('transform', `translate(${this.width / 2},${this.height / 2})`);
        
        // Create color scale
        const color = d3.scaleOrdinal()
            .domain(this.data.map(d => d.category || d.region || d.id))
            .range(this.colorScheme);
            
        // Create pie layout
        const pie = d3.pie()
            .value(d => d.revenue || d.orders || 0)
            .sort(null);
            
        // Create arc generator
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);
            
        // Create arcs
        const arcs = this.chart.selectAll('.arc')
            .data(pie(this.data))
            .enter()
            .append('g')
            .attr('class', 'arc');
            
        // Add paths
        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.category || d.data.region || d.data.id))
            .attr('opacity', 0.8)
            .attr('stroke', 'white')
            .style('stroke-width', 2)
            .on('mouseover', function() {
                d3.select(this).attr('opacity', 1);
            })
            .on('mouseout', function() {
                d3.select(this).attr('opacity', 0.8);
            })
            .transition()
            .duration(this.config.animationDuration)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });
            
        // Add labels
        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', this.config.theme === 'dark' ? '#fff' : '#333')
            .text(d => {
                const value = d.data.revenue || d.data.orders || 0;
                return value > 0.05 * d3.sum(this.data, d => d.revenue || d.orders || 0) 
                    ? d.data.category || d.data.region || d.data.id 
                    : '';
            })
            .style('opacity', 0)
            .transition()
            .delay(this.config.animationDuration)
            .duration(this.config.animationDuration / 2)
            .style('opacity', 1);
    }
    
    drawScatterChart() {
        // Create scales
        const x = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.revenue || 0) * 1.1])
            .range([0, this.innerWidth]);
            
        const y = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.orders || 0) * 1.1])
            .range([this.innerHeight, 0]);
            
        // Create axes
        const xAxis = d3.axisBottom(x)
            .ticks(5)
            .tickFormat(d => `$${d3.format(",.0f")(d)}`);
            
        const yAxis = d3.axisLeft(y)
            .ticks(5);
            
        // Add axes
        this.chart.append('g')
            .attr('transform', `translate(0,${this.innerHeight})`)
            .call(xAxis);
            
        this.chart.append('g')
            .call(yAxis);
            
        // Add dots
        this.chart.selectAll('.dot')
            .data(this.data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.revenue || 0))
            .attr('cy', d => y(d.orders || 0))
            .attr('r', 0)
            .attr('fill', (d, i) => this.colorScheme[i % this.colorScheme.length])
            .attr('opacity', 0.7)
            .on('mouseover', function() {
                d3.select(this)
                    .attr('opacity', 1)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 2);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('opacity', 0.7)
                    .attr('stroke', 'none');
            })
            .transition()
            .duration(this.config.animationDuration)
            .attr('r', d => Math.sqrt((d.revenue || 0) / 1000) + 3);
    }
} 