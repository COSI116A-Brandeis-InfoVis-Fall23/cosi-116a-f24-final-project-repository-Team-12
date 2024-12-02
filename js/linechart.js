/* global D3 */

// Initialize a line chart. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
// this line chart shows the average of on/off of the station selected on the mbta map
function linechart() {

    // Based on Mike Bostock's margin convention
    // https://bl.ocks.org/mbostock/3019563
    let margin = {
        top: 60,
        left: 50,
        right: 30,
        bottom: 35
      },
      svg,
      width = 1000 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom,
      xValue = d => d[0],
      yValue = d => d[1],
      xLabelText = "",
      yLabelText = "",
      yLabelOffsetPx = 0,
      xScale = d3.scaleBand(),
      yScale = d3.scaleLinear(),
      ourBrush = null,
      selectableElements = d3.select(null),
      dispatcher,
      olddata;
    
    function createlinechart(selector, data, stopn){
        olddata=data;
        data = data.filter(d => d['stop_name']===stopn)
               .sort((a, b) => a['time_period_id'].localeCompare(b['time_period_id']));
        console.log(data);
        //data2 = data.filter(d => d['route_id'] === 'Red' && d['stop_name'] === 'Braintree' && d['dir_id'] === 'NB');
            //console.log(data);
            
        svg = d3.select(selector);
        if(svg.selectAll("*").size()>0){
            svg.selectAll("*").remove();
        }

       
      
        svg =svg.append("svg")
              .attr("preserveAspectRatio", "xMidYMid meet")
              .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
              .classed("svg-content", true);
      
          svg = svg.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
          svg.append("text")
              .attr("x", width/2)
              .attr("y", -20)
              .attr("text-anchor", "middle") 
              .attr("dominant-baseline", "hanging")
              .attr("font-size", "16px") 
              .attr("font-family","sans-serif")
              .attr("font-weight", "bold") 
              .text("Details of " +stopn+"'s flow");  
          //Define scales
          xScale
            .domain(data.map(d=>d.time_period_name))
            .range([0, width]);
      
          yScale
            .domain([
              0,
              d3.max(data, d => Math.max(d.average_flow,d.average_ons,d.average_offs))
            ])
            .nice()
            .rangeRound([height, 0]);
      
          // X axis
          let xAxis = svg.append("g")
              .attr("transform", "translate(0," + (height) + ")")
              .call(d3.axisBottom(xScale));
              
          // Put X axis tick labels at an angle
          xAxis.selectAll("text") 
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-10)")
              .style("font-family","sans-serif")
              .style("fill", "black")
              .style("font-size","8px");
             
              
          // X axis label
          xAxis.append("text")        
              .attr("class", "axisLabel")
              .attr("transform", "translate(" + (width - 50) + ",-10)")
              .text(xLabelText);
          //alert(xLabelText);
    
          // Y axis and label
          let yAxis = svg.append("g")
              .call(d3.axisLeft(yScale))
              .selectAll("text") 
              .style("text-anchor", "end")
              //.attr("transform", "rotate(-90)")
              .style("font-family","sans-serif")
              .style("fill", "black")
              .style("font-size","12px")
              .attr("y",5);
           yAxis.append("text")
              .attr("class", "axisLabel")
              .attr("transform", "translate(" + yLabelOffsetPx + ", -12)")
              .text(yLabelText);
          
          /* const colorMap = {}; 
           const dirIds = [...new Set(data.map(d => d.dir_id))];
           dirIds.forEach(dirId => {
              const metrics = ["average_flow", "average_ons", "average_offs"];
              const colorSubMap = d3.scaleOrdinal()
                      .domain(metrics)
                      .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728", "#984ea3", "#9467bd"]); 
           
              metrics.forEach(metric => {
                  colorMap[`${dirId}-${metric}`] = colorSubMap(metric);
               });
            });
            console.log(colorMap);*/
            const metrics = ["average_flow", "average_ons", "average_offs"];

            const uniqueDirIds = [...new Set(data.map(d => d.dir_id))];

            const colorMap = {};

            const colorScale = d3.scaleOrdinal()
                      .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728", "#984ea3", "#9467bd"]);
 
            uniqueDirIds.forEach(dirId => {
                  metrics.forEach(metric => {
                      const key = `${dirId}-${metric}`;

                      if (!colorScale.domain().includes(key)) {
                          colorScale.domain(colorScale.domain().concat(key)); 
                      }
                      colorMap[key] = colorScale(key); 
                  });
            });
 

            console.log(colorMap);
           
            function plotLines(data) {
              data.forEach(d => {
                const dirId = d.dir_id;
                const metrics = Object.keys(d).filter(key => key.startsWith("average_"));
            
                metrics.forEach(metric => {
                  const metricData = data.filter(item => item.dir_id === dirId && item[metric] !== undefined); 
            
                  const timePeriods = metricData.map(item => item.time_period_name);
                  const values = metricData.map(item => item[metric]);
                  console.log(values);

                  const dataPoints = timePeriods.map((timePeriod, index) => ({
                    time: timePeriod,
                    value: values[index]
                  }));

                  const lineGenerator = d3.line()
                    .x(d => xScale(d.time))
                    .y(d => yScale(d.value))
                    .curve(d3.curveMonotoneX);

                  svg.append("path")
                    .datum(dataPoints) 
                    .attr("fill", "none")
                    .attr("stroke", colorMap[`${dirId}-${metric}`]) 
                    .attr("stroke-width", 1.5)
                    .attr("d", lineGenerator)
                    .attr("class", `line-${dirId}-${metric}`) 
                    .attr("title", `${metric.replace("average_", "").charAt(0).toUpperCase() + metric.replace("average_", "").slice(1)} for Direction ${dirId}`); 

                  dataPoints.forEach(point => {
                    svg.append("circle")
                      .attr("cx", xScale(point.time)) 
                      .attr("cy", yScale(point.value)) 
                      .attr("r", 3) 
                      .attr("fill", colorMap[`${dirId}-${metric}`]) 
                      .attr("stroke", "black") 
                      .attr("stroke-width", 0.5); 
                  });
                });
              });
            }
            plotLines(data);
           

           
    
          /*
           const lineAverageFlow = d3.line()
              .x(d => xScale(d.time_period_name) + xScale.bandwidth() / 2)
              .y(d => yScale(d.average_flow))
              .curve(d3.curveMonotoneX); 
            
           const lineTotalOffs = d3.line()
              .x(d => xScale(d.time_period_name) + xScale.bandwidth() / 2)
              .y(d => yScale(d.average_offs))
              .curve(d3.curveMonotoneX);
             
           const lineTotalOns = d3.line()
              .x(d => xScale(d.time_period_name) + xScale.bandwidth() / 2)
              .y(d => yScale(d.average_ons))
              .curve(d3.curveMonotoneX);
            //alert(lineAverageFlow);  
            svg.append("path")
              .datum(ndata)
              .attr("fill", "none")
              .attr("stroke", "steelblue")
              .attr("stroke-width", 1.5)
              .attr("d", lineAverageFlow);
           
             
            svg.append("path")
              .datum(ndata)
              .attr("fill", "none")
              .attr("stroke", "orange")
              .attr("stroke-width", 1.5)
              .attr("d", lineTotalOffs);
             
            svg.append("path")
              .datum(ndata)
              .attr("fill", "none")
              .attr("stroke", "green")
              .attr("stroke-width", 1.5)
              .attr("d", lineTotalOns);
           // alert("ddd3");
              let radius = 5;
              svg.selectAll(".data-point")
                .data(ndata)
                .enter()
                .append("g")
                .attr("class", "data-point-group")
                .selectAll("circle")
                .data(d => [
                  {type: 'average_flow', value: d.average_flow},
                  {type: 'average_offs', value: d.total_offs},
                  {type: 'average_ons', value: d.total_ons}
                ])
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d.time_period_name) + xScale.bandwidth() / 2)
                .attr("cy", d => yScale(d.value))
                .attr("r", radius)
                .attr("fill", (d, i) => {
                  switch (i) {
                    case 0: return 'red'; // average_flow
                    case 1: return 'orange'; // total_offs
                    case 2: return 'green'; // total_ons
                    default: return 'black';
                  }
                 });
          */
                 const svgWidth = +svg.attr("width");
const svgHeight = +svg.attr("height");
 

function createLegend(colorMap, dirIds, metrics, margin) {

   const itemHeight = 20; 
   const itemSpacing = 10; 
 

   const legendGroup = svg.append("g")
     .attr("class", "legend")

     .attr("transform", `translate(${margin.left}, ${margin.top})`);
 
   let currentY = 0; 
 

   dirIds.forEach(dirId => {
      metrics.forEach(metric => {
        const key = `${dirId}-${metric}`;
        const color = colorMap[key];
        const label = `${metric.replace("average_", "").charAt(0).toUpperCase() + metric.replace("average_", "").slice(1)} for ${dirId}`;
 
        legendGroup.append("rect")
          .attr("x", 0)
          .attr("y", currentY)
          .attr("width", 18)
          .attr("height", 18) 
          .attr("fill", color)
          .attr("stroke", "black")
          .attr("stroke-width", 0.5);

         legendGroup.append("text")
          .attr("x", 24)
          .attr("y", currentY + 9) 
          .attr("dy", ".35em") 
          .attr("text-anchor", "start")
          .style("font-size","12px")
          .text(label);

          currentY += itemHeight + itemSpacing; 
      });
    });
  }
 

          const smargin = {top: 20, right: 20, bottom: 30, left: 40}; 
          createLegend(colorMap, uniqueDirIds, ["average_flow", "average_ons", "average_offs"], smargin);
 
          //selectableElements = points;
    }
        // Create the chart by adding an svg to the div with the id 
        // specified by the selector using the given data
function chart(selector, data) {
    createlinechart(selector, data, 'Ashmont')
        
  
    
  
      //svg.call(brush);
  
      // Highlight points when brushed
      function brush(g) {
        const brush = d3.brush()
          .on("start brush", highlight)
          .on("end", brushEnd)
          .extent([
            [-margin.left, -margin.bottom],
            [width + margin.right, height + margin.top]
          ]);
  
        ourBrush = brush;
  
        g.call(brush); // Adds the brush to this element
  
        // Highlight the selected circles.
        function highlight() {
          if (d3.event.selection === null) return;
          const [
            [x0, y0],
            [x1, y1]
          ] = d3.event.selection;
          points.classed("selected", d =>
            x0 <= X(d) && X(d) <= x1 && y0 <= Y(d) && Y(d) <= y1
          );
  
          // Get the name of our dispatcher's event
          let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
  
          // Let other charts know
          dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
        }
        
        function brushEnd() {
          // We don't want an infinite recursion
          if (d3.event.sourceEvent.type != "end") {
            d3.select(this).call(brush.move, null);
          }
        }
      }
  
      return chart;
    }
  
    // The x-accessor from the datum
    function X(d) {
      return xScale(xValue(d));
    }
  
    // The y-accessor from the datum
    function Y(d) {
      return yScale(yValue(d));
    }
  
    chart.margin = function (_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };
  
    chart.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };
  
    chart.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };
  
    chart.x = function (_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };
  
    chart.y = function (_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };
  
    chart.xLabel = function (_) {
      if (!arguments.length) return xLabelText;
      xLabelText = _;
      return chart;
    };
  
    chart.yLabel = function (_) {
      if (!arguments.length) return yLabelText;
      yLabelText = _;
      return chart;
    };
  
    chart.yLabelOffset = function (_) {
      if (!arguments.length) return yLabelOffsetPx;
      yLabelOffsetPx = _;
      return chart;
    };
  
    // Gets or sets the dispatcher we use for selection events
    chart.selectionDispatcher = function (_) {
      if (!arguments.length) return dispatcher;
      dispatcher = _;
      return chart;
    };
  
    // Given selected data from another visualization 
    // select the relevant elements here (linking)
    chart.updateSelection = function (selectedData) {
        stopn = selectedData[0].stop_name;
        //alert(stopn);
      if (!arguments.length) return;
      //alert(stopn);
      createlinechart("#linechart", olddata, stopn);
  
      // Select an element if its datum was selected
      selectableElements.classed("selected", d => {
        return selectedData.includes(d)
      });
    };
  
    return chart;
  }