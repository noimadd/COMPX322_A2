
const API_KEY = '';
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
        this.dataSelect = this.element.querySelector('.data-select select');
        this.countrySelect = this.element.querySelector('.country-select select');
        this.chartSelect = this.element.querySelector('.chart-select select');

        this.container.appendChild(this.element);
    }

    attachEventListeners() {
        this.dataSelect.addEventListener('change', () => this.fetchData());
        this.countrySelect.addEventListener('change', () => this.fetchData());

        this.chartSelect.addEventListener('change', () => { if (this.apiData) this.updateChart(); });

        this.element.querySelector('.widget-close-btn').addEventListener('click', () => {
            this.element.remove();
        });
    }

    async fetchData() {
        const COUNTRY = this.countrySelect.value;
        const dataLabel = this.dataSelect.value;

        console.log(`Fetching data for ${COUNTRY} - ${dataLabel}`);

        if (!COUNTRY || !dataLabel) return;

        try {
            const response = await fetch(
                `${API_URL}?country=${encodeURIComponent(COUNTRY)}`,
                { headers:
                    { 'X-Api-Key': API_KEY }
                }
            )

            if (!response.ok) { throw new Error(`API error: ${response.status}`); }

            const data = await response.json();

            const historical = data.historical_population;
            const forecast = data.population_forecast;

            this.apiData = {
                historical: historical.map(entry => ({ year: entry.year, value: entry[DATA_OPTIONS[dataLabel]] })),
                forecast: forecast.map(entry => ({ year: entry.year, value: entry[DATA_OPTIONS[dataLabel]] }))
            };

            console.log(this.apiData);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data. Please check the console for details.');
            return;
        }
    }
}