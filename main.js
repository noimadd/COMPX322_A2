document.addEventListener('DOMContentLoaded', () => {

    const dashboard = document.getElementById('dashboard');
    const addWidgetBtn = document.getElementById('add-widget-btn');

    addWidgetBtn.addEventListener('click', () => {
        const widget = new Widget(dashboard);
    });

});