
var mapSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var mapData;
var timeData;
var cscale_temp="interpolateRdYlGn";
var cs_scale;
var q = 0;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  mapSvg = d3.select('#map');
  lineSvg = d3.select('#linechart');
  lineWidth = +lineSvg.style('width').replace('px','');
  lineHeight = +lineSvg.style('height').replace('px','');;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  // Load both files before doing anything else
  Promise.all([d3.json('data/africa.geojson'),
               d3.csv('data/africa_gdp_per_capita.csv')])
          .then(function(values){
    
    mapData = values[0];
    timeData = values[1];
   
    drawMap();
  })

});

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for(var key in yearData) {
    if(key == 'Year') 
      continue;
    let val = +yearData[key];
    if(val > max)
      max = val;
    if(val < min)
      min = val;
  }
  return [min,max];
}

// Draw the map in the #map svg
function drawMap() {

  // create the map projection and geoPath
  let projection = d3.geoMercator()
                      .scale(400)
                      .center(d3.geoCentroid(mapData))
                      .translate([+mapSvg.style('width').replace('px','')/2,
                                  +mapSvg.style('height').replace('px','')/2.3]);
  let path = d3.geoPath()
               .projection(projection);

  // get the selected year based on the input box's value
  var year = document.getElementById('year-input').value;

  // get the GDP values for countries for the selected year
  let yearData = timeData.filter( d => d.Year == year)[0];
  
  // get the min/max GDP values for the selected year
  let extent = getExtentsForYear(yearData);

  // get the selected color scale based on the dropdown value
  var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
                     .domain(extent);
  var colorScale2 = d3.scaleSequential(d3.interpolateViridis)
                     .domain(extent);
  var colorScale3 = d3.scaleSequential(d3.interpolateBrBG)
                     .domain(extent);
  cs_scale = colorScale;
  //var cscale_temp = "interpolateRdYlGn";
  
  var div = d3.select("body").append("div")
     .attr("class", "tooltip-map")
     .style("opacity", 0);

  // draw the map on the #map svg
  let g = mapSvg.append('g');
  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => { return d.properties.name})
    .attr('class','countrymap')
    .style('fill', d => {
      let val = +yearData[d.properties.name];
      if(isNaN(val)) 
        return 'white';
      return colorScale(val);
    })
    .on('mouseover', function(d,i) {
      console.log('mouseover on ' + d.properties.name);
      d3.select(this).classed('highlighted_country',true);
      div.transition().duration(50)
      .style("opacity",1);
      div.html("Country: "+d.properties.name+"<br>GDP: "+yearData[d.properties.name])
     .style("left", (d3.event.pageX + 10) + "px")
     .style("top", (d3.event.pageY - 15) + "px");
    })
    .on('mousemove',function(d,i) {
      console.log('mousemove on ' + d.properties.name);
      div.transition().duration(50)
      .style("opacity",1);
      div.html("Country: "+d.properties.name+"<br>GDP: "+yearData[d.properties.name])
     .style("left", (d3.event.pageX + 10) + "px")
     .style("top", (d3.event.pageY - 15) + "px");
    })
    .on('mouseout', function(d,i) {
      console.log('mouseout on ' + d.properties.name);
      d3.select(this).classed('highlighted_country',false);
      div.transition().duration(50)
      .style("opacity",0);
    })
    .on('click', function(d,i) {
      console.log('clicked on ' + d.properties.name);
      drawLineChart(d.properties.name);
    });

    //taking year as input 
    document.getElementById("year-input").addEventListener("change",function(){

      d3.selectAll("#map > *").remove();
      // get the selected year based on the input box's value
  var year = document.getElementById('year-input').value;

  // get the GDP values for countries for the selected year
  let yearData = timeData.filter( d => d.Year == year)[0];
  
  // get the min/max GDP values for the selected year
  let extent = getExtentsForYear(yearData);

  // get the selected color scale based on the dropdown value
  var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
                     .domain(extent);
  var colorScale2 = d3.scaleSequential(d3.interpolateViridis)
                     .domain(extent);
  var colorScale3 = d3.scaleSequential(d3.interpolateBrBG)
                     .domain(extent);

  
  // draw the map on the #map svg
  let g = mapSvg.append('g');
  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => { return d.properties.name})
    .attr('class','countrymap')
    .style('fill', d => {
      let val = +yearData[d.properties.name];
      if(isNaN(val)) 
        return 'white';
      if(cscale_temp == "interpolateRdYlGn"){
        cs_scale = colorScale
        return colorScale(val);
      }
      else if(cscale_temp == "interpolateViridis"){
        cs_scale = colorScale2
        return colorScale2(val);
      }
      else if(cscale_temp == "interpolateBrBG"){
        cs_scale = colorScale3
        return colorScale3(val);
      }
    })
    .on('mouseover', function(d,i) {
      console.log('mouseover on ' + d.properties.name);
      d3.select(this).classed('highlighted_country',true);
      div.transition().duration(50)
      .style("opacity",1);
      div.html("Country: "+d.properties.name+"<br>GDP: "+yearData[d.properties.name])
     .style("left", (d3.event.pageX + 10) + "px")
     .style("top", (d3.event.pageY - 15) + "px");
    })
    .on('mousemove',function(d,i) {
      console.log('mousemove on ' + d.properties.name);
      div.transition().duration(50)
      .style("opacity",1);
      div.html("Country: "+d.properties.name+"<br>GDP: "+yearData[d.properties.name])
     .style("left", (d3.event.pageX + 10) + "px")
     .style("top", (d3.event.pageY - 15) + "px");
    })
    .on('mouseout', function(d,i) {
      console.log('mouseout on ' + d.properties.name);
      d3.select(this).classed('highlighted_country',false);
      div.transition().duration(50)
      .style("opacity",0);
    })
    .on('click', function(d,i) {
      console.log('clicked on ' + d.properties.name);
      drawLineChart(d.properties.name);
    });

    axisScale = d3.scaleLinear()
    .domain(cs_scale.domain())
    .range([lineMargin.left - 70, lineInnerWidth - lineMargin.right - 350]);

  axisBottom = g => g
    .attr("class", `x-axis`)
    .attr("transform", `translate(0,${lineInnerHeight + 20})`)
    .call(d3.axisBottom(axisScale)
    .ticks(6)
    .tickSize(-20));

    const defs = mapSvg.append("defs");
    
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
    
    linearGradient.selectAll("stop")
      .data(cs_scale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: cs_scale(t) })))
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

      mapSvg.append('g')
      .attr("transform", `translate(0,${lineInnerHeight})`)
      .append("rect")
      .attr('transform', `translate(${lineMargin.left - 70}, 0)`)
      .attr("width", 200)
      .attr("height", 20)
      .style("fill", "url(#linear-gradient)");

    mapSvg.append('g')
      .call(axisBottom);

    });

    //color-scale-select event listener
    document.getElementById("color-scale-select").addEventListener("change", function(){
      d3.selectAll("#map > *").remove();
      cscale_temp = document.getElementById("color-scale-select").value;
      var year = document.getElementById('year-input').value;

      // get the GDP values for countries for the selected year
      let yearData = timeData.filter( d => d.Year == year)[0];
      
      // get the min/max GDP values for the selected year
      let extent = getExtentsForYear(yearData);
    
      // get the selected color scale based on the dropdown value
      var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
                         .domain(extent);
      var colorScale2 = d3.scaleSequential(d3.interpolateViridis)
                         .domain(extent);
      var colorScale3 = d3.scaleSequential(d3.interpolateBrBG)
                         .domain(extent);
    
      
      // draw the map on the #map svg
      let g = mapSvg.append('g');
      g.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('id', d => { return d.properties.name})
        .attr('class','countrymap')
        .style('fill', d => {
          let val = +yearData[d.properties.name];
          if(isNaN(val)) 
            return 'white';
          if(cscale_temp == "interpolateRdYlGn"){
            cs_scale = colorScale
            return colorScale(val);
          }
          else if(cscale_temp == "interpolateViridis"){
            cs_scale = colorScale2
            return colorScale2(val);
          }
          else if(cscale_temp == "interpolateBrBG"){
            cs_scale = colorScale3
            return colorScale3(val);
          }
        })
        .on('mouseover', function(d,i) {
          console.log('mouseover on ' + d.properties.name);
          d3.select(this).classed('highlighted_country',true);
          div.transition().duration(50)
      .style("opacity",1);
      div.html("Country: "+d.properties.name+"<br>GDP: "+yearData[d.properties.name])
     .style("left", (d3.event.pageX + 10) + "px")
     .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mousemove',function(d,i) {
          console.log('mousemove on ' + d.properties.name);
          div.transition().duration(50)
      .style("opacity",1);
      div.html("Country: "+d.properties.name+"<br>GDP: "+yearData[d.properties.name])
     .style("left", (d3.event.pageX + 10) + "px")
     .style("top", (d3.event.pageY - 15) + "px");
        })
        .on('mouseout', function(d,i) {
          console.log('mouseout on ' + d.properties.name);
          d3.select(this).classed('highlighted_country',false);
          div.transition().duration(50)
      .style("opacity",0);
        })
        .on('click', function(d,i) {
          console.log('clicked on ' + d.properties.name);
          drawLineChart(d.properties.name);
        });

        axisScale = d3.scaleLinear()
    .domain(cs_scale.domain())
    .range([lineMargin.left - 70, lineInnerWidth - lineMargin.right - 350]);

  axisBottom = g => g
    .attr("class", `x-axis`)
    .attr("transform", `translate(0,${lineInnerHeight + 20})`)
    .call(d3.axisBottom(axisScale)
    .ticks(6)
    .tickSize(-20));

    const defs = mapSvg.append("defs");
    
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
    
    linearGradient.selectAll("stop")
      .data(cs_scale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: cs_scale(t) })))
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

      mapSvg.append('g')
      .attr("transform", `translate(0,${lineInnerHeight})`)
      .append("rect")
      .attr('transform', `translate(${lineMargin.left - 70}, 0)`)
      .attr("width", 200)
      .attr("height", 20)
      .style("fill", "url(#linear-gradient)");

    mapSvg.append('g')
      .call(axisBottom);


    });

    if(q==0){
      axisScale = d3.scaleLinear()
    .domain(cs_scale.domain())
    .range([lineMargin.left - 70, lineInnerWidth - lineMargin.right - 350]);

  axisBottom = g => g
    .attr("class", `x-axis`)
    .attr("transform", `translate(0,${lineInnerHeight + 20})`)
    .call(d3.axisBottom(axisScale)
    .ticks(6)
    .tickSize(-20));

    const defs = mapSvg.append("defs");
    
    const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
    
    linearGradient.selectAll("stop")
      .data(cs_scale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: cs_scale(t) })))
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

      mapSvg.append('g')
      .attr("transform", `translate(0,${lineInnerHeight})`)
      .append("rect")
      .attr('transform', `translate(${lineMargin.left - 70}, 0)`)
      .attr("width", 200)
      .attr("height", 20)
      .style("fill", "url(#linear-gradient)");

    mapSvg.append('g')
      .call(axisBottom);

      q++;
    }

}


// Draw the line chart in the #linechart svg for
// the country argument (e.g., `Algeria').
function drawLineChart(country) {

  d3.selectAll("#linechart > *").remove();

  console.log("Inside the function with country data: "+country);

  //console.log(d3.min(timeData,function(d){return d.Year;}));

  let svg = lineSvg.append("svg")
  .attr("width", lineInnerWidth + lineMargin.left + lineMargin.right)
  .attr("height", lineInnerHeight + lineMargin.top + lineMargin.bottom)
  .append("g")
  .attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");

  var data = timeData.map(function(d) {
    return {
        Year: d.Year,
        Gdp: +d[country]
        }
      });

      console.log(d3.max(data,function(d){return d.Gdp}));

      var x = d3.scaleLinear()
      .domain([data[0].Year, data[data.length - 1].Year])
      .range([0, lineInnerWidth]);

      const xAxis = d3.axisBottom(x);
      xAxis.ticks(11,"4d");


    svg.append("g")
    .attr("class","randomclass")
    .attr("transform", `translate(0,${lineHeight - lineMargin.bottom-20})`)
      .call(xAxis)
      .call(g => g.selectAll(".tick text")
      .attr("x",0)
        .attr("dy",10))
        .style("font-size","12px")
        .style("color","gray");

        var ticks = d3.selectAll("#linechart .tick text");

        ticks.each(function(_, i) {
         if (i % 2 != 0) d3.select(this).remove();
         });


    // Add Y axis
  var y = d3.scaleLinear()
  .domain([0,d3.max(data,function(d){return d.Gdp}) ])
  .range([lineInnerHeight, 0]);
  
  const yAxis = d3.axisRight(y)

  svg.append("g")
    .attr("transform", `translate(${lineMargin.left - lineMargin.right-40},0)`)
    .call(yAxis
      .tickSize(lineWidth - lineMargin.left - lineMargin.right))
    .call(g => g.select(".domain")
        .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "5,10"))
    .call(g => g.selectAll(".tick text ")
        .attr("x", -10)
        .attr("dy", -3))
        .style("font-size","12px")
        .style("color","gray");

        // Create X axis label
        svg.append("text")
        .attr("x", lineInnerWidth / 2 )
        .attr("y", lineInnerHeight + lineMargin.bottom - 20)
        .style("text-anchor", "middle")
        .style("fill","gray")
        .text("Year");

    // Create Y axis label
    svg.append("text")
        .attr("class","axis")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - lineMargin.left + 50)
        .attr("x", 0 - (lineInnerHeight / 2))
        .style("text-anchor", "middle")
        .style("fill","gray")
        .text("GDP for "+country+" (based on current USD)");

  // This allows to find the closest X index of the mouse

  // Create the circle that travels along the curve of chart
  var focus = svg
    .append('g')
    .append('circle')
      .style("fill", "none")
      .attr("stroke", "black")
      .attr('r', 10)
      .style("opacity", 0);

  var div = d3.select("body").append("div")
     .attr("class", "tooltip-line")
     .style("opacity", 0);

        // Add the line
        svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("class", "line")
        .attr("d", d3.line()
          .x(function(d) { return x(d.Year); })
          .y(function(d) { return y(d.Gdp); }));

          var bisect = d3.bisector(function(d) { return d.Year; }).left;

         var space =  svg
          .append('rect')
          .style("fill", "none")
          .style("pointer-events", "all")
          .attr('width', lineWidth - lineMargin.right)
          .attr('height', lineHeight)
          .on('mouseover', mouseover)
          .on('mousemove', mousemove)
          .on('mouseout', mouseout);
    
          function mouseover() {
            focus.style("opacity", 1);
            //focusText.style("opacity",1)
            div.transition().duration(50)
            .style("opacity",1);
            div.html("Year: ")
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 15) + "px");
          }
        
          function mousemove() {
            // recover coordinate we need
    var x0 = x.invert(d3.mouse(this)[0]);
    console.log(x0);
    var i = bisect(data, x0, 1);
    console.log(i);
    selectedData = data[i]
    console.log(selectedData);
    focus
      .attr("cx", x(selectedData.Year))
      .attr("cy", y(selectedData.Gdp));
      console.log("y:"+selectedData.Year+" g:"+selectedData.Gdp);
    //focusText
      //.html("x:" + selectedData.Year + "  -  " + "y:" + selectedData.Gdp)
      //.attr("x", x(selectedData.Year)+15)
      //.attr("y", y(selectedData.Gdp));

      div.html("Year: "+selectedData.Year+"<br>GDP: "+selectedData.Gdp)
     .style("left", (d3.event.pageX + 10) + "px")
     .style("top", (d3.event.pageY - 15) + "px");
    
          }

        function mouseout() {
          focus.style("opacity",0);
          //focusText.style("opacity", 0)
          div.style("opacity",0);
        }




  if(!country)
    return;
  
}
