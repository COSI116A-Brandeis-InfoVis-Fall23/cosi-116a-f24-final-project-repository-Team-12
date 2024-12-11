function treemap() {
    let margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = 1200 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom,
        color = d3.scaleOrdinal(d3.schemeCategory10),
        dispatcher;

    const lowThreshold = 100;   
    const highThreshold = 500;

    const highGroup1 = ["Arlington", "Copley", "Chinatown"];
    const highGroup2 = ["North Quincy", "Park Street", "Harvard Avenue"];

    function chart(selector, data) {
        let stationMap = d3.nest()
            .key(d => d.stop_name)
            .rollup(leaves => d3.mean(leaves, d => +d.average_flow))
            .object(data);

        let highStations = [];
        let avgStations = [];
        let lowStations = [];

        Object.keys(stationMap).forEach(stationName => {
            let avgFlow = stationMap[stationName];
            if (avgFlow < lowThreshold) {
                lowStations.push(stationName);
            } else if (avgFlow > highThreshold) {
                highStations.push(stationName);
            } else {
                avgStations.push(stationName);
            }
        });

        let highChildren = [];
        let group1HighStations = highGroup1.filter(d => highStations.includes(d));
        if (group1HighStations.length > 0) {
            highChildren.push({
                name: "Group 1",
                children: group1HighStations.map(s => ({ name: s, value: 1 }))
            });
        }

        let group2HighStations = highGroup2.filter(d => highStations.includes(d));
        if (group2HighStations.length > 0) {
            highChildren.push({
                name: "Group 2",
                children: group2HighStations.map(s => ({ name: s, value: 1 }))
            });
        }

        let remainingHigh = highStations.filter(s => 
            !highGroup1.includes(s) && !highGroup2.includes(s)
        );
        if (remainingHigh.length > 0) {
            highChildren.push({
                name: "Group 3",
                children: remainingHigh.map(s => ({ name: s, value: 1 }))
            });
        }

        let avgChildren = [];
        if (avgStations.length > 0) {
            avgChildren.push({
                name: "Group 1",
                children: avgStations.map(s => ({ name: s, value: 1 }))
            });
        }

        let lowChildren = [];
        if (lowStations.length > 0) {
            lowChildren.push({
                name: "Group 1",
                children: lowStations.map(s => ({ name: s, value: 1 }))
            });
        }

        let rootData = {
            name: "Red Line",
            children: [
                { name: "High", children: highChildren },
                { name: "Average", children: avgChildren },
                { name: "Low", children: lowChildren }
            ]
        };

        let root = d3.hierarchy(rootData)
            .sum(d => d.value ? d.value : 0)
            .sort((a, b) => b.value - a.value);

        const treemapLayout = d3.treemap()
            .size([width, height])
            .paddingInner(1);

        treemapLayout(root);

        const svg = d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const leaves = root.leaves();
        const nodes = svg.selectAll("rect")
            .data(leaves)
            .enter()
            .append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => {
                let categoryNode = d.ancestors().find(a => a.depth === 1);
                return categoryNode ? color(categoryNode.data.name) : "#ccc";
            })
            .attr("stroke", "#fff")
            .attr("class", "treemap-rect")
            .on("click", selectSegment);

        const labels = svg.selectAll(".treemap-text")
            .data(leaves)
            .enter()
            .append("text")
            .attr("class", "treemap-text")
            .attr("x", d => d.x0 + 5)
            .attr("y", d => d.y0 + 15) 
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("pointer-events", "none");

        labels.each(function(d) {
            let categoryNode = d.ancestors().find(a => a.depth === 1);
            let category = categoryNode ? categoryNode.data.name : "";

            // Split station name into words
            let words = d.data.name.split(/\s+/);

            // Print each word on its own line
            // The last word gets a colon appended
            words.forEach((word, i) => {
                let line = i === words.length - 1 ? word + ":" : word;
                d3.select(this).append("tspan")
                    .attr("x", d.x0 + 5)
                    .attr("dy", i === 0 ? "1em" : "1em")
                    .text(line);
            });

            // Print category on a new line after all words
            d3.select(this).append("tspan")
                .attr("x", d.x0 + 5)
                .attr("dy", "1em")
                .text(category);
        });

        chart.selectableElements = nodes;
    }

    function selectSegment(d) {
        d3.selectAll(".treemap-rect").classed("selected", false);
        d3.select(this).classed("selected", true);
        dispatcher.call("selectionUpdated", this, [{ stop_name: d.data.name }]);
    }

    chart.updateSelection = function(selectedData) {
        if (!selectedData || selectedData.length === 0) {
            d3.selectAll(".treemap-rect").classed("selected", false);
            return;
        }

        const selectedStop = selectedData[0].stop_name;
        d3.selectAll(".treemap-rect")
            .classed("selected", d => d.data.name === selectedStop);
    };

    chart.selectionDispatcher = function(_) {
        if (!arguments.length) return dispatcher;
        dispatcher = _;
        return chart;
    };

    return chart;
}
