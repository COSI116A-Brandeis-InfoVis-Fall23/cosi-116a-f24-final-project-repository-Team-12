// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {
  //these code is cited from visualization.js of homework4 brushing&linking
  // Load the data from a json file (you can make these using
  // JSON.stringify(YOUR_OBJECT), just remove the surrounding "")
  d3.csv("data/MBTAridership.csv", (data) => {

    // General event type for selections, used by d3-dispatch
    // https://github.com/d3/d3-dispatch
    const dispatchString = "selectionUpdated";

    // Create a barchart given x and y attributes, labels, offsets; 
    // a dispatcher (d3-dispatch) for selection events; 
    // a div id selector to put our svg in; and the data to use.
    let bcStationflow= barchart()
      .x(d => d.average_flow)
      .xLabel("Average Flow/per person")
      .y(d => d.stop_name)
      .yLabel("Stop name")
      .yLabelOffset(150)
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#barchart", data);

    // Create a line chart given x and y attributes, labels, offsets; 
    // a dispatcher (d3-dispatch) for selection events; 
    // a div id selector to put our svg in; and the data to use.
    /*let lcYearPoverty = linechart()
      .x(d => d.year)
      .xLabel("YEAR")
      .y(d => d.poverty)
      .yLabel("POVERTY RATE")
      .yLabelOffset(40)
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#linechart", data);

    // Create a table given the following: 
    // a dispatcher (d3-dispatch) for selection events; 
    // a div id selector to put our table in; and the data to use.
    let tableData = table()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#table", data);


    // When the line chart selection is updated via brushing, 
    // tell the scatterplot to update it's selection (linking)
    // tell the table to update it's selection (linking)
    lcYearPoverty.selectionDispatcher().on(dispatchString, function(selectedData) {
      spUnemployMurder.updateSelection(selectedData);
      // ADD CODE TO HAVE TABLE UPDATE ITS SELECTION AS WELL
      tableData.updateSelection(selectedData);
    });

    // When the scatterplot selection is updated via brushing, 
    // tell the line chart to update it's selection (linking)
    // tell the table to update it's selection (linking)
    spUnemployMurder.selectionDispatcher().on(dispatchString, function(selectedData) {
      lcYearPoverty.updateSelection(selectedData);
      // ADD CODE TO HAVE TABLE UPDATE ITS SELECTION AS WELL
      tableData.updateSelection(selectedData);
    });

    // When the table is updated via brushing, tell the line chart and scatterplot
    // YOUR CODE HERE
    tableData.selectionDispatcher().on(dispatchString, function(selectedData) {//use varible selectedData to send and receive the change of selected area
      spUnemployMurder.updateSelection(selectedData);
      lcYearPoverty.updateSelection(selectedData);
    });*/
  });
  //console.log("Hello, world!");

})());