// Immediately Invoked Function Expression to limit access to our variables and prevent race conditions
((() => {
  //these code is cited from visualization.js of homework4 brushing&linking
    // Load the data from the csv file (MBTAridershipnew.csv)
    d3.csv("data/MBTAridershipnew.csv", (data) => {
      //calculate the total flows, total ons flow and total offs flow of every stations on the MBTA lines
      const totals = data.reduce((acc, d) => {
      if (!acc[d.stop_name]) {
        acc[d.stop_name] = { sum_ons: 0, sum_offs: 0,total :0 };
      }
      let days = parseInt(d.number_service_days);
      acc[d.stop_name].sum_ons += (parseInt(d.average_ons)*days) || 0; // use || 0 to deal with possible NaN or undefined
      acc[d.stop_name].sum_offs += (parseInt(d.average_offs)*days) || 0; 
      acc[d.stop_name].total += (parseInt(d.average_flow)*days) || 0; 
      return acc;
   }, {});
     
    //then go through the array to get total_flow（total_on + total_off）for every objects
    data.forEach(d => {
      const stopTotals = totals[d.stop_name];
      if (stopTotals) { // make sure there is data in 'total'
        d.sum_ons = stopTotals.sum_ons;
        d.sum_offs = stopTotals.sum_offs;
        d.total = stopTotals.total;
        //handle weekend average flow to make it match weekday which have 9 time period a day
        if (d.day_type_id==="day_type_01"){
          d.average_flow = parseInt(d.average_flow);
        }else{
          d.average_flow = Math.round(parseInt(d.average_flow)/9);//divide average flow by 9 to get rough 1 time period
        }
        
        d.average_ons = parseInt(d.average_ons);
        d.average_offs = parseInt(d.average_offs);
      } else {
        //if there is a station that didn't exist
        d.total = 0; //set 0
      }
    });

    // General event type for selections, used by d3-dispatch
    // https://github.com/d3/d3-dispatch
    const dispatchString = "selectionUpdated";

    let ttip = tooltip()
      ("#tooltip");

    // Create a mbtamap
    let MbtaMap = mbtamap()
      .x(d => d.parent_station)
      .xLabel("station")
      .y(d => d.total)
      .yLabel("flow")
      .yLabelOffset(40)
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#mbtamap", data, ttip);
    
    // Create a barchart given x and y attributes, labels, offsets; 
    // a dispatcher (d3-dispatch) for selection events; 
    // a div id selector to put our svg in; and the data to use.
    let bcStationflow= barchart()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#barchart", data, ttip);

    let lcTimeFlow = linechart()
      .x(d => d.time_period_name)
      .xLabel("time period")
      .y(d => d.total_ons)
      .yLabel("flow")
      .yLabelOffset(40)
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#linechart", data, ttip);

    
      setTimeout(function() {
        //alert(mmMap.selectionDispatcher());
        MbtaMap.selectionDispatcher().on(dispatchString, function(selectedData) {
          bcStationflow.updateSelection(selectedData);
          // ADD CODE TO HAVE barchart UPDATE ITS SELECTION AS WELL
          lcTimeFlow.updateSelection(selectedData);
        });

        // When the line chart selection is updated via selection
        bcStationflow.selectionDispatcher().on(dispatchString, function(selectedData) {
          MbtaMap.updateSelection(selectedData);
        // ADD CODE TO HAVE TABLE UPDATE ITS SELECTION AS WELL
          lcTimeFlow.updateSelection(selectedData);
        });
      }  , 500);
  });

})());