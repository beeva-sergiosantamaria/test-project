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
        'boxWidth': window.innerWidth,
        'boxHeight': window.innerHeight,
        'radarPositions': ''
      }

      radarData.then(function(data){
        directiveConf['radarPositions'] = data;
        console.log('vectores: ', directiveConf['radarPositions'].nodes);
          _.each(data.nodes, function(value){
            console.log('nodos: ', value.x+' - '+value.y);
            createNodes(value.x, value.y);
          })
        });

      var box = d3.select('#chart')
        .append('svg')
        .attr('class', 'box')
        .attr('width', directiveConf['boxWidth'])
        .attr('height', directiveConf['boxHeight']);

      //var drag = d3.behavior.drag()
      //  .on('dragstart', function() { circle.style('fill', 'red'); })
      //  .on('drag', function() { circle.attr('cx', d3.event.x)
      //  .attr('cy', d3.event.y); })
      //  .on('dragend', function() { circle.style('fill', 'white'); console.log(circle[0][0].attributes.cx.value+' - '+circle[0][0].attributes.cy.value ); });


      function createNodes(x,y){
        console.log('se ejecuta');
        var circle = box.selectAll('.draggableCircle')
          .data(directiveConf['radarPositions'].nodes)
          .enter()
          .append('svg:circle')
          .attr('class', 'draggableCircle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 10)
          //.call(drag)
          .style('fill', 'green');
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
