/* global D3 */

// Initialize a barchart. 
// This barchart/table shows details(saperate by time periods and different date) of averge flow and total flow of the stations/stops
// the y-axis represents the stop name and the x-axis(data under x-axis) is about both average flow(divide by day type) and total flow
// When the mouse is over the the different color rectangles within the bars under "Weekday, Sat, Sun" , it will show the secific name of the line,stop,time period, and average flow through the tooltip
// The stops brushed/selected on the mbtamap will be highlighted/linked
// When the mouse is over the bars under "Total" , it will show the totel flow of the stop/station
/* global D3 */

function barchart() {

  // Based on Mike Bostock's margin convention
  // https://bl.ocks.org/mbostock/3019563
  let ourBrush = null,
    selectableElements = d3.select(null),
    colorFlowScale,
    weekdaytype,
    frHeight =8,
    frWidth = 20,
    maxTotalWidth = 450,
    totalScale,
    tooltip,
    dispatcher;

  // Create the chart by adding an svg to the div with the id 
  // specified by the selector using the given data
  function chart(selector, data,intooltip) {
    tooltip = intooltip;

    //set total bar scale
    totalScale = d3.scaleLinear()
        .domain([
          0,
          d3.max(data, d => d.total)
        ])
        .range([0, maxTotalWidth]);
    //set color scale for average flow
    colorFlowScale= d3.scaleLinear()
        .domain([
          d3.min(data, d => d.average_flow),
          d3.max(data, d => d.average_flow)
        ])
        .range(["lightblue","#118"]);
    //get different daytype from the data
    weekdaytype = [...new Set(data.map(item => item.day_type_id))];
     
    let bchart = d3.select(selector)
      .append("table")
        .classed("text-unselectable", true);// use a style from css to let the table content unselectable
    let heads =[
      {"name":""},
      {"name":"Stop Name"},
      {"name":"Weekday"},
      {"name":"Sat"},
      {"name":"Sun"},
      {"name":"Total"}
    ];
    //set chart header
    bchart.append("thead").append("tr")
          .selectAll('th').data(heads).enter().append('th').text((d) => d.name)
    //sort the data base on the total amount
    let tdata= data.sort((a, b) => b.total - a.total);
    //divid the data by parent station
    let stopdata = tdata.reduce((acc, item) => {
      const key = item.parent_station;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    let tbody = bchart.append("tbody");
    //go through every stops
    Object.keys(stopdata).forEach(key => {
        let sdata = stopdata[key];
        let tr = tbody.append("tr")
                .classed("stoprow", true);
        setstopinfo(sdata,tr);
        tr.datum(sdata[0]);
    });
    bchart.selectAll(".stoprow")
      .on("mouseover", tmouseover)//create function for action mouseover
      .on("mouseout", tmouseout)//create function for action muoseout
      .on("mouseup", tmouseup)//create function for action muoseup
      .on("mousedown", tmousedown);//create function for action muosedown

    //create chart for every stops
    function setstopinfo(data,curtr){
      //find all the route id for the current stop
      var routeIds = [...new Set(data.map(item => item.route_id))];
      var td = curtr.append("td")
                     .style("text-align", "right");
                    
      //set route info 
      var tempsvg= td.append("svg").attr("width",45)
                       .attr("height",20);
      //console.log(routeIds);
      //use circles with different colors to show different routes
      tempsvg.selectAll("circle")
               .data(routeIds)
               .enter()
               .append("circle")
               .attr("cx", (d, i) => i * 8+8)
               .attr("cy", (d, i) => 15)
               .attr("r", 3)
               .attr("fill",d=>d.toLowerCase());
      
      //show the stop name
      curtr.append("td")
           .text(data[0].stop_name)
           .attr("font-weight","bold");
      
      //create svg for different daytype
      weekdaytype.forEach((daytype,idx)=> { 
        var td =curtr.append("td");
        var tsvg = td.append("svg")                     
                    .attr("height", frHeight*Object.keys(routeIds).length*2); 
        routeIds.forEach((routeId,ridx)=>{
          //get data for every route_id
          var rdata = data.filter(d=>d.route_id==routeId);
          //get data for every day_type_id
          var daydata = rdata.filter(item=>item.day_type_id==daytype);
          //get data for every direction and route_id
          var dirdata = daydata.reduce((acc, item) => {
            const key = item.dir_id;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(item);
            return acc;
          }, {});
          //go through every direction to draw rectangles of different color for different time period
          Object.keys(dirdata).forEach((dir,i)=>{
            //get the absolute position(width and height) for the small rectangles for the different time/directions of the stops
            var tg = tsvg.append("g")
               .attr("transform", "translate(0,"+frHeight*(i+ridx*Object.keys(dirdata).length)+")");
            var dirdaydata = dirdata[dir];
            tsvg.attr("width", frWidth*dirdaydata.length);
            //sort the data with time priod id
            dirdaydata.sort((a, b) => a.time_period_id.localeCompare(b.time_period_id)); 
     
            //create rect for average flow(using width, height and dirdaydata get above)
            tg.selectAll("rect")
                      .data(dirdaydata)
                      .enter()
                      .append("rect")
                      .classed("flowrect",true)
                      .attr("x", (d,ti)=>ti*frWidth)
                      .attr("y", 0)  
                      .attr("fill",d => colorFlowScale(d.average_flow))
                      .on("mouseover",function(d){//handle mouseover event
                        d3.select(this).classed("mouseover",true);
                        tooltip.show(this,
                           d.route_name+" Direction ["+d.dir_id+"]",
                           "Time Period: "+ d.time_period_name,
                           "Average Flow:"+d.average_flow.toLocaleString());
                      })
                      .on("mouseout",function(){//handle mouseout event
                        d3.select(this).classed("mouseover",false);
                        tooltip.hide();
                      });
          });
        });
      }); 
      //add total bar
      var td= curtr.append("td");
     
      //add rectangels for total
      var rect = td.append("svg")
        .attr("width", maxTotalWidth)
        .attr("height", 30)
        .append("g")
        .attr("transform", "translate(0,5)")
        .append("rect");
      rect.datum(data[0])
        .classed("totalbar",true)
        .attr("x",0)
        .attr("y",0)
        .attr("width",d=> totalScale(d.total))
        .on("mouseover",function(d){//handle mouseover event
          d3.select(this).classed("mouseover",true);
          tooltip.show(this,
               d.stop_name,
               "Total: "+d.total.toLocaleString())
          })
        .on("mouseout",function(d){// handle mouseout event
           d3.select(this).classed("mouseover",false);
           tooltip.hide();
         });
     

    }
    
    let brushing = false;//set brushing flag for brushing operation(when mouseup it is true else false)

    //handle event of action mouseover
    function tmouseover(){
      if (d3.event.selection === null) return;//judge whether something is selected in table
      if (brushing == true){ //in brushing condition, set mouseover selected and selected(make the area selected pink , red for mouseover and selected)
        d3.select(this).classed("selected", true);
        d3.select(this).classed("mouseover selected", true);
        if (brushing){//relate the linecharts and scatterplot if brushing for mouseover area
          let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
          dispatcher.call(dispatchString, this, bchart.selectAll(".selected").data());
        }
      }else{//in not brushing condition, set mouseover(make the area that mouse is over gray)
        d3.select(this).classed("mouseover", true);
      }
    }

    //handle event of action mouseout
    //in mouseout action(the mouse move away from content in table), set mouseover false((make the area backgroud color)
    function tmouseout(){
      if (d3.event.selection === null) return;
      d3.select(this).classed("mouseover", false);
    }

    //this function handle event of action mouseup
    function tmouseup(){
      if (d3.event.selection === null) return;
      brushing = false;//in mouseup action set brushing condition false
    }

    //this function handle event of action mousedown
    function tmousedown(){
      if (d3.event.selection === null) return;
      if (!brushing){
        d3.selectAll('.stoprow').classed("selected",false);//when brushing is false clear the selected areas
      }
      brushing = true;
      //console.log(this);
      d3.select(this).classed("selected", true);
      //console.log(d3.select(this).attr("class"));
      if (brushing){//when  brushing flag is true, let dispatch notify the linechart and scatterpolt to chage the hilighted points
        let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
        dispatcher.call(dispatchString, this, bchart.selectAll("tr.selected").data());
      }
    }
    return chart;
  }

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

    d3.selectAll('.stoprow').classed("selected", d => {
      //console.log(d.ObjectId+ d.stop_name);
      var flag= false;
      selectedData.forEach(function(item){
         if(item.parent_station==d.parent_station){
           //console.log(item.ObjectId+" "+d.ObjectId);
           flag=true;
         }
      });
      return flag;
    });

  }

  return chart;
}