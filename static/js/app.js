var sampleSelect = d3.select('#sample-select');


// var metaFields =

function updateMeta(sample) {
    console.log(sample);
    d3.json('/metadata/' + sample, (data) => {
        console.log(data);
        var fields = Object.keys(data[0]);
        var listItems = d3.select('#sample-meta').selectAll('li')
            .data(fields);

        listItems.exit().remove();
        listItems.enter().append('li').merge(listItems)
            .text(d => d.toUpperCase() + ': ' + data[0][d])
    });

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

        updateMeta(sample);

    });


}

init();

d3.select("#sample-select").on('change', function () {
    var sample = d3.select('#sample-select').property('value');

    updateMeta(sample);
});



