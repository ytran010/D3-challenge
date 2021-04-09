var svgWidth = 990;
var svgHeight = 600;

var margin = {
  top:20,
  right: 90,
  bottom: 85,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderxAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderyAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)

    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d=> newYScale(d[chosenYAxis]))
  console.log(chosenXAxis)
  console.log(chosenYAxis)

  return circlesGroup;
}

function renderStateAbbr(stateAbbr, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis){
  stateAbbr.transition()
    .duration(1000)
    .attr("x", d=> xLinearScale(d[chosenXAxis]))
    .attr("y", d=> yLinearScale(d[chosenYAxis]))

    return stateAbbr
}
// function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

//   circlesGroup.transition()
//     .duration(1000)

//     .attr("cy", d => newYScale(d[chosenYAxis]))
//     // .attr("cy", d=> newYScale(d[chosenYAxis]))
//   console.log(chosenYAxis)
//   // console.log(chosenYAxis)

//   return circlesGroup;
// }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateAbbr) {

  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xlabel = "Poverty: ";
  }
  else if(chosenXAxis === "age") {
    xlabel = "Age: ";
  } else{
    xlabel = "Household Income: "
  }

  if (chosenYAxis === "healthcare") {
    ylabel = "Lacks healthcare: "
  } else if(chosenYAxis === "smokes"){
    ylabel = "Smokes: "
  } else{
    ylabel = "Obesity: "
  }
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([10, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}%`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(stateData, error) {
    console.log(stateData)
  if (error) throw error;

  // parse data
    stateData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.smoke = +data.smoke;
    data.obese = +data.obese
    // data.healthcare = +data.healthcare;
    data.healthcare = +data.healthcare;
    // data.healthcareHigh = +data.healthcareHigh;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(stateData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(stateData, chosenYAxis);

  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(stateData, d => d.healthcare)])
  //   .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, ${height}`)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "pink")
    .attr("opacity", ".5")
    .classed("stateCircle", true);

  
    // .text(stateData.abbr)
    // .append("text")
    // // .text(function(d){
    // //   return radiusScale(5)
    // // })
    // // .attr("dx", function(d){return -20})
    // .text(function(d){
    //   return d.abbr
    // })
  
  var stateAbbr = circlesGroup
    .exit()
    .data(stateData)
    .enter()
    .append("text")
    .attr("x", d=> xLinearScale(d[chosenXAxis]))
    .attr("y", d=> yLinearScale(d[chosenYAxis]))
    .text(function(d){
      return d.abbr
    })
    .classed("stateText", true)

  // var textCircle = circlesGroup.append("text")
  //   // .attr("dx", function(d){return -20})
  //   .text(function(d){
  //     return d.abbr
  //   })
    // .attr({
    //   "text-anchor": "middle",
    //   "font-size": function(d) {
    //     return d.r / ((d.r * 10) / 100);
    //   },
    //   "dy": function(d) {
    //     return d.r / ((d.r * 25) / 100);
    //   }
    // });
    // .attr("fill", "black")
    

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageMedianLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 60)
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");

  var ylabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)")

  // append y axis
  var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 0 - 80)
    .attr("x", 0 - ((height - 120)/ 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed("active", true)
    .attr("value", "healthcare")
    .text("Lacks Healthcare (%)");

  var obeseLabel = ylabelsGroup.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - ((height - 120)/ 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", 0 - 100)
    .attr("x", 0 - ((height-120)/ 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  //   var healthcareLabel = labelsGroup.append("text")
  // .attr("x", 20)
  // .attr("y", 0)
  // .attr("value", "healthcare") // value to grab for event listener
  // .classed("active", true)
  // .text("Lacks healthcare %");

  // updateToolTip function above csv import
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateAbbr);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        console.log(chosenXAxis)

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);
        // console.log(xLinearScale)
        // updates x axis with transition
        xAxis = renderxAxes(xLinearScale, xAxis);
        
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis, stateAbbr); 

        stateAbbr = renderStateAbbr(stateAbbr, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)
    
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateAbbr);
        
        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          ageMedianLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if(chosenXAxis === "income"){
          ageMedianLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          ageMedianLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        }
      
  });

  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // console.log("running chart group")
      // get value of selection
      var value = d3.select(this).attr("value");
    if (value !== chosenYAxis){
        chosenYAxis = value;
        // console.log(chosenYAxis)
        console.log(chosenYAxis)

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(stateData, chosenYAxis);

        // updates x axis with transition
        yAxis = renderyAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis, stateAbbr);

        stateAbbr = renderStateAbbr(stateAbbr, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, stateAbbr);

        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        } else if (chosenYAxis === "obesity"){
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true)
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
      
  });
}).catch(function(error) {
  console.log(error);
});
