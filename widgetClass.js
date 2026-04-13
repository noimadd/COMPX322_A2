
const API_KEY = 'null';
const API_URL = 'https://api.api-ninjas.com/v1/population';

const DATA_OPTIONS = {
    'Population': 'population',
    'Median Age': 'median_age',
    'Density': 'density',
    'Migrants': 'migrants'
}

const COUNTRIES = [
    'New Zealand',
    'United Kingdom',
    'Japan',
    'United States',
    'China',
    'India',
    'Germany',
    'Brazil',
    'Australia',
    'South Korea'
];

const CHART_TYPES = [
    'Bar',
    'Line',
    'Radar'
];

class Widget {

    constructor(container) {
        this.container = container;
        this.apiData = null;
        this.chart = null;


        this.render();
        this.attachEventListeners();
    }

    render() {
        this.element = document.createElement('div');
        this.element.className = 'widget';


        this.element.innerHTML = `
            <div class="widget-header">
                <h3 class="widget-title">No Data Selected</h3>
                <button class="widget-close-btn" aria-label="close widget">
                    ✕
                </button>
            </div>
            <div class="widget-controls">
                <div class="data-select widget-control">
                    <label class="control-label" for="data-select">DATA</label>
                    <select name="data-select">
                        <option value="" disabled selected>Select Data</option>
                        ${Object.keys(DATA_OPTIONS).map(label => `<option value="${label}">${label}</option>`).join('')}
                    </select>
                </div>
                <div class="country-select widget-control">
                    <label class="control-label" for="country-select">COUNTRY</label>
                    <select name="country-select">
                        <option value="" disabled selected>Select Country</option>
                        ${COUNTRIES.map(country => `<option value="${country}">${country}</option>`).join('')}
                    </select>
                </div>
                <div class="chart-select widget-control">
                    <label class="control-label" for="chart-select">CHART TYPE</label>
                    <select name="chart-select">
                        ${CHART_TYPES.map(t =>
                            `<option value="${t}">${t}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="widget-content">
                <canvas class="widget-chart" aria-label="population data chart"></canvas>
            </div>
        `;

        this.titleElement = this.element.querySelector('.widget-title');
        this.chartElement = this.element.querySelector('.widget-chart');
        this.dataSelect = this.element.querySelector('.data-select');
        this.countrySelect = this.element.querySelector('.country-select');
        this.chartSelect = this.element.querySelector('.chart-select');

        this.container.appendChild(this.element);
    }

}