
const API_KEY = ''; // api-ninjas.com API key
const API_URL = 'https://api.api-ninjas.com/v1/population'; // base URL for the population data API

// maps user-friendly labels to the value the API expects for the 'data' parameter
const DATA_OPTIONS = {
    'Population': 'population',
    'Median Age': 'median_age',
    'Density': 'density',
    'Migrants': 'migrants'
}

// the selection of countries that the user can choose from
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

// the types of charts that the user can choose from
const CHART_TYPES = [
    'Bar',
    'Line',
    'Radar'
];

/**
 * Widget class that represents an individual data visualisation widget on the dashboard
 * each widget allows the user to select a data type, country, and chart type
 * relevant data is fetched from the API and displayed using Chart.js
 * widgets can be added and removed dynamically, with the ability to have multiple widgets with different configurations appearing at one time
 */
class Widget {

    /**
     * initialises the widget, rendering the necessary DOM elements
     * @param {HTMLElement} container - the DOM element that this widget is to be rendered inside of
     */
    constructor(container) {
        this.container = container;
        this.apiData = null; // holds the data fetched from the API
        this.chart = null; // holds the current Chat.js instance


        this.render(); // renders the widget's DOM elements
        this.attachEventListeners(); // attaaches event listeners to the close button and dropdown controls
    }

    /**
     * renders the widget's DOM elements
     */
    render() {
        this.element = document.createElement('div'); // the main container element for this widget
        this.element.className = 'widget'; // set class for styling

        // the innerHTML structure of the widget
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
        this.dataSelect = this.element.querySelector('.data-select select'); // dropdown for selecting data type (population, median age, etc.)
        this.countrySelect = this.element.querySelector('.country-select select'); // dropdown for selecting country
        this.chartSelect = this.element.querySelector('.chart-select select'); // dropdown for selecting chart type (bar, line, radar)

        this.container.appendChild(this.element); // adds widget to dashboard
    }

    /**
     * attaches event listeners to the widget's controls
     */
    attachEventListeners() {
        this.dataSelect.addEventListener('change', () => this.fetchData());
        this.countrySelect.addEventListener('change', () => this.fetchData());

        this.chartSelect.addEventListener('change', () => { if (this.apiData) this.renderChart(); });

        this.element.querySelector('.widget-close-btn').addEventListener('click', () => { this.element.remove(); }); // removes current widget when close button is clicked
    }

    /**
     * fetches data from the API based on current data type and country selection
     * @returns {Promise<void>}
     */
    async fetchData() {
        this.country = this.countrySelect.value;
        this.dataLabel = this.dataSelect.value;
        const COUNTRY = this.country;
        const dataLabel = this.dataLabel;

        this.titleElement.textContent = `${dataLabel || 'Data'} - ${COUNTRY || 'Country'}`; // updates title to reflect current selections

        if (!COUNTRY || !dataLabel) return; // if either country or data type has not been selected, do not attempt to fetch data

        // fetch data from API
        try {
            const response = await fetch(
                `${API_URL}?country=${encodeURIComponent(COUNTRY)}`,
                { headers:
                    { 'X-Api-Key': API_KEY }
                }
            )

            if (!response.ok) { throw new Error(`API error: ${response.status}`); }

            const data = await response.json(); // parse response to JSON object

            // saves return data to variables
            const historical = data.historical_population;
            const forecast = data.population_forecast;
            
            this.apiData = [...historical, ...forecast];

            this.renderChart(); // renders chart with new data
        } catch (error) {
            console.error('Error fetching data:', error);
            return;
        }
    }

    /**
     * renders the chart using Chart.js based on the current API data and selected chart type
     */
    renderChart() {
        if (this.chart) { this.chart.destroy(); } // destroys previous chart instance

        const chartType = this.chartSelect.value.toLowerCase() || 'bar'; // currently selected chart type
        const key = DATA_OPTIONS[this.dataLabel]; // key value based on API expectatino

        const data = [...this.apiData].sort((a, b) => a.year - b.year); // sorts data by year in ascending order

        // creates new Chart.js instance
        this.chart = new Chart(this.chartElement, {
            type: chartType,
            data: {
                labels: data.map(entry => entry.year),
                datasets: [
                    {
                        label: this.dataLabel,
                        data: data.map(entry => entry[key]),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        fill: chartType === 'line' ? false : true,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...(chartType === 'radar' ? {
                    scales: {
                        r: {
                            ticks: {
                                backdropColor: 'transparent',
                                color: 'oklch(0.9212 0.0093 264.06/0.8)'
                            },
                            pointLabels: {
                                color: 'oklch(0.9212 0.0093 264.06/0.7)'
                            },
                            angleLines: {
                                color: 'oklch(0.9212 0.0093 264.06/0.7)'
                            },
                            grid: {
                                color: 'oklch(0.9212 0.0093 264.06/0.7)'
                            }
                        }
                    }
                } : {
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Year',
                                color: 'oklch(0.9212 0.0093 264.06/0.7)'
                            },
                            ticks: {
                                color: 'oklch(0.9212 0.0093 264.06/0.8)'
                            },
                            grid: {
                                color: 'oklch(0.9212 0.0093 264.06/0.2)'
                            },
                            border: {
                                color: 'oklch(0.9212 0.0093 264.06/0.1)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: this.dataLabel,
                                color: 'oklch(0.9212 0.0093 264.06/0.7)'
                            },
                            ticks: {
                                color: 'oklch(0.9212 0.0093 264.06/0.8)'
                            },
                            grid: {
                                color: 'oklch(0.9212 0.0093 264.06/0.2)'
                            },
                            border: {
                                color: 'oklch(0.9212 0.0093 264.06/0.1)'
                            }
                        }
                    }
                })
            }
        });
    }
}