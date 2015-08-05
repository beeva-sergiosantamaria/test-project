/**
 * Created by sergiosantamaria on 16/07/15.
 */
angular.module('testProjectApp')

.directive('radarInteractive', function(radarData) {
  return {
    restrict: 'EA',
    scope: {},
    link: function() {

      var directiveConf = {
        //'boxWidth': window.innerWidth,
        'boxWidth': 1500,
        //'boxHeight': window.innerHeight,
        'boxHeight': 1500,
        'tooltip': '',
        'top': 250,
        'left': 300,
        'nodeActive': false,
        'radar_arcs' : ['Hold', 'Assess', 'Trial', 'Adopt'],
        'new_positions': []
      }

      var radius = directiveConf['boxWidth']/3;
      var medRadius = radius/2;
      var Nniveles = directiveConf.radar_arcs.length;

      radarData.then(function(data){
        console.log(data);
          _.each(data, function(value){
            _.each(value.items, function(val){
              createNodes(val,value.left,value.top, value.color, value.colorover);
            })
          })
        });

      document.getElementById("chart").style.height = window.innerHeight + "px";
      document.getElementById("chart").style.width = window.innerWidth + "px";
      document.getElementById("chart").style.backgroundColor = "beige";

      var box = d3.select('#chart')
        .append('svg')
        .attr('class', 'box')
        .attr('width', radius)
        .attr('height', radius)

      directiveConf['tooltip'] = box.append('text')
        .style('opacity', 1)
        .style('font-family', 'sans-serif')
        .style('font-size', '13px');



      _.each(directiveConf.radar_arcs, function(d,i){
        drawRadarPanel(d, i, Nniveles );
      })

      //for ( var a= 0; a<5; a++){
      //  drawRadarPanel(radius, a);
      //}

   function createNodes(datos, top, left, color, colorOver){
       var rehubicacion = 300-medRadius;
        console.log(datos, top, left, color, colorOver);
        var drag = d3.behavior.drag()
          .on('dragstart', function() {
            circle.style('fill', d3.rgb(41, 58, 82));

            directiveConf['tooltip']
              .transition(200)
              .style('opacity', 0);

            console.log(circle[0][0].attributes.cx.value+' - '+circle[0][0].attributes.cy.value);
            console.log(circle);
          })
          .on('drag', function() {
            circle.attr('cx', d3.event.x)
            .attr('cy', d3.event.y); })
          .on('dragend', function() {
            console.log(circle[0][0].attributes);
            circle.style('fill', d3.rgb(191, 126, 48));
            directiveConf['nodeActive'] = true;
            console.log(circle[0][0].attributes.cx.value+' - '+circle[0][0].attributes.cy.value );
            directiveConf['new_positions']
              .push({
                "name": circle[0][0].attributes.nombre.nodeValue,
                "pc": {
                  "r": circle[0][0].attributes.cx.value,
                  "t": circle[0][0].attributes.cy.value },
                "movement": "c" })
            console.log(directiveConf['new_positions']);
          });

        var circle = box.append('svg:circle')
          .attr('class', 'draggableCircle')
          //.attr('cx', datos.pc.r+(directiveConf.left - left))
          .attr('cx', datos.pc.r-rehubicacion)
          //.attr('cy', datos.pc.t+(directiveConf.top/2 + top))
          .attr('cy', datos.pc.t-rehubicacion)
          .attr('r', 5)
          .attr('nombre', datos.name)
          .attr('color', color)
          .attr('colorover', colorOver)
          //.attr('tipo', datos.tipo)
          .text( datos.name )
          .call(drag)
          .style('fill', color);

        box.selectAll(".draggableCircle")
          .on("mouseover", function() {
            directiveConf['nodeActive']=false;
            directiveConf['tooltip']
              .attr('x', parseInt($(this).attr('cx'))+15)
              .attr('y', $(this).attr('cy'))
              .attr("font-weight", "bold")
              .text($(this).attr('nombre'))
              .transition(200)
              .style('opacity', 1);

            d3.select(this)
              .style('fill',$(this).attr('colorover'));
          })
          .on("mouseout", function(d, i) {
            if(!directiveConf['nodeActive']){
              directiveConf['tooltip']
                .transition(200)
                .style('opacity', 0);
              d3.select(this)
                .style("fill",$(this).attr('color'));
            }
          })
      }
      //setInterval(function(){
      //  box.selectAll(".draggableCircle")
      //    .transition()
      //    .duration(2000)
      //    .attr("cx", function(d,i){ return Math.floor((Math.random() * 600) + 10); })
      //    //.attr("cx", function(d,i){ return +d3.selectAll(".draggableCircle")[0][i].cy.animVal.value - 5 })
      //    .attr("cy", function(d,i){ return Math.floor((Math.random() * 600) + 10); })
      //    //.attr("cy", function(d,i){ return +d3.selectAll(".draggableCircle")[0][i].cy.animVal.value - 5 });
      //}, 5000);

   function drawRadarPanel(cuadrantes, nivel, Nniveles){
        box.append('svg:circle').attr({
          cx: radius/2,
          cy: radius/2,
          r: (medRadius/Nniveles)*nivel,
          class: 'serctorCircles',
          fill: "transparent",
          stroke: d3.rgb(90, 90, 90)
        });
       box.append('text')
         .attr('x', medRadius)
         .attr('y', ((medRadius/Nniveles)*nivel)+10)
         .attr("font-weight", "bold")
         .text( cuadrantes )
         .style('opacity', 1)
         .style('font-family', 'sans-serif')
         .style('font-size', '13px');


        box.append("line")
          .attr("x1", 0)
          .attr("y1", radius/2)
          .attr("x2", radius)
          .attr("y2", radius/2)
          .attr("stroke-width", 2)
          .attr("stroke", d3.rgb(90, 90, 90));
        box.append("line")
          .attr("x1", radius/2)
          .attr("y1", 0)
          .attr("x2", radius/2)
          .attr("y2", radius)
          .attr("stroke-width", 2)
          .attr("stroke", d3.rgb(90, 90, 90));

        var circleCenter = box.append('svg:circle')
          .attr('class', 'circleCenterFixed')
          .attr('cx', radius/2)
          .attr('cy', radius/2)
          .attr('r', 5)
          .style('fill', d3.rgb(76, 76, 76));
      }
    }
  }
})

.directive('backImg', function(){
  return function(scope, element, attrs){
    var url = attrs.backImg;
    var heigth = window.innerHeight;
    var width = window.innerWidth;
    element.css({
      'background-image': 'url(images/' + url +')',
      'background-size' : 'cover',
      'width': width,
      'height': heigth
    });
  };
});
