/* global D3 */

// Initialize a mbta map. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
// the stations on the map can be selected, and link to the line, bar charts
// MBTA_Rapid_Transit.svg is usd
function mbtamap() {

    // Based on Mike Bostock's margin convention
    // https://bl.ocks.org/mbostock/3019563
    let margin = {
        top: 60,
        left: 50,
        right: 30,
        bottom: 35
      },
      width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      xValue = d => d[0],
      yValue = d => d[1],
      xLabelText = "",
      yLabelText = "",
      yLabelOffsetPx = 0,
      xScale = d3.scalePoint(),
      yScale = d3.scaleLinear(),
      ourBrush = null,
      selectableElements = d3.select(null),
      svg,
      threshold1,
      threshold2,
      dispatcher;

  
    // Create the chart by adding an svg to the div with the id 
    // specified by the selector using the given data
    function chart(selector, data) {
        //alert("aaa");
        
        fetch('data/MBTA_Rapid_Transit.svg')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(data => {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(data, 'image/svg+xml');
          /*const circle = svgDoc.getElementById('place-sull');
          if (circle && circle.tagName === 'circle') {
            //alert(circle);
            const circleSelection = d3.select(circle);
            //alert(circleSelection.node().outerHTML);
            circleSelection.data([data[0]]);
            circleSelection.attr('fill', "green");
          }*/
          
          svg = d3.select(selector).node().appendChild(svgDoc.documentElement);
          svg= d3.select(svg);
          //svg.attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
          
          
     })
     .catch(error => {
         
          console.error('Error loading SVG:', error);
     });
      /*svg = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      //alert("aaa2");*/
      //alert(svg.html());

      //Define scales
      xScale
        .domain(d3.map(data, xValue).keys())
        .rangeRound([0, width]);
  
      minY = d3.min(data, d => yValue(d));
      maxY = d3.max(data, d => yValue(d));

      threshold1 = minY + (maxY - minY) / 3;
      threshold2 = minY + 2 * (maxY - minY) / 3;  
      yScale
        .domain([
          d3.min(data, d => yValue(d)),
          d3.max(data, d => yValue(d))
        ])
        .rangeRound([height, 0]);

      setTimeout(function() {
            /*var nc = d3.select('#place-sull');
            alert(nc.size());
            if (nc.size()>0) {
                alert(nc.size());
                alert(nc.node().outerHTML);
           
                }else{
             alert("3333");
             }*/
             data.forEach(d => {
                //alert(xValue(d));      
                //tempc = d3.select("#" + xValue(d));
                        //.data([d]);
                        
                let tempc = d3.select("#" + xValue(d));           
                
                if(tempc.size()>0&&tempc.attr("fill")===null){
                    //tempc.data([d]);
                    //alert(tempc.size()+d.parent_station); 
                    
                    let tcolor;
                    if (yValue(d) > threshold2) {
                        tcolor = 'red';
                      } else if (yValue(d) > threshold1) {
                        tcolor = 'yellow';
                      } else {
                        tcolor = 'green';
                      }
                    //alert(tempc.attr("fill"));
                    tempc.attr("fill",tcolor);
                    tempc.attr("class","point mbtapoint")
                    
                
                   
                    tempc.datum(d);
                    tempc.on("click",selectstop);
                    //alert(JSON.stringify(tempc.datum()));
                    //alert(tempc.datum().stop_name);
    
                }
                
              });
              let points= svg.selectAll(".mbtapoint");
              //alert(points.size());
              //let points = null;
              selectableElements = points;

              //svg.call(brush);
              
              
       }, 500);   
       //alert("stop data installed"); 
       function selectstop(d) {
          
          //alert(d.total);
          svg.selectAll(".selected").classed("selected", false);
          //points.classed("selected", d => d === this);
          //alert("selected beg");
          
          svg.select("#"+d.parent_station).classed("selected", true);
          
          //alert("selected");
          //alert(this);
          // Get the name of our dispatcher's event
          let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

        // Let other charts know
          //alert(svg.selectAll(".selected").data());
          dispatcher.call(dispatchString, svg, svg.selectAll(".selected").data());
        
      }
      // Highlight points when brushed
      function brush(g) {
        const brush = d3.brush()
          .on("start brush", highlight)
          .on("end", brushEnd)
          .extent([
            [-5,-6],
            [1500,1500]  
            //[-margin.left, -margin.bottom],
            //[width + margin.right, height + margin.top]

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
          //alert(x0+" "+y0+"  "+x1+"  "+y1+ " "+JSON.stringify(d3.event));
          points.classed("selected", d =>
            x0 <= X(d) && X(d) <= x1 && y0 <= Y(d) && Y(d) <= y1
          );
  
          // Get the name of our dispatcher's event
          let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
  
          // Let other charts know
          //alert(dispatchString);
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
        alert(xValue(d));
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
      //alert(arguments.length+" "+dispatcher);
      if (!arguments.length) return dispatcher;
      dispatcher = _;
      //alert(dispatcher._);
      return chart;
    };
  
    // Given selected data from another visualization 
    // select the relevant elements here (linking)
    chart.updateSelection = function (selectedData) {
      //alert("upatatembta");
      if (!arguments.length) return;
  
      // Select an element if its datum was selected
      if (selectedData.length==0) return;
      //svg.selectAll(".selected").classed("selected", false);
      //svg.select("#"+selectedData[0].parent_station).classed("selected",true);
      selectableElements.classed("selected", d => {
        //alert(d[0]);
        return selectedData.includes(d)
      });
    };
  
    return chart;
  }