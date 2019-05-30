var sampleSelect = d3.select('#sample-select');


// var metaFields =

function updateMeta(data) {
    var fields = Object.keys(data[0]);
    var listItems = d3.select('#sample-meta').selectAll('li')
        .data(fields);

    listItems.exit().remove();
    listItems.enter().append('li').merge(listItems)
        .text(d => d.toUpperCase() + ': ' + data[0][d])

}

function createPie(data) {
    var pieData = [{
        values: data['otu_values'],
        labels: data['otu_ids'],
        type: 'pie'
    }];

    Plotly.newPlot('pie', pieData, {responsive: true});
}


function updateCharts(sample) {
    // PULL METADATA
    // update meta list
    d3.json('/metadata/' + sample, data => {
        updateMeta(data);
    });
    // TODO - update the gauge

    // PULL SAMPLE DATA
    // update the pie chart
    d3.json('/samples/' + sample, data => {
        createPie(data);
    });
    // update the bubble chart
}

function init() {
    d3.json('/names', function (data) {
        sampleSelect.selectAll('option')
            .data(data).enter()
            .append('option')
            .text(name => name)
            .attr('value', name => name);
        sampleSelect.select('option').attr('selected', 'selected');

        var sample = d3.select('#sample-select').property('value');

        updateCharts(sample);

    });
}

init();

d3.select("#sample-select").on('change', function () {
    var sample = d3.select('#sample-select').property('value');

    updateCharts(sample);
});



