url="https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function updateHeading(baseTemp, dataset){
  var minYear = d3.min(dataset, (d) => d["year"]);
  var maxYear = d3.max(dataset, (d) => d["year"]);

  d3.select("#description")
    .html(minYear + " - " + maxYear + ": base temperature " + baseTemp + "&#8451;");
}

function drawChart(dataset){

  var minYear = d3.min(dataset, (d) => d["year"]);
  var maxYear = d3.max(dataset, (d) => d["year"]);
  var minTemp = d3.min(dataset, (d) => d["temperature"]);
  var maxTemp = d3.max(dataset, (d) => d["temperature"]);

  // svg for the chart
  const canvasWidth = 1500;
  const canvasHeight = 540;
  const margins={"left": 100,
                 "right": 50,
                 "top": 50,
                 "bottom": 100};

  var svg = d3.select("svg")
            .attr("width",canvasWidth)
            .attr("height",canvasHeight)
  ;

  // group chart elements
  var g = svg.append("g")
             .attr("class", "chartgroup");

  // calculate scales
  const xScale = d3.scaleBand()
                   .domain(d3.range(minYear, maxYear + 1))
                   .range([margins["left"], canvasWidth - margins["right"]]);
  cellWidth = (canvasWidth - margins["left"] - margins["right"]) /
              (d3.max(dataset, (d) => d["year"]) - d3.min(dataset, (d) => d["year"]) + 1);
  cellHeight = (canvasHeight - margins["top"] - margins["bottom"])/12 - 1
  const yScale = d3.scaleBand()
                   .domain(monthNames)
                   .range([margins["top"], canvasHeight - margins["bottom"]]);

  var myColor = d3.scaleSequential()
                  .interpolator(d3.interpolateRdBu)
                  .domain([maxTemp, minTemp]);

  const xAxis = d3.axisBottom(xScale)
                  .tickValues(xScale.domain().filter(function(d,i){
                    return !(d%10)
                  }));

  const yAxis = d3.axisLeft(yScale);

  var tooltip = d3.select("body")
                  .append("div")
                  .attr("id", "tooltip")
                  .text("a simple tooltip")
                  .style("opacity", 0);

  g.append("g")
   .attr("id", "x-axis")
   .attr("transform", "translate(0," + (canvasHeight - margins["bottom"]) + ")")
   .call(xAxis);

  g.append("g")
   .attr("id", "y-axis")
   .attr("transform", "translate(" + margins["left"] + ", 0)")
   .call(yAxis);

  g.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("class", "cell")
   .attr("data-month", (d, i) => d["month"]-1)
   .attr("data-year", (d, i) => d["year"])
   .attr("data-temp", (d, i) => d["temperature"])
   .attr("x", (d, i) => xScale(d["year"]))
   .attr("y", (d, i) => yScale(d["monthName"]))
   .attr("height", cellHeight)
   .attr("width", cellWidth)
   .attr("fill", (d, i) => myColor(d["temperature"]))
   .on("mouseover", function(d){
     var tooltip_html = d["year"] + " - " + d["monthName"] + "<br>"
                       + d3.format(".1f")(d["temperature"]) + "<br>"
                       + d3.format("+.1f")(d["variance"]);
     tooltip.html(tooltip_html);
     tooltip.style("left", (d3.event.pageX + 15) + "px")
            .style("top", (d3.event.pageY - 15) + "px")
            .style("opacity", 0.9)
            .attr("data-year", d["year"]);
   })
   .on("mouseout", function(d){
     tooltip.style("opacity", 0);
   });

   // create legend
   var legend = svg.append("g")
                   .attr("id", "legend")
                   .attr("transform", "translate(" + margins["left"] + ", " + (canvasHeight - margins["bottom"] / 2) + ")");
   var legendData = d3.range(minTemp, maxTemp+1, (maxTemp - minTemp) / 10);
   //console.log(legendData);
   legend.selectAll("rect")
         .data(legendData)
         .enter()
         .append("rect")
         .attr("x", (d, i) => i*50)
         .attr("y", 0)
         .attr("height", 30)
         .attr("width", 50)
         .style("fill", (d, i) => myColor(d));

    legend.selectAll("text")
          .data(legendData)
          .enter()
          .append("text")
          .attr("x", (d, i) => i*50 + 15)
          .attr("y", 45)
          .text((d, i) => d3.format(".1f")(d));


}

req=new XMLHttpRequest();
req.open("GET", url, true);
req.send();
req.onload=function(){
  json=JSON.parse(req.responseText);
  baseTemperature=json["baseTemperature"];
  monthlyVariances=json["monthlyVariance"];
  for (var i=0; i<monthlyVariances.length; i++){
    monthlyVariances[i]["monthName"]=monthNames[monthlyVariances[i]["month"]-1];
    monthlyVariances[i]["temperature"]=monthlyVariances[i]["variance"]+baseTemperature;
  }
  updateHeading(baseTemperature, monthlyVariances);
  drawChart(monthlyVariances);
}
