/* global D3 */

// Initialize a line chart. Modeled after Mike Bostock's
// This chart shows the on/off flow of different time period for the stations.
// x-axis represent the time period, y-axis represent the flows. The positive half-axis of the y-axis represents the total_ons, and the negative half-axis of the y-axis represents the total_offs.
// The stations/stops brushed on the mbtamap will appear/link on the linechart, when you move the mouse over the lines, it will highlight and show show the lines(areas between the two lines).
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function linechart() {

  // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let margin = {
      top: 30,
      left: 70,
      right: 30,
      bottom: 70
    },
    svg,
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    xValue = d => d[0],
    yValue = d => d[1],
    xLabelText = "",
    yLabelText = "",
    yLabelOffsetPx = 0,
    xScale = d3.scaleBand(),
    yScaleup = d3.scaleLinear(),
    yScaledown = d3.scaleLinear(),
    ourBrush = null,
    selectableElements = d3.select(null),
    dispatcher,
    olddata,
    tooltip;
  
  //create the linechart base on total ons/offs of every stop
  function createlinechart(selector, data, sdata){
      olddata=data;
      //filter the data to get data of selected stations
      data = data.filter(d=>
                 sdata.some(Item => Item.parent_station === d.parent_station)
              )
              .sort((a, b) => a['time_period_id'].localeCompare(b['time_period_id']));
          
      //clear the old chart(old selection)
      svg = d3.select(selector);
      if(svg.selectAll("*").size()>0){
          svg.selectAll("*").remove();
      }

      //create new svg(chart) base on new selection
      svg =svg.append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
            .classed("svg-content", true);
    
      svg = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
      //set chart's caption/title
      svg.append("text")
            .attr("x", width/2) //set it middle
            .attr("y", -20) 
            .attr("text-anchor", "middle") // set text middle
            .attr("dominant-baseline", "hanging") 
            .attr("font-size", "16px") 
            .attr("font-family","sans-serif")
            .attr("font-weight", "bold") 
            .text("Details of selected stations total ons and offs");  
        
      //Define scales
      xScale
          .domain(data.map(d=>d.time_period_name))
          .range([0, width]);
    
      //set the y scales upside with the total_ons data of the station
      yScaleup
          .domain([
            0,
            d3.max(data, d => Math.max(parseInt(d.total_ons)))
          ])
          .nice()
          .rangeRound([height/2,0]);
        
      //set the x scales below with the total_offs data of the station
      yScaledown
          .domain([
            0,
            d3.max(data, d => Math.max(parseInt(d.total_offs)))
          ])
          .nice()
          .rangeRound([height/2,height]);
    
    
        // X axis
      let xAxis = svg.append("g")
            .attr("transform", "translate(0," + (height/2) + ")")
            .call(d3.axisBottom(xScale));
            
        // Put X axis tick labels at an angle
      xAxis.selectAll("text") 
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-10)")
            .style("font-family","sans-serif")
            .style("fill", "black")
            .style("font-size","12px");
           
            
        // X axis label
      xAxis.append("text")        
            .attr("class", "axisLabel")
            .attr("transform", "translate(" + (width - 50) + ",-10)")
            .text(xLabelText);
  
        // Y axis and label
      let yAxisup = svg.append("g")
            .call(d3.axisLeft(yScaleup))
            .selectAll("text") 
            .style("text-anchor", "end")
            //.attr("transform", "rotate(-90)")
            .style("font-family","sans-serif")
            .style("fill", "black")
            .style("font-size","12px")
            .attr("y",5);
      let yAxisdown = svg.append("g")
            .call(d3.axisLeft(yScaledown))
            .selectAll("text") 
            .style("text-anchor", "end")
            //.attr("transform", "rotate(-90)")
            .style("font-family","sans-serif")
            .style("fill", "black")
            .style("font-size","12px")
            .attr("y",5); 
            //.text(yLabelText);
     
      //get all the dir
      let uniqueStops = [...new Set(data.map(d => d.parent_station))];
      let uniqueRoutes = [...new Set(data.map(d => d.route_id))];
      let uniqueDirIds = [...new Set(data.map(d => d.dir_id))];

      //create a colormap for different directions
      let colorMap = {
            "NB": "#779043",
            "EB": "#3b6291",              
            "WB": "#76b7b2",
            "SB": "#943c39",
      };
         
      //draw the lines and points(circles) for the line chart
      function plotLines(data) {
            //go through every stops
            uniqueStops.forEach(stop => {
              //go through every routes
             uniqueRoutes.forEach(routeid=>{
              // go through every directions
              uniqueDirIds.forEach(dirId => {
                var linegraph = svg.append("g")
                            .classed("linepoints", true);
                //get the data of the certain dirctions and route of the station and sort them by time period
                let filteredData = data.filter(d => d.parent_station === stop && d.route_id=== routeid &&d.dir_id === dirId)
                      .sort((a, b) => a['time_period_id'].localeCompare(b['time_period_id']));
                //create a range for the colors
                let colorRange = colorMap[dirId];
                //create line
                if(filteredData.length>0){
                  //create line position data for upside of the y axis
                  var lineup = d3.line()
                                       .x(d => xScale(d.time_period_name))
                                       .y(d => yScaleup(parseInt(d.total_ons)))
                                       .curve(d3.curveMonotoneX); 
                  //create line position data for below the y axis
                  var linedown =d3.line()
                                       .x(d => xScale(d.time_period_name))  
                                       .y(d => yScaledown(parseInt(d.total_offs)))
                                       .curve(d3.curveMonotoneX);
                  //create area position data for upside of the y axis
                  var areaOns = d3.area()
                                       .x(d => xScale(d.time_period_name))
                                       .y0(d => yScaleup(0))
                                       .y1(d => yScaleup(parseInt(d.total_ons)))
                                       .curve(d3.curveMonotoneX);
                  //create area position data below the y axis
                  var areaOffs = d3.area()
                                       .x(d => xScale(d.time_period_name))
                                       .y0(d => yScaledown(parseInt(d.total_offs)))
                                       .y1(d => yScaledown(0))
                                       .curve(d3.curveMonotoneX);
                  //draw lines and areas
                  linegraph.append("path")
                      .datum(filteredData) 
                      .classed("linearea", true)
                      .attr("fill", colorRange)
                      .attr("stroke", "none")
                      .attr("d", areaOns)
                      .on("mouseover",function(d){
                         handlemouseover(this,true,d);
                       })                        
                      .on("mouseout",function(){
                         //handlemouseover(this,false,null);
                          tooltip.hide();    
                          var thisparent = d3.select(this.parentNode);
                          thisparent.selectAll(".line").classed("mouseover",false);
                          thisparent.selectAll(".circlepoint").classed("mouseover",false);
                          thisparent.selectAll(".linearea").classed("mouseover",false);
                      });
                  linegraph.append("path")
                      .datum(filteredData) 
                      .classed("linearea", true)
                      .attr("fill", colorRange)
                      .attr("stroke", "none")
                      .attr("d", areaOffs)
                      .on("mouseover",function(d){
                        handlemouseover(this,true,d);
                      })
                     .on("mouseout",function(){
                        tooltip.hide();    
                        var thisparent = d3.select(this.parentNode);
                        thisparent.selectAll(".line").classed("mouseover",false);
                        thisparent.selectAll(".circlepoint").classed("mouseover",false);
                        thisparent.selectAll(".linearea").classed("mouseover",false);
                      });
                  linegraph.append("path")
                      .datum(filteredData) 
                      .classed("line", true)
                      .attr("fill", "none")
                      .attr("stroke", colorRange)
                      .attr("stroke-width", 2)
                      .attr("d", lineup)
                      .on("mouseover",function(d){
                        handlemouseover(this,true,d);
                       })
                      .on("mouseout",function(){
                        //handlemouseout(this,false,null);
                        tooltip.hide();    
                        var thisparent = d3.select(this.parentNode);
                        thisparent.selectAll(".line").classed("mouseover",false);
                        thisparent.selectAll(".circlepoint").classed("mouseover",false);
                        thisparent.selectAll(".linearea").classed("mouseover",false);
                      });
                 
                  linegraph.append("path")
                      .datum(filteredData) 
                      .classed("line", true)
                      .attr("fill", "none")
                      .attr("stroke", colorRange)
                      .attr("stroke-width", 2)
                      .attr("d", linedown)
                      .on("mouseover",function(d){
                        handlemouseover(this,true,d);
                      })
                     .on("mouseout",function(){
                        //handlemouseout(this,false,null);
                        tooltip.hide();    
                        var thisparent = d3.select(this.parentNode);
                        thisparent.selectAll(".line").classed("mouseover",false);
                        thisparent.selectAll(".circlepoint").classed("mouseover",false);
                        thisparent.selectAll(".linearea").classed("mouseover",false);
                      });
                  // draw circles of total_offs data
                  linegraph.selectAll(".circlepoint.up")
                      .data(filteredData)
                      .enter()
                      .append("circle")
                      .attr("class", "circlepoint")
                      .attr("cx", d => xScale(d.time_period_name))
                      .attr("cy", d => yScaleup(parseInt(d.total_ons)))
                      .attr("fill", colorRange);
                      /*.on("mouseover",function(d){
                          tooltip.show(this,d[0].stop_name+" "+d[0].route_name+"["+d[0].dir_id+"]",
                            d.total_ons.localstring());
                      })
                      .on("mouseout",function(){
                        tooltip.hide();
                      });*/

                  // draw circles of total_ons data
                  linegraph.selectAll(".circlepoint.down")
                      .data(filteredData)
                      .enter()
                      .append("circle")
                      .attr("class", "circlepoint")
                      .attr("cx", d => xScale(d.time_period_name))
                      .attr("cy", d => yScaledown(parseInt(d.total_offs)))
                      .attr("r", 3)
                      .attr("fill", colorRange);
                }
              });
             }); 
            });
          }

          //handle mouseover event
          function handlemouseover(curobj,showflag,d){
            if (showflag){
              tooltip.show(curobj,d[0].stop_name+" "+d[0].route_name+"["+d[0].dir_id+"]");
            }else{
              tooltip.hide();
            }
            
            var thisparent = d3.select(curobj.parentNode);
            thisparent.selectAll(".line").classed("mouseover",showflag);
            thisparent.selectAll(".circlepoint").classed("mouseover",showflag);
            thisparent.selectAll(".linearea").classed("mouseover",showflag);
         }

          plotLines(data);
          xAxis.raise();
         
          const svgWidth = +svg.attr("width");
          const svgHeight = +svg.attr("height");

          //this function create a legend
          function createLegend(colorMap,  margin) {
              const itemHeight = 20;
              const itemSpacing = 10;

              legendGroup = svg.append("g")
                  .attr("class", "legend")
                  .attr("transform", `translate(${margin.left}, ${margin.top})`);

              let currentY = 0;
              Object.keys(colorMap).forEach((key,i) => {
                  
                  var colorvalue=colorMap[key];

                  //create a rect for color range of different directions on the chart
                  legendGroup.append("rect")
                      .attr("x", width-60)
                      .attr("y", i*(itemSpacing+itemHeight))
                      .attr("width", 10)
                      .attr("height", itemHeight)
                      .attr("fill", colorvalue)
                      .attr("stroke", "black")
                      .attr("stroke-width", 0.5);
                  legendGroup.append("text")
                      .attr("x", width-46) 
                      .attr("y", i*(itemSpacing + itemHeight)+itemHeight*0.75) 
                      .text(key);
                  
                  
              });
           }

        // use the function to create legend on svg
        const smargin = {top: 20, right: 20, bottom: 30, left: 40}; 
        createLegend(colorMap,  smargin);
      }
      // Create the chart by adding an svg to the div with the id 
      // specified by the selector using the given data

    function chart(selector, data,intooltip) {
        tooltip = intooltip;
      //default selection for stop is Airport
        createlinechart(selector, data, data.filter(d => d.parent_station==='place-aport'));

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
   
    if (!arguments.length) return;
    if (selectedData.length == 0) {
      return;
    }
    //create the new line chart using selectd data
    createlinechart("#linechart", olddata, selectedData);

    // Select an element if its datum was selected
    selectableElements.classed("selected", d => {
      return selectedData.includes(d)
    });
  };

  return chart;
}