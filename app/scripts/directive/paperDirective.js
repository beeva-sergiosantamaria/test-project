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
        'boxWidth': 1800,
        //'boxHeight': window.innerHeight,
        'boxHeight': 1800,
        'radarPositions': '',
        'tooltip': ''
      }

      var radius = directiveConf['boxWidth']/3;

      radarData.then(function(data){
        directiveConf['radarPositions'] = data;
        //console.log(data);
        //  _.each(data.nodes, function(value){
        //    createNodes(value);
        //  })
        });

      var box = d3.select('#chart')
        .append('svg')
        .attr('class', 'box')
        .attr('width', radius)
        .attr('height', radius)
        .append('g')
        .attr('transform', 'translate(0,0)');


      var circle = box.append('circle')
        .data(directiveConf['radarPositions'])
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', 10)
        .attr('class', 'draggableCircle')
        .attr('cx', function (d) {
          console.log(d)
          return d.pc.r;
        })
        .attr('cy', function (d) {
          return d.pc.t;
        })
        .attr('nombre', function (d) {
          return d.color;
        })
        .style('fill', d3.rgb(72, 101, 145));

      for ( var a= 0; a<5; a++){
        drawRadarPanel(radius, a);
      }

   function createNodes(datos){
        var drag = d3.behavior.drag()
          .on('dragstart', function() {
            circle.style('fill', d3.rgb(41, 58, 82));

            directiveConf['tooltip']
              .transition(200)
              .style('opacity', 0);

            console.log(circle[0][0].attributes.cx.value+' - '+circle[0][0].attributes.cy.value);
            console.log(circle);
          })
          .on('drag', function() { circle.attr('cx', d3.event.x)
            .attr('cy', d3.event.y); })
          .on('dragend', function() {
            circle.style('fill', d3.rgb(191, 126, 48));
            console.log(circle[0][0].attributes.cx.value+' - '+circle[0][0].attributes.cy.value );
          });

        var circle = box.append('svg:circle')
          .attr('class', 'draggableCircle')
          .attr('cx', datos.pc.r+datos.top)
          .attr('cy', datos.pc.t+datos.left)
          .attr('r', 5)
          .attr('nombre', datos.name)
          //.attr('tipo', datos.tipo)
          .text(  datos.name )
          .call(drag)
          .style('fill', d3.rgb(72, 101, 145));

        box.selectAll(".draggableCircle")
          .on("mouseover", function(d, i) {
            console.log(parseInt($(this).attr('cx'))+15);
            directiveConf['tooltip']
              .attr('x', parseInt($(this).attr('cx'))+15)
              .attr('y', $(this).attr('cy'))
              .attr("font-weight", "bold")
              .text($(this).attr('nombre'))
              .transition(200)
              .style('opacity', 1);

            d3.select(this)
              .style('fill',d3.rgb(41, 58, 82));
          })
          .on("mouseout", function(d, i) {
            directiveConf['tooltip']
              .transition(200)
              .style('opacity', 0);
            d3.select(this)
              .style("fill",d3.rgb(72, 101, 145));
          })
      }

      setInterval(function(){
        console.log(box.selectAll(".draggableCircle"));
       box.selectAll(".draggableCircle")
          .transition()
          .duration(2000)
          .attr("cx",function(d,i){
           console.log(d,i);
           return d.cx.value
         })
          .attr("cy",function(d,i){
           console.log(d,i);
           return d.cy.value
         });
      }, 5000);

   function drawRadarPanel(radio, long){
        box.append('svg:circle').attr({
          cx: radio/2,
          cy: radio/2,
          r: (radio/8)*long,
          class: 'serctorCircles',
          fill: "transparent",
          stroke: d3.rgb(90, 90, 90)
        });
       box.append('text')
         .attr('x', 300)
         .attr('y', (radio/8)*long)
         .attr("font-weight", "bold")
         .text('trial')
         .style('opacity', 1)
         .style('font-family', 'sans-serif')
         .style('font-size', '13px');


        box.append("line")
          .attr("x1", 0)
          .attr("y1", 300)
          .attr("x2", 600)
          .attr("y2", 300)
          .attr("stroke-width", 2)
          .attr("stroke", d3.rgb(90, 90, 90));
        box.append("line")
          .attr("x1", 300)
          .attr("y1", 0)
          .attr("x2", 300)
          .attr("y2", 600)
          .attr("stroke-width", 2)
          .attr("stroke", d3.rgb(90, 90, 90));

        var circleCenter = box.append('svg:circle')
          .attr('class', 'circleCenterFixed')
          .attr('cx', radius/2)
          .attr('cy', radius/2)
          .attr('r', 5)
          .style('fill', d3.rgb(76, 76, 76));
      }

      directiveConf['tooltip'] = box.append('text')
        .style('opacity', 1)
        .style('font-family', 'sans-serif')
        .style('font-size', '13px');
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
