import * as d3 from "d3"
import * as moment from 'moment';

var swingSettings = {sortBy:"swing", colorBy:"party"}

function init(results, seatInfo) {

	// console.log(results)

	d3.select("#loadingContainer").remove()
	const container = d3.select("#graphicContainer")

	var isMobile;
	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	if (windowWidth < 610) {
			isMobile = true;
	}	

	if (windowWidth >= 610) {
			isMobile = false;
	}

	var width = document.querySelector("#graphicContainer").getBoundingClientRect().width
	var height = 1800;					
	var margin = {top: 40, right: 20, bottom: 20, left:20};	

	var stateOrder = {
		"NSW":0,
		"VIC":1,
		"QLD":2,
		"WA":3,
		"SA":4,
		"TAS":5,
		"NT":6,
		"ACT":6
	}

	var partyOrder = {
		"ALP":0,
		"LNP":1,
		"LIB":1,
		"NAT":1,
		"GRN":2,
		"Unknown":2,
		"NXT":2,
		"CA":2,
		"Excluded":3
	}

	var partyColors = {
		"ALP":"#b51800",
		"LNP":"#005689",
		"LIB":"#005689",
		"NAT":"#197caa",
		"GRN":"#298422",
		"Unknown":"#767676",
		"NXT":"#e6711b",
		"CA":"#e6711b",
		"":"#767676",
		"KAP":"#ff9b0b",
		"IND":"purple",
		"Excluded":"#000"
	}

	width = width - margin.left - margin.right,
	height = height - margin.top - margin.bottom;
	var excludes = ["Whitlam","Farrer","Wentworth","Maranoa","Cowper","Warringah","Grey","Kennedy","Indi","Mayo","Clark","Melbourne","Wills","Cooper","Grayndler","Barker","New England","Kooyong"]	

	d3.select("#graphicContainer svg").remove();
	
	var svg = d3.select("#graphicContainer").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden");					

	var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleLinear().range([0, width]);
	var y = d3.scaleBand().range([height, 0]);
	// console.log(x.domain())
	var xAxis = d3.axisBottom(x);
	var xAxis2 = d3.axisTop(x);
	var yAxis = d3.axisLeft(y);

	var seatInfo = d3.nest()
		.key(function(d) { return d.electorate; })
  		.object(seatInfo.sheets.electorates);

  	// console.log(seatInfo['Adelaide'][0])
  	results.forEach(function(d,) {

  		// console.log(d.name)
  		// console.log(seatInfo[d.name])
  		
  		if (d.name in seatInfo) {
  			d.incumbent = seatInfo[d.name][0].incumbent
  		}
  		
  		else {
  			d.incumbent = "Unknown"
  		}

  		if (d.name in seatInfo) {
  			d.prediction = seatInfo[d.name][0].prediction
  		}
  		
  		else {
  			d.prediction = "Unknown"
  		}

  		d.stateOrder = stateOrder[d.state]
  		d.partyOrder = partyOrder[d.incumbent]
  		if (d.partyOrder == undefined) {
  			d.partyOrder = 2
  		}

  		if (d.tcp[0].votesTotal + d.tcp[1].votesTotal  === 0) {
  			d.tppLabor = 0;
  		}

  		if (excludes.includes(d.name)) {
  			d.tppLabor = 0;
  			d.incumbent = "Excluded"
  		}
  	
  	})
	
	// console.log(seatInfo)

	if (swingSettings.sortBy == "swing") {
  		results.sort(function(a, b) { return a.tppLabor - b.tppLabor; })
  	}	

  	else if (swingSettings.sortBy == "state") {
  		results.sort(function(a, b) { return b.stateOrder - a.stateOrder || a.tppLabor - b.tppLabor})
  	}

  	else if (swingSettings.sortBy == "party") {
  		results.sort(function(a, b) { return b.partyOrder - a.partyOrder || a.tppLabor - b.tppLabor})
  	}


  	y.domain(results.map(function (d) {return d.name;})).padding(0.1);
	x.domain(d3.extent(results, function (d) {return d.tppLabor;})).nice();

  	// console.log(results);

  	function make_x_gridlines() {		
    	return d3.axisBottom(x)
	}

	features.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(xAxis);

	features.append('g')
		.attr('class', 'x axis2')
		.call(xAxis2);	

	features.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(' + x(0) + ',0)')
		.call(yAxis)	

	features.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      )

     var laborLabel =  "2PP swing to Labor →";
     var coalitionLabel =  "← 2PP swing to Coalition";

    if (width < 500) {
    	laborLabel =  "Labor →";
     	coalitionLabel =  "← Coalition";
    }  

    var stateLabelOpacity = 0;
    var partyLabelOpacity = 0;

    if (swingSettings.sortBy === "state") {
    	stateLabelOpacity = 1;
    }

    if (swingSettings.sortBy === "party") {
    	partyLabelOpacity = 1;
    }


    svg.append("text")
		.attr("x", x(2))
		.attr("y", 10)
		.attr("text-anchor","start")
		.attr("class", "label")
		.text(laborLabel);  

	svg.append("text")
		.attr("x", x(-2))
		.attr("y", 10)
		.attr("text-anchor","end")
		.attr("class", "label")
		.text(coalitionLabel); 

	svg.append("text")
		.attr("x", 5)
		.attr("y", height * 0.028)
		.attr("class", "label stateLabel")
		.style("opacity", stateLabelOpacity)
		.text("NSW"); 

	svg.append("text")
		.attr("x", 5)
		.attr("y", height * 0.343)
		.attr("class", "label stateLabel")
		.style("opacity", stateLabelOpacity)
		.text("VIC");	

	svg.append("text")
		.attr("x", 5)
		.attr("y", height * 0.589)
		.attr("class", "label stateLabel")
		.style("opacity", stateLabelOpacity)
		.text("QLD");

	svg.append("text")
		.attr("x", 5)
		.attr("y", height * 0.789)
		.attr("class", "label stateLabel")
		.style("opacity", stateLabelOpacity)
		.text("WA");				

	svg.append("text")
		.attr("x", 5)
		.attr("y", height * 0.896)
		.attr("class", "label stateLabel")
		.style("opacity", stateLabelOpacity)
		.text("SA");	

	svg.append("text")
		.attr("x", 5)
		.attr("y", height * 0.969)
		.attr("class", "label stateLabel")
		.style("opacity", stateLabelOpacity)
		.text("TAS");

	svg.append("text")
		.attr("x", 5)
		.attr("y", height *1.002)
		.attr("class", "label stateLabel")
		.style("opacity", stateLabelOpacity)
		.text("NT/ACT");

	svg.append("text")
		.attr("x", 5)
		.attr("y", height * 0.028)
		.attr("class", "label partyLabel")
		.style("opacity", partyLabelOpacity)
		.text("Labor");

	svg.append("text")
		.attr("x", 5)
		.attr("y", height * 0.462)
		.attr("class", "label partyLabel")
		.style("opacity", partyLabelOpacity)
		.text("Coalition");	

	svg.append("text")
		.attr("x", 5)
		.attr("y", height * 0.948)
		.attr("class", "label partyLabel")
		.style("opacity", partyLabelOpacity)
		.text("Other");						

	// var tickLabels = features.selectAll(".y .tick text") 

	// tickLabels.attr("class", function(d,i) {
	//  	return results[i].incumbent
	// });

	// var tickNegative = svg.append('g')
	// 	.attr('class', 'y axis')
	// 	.attr('transform', 'translate(' + x(0) + ',0)')
	// 	.call(yAxis)
	// 	.selectAll('.tick')
	// 	.filter(function (d, i) {return results[i].tppLabor < 0;});

	// tickNegative.select('line')
	// 	.attr('x2', 6);

	// tickNegative.select('text')
	// 	.attr('x', 9)
	// 	.style('text-anchor', 'start');


	var tickPositive = features.selectAll(".y .tick")	
		.filter(function (d, i) {return results[i].tppLabor > 0;})

	tickPositive.select('text')
		.attr('dx', -2);	

	var tickNegative = features.selectAll(".y .tick")
		.filter(function (d, i) {return results[i].tppLabor < 0;});

	tickNegative.select('text')
		.attr('x', 14)
		.style('text-anchor', 'start');				


  	function drawChart(data) {

  		// console.log("drawing chart")

  		x.domain(d3.extent(data, function (d) {return d.tppLabor;})).nice();
  		y.domain(data.map(function (d) {return d.name;})).padding(0.1);

  		var bars = features.selectAll(".bar").data(data, function(d){ return d.name });
  		var partyMarkers = features.selectAll(".partyMarker").data(data, function(d){ return d.name });
  		var circles = features.selectAll(".circle").data(data, function(d){ return d.name });

  		var t = d3.transition("blah")
      		.duration(750);

      	// Remove	

      	bars.exit().transition(t)
		  .style("opacity","0")
		  .attr("y", (height + margin.top + margin.bottom))
		  .remove(); 

		partyMarkers.exit().transition(t)
		  .style("opacity","0")
		  .attr("y", (height + margin.top + margin.bottom))
		  .remove();   

		circles.exit().transition(t)
		  .style("opacity","0")
		  .attr("y", (height + margin.top + margin.bottom))
		  .remove();


		// Update
		
		bars.transition(t)
			.attr('x', function (d) {return x(Math.min(0, d.tppLabor));})
			.attr('y', function (d) {return y(d.name) + y.bandwidth()/2 - 1;})
			.attr('width', function (d) {return Math.abs(x(d.tppLabor) - x(0));})

		partyMarkers.transition(t)
			.attr('x', function (d) { 
				if (d.tppLabor < 0) {
					return x(0) + 2;
				}

				else {
					return x(0) - 8;
				}		
			})
			.attr('y', function (d) {return y(d.name)})	

		circles.transition(t)
			.attr('cx', function (d) {return x(d.tppLabor) })
			.attr('cy', function (d) {return y(d.name) + y.bandwidth()/2;}) 

  		bars.enter().append("rect")
  			.attr('class', function (d) {
					return "bar bar--" + (d.tppLabor < 0 ? "negative" : "positive");
				})
			.attr('x', function (d) {return x(Math.min(0, d.tppLabor));})
			.attr("fill", function(d) {
				if (swingSettings.colorBy == "swing") {
					return d.tppLabor < 0 ? "#005689" : "#b51800";
				}
				else if (swingSettings.colorBy == "party") {
					return partyColors[d.prediction]
				}
			})
			.attr('y', function (d) {return y(d.name) + y.bandwidth()/2 - 1;})
			.attr('width', function (d) {return Math.abs(x(d.tppLabor) - x(0));})
			.attr('height', 2)
			.transition(t)
				.attr('x', function (d) {return x(Math.min(0, d.tppLabor));})
				.attr('y', function (d) {return y(d.name) + y.bandwidth()/2 - 1;})
				.attr('width', function (d) {return Math.abs(x(d.tppLabor) - x(0));})

		circles.enter().append('circle')	
			.attr('class', function (d) {
					return "circle circle--" + (d.tppLabor < 0 ? "negative" : "positive");
			})
			.attr('cx', function (d) {return x(d.tppLabor) })
			.attr("fill", function(d) {
				if (swingSettings.colorBy == "swing") {
					return d.tppLabor < 0 ? "#005689" : "#b51800";
				}

				else if (swingSettings.colorBy == "party") {
					return partyColors[d.prediction]
				}
			})
			.attr('cy', function (d) {return y(d.name) + y.bandwidth()/2;})
			.attr('r', function (d) {return y.bandwidth()/2;})
			.transition(t)
				.attr('cx', function (d) {return x(d.tppLabor) })
				.attr('cy', function (d) {return y(d.name) + y.bandwidth()/2;})

		partyMarkers.enter().append("rect")
			.attr('class', function (d) { return "partyMarker " + d.incumbent; })
			.attr('x', function (d) { 
				if (d.tppLabor < 0) {
					return x(0) + 2;
				}

				else {
					return x(0) - 8;
				}		
			})
			.attr('y', function (d) {return y(d.name)})
			.attr('width', 6)
			.attr('height', y.bandwidth())
			.transition(t)
				.attr('x', function (d) { 
				if (d.tppLabor < 0) {
					return x(0) + 4;
				}

				else {
					return x(0) - 8;
				}		
				})
				.attr('y', function (d) {return y(d.name)})	


		features.select(".x.axis").transition(t)
			.call(xAxis)	

		features.select(".y.axis").transition(t)
			.call(yAxis)

		var tickPositive = features.selectAll(".y .tick")	
			.filter(function (d, i) {return results[i].tppLabor > 0;})

		tickPositive.select('text').transition(t)
			.attr('dx', -2);	

		var tickNegative = features.selectAll(".y .tick")
			.filter(function (d, i) {return results[i].tppLabor < 0;});

		// tickNegative.selectAll('.tick')
		// 	.filter(function (d, i) {return results[i].tppLabor < 0;});

		// tickNegative.select('line').transition(t)
		// 	.attr('x2', 6);

		tickNegative.select('text').transition(t)
			.attr('x', 14)
			.style('text-anchor', 'start');				


  	}

  	function swingSort() {

  		swingSettings.sortBy = "swing"
  		results.sort(function(a, b) { return a.tppLabor - b.tppLabor; })
  		drawChart(results)
  		console.log("sorted")
  		// console.log(results)
  		d3.selectAll(".stateLabel").transition().style("opacity",0)
  		d3.selectAll(".partyLabel").transition().style("opacity",0)
  		d3.selectAll("#controls1 .btn").classed("active", false)
  		d3.select("#swingSort").classed("active", true)
  	}

  	function stateSort() {
  		swingSettings.sortBy = "state"
  		results.sort(function(a, b) { return b.stateOrder - a.stateOrder || a.tppLabor - b.tppLabor})
  		console.log("sorted")
  		// console.log(results)
  		drawChart(results)
  		d3.selectAll(".stateLabel").transition().style("opacity",1)
  		d3.selectAll(".partyLabel").transition().style("opacity",0)
  		d3.selectAll("#controls1 .btn").classed("active", false)
  		d3.select("#stateSort").classed("active", true)
  	}

  	function partySort() {
  		swingSettings.sortBy = "party"
  		results.sort(function(a, b) { return b.partyOrder - a.partyOrder || a.tppLabor - b.tppLabor})
  		console.log("sorted")
  		// console.log(results)
  		drawChart(results)
  		d3.selectAll(".stateLabel").transition().style("opacity",0)
  		d3.selectAll(".partyLabel").transition().style("opacity",1)
  		d3.selectAll("#controls1 .btn").classed("active", false)
  		d3.select("#partySort").classed("active", true)
  	}

  	function colorSwing() {
  		swingSettings.colorBy = "swing"
  		d3.selectAll(".bar").transition().attr("fill", function(d) {
				if (swingSettings.colorBy == "swing") {
					return d.tppLabor < 0 ? "#005689" : "#b51800";
				}
				else if (swingSettings.colorBy == "party") {
					return partyColors[d.prediction]
				}
		})

		d3.selectAll(".circle").transition().attr("fill", function(d) {
				if (swingSettings.colorBy == "swing") {
					return d.tppLabor < 0 ? "#005689" : "#b51800";
				}
				else if (swingSettings.colorBy == "party") {
					return partyColors[d.prediction]
				}
		})

  		d3.selectAll("#controls2 .btn").classed("active", false)
  		d3.select("#colorSwing").classed("active", true)

  	}

  	function colorWinner() {
  		swingSettings.colorBy = "party"
  		d3.selectAll(".bar").transition().attr("fill", function(d) {
				if (swingSettings.colorBy == "swing") {
					return d.tppLabor < 0 ? "#005689" : "#b51800";
				}
				else if (swingSettings.colorBy == "party") {
					return partyColors[d.prediction]
				}
		})

		d3.selectAll(".circle").transition().attr("fill", function(d) {
				if (swingSettings.colorBy == "swing") {
					return d.tppLabor < 0 ? "#005689" : "#b51800";
				}
				else if (swingSettings.colorBy == "party") {
					return partyColors[d.prediction]
				}
		})

		d3.selectAll("#controls2 .btn").classed("active", false)
  		d3.select("#colorParty").classed("active", true)

  	}

  	d3.select("#swingSort").on("click", swingSort)
  	d3.select("#stateSort").on("click", stateSort)
  	d3.select("#partySort").on("click", partySort)
  	d3.select("#colorSwing").on("click", colorSwing)
  	d3.select("#colorParty").on("click", colorWinner)


  	if (swingSettings.sortBy == "swing") {
  		swingSort()
  	}	

  	else if (swingSettings.sortBy == "state") {
  		stateSort()
  	}

  	else if (swingSettings.sortBy == "party") {
  		partySort()
  	}

}	


// Get most recent results

// var timestamp = "20160813164221"


// function getData(data) {

//         var self = this

//         var dataUrl = 'https://interactive.guim.co.uk/2019/05/aus-election/results-data/'

//         var allFeeds = await loadJson(`${dataUrl}recentResults.json`).then((feeds) => feeds)

//         allFeeds = allFeeds.map((item) => +item)

//         var ordered = allFeeds.sort((a,b) => +b - +a)

//         var latestFeed = ordered[0]

//         if (data.feed!=latestFeed) {

//             loadJson(`${dataUrl}${latestFeed}.json`).then((electorates) => init(electorates))

//         }

//         console.log(latestFeed)

//         // return latestFeed

// }

function updateFeed() {
	Promise.all([
			d3.json(`https://interactive.guim.co.uk/2019/05/aus-election/results-data/recentResults.json`)
		]).then((latest) => {

			var allFeeds = latest[0].map((item) => +item)
			var ordered = allFeeds.sort((a,b) => +b - +a)
       		var timestamp = ordered[0]
       		console.log(timestamp)
       		var time = moment(timestamp, 'YYYYMMDDHHmm')
       		d3.select("#lastUpdated").text(time.format("HH:mm DD-MM-YYYY"))
       		render(timestamp)
		})
}


function render (timestamp) {
	Promise.all([
		// d3.json(`https://interactive.guim.co.uk/2019/05/aus-election/results-data/${timestamp}.json`)
			d3.json(`https://interactive.guim.co.uk/2019/05/aus-election/results-data/${timestamp}-swing.json`),
			d3.json('https://interactive.guim.co.uk/docsdata/1d3PX0uc-5KW9sOCaAwuLh2EX4ofLZjokLk1pmA2sRCE.json')
		])
		.then((results) =>  {
			init(results[0],results[1])
			var to=null
			var lastWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
			window.addEventListener('resize', function() {
				var thisWidth = document.querySelector("#graphicContainer").getBoundingClientRect()
				if (lastWidth != thisWidth) {
					window.clearTimeout(to);
					to = window.setTimeout(function() {
						    init(results[0],results[1])
						}, 100)
				}
			
			})

	});

}

updateFeed()

setInterval(function(){ 
	updateFeed()
}, 60000);


// https://interactive.guim.co.uk/2019/05/aus-election/results-data/recentResults.json