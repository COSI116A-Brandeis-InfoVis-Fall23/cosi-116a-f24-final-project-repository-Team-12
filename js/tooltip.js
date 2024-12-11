/**
 * This function helps to create tooltip which can be shown and hidden
 * @returns 
 */
function tooltip() {

   //create varibles for different lines of the tooltip
    let tpdiv,// the html object for tooltip
        firstline,
        secondline,
        thirdline;

    function tooltipdiv(selector){
        //create tooltip html with classes
        tpdiv = d3.select(selector)
                   .attr("class", "tooltip")       
                   .style("opacity", 0);
        firstline =tpdiv.append("div")
                   .attr("class","tooltip-title")
                   .append("span")
                  .attr("id","firstline");
        secondline =tpdiv.append("div")
                  .append("span")
                  .attr("id","secondline");
        thirdline =tpdiv.append("div")
                  .append("span")
                  .attr("id","thirdline");
        
        return tooltipdiv;
    }
    //show the the three line of tip at curobj
    tooltipdiv.show =function (curobj,ftext,stext,ttext) {
        
        if (curobj!= null) {
            //get the absolute position(ax,ay) of curobj
            var rect = curobj.getBoundingClientRect();
            var ax = rect.left+window.scrollX+rect.width/2;
            var ay = rect.top+window.scrollY;
            //set content for the three lines of tips
            firstline.text(ftext);
            secondline.text(stext);
            thirdline.text(ttext);
            // show tpdiv
            tpdiv.style("left", (ax + 10) + "px")
               .style("top", (ay +2) + "px")             
               .transition()    
               .duration(50)    
               .style("opacity", 1);
        
        }
        
        return tooltipdiv;
    }

    // This function hide the tooltip
    tooltipdiv.hide = function() {
        tpdiv.transition()    
             .duration(500)    
             .style("opacity", 0);
        return tooltipdiv;
    }

    return tooltipdiv;
  }