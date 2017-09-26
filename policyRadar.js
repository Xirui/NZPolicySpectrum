function RadarChart(id, data, options) {
  var cfg = {
    w: 600,				// width of the circle
    h: 600,				// height of the circle
    margin: {top: 20, right: 20, bottom: 20, left: 20},
    numOfCircles: 4,
    maxValue: 100,
    labelDistance: 1.26, // distance between labels and outer circle
    wrapWidth: 60, 		// number of pixels after which a label needs to be given a new line
    opacityArea: 0.35, 	// default opacity of the area of the blob
    dotRadius: 4, 			// size of the colored circles of each blog
    opacityCircles: 0.1, 	// opacity of the circles of each blob
    strokeWidth: 2, 		// width of the stroke around each blob
    roundStrokes: false,
    color: d3.schemeCategory10
  };
  
  // verify options and put them to configure/cfg
  if ('undefined' !== typeof options) {
    for (var i in options) {
      if ('undefined' !== typeof options[i]) {
        cfg[i] = options[i];
      }
    }
  }
  
  // extract figures from csv data
  for (var figures = []; figures.push([]) < 5;);
  data.forEach(function (line) {
    figures[0].push(line["Green"]);
    figures[1].push(line["Labour"]);
    figures[2].push(line["National"]);
    figures[3].push(line["New Zealand First"]);
    figures[4].push(line["Total"]);
  });
  
  var allAxis = (data.map(function (i, j) {
      return i["Issues"]
    })),	// label of each axis
    total = allAxis.length,
    radius = Math.min(cfg.w / 2, cfg.h / 2),
    angleSlice = Math.PI * 2 / total;
  
  // scale for the radius
  var rScale = d3.scaleLinear()
    .range([0, radius])
    .domain([0, cfg.maxValue]);
  
  // add the radar chart SVG
  var svg = d3.select(id).append("svg")
    .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
    .attr("class", "radar" + id);
  var g = svg.append("g")
    .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");
  
  // special visualization effect
  var filter = g.append('defs').append('filter').attr('id', 'glow'),
    feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
    feMerge = filter.append('feMerge'),
    feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
    feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  
  // wrapper for the grid & axes
  var axisGrid = g.append("g").attr("class", "axisWrapper");
  axisGrid.selectAll(".levels")
    .data(d3.range(1, (cfg.numOfCircles + 1)).reverse())
    .enter()
    .append("circle")
    .attr("class", "gridCircle")
    .attr("r", function (d, i) {
      return radius / cfg.numOfCircles * d;
    })
    .style("fill", "#CDCDCD")
    .style("stroke", "#CDCDCD")
    .style("fill-opacity", cfg.opacityCircles)
    .style("filter", "url(#glow)");
  
  // create level scale number (25,50,75,100)
  axisGrid.selectAll(".axisLabel")
    .data(d3.range(1, (cfg.numOfCircles + 1)).reverse())
    .enter().append("text")
    .attr("class", "axisLabel")
    .attr("x", 4)
    .attr("y", function (d) {
      return -d * radius / cfg.numOfCircles;
    })
    .attr("dy", "0.4em")
    .style("font-size", "10px")
    .attr("fill", "#737373")
    .text(function (d, i) {
      return cfg.maxValue * d / cfg.numOfCircles
    });
  
  // create scale lines
  var axis = axisGrid.selectAll(".axis")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "axis");
  axis.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function (d, i) {
      return rScale(cfg.maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("y2", function (d, i) {
      return rScale(cfg.maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .attr("class", "line")
    .style("stroke", "white")
    .style("stroke-width", "2px");
  
  // add the topic labels at each axis
  axis.append("text")
    .attr("class", "legend")
    .style("font-size", "11px")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", function (d, i) {
      return rScale(cfg.maxValue * cfg.labelDistance) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("y", function (d, i) {
      return rScale(cfg.maxValue * cfg.labelDistance) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .text(function (d) {
      return d
    })
    .call(wrap, cfg.wrapWidth);
  
  // create radar shape
  var radarLine = d3.radialLine()
    .curve(d3.curveLinearClosed)
    .radius(function (d) {
      return rScale(d);
    })
    .angle(function (d, i) {
      return i * angleSlice;
    });
  
  if (cfg.roundStrokes) {
    radarLine.curve(d3.curveCardinalClosed);
  }

  var counter = 0;

  // create a wrapper for the blobs
  var blobWrapper = g.selectAll(".radarWrapper")
    .data(figures)
    .enter().append("g")
    .attr("class", function(){
      var radarWrapper = "radarWrapper";
        switch(counter){
            case 0:
                counter++;
                return radarWrapper + " Green";
            case 1:
                counter++;
                return radarWrapper + " Labour";
            case 2:
                counter++;
                return radarWrapper + " National";
            case 3:
                counter++;
                return radarWrapper + " NZFirst";
            case 4:
                counter++;
                return radarWrapper + " Total";
        }
    })
    .attr("visibility", "visible");
  
  // append the backgrounds
  blobWrapper
    .append("path")
    .attr("class", "radarArea")
    .attr("d", function (d, i) {
      return radarLine(d);
    })
    .style("fill", function (d, i) {
      return cfg.color(i);
    })
    .style("fill-opacity", cfg.opacityArea)
    .on('mouseover', function (d, i) {
      // dim unselected party radar blobs
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", 0.1);
      // highlight selected party radar blob
      d3.select(this)
        .transition().duration(200)
        .style("fill-opacity", 0.7);
    })
    .on('mouseout', function () {
      // reset all blobs
      d3.selectAll(".radarArea")
        .transition().duration(200)
        .style("fill-opacity", cfg.opacityArea);
    });
  
  // create the outlines
  blobWrapper.append("path")
    .attr("class", "radarStroke")
    .attr("d", function (d, i) {
      return radarLine(d);
    })
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", function (d, i) {
      return cfg.color(i);
    })
    .style("fill", "none")
    .style("filter", "url(#glow)");
  
  // append the circles
  blobWrapper.selectAll(".radarCircle")
    .data(function (d, i) {
      return d;
    })
    .enter().append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr("cx", function (d, i) {
      return rScale(d) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("cy", function (d, i) {
      return rScale(d) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .style("fill", function (d, i, j) {
      return cfg.color(j);
    })
    .style("fill-opacity", 0.8);
  
  var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
    .data(figures)
    .enter().append("g")
    .attr("class", "radarCircleWrapper");
  
  // create pop-up figure when mouseover to a data point
  blobCircleWrapper.selectAll(".radarInvisibleCircle")
    .data(function (d, i) {
      return d;
    })
    .enter().append("circle")
    .attr("class", "radarInvisibleCircle")
    .attr("r", cfg.dotRadius * 1.5)
    .attr("cx", function (d, i) {
      return rScale(d) * Math.cos(angleSlice * i - Math.PI / 2);
    })
    .attr("cy", function (d, i) {
      return rScale(d) * Math.sin(angleSlice * i - Math.PI / 2);
    })
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function (d, i) {
      newX = parseFloat(d3.select(this).attr('cx')) - 10;
      newY = parseFloat(d3.select(this).attr('cy')) - 10;
      pointFigure
        .attr('x', newX)
        .attr('y', newY)
        .text(d)
        .transition().duration(200)
        .style('opacity', 1);
    })
    .on("mouseout", function () {
      pointFigure.transition().duration(200)
        .style("opacity", 0);
    });
  var pointFigure = g.append("text")
    .attr("class", "readings")
    .style("opacity", 0);
  
  // wraps SVG text: http://bl.ocks.org/mbostock/7555321
  function wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.4,
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }
}