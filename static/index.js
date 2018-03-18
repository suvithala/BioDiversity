
function loaddropdown() {
    /* data route */
	Plotly.d3.json("/names", function (error, response) {

 		if (error) return console.warn(error);
		
 		var select = document.getElementById("selDataset");

 		for (var i = 0; i < response.length; i++) {
 			var option = document.createElement("OPTION"),
 				txt = document.createTextNode(response[i]);
 				option.appendChild(txt)
 				option.setAttribute("value",response[i]);
 				select.insertBefore(option,select.firstChild);
 		}
 	optionChanged(response[0]);
 	});
 }


function optionChanged(slectedsample) {
	var sampleId = slectedsample.slice(3);
	Plotly.d3.json(`/metadata/${sampleId}`, function (error, response) {
		if (error) return console.warn(error);
		var samplediv = document.querySelector("#sampleMetadata");
		samplediv.innerHTML = " ";
		for(var i in response) { 
    		var newdiv = document.createElement('p');
			newdiv.innerHTML = [i] + ": " + response[i];
			samplediv.appendChild(newdiv)
	 };
	});
	piePlot(slectedsample);
	scatterPlot(slectedsample);
	gaugePlot(slectedsample);
}



function piePlot(slectedsample){
    var description =[];
    Plotly.d3.json("/otu", function (error, response) {
        descriptions = response;
    })


    Plotly.d3.json(`/samples/${slectedsample}`, function (error, sresponse) {
		if (error) return console.warn(error);

        var plabels=[];
        var pvalues=[];
        var pdescription=[];
        for(var i=0;i<10;i++){
            plabels.push(sresponse[0].otu_ids[i]);
            pvalues.push(sresponse[0].sample_values[i]);
            pdescription.push(descriptions[sresponse[0].otu_ids[i]]);
            
            }

       var piedata = [{
				values: pvalues,
				labels: plabels,
				hovertext: pdescription,
				type: 'pie',

			}];
			
			var pieLayout = {
				height: 600,
				width: 600,
				backgroundcolor: "lightgrey",
	 			showbackground: true,
			};
			
			Plotly.newPlot("pie", piedata, pieLayout);
    })
}

function scatterPlot(slectedsample){
	Plotly.d3.json("/otu", function (error, response) {
    	descriptions = response;
    })

    Plotly.d3.json(`/samples/${slectedsample}`, function (error, response) {
		if (error) return console.warn(error);
			const xAxis = [];
			const yAxis = [];
			const radii = [];
			const colors = [];
			var sdescription=[];
			for(var i=0;i<10;i++){
            	sdescription.push(descriptions[response[0].otu_ids[i]]);
            	xAxis.push(response[0].otu_ids[i]);
           		yAxis.push(response[0].sample_values[i]);
   				radii.push(response[0].sample_values[i]);
  				colors.push(response[0].otu_ids[i]);
		
            }
           	
           	const bubbledata = [{
				x: xAxis,
				y: yAxis,
				hovertext: sdescription,
				mode: "markers",
				marker: {
					size: radii,
				    color: colors,
				    colorscale: 'Rainbow'

				  }
				}];

			const layout = {
				title: "Bubble Chart",
				showlegend: false,
				height: 800,
				width: 1500
			};
			Plotly.newPlot("scatter", bubbledata, layout);
	});

};
	
// wash freq
function gaugePlot(slectedsample){
	var sampleId = slectedsample.slice(3);
	Plotly.d3.json(`/wfreq/${sampleId}`, function (error, wresponse) {

	var level = wresponse * 20;
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
	var path = mainPath.concat(pathX,space,pathY,pathEnd);

	var data = [{ type: 'scatter',
   		x: [0], y:[0],
    	marker: {size: 28, color:'850000'},
    	showlegend: false,
    	name: 'speed',
    	text: level,
    	hoverinfo: 'text+name'
    },
  	{
  		values: [50/6, 50/6, 50/6, 50/6, 50/6, 50/6, 50],
  		rotation: 90,
  		text: ['TOO FAST!', 'Pretty Fast', 'Fast', 'Average',
            	'Slow', 'Super Slow', ''],
  		textinfo: 'text',
  		textposition:'inside',
  		marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                         'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                         'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                         'rgba(255, 255, 255, 0)']},
  		labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
  		hoverinfo: 'label',
  		hole: .5,
  		type: 'pie',
  		showlegend: false
	}];

	var layout = {
  		shapes:[{
      		type: 'path',
      		path: path,
      		fillcolor: '850000',
      		line: {
        	color: '850000'

      	}
    }],
		
  		height: 900,
  		width: 1000,
  		xaxis: {
  			zeroline:false, showticklabels:false,
            showgrid: false, range: [-1, 1]
        },
  		yaxis: {
  			zeroline:false, showticklabels:false,
            showgrid: false, range: [-1, 1]
        }
	};

	Plotly.newPlot('gauge', data, layout);
	});
};

loaddropdown();
