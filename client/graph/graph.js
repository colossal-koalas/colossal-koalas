var graph = angular.module('greenfeels.graph',[]);

graph.controller('GraphController',
	['Entries', 'Twemoji', 'Spinner', function(Entries, Twemoji, Spinner) {

		var getData = function(){
			//Create and start spinning spinner
			var spinner = Spinner.create();
			spinner.spin(document.querySelector('#graph1'));

			Entries.getAll()
			.then(function(data){
				//Stop spinner
				spinner.stop();
				//Initialize graph parameters
				renderGraph(data);

			})      	
	}() 	//immediately invoke

	var renderGraph = function(data){
		var params = initializeGraphParameters(data);
		// console.log(params.data)
		generateAxis(params);
		generateLine(params);
		generateEmojis(params);

	}

	var initializeGraphParameters = function(data){
		//container 
		var params = {};
		params.data = data;
		//create svg
		params.options ={
			width:800,
			height:600,
			marginVertical:100,
			marginSides:50
		};
		//svg selector 
		params.svg = d3.select("#graph1").append("svg")
		.attr("width",params.options.width)
		.attr("height",params.options.height);

		params.timeRange = _.pluck(data,'createdAt');
		params.momentHash = {};
		_.each(params.timeRange,function(element){
			var time = moment(element).fromNow();
			params.momentHash[time] =true;
		});
		params.momentRange = _.map(params.timeRange,function(element){
			return moment(element).fromNow();
		});

		params.mapX = d3.scale.linear()
		.domain([new Date(d3.min(params.timeRange)), new Date(d3.max(params.timeRange))])
		.range([params.options.marginSides,params.options.width - params.options.marginSides]);
		params.mapY = d3.scale.linear()
		.domain(d3.extent(_.pluck(data,'emotion')))
		.range([params.options.marginVertical,params.options.height - params.options.marginVertical]);

		return params;
	};
	var generateAxis = function(params){
 		// console.log("mapping",_.map(params.data,function(datum){return moment(datum).fromNow()}))
 		var xAxis = d3.svg.axis()
		.scale(params.mapX) //where to orient numbers
		// .tickValues(params.momentRange)
		.tickFormat(function(d) {
			var time = moment(d).fromNow();
			// console.log(time,params.momentRange);
			return time;
		})
		.orient('bottom') 

		//clear previous append
		params.svg.selectAll("g").remove()
		// use svg selector, add axis to svg as a collection of g elements
		params.svg.append("g")
		.attr('class','axis')
		.attr('transform','translate(0,'+ (params.options.height - params.options.marginVertical) +')')
		.call(xAxis)
		.selectAll("text")  
		.style("text-anchor", "end")
		.attr("transform", "rotate(-25)" );
	}

	//clear graph first
	var generateEmojis = function(params){
		d3.selectAll('.emojiText').remove();
		params.svg.selectAll(".emojiImage").remove();


		params.svg.selectAll(".emojiImage").data(params.data,function(e,index){return index})
		.enter()
		.append("svg:image")
		.attr('width', 40)
		.attr('height', 40)
		.attr('class','emojiImage')
		.attr('x',function(d){
			return -20+params.mapX(new Date(d["createdAt"]))
		})
		.attr('y',function(d){
			return -35+params.mapY(+d["emotion"])
		})
		.attr("xlink:href",function(d){return Twemoji.getTwemojiSrc(+d["emotion"],36)})

		.on("mouseover", function(d) {
			d3.select(this).style({
				"box-sizing": "border-box",
				"border": "150px",
				"padding": "20px",
				"background-color": "#fff"	
			})
			d3.select(this).attr('opacity',0.8)
		})
		.on("mouseout", function(d) {
			d3.select(this).style({'null':null});
			d3.select(this).attr('opacity',1)
		})

		.on('click',function(d){
			

		})
		.append('title')
		.text(function(d){return d['text']})

		params.svg.selectAll("circle").data(params.data,function(e,index){return index})
		.enter()    
		.append("circle")
		.attr("cx", function(d){
			return params.mapX(new Date(d["createdAt"]))
		})
		.attr("cy", function(d){
			return -15+params.mapY(+d["emotion"])
		})
		.attr("r", 22)
		.attr('opacity',0)
		.on('click',function(d){
			d3.selectAll('circle').attr('stroke-width', '0').attr('opacity', 0).attr('fill', 'white')

			d3.selectAll('.emojiText').remove();
			d3.selectAll('.emojiLink').remove();

			d3.select(this).attr('stroke','white').attr('stroke-width', '6').attr('opacity', 1).attr('fill', 'none')
			
			d3.select('#graphText')
			.append('div')
			.attr('class','emojiText')
			.html('<div style="font-size: 16px">'+moment(d.createdAt).format('MMM Do YYYY')+'</div>' + '\n' + d.text+'\n')
			.append('button')
			.text('updateText')
			.on('click',function(){
				d3.select('.emojiText')
				.append('textarea')
				.attr('rows','4')
				.attr('cols','20')
				.attr('class','updateText')
				.text(d.text)

				d3.select(this).remove();

				d3.select('.emojiText')			
				.append('button')
				.on('click',function(){
					Entries.updateEntry(d.id,d3.select('.updateText').text()).then(function(data){
						console.log(data)
					})
				})
				.text('updateEntry')

				
				d3.select('.emojiText')
				.append('button')
				.on('click',function(){
					Entries.deleteEntry(d.id).then(function(data){
						console.log(data)
					})
				})
				.text('deleteEntry')
			})



		})
.append('title')
.text(function(d){return d['text']})
}

var generateLine = function(params){
	var line = d3.svg.line()
	.interpolate("monotone")
	.x(function(d,i) {return params.mapX(new Date(d["createdAt"]))})
	.y(function(d,i) {return params.mapY(+d["emotion"])})

	var path = params.svg.append("path")
	.attr("d", line(params.data))
	.attr("stroke", "steelblue")
	.attr("stroke-width", "2")
	.attr("fill", "none");

	var totalLength = path.node().getTotalLength();

	path
	.attr("stroke-dasharray", totalLength + " " + totalLength)
	.attr("stroke-dashoffset", totalLength)
	.transition()
	.duration(2000)
	.ease("linear")
	.attr("stroke-dashoffset", 0);
}
}]);
