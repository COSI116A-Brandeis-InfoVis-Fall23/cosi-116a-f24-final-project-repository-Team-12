/* global D3 */

// Initialize a mbta map. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
// the stations on the map can be selected, and link to the line, bar/table charts
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
      width = 1500 - margin.left - margin.right,
      height = 2250 - margin.top - margin.bottom,
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
      tooltip,
      dispatcher;

  
    // Create the chart by adding an svg to the div with the id 
    // specified by the selector using the given data
    function chart(selector, data, intooltip) {
      //alert("aaa");
      tooltip = intooltip;

      //get the map from the svg file
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
        svg = d3.select(selector).node().appendChild(svgDoc.documentElement);
        svg= d3.select(svg)
                .classed("text-unselectable", true);
      })
      .catch(error => {
            console.error('Error loading SVG:', error);
      });

      //Define scales
      xScale
        .domain(d3.map(data, xValue).keys())
        .rangeRound([0, width]);
      yScale
        .domain([
          d3.min(data, d => yValue(d)),
          d3.max(data, d => yValue(d))
        ])
        .rangeRound([height, 0]);

      //define threshold for total
      threshold1 = 1000000;
      threshold2 = 2000000;
      threshold3 = 4000000;

      setTimeout(function() { 
        //find stops on the svg map
        data.forEach(d => {
           let tempc = d3.select("#" + xValue(d));           
           if(tempc.size()>0&&tempc.attr("fill")===null){

               let tcolor,tempr=20;
               //give the circles of the stops different clolors and size base on the flow amount
               if (yValue(d) > threshold3) {
                   tempr =35;
               }else if (yValue(d)>threshold2){
                   tcolor = "darkgray";
                   tempr = 25;
                 } else if (yValue(d) > threshold1) {
                   tcolor = 'gray';
                   tempr = 20;
                 } else {
                   tcolor = 'gainsboro';
                   tempr = 15;
                 }

               tempc.attr("class","point mbtapoint");
               tempc.attr("r",tempr);
               //tempc.attr("fill",tcolor);
               
               tempc.datum(d);
            }         
          });
          //create legend
          let lengendData = [
              { label: "Low ( < 1M )", r: 15 },
              { label: "Medium(1M-2M)", r: 20 },
              { label: "High (2M-4M)", r: 25 },
              { label: "Very High(>4M)", r: 35 }
          ];
          let legend = svg.append("g")
                  .attr("transform", "translate(" + (0) + "," + (height+35) + ")");
          //draw circle
          legend.selectAll("circle")
                .data(lengendData)
                .enter()
                .append("circle")
                .attr("cx", (d,i)=> i * 320+60)
                .attr("cy", 0)
                .attr("r", d => d.r)
                .attr("fill", "gainsboro")
                .attr("stroke", "black")
                .attr("stroke-width", "2.5px");
          //add texts(label)
          legend.selectAll("text")
                .data(lengendData)
                .enter()
                .append("text")
                .attr("x", (d,i)=> i * 320+d.r+65)
                .attr("y", 5)
                .attr("font-size", "30px")
                .attr("fill","black")
                .text(d => d.label);

          points = svg.selectAll(".mbtapoint");
          selectableElements = points;

          svg.call(brush);
         
         
        }, 500);

      // Highlight points when brushed
      function brush(g) {
        const brush = d3.brush()
          .on("start brush", highlight)
          .on("end", brushEnd)
          .extent([
            [-5,-6],
            [1500,2300]  
            //[-margin.left, -margin.bottom],
            //[width + margin.right, height + margin.top]
          ]);

        ourBrush = brush;
  
        g.call(brush); // Adds the brush to this element
  
        // Highlight the selected circles.
        function highlight() {
          if (d3.event.selection === null) return;
          //get brush selection's position
          var [
            [x0, y0],
            [x1, y1]
          ] = d3.event.selection;
          
          //transform brush position to absolute position
          var svgRect = svg.node().getBoundingClientRect();
          var svgTransform = svg.node().getCTM();
          //calculate the absolute position
          x0 = x0*svgTransform.a +svgRect.left;
          y0 = y0*svgTransform.d +svgRect.top+svgTransform.f;
          x1 = x1*svgTransform.a +svgRect.left;
          y1 = y1*svgTransform.d +svgRect.top+svgTransform.f;

          points.each(function(d){
            let curobj= d3.select(this);
            let x=X(this);
            let y=Y(this);
            
            let  flag = (x0 <= x && x <= x1 && y0 <= y && y<= y1);
            curobj.classed("selected",flag);

          });
  
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
    function X(cobj) {
      var temprect= cobj.getBoundingClientRect();
       return (temprect.left);
   }
 
   // The y-accessor from the datum
   function Y(cobj) {
       var temprect= cobj.getBoundingClientRect();
       return (temprect.top);
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
  
      // Select an element if its datum was selected
      if (selectedData.length==0) return;

      selectableElements.classed("selected", d => {
           var flag= false;
           selectedData.forEach(function(item){
              if(item.parent_station==d.parent_station){
                flag=true;
              }
           });
           return flag;
        });
        //return selectedData.includes(d)
  
    }
  
    return chart;
  }