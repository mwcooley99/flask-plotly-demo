var sampleSelect = d3.select('#sample-select');

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

function createBubble(data) {
    var desired_maximum_marker_size = 15;
    var size = data['otu_values'];
    var bubbleData = [{
        x: data['otu_ids'],
        y: data['otu_values'],
        text: data['otu_labels'],
        mode: 'markers',
        marker: {
            size: size,
            color: data['otu_ids'].map(d => 'hsl(' + (d % 360) + ', 100, 40)'),
            sizeref: 2.0 * Math.max(...size) / (desired_maximum_marker_size ** 2)
        }
    }];
    console.log("Here");
    console.log(bubbleData[0]['marker']['color']);

    var layout = {
        title: 'Belly Button Bacteria',
        margin: {
            r: 20
        },
        width: 800,
        automargin: true,
        xaxis: {
            title: 'Bacteria ID'
        },
        yaxis: {
            title: 'Amount of Bacteria'
        }
    };

    Plotly.newPlot('bubble', bubbleData, layout, {responsive: true});

}

function createGauge(data) {
    // Enter a speed between 0 and 180
    console.log(data);
    var normalized_num = Math.floor(data['wfreq']/2) * 2;
    console.log(normalized_num);
    var level = 18 + 18 * (normalized_num);
    console.log("level: " + level);

// Trig to calc meter point
    var degrees = 180 - level,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX, space, pathY, pathEnd);
    console.log(path);

    var gaugeData = [{
        type: 'scatter',
        x: [0], y: [0],
        marker: {size: 28, color: '850000'},
        showlegend: false,
        name: 'speed',
        text: level,
        hoverinfo: 'text+name'
    },
        {
            values: [60 / 5, 60 / 5, 60 / 5, 60 / 5, 60 / 5, 60],
            rotation: 90,
            text: ['8-9', '6-7', '4-5', '2-3',
                '0-1', ''],
            textinfo: 'text',
            textposition: 'inside',
            marker: {
                colors: ['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                    'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                    'rgba(210, 206, 145, .5)',
                    'rgba(255, 255, 255, 0)']
            },
            labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
            hoverinfo: 'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        }];

    var layout = {
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],
        title: '<b>Belly Button Washing Frequency</b><br> Per Week',

        xaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        },
        yaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        }
    };

    Plotly.newPlot('gauge', gaugeData, layout, {responsive: true});
}


function updateCharts(sample) {
    // PULL METADATA

    d3.json('/metadata/' + sample, data => {
        // update meta list
        updateMeta(data);
        createGauge(data[0]);
    });


    // PULL SAMPLE DATA
    d3.json('/samples/' + sample, data => {
        // update the pie chart
        createPie(data);
        //update the bubble chart
        createBubble(data);
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

        updateCharts(sample);

    });
}

init();

d3.select("#sample-select").on('change', function () {
    var sample = d3.select('#sample-select').property('value');

    updateCharts(sample);
});



