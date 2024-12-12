// This is not been used. 
function init(){
    var width = 680;
    var height = 800;
    var legend = [];
    var pointSize = [];
    var svg = d3.select("#chart").attr("width", width).attr("height", height);

    // Load CSV data
    d3.csv("data/data.csv", function(data) {
        // Set line function
        var line = d3.line()
                    .x(function(d) {
                      return d.x
                    })
                    .y(function(d) {
                      return d.y
                    })
                    .curve(d3.curveMonotoneX);
        
        // Grouped data based on 'line' field
        var links = svg.append("g");
        var points = svg.append("g");
        var wl = svg.append("g");
        
        // Create points group
        points.append("g")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx",function(d){return d.x})
        .attr("cy",function(d){return d.y})
        .attr("r",function(d){return d.size})
        .attr("fill", "#fff")
        .attr("stroke",function(d){return d.color});
        

        // data 
        var pathData = [];
        for(var i=0;i<data.length;i++){
            data[i].size = Number(data[i].size);
            var has = -1;
            for(var j=0;j<pathData.length;j++){
                if(pathData[j].lid == data[i].line){
                    has = j;
                }
            }
            if(has>-1){
                pathData[has].data.push({x:data[i].x,y:data[i].y});
            }else{
                pathData.push({title:data[i].title,lid:data[i].line,color:data[i].color,data:[{x:data[i].x,y:data[i].y}]});
            }
            has = 0;
            for(var m=0;m<pointSize.length;m++){
                if(pointSize[m]==data[i].size){
                    has = 1;
                }
            }
            if(!has && data[i].size){
                pointSize.push(data[i].size);
            }
        }
        
        //draw lines
        for(var i=0;i<pathData.length;i++){
            if(pathData[i].title=="WL"){
                wl.append("path")
                    .attr("fill","none")
                    .attr("stroke",pathData[i].color)
                    .style("stroke-width",5)
                    .attr("d", line(pathData[i].data));
            }else{
                var has = false;
                for(var m=0;m<legend.length;m++){
                    if(legend[m].title==pathData[i].title){
                        has = true;
                    }
                }
                if(!has){
                    legend.push({title:pathData[i].title,color:pathData[i].color});
                }
                links.append("path")
                    .attr("fill","none")
                    .attr("stroke",pathData[i].color)
                    .style("stroke-width",10)
                    .attr("d", line(pathData[i].data));

            }
        }
        
        //draw legand 
        var legItemW = width/2/legend.length;
        svg.append("g")
        .selectAll("text")
        .data(legend)
        .enter()
        .append("text")
        .attr("x", function(d,id) { return id*legItemW+width/4+legItemW/2+20; })
        .attr("y", 25)
        .text(function(d){return d.title});
        svg.append("g")
        .selectAll("rect")
        .data(legend)
        .enter()
        .append("rect")
        .attr("x", function(d,id) { return id*legItemW+width/4+legItemW/2; })
        .attr("y", 11)
        .attr("width",15)
        .attr("height",15)
        .attr("fill",function(d){return d.color;})


        //text
        svg.append("g")
        .append("text")
        .attr("x", width/2)
        .attr("y", height-80)
        .attr("text-anchor","middle")
        .attr("dominant-baseline","middle")
        .text("Size shows average entrles");
        
        //draw cicle examples
        var sizeItemW = width/2/pointSize.length;
        svg.append("g")
        .selectAll("circle")
        .data(pointSize)
        .enter()
        .append("circle")
        .attr("cx",function(d,id){return id*sizeItemW+width/4+sizeItemW/2})
        .attr("cy",height-40)
        .attr("r",function(d){return d})
        .attr("fill", "#fff")
        .attr("stroke","#333");
        svg.append("g")
        .selectAll("text")
        .data(pointSize)
        .enter()
        .append("text")
        .attr("x", function(d,id){return id*sizeItemW+width/4+sizeItemW/2+d+3})
        .attr("y", height-40)
        .attr("dominant-baseline","middle")
        .text(function(d){return d});
    });

}