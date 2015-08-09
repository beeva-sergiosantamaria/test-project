/**
 * Created by sergiosantamaria on 16/07/15.
 */
angular.module('testProjectApp')

.directive('radarInteractive', function(radarData) {
  return {
    restrict: 'EA',
    scope: {
      height: '=',
      width: '=',
      levels: '='
    },
    link: function(scope) {

      if(scope.width == undefined) scope.width = window.innerWidth;
      if(scope.height == undefined) scope.height = window.innerHeight;
      if(scope.levels == undefined) scope.levels = ['Hold', 'Assess', 'Trial', 'Adopt'];

      var directiveConf = {
        'boxWidth': scope.width,
        'boxHeight': scope.height,
        'tooltip': '',
        'nodeActive': false,
        'radar_arcs' : scope.levels,
        'new_positions': [],
        'nodesActives': []
      }
      var nodesActives = true;
      var radius = directiveConf['boxWidth'];
      var medRadius = radius/2;
      var Nniveles = directiveConf.radar_arcs.length;
      var calculateMedia = (medRadius)/300;
      var doble = 16*calculateMedia;
      var normal = 6*calculateMedia;
      var control = false;

      document.getElementById("chart").style.height = window.innerHeight + "px";
      document.getElementById("chart").style.width = window.innerWidth + "px";
      document.getElementById("chart").style.backgroundColor = 'rgb(40, 44, 52)';

      $(document).on('keyup keydown', function(e) {
        control = e.ctrlKey;
      });

      $('#playButton').click(function(){
        transitionNodes();
      })

      $('#resetButton').click(function(){
        resetNodes();
      })

      var box = d3.select('#chart')
        .append('svg')
        .attr('class', 'box')
        .attr('width', radius)
        .attr('height', radius);

      radarData.then(function(data){
          drawRadarSectors(data.length);
          _.each(data, function(value,a){
            CreateTableInf(value.quadrant,a);
            CreateClusterTitle(value.quadrant);
            _.each(value.items, function(val){
              CreateNodeList(val.name, value.quadrant, value.color);
              createNodes(val, value.color, value.colorover);
            })
          })
        });

      _.each(directiveConf.radar_arcs, function(d,i){
        drawRadarLevels(d, i, Nniveles );
      })

   function CreateTableInf(cuadrante,valor){
     var clusterTitle = cuadrante.split(' ')[0];
     //var posCuadrante = valor%2;
     var cuadro = document.createElement("div");
     cuadro.className = 'nodeList'+valor;
     cuadro.id= 'nodeList'+clusterTitle;
     $('#chart').append(cuadro);
   }
   function CreateClusterTitle(title){
     var clusterTitle = title.split(' ')[0];
     var titulo = document.createElement("div");
     titulo.textContent = title;
     titulo.className = 'clusterName';
     titulo.id= 'clusterName';
     $('#nodeList'+clusterTitle).append(titulo);
   }
   function CreateNodeList(nombre, cuadrante,color){

     var nombreTrim = nombre.match(/^\w+|\s\w/g).join("").replace(/\s/g, '');

     var clusterTitle = cuadrante.split(' ')[0];

     var elements = document.createElement("div");
     elements.className = 'nodeElement';
     elements.id= nombreTrim;
     $('#nodeList'+clusterTitle).append(elements);

     var elementCircle = document.createElement("div");
     elementCircle.className = 'nodeCircle';
     elementCircle.style.backgroundColor = color;
     elementCircle.id= 'nodeCircle';
     $('#'+nombreTrim).append(elementCircle);

     var elementName = document.createElement("div");
     elementName.textContent = nombre;
     elementName.className = 'nodeTitle';
     elementName.id= 'nodeTitle';
     $('#'+nombreTrim).append(elementName);

     $('.nodeElement')
       .on("mouseover", function() {
         var coloreDark = d3.select('#'+$(this).attr('id'))[0][0].attributes.colorover.value;
         d3.select('#' + $(this).attr('id'))
           .transition()
           .attr('r', doble);
         if(nodesActives) {
           d3.select('#' + $(this).attr('id'))
             .transition()
             .attr('r', doble)
             .style("fill", coloreDark);
            }
         })
       .on("mouseout", function() {
         var colore = d3.select('#'+$(this).attr('id'))[0][0].attributes.color.value;
         d3.select('#'+$(this).attr('id'))
           .transition()
           .attr('r', normal);
         if(nodesActives){
           d3.select('#'+$(this).attr('id'))
             .transition()
             .attr('r', normal)
             .style("fill",colore);
          }
       })
       .on("mousedown", function(){
         if(!control)directiveConf['nodesActives'] = [$(this).attr('id')];
         if(control)directiveConf['nodesActives'].push($(this).attr('id'));
         var nodos = box.selectAll(".draggableCircle")[0];
         _.each(nodos, function(d){
           if ($.inArray($(d).attr('id'), directiveConf['nodesActives']) == -1) {
             $('#'+$(d).attr('id')+'.nodeElementOver')
               .removeClass('nodeElementOver')
               .addClass('nodeElement');
             d3.select(d)
               .transition()
               .duration(500)
               .style("fill", 'white');
             nodesActives = false;
           } else {
             $('#'+$(d).attr('id')+'.nodeElement')
               .removeClass('nodeElement')
               .addClass('nodeElementOver');
             d3.select(d)
               .transition()
               .duration(500)
               .style("fill", $(d).attr('color'));
             nodesActives = false;
           }
         })
       })
   }

   function createNodes(datos, color, colorOver){
        var nombreTrim = datos.name.match(/^\w+|\s\w/g).join("").replace(/\s/g, '');
        var drag = d3.behavior.drag()
          .on('dragstart', function() {
            circle.style('fill', d3.rgb(41, 58, 82));

            directiveConf['tooltip']
              .transition(200)
              .style('opacity', 0);
          })
          .on('drag', function() {
            circle.attr('cx', d3.event.x)
              .attr('cy', d3.event.y); })
          .on('dragend', function() {
            var coeficienteX = (parseInt(circle[0][0].attributes.cx.value) - parseInt(circle[0][0].attributes.originalcx.value));
            var coeficienteY = (parseInt(circle[0][0].attributes.cy.value) - parseInt(circle[0][0].attributes.originalcy.value));
            if( Math.abs(coeficienteX)>6 || Math.abs(coeficienteY)>6 ){
              console.log( Math.abs(coeficienteX), Math.abs(coeficienteY) );
              circle.style('fill', d3.rgb(200, 10, 10));
              directiveConf['nodeActive'] = true;
              directiveConf['new_positions']
                .push({
                  "name": circle[0][0].attributes.nombre.nodeValue,
                  "pc": {
                    "r": circle[0][0].attributes.cx.value,
                    "t": circle[0][0].attributes.cy.value },
                  "movement": "c" })
              console.log(directiveConf['new_positions']);
            }
          });

        var circle = box.append('svg:circle')
          .attr('class', 'draggableCircle')
          .attr('cx', datos.pc.r*calculateMedia)
          .attr('cy', datos.pc.t*calculateMedia)
          .attr('r', normal)
          .attr('nombre', datos.name)
          .attr('color', color)
          .attr('colorover', colorOver)
          .attr('originalcx', datos.pc.r*calculateMedia)
          .attr('originalcy', datos.pc.t*calculateMedia)
          .attr('id', nombreTrim)
          .text( datos.name )
          .call(drag)
          .style('fill', color)
          .style('stroke', color);

        box.selectAll(".draggableCircle")
          .on("mouseover", function() {
            if(nodesActives){
              d3.select(this)
                .style('fill',$(this).attr('colorover'));
            }
            $('#'+$(this).attr('id')+'.nodeElement')
              .removeClass('nodeElement')
              .addClass('nodeElementOver');
            directiveConf['nodeActive']=false;
            directiveConf['tooltip']
              .attr('x', parseInt($(this).attr('cx'))+15)
              .attr('y', $(this).attr('cy'))
              .attr("font-weight", "bold")
              .text($(this).attr('nombre'))
              .transition(200)
              .style('opacity', 1);
          })
          .on("mouseout", function() {
            if ($.inArray($(this).attr('id'), directiveConf['nodesActives']) == -1) {
              $('#' + $(this).attr('id') + '.nodeElementOver')
                .removeClass('nodeElementOver')
                .addClass('nodeElement');
            }
            if(!directiveConf['nodeActive']){
              directiveConf['tooltip']
                .transition(200)
                .style('opacity', 0);
              if(nodesActives){
                d3.select(this)
                  .style("fill",$(this).attr('color'));
              }
            }
          })
          .on("mousedown", function(){
            if(!control)directiveConf['nodesActives'] = [$(this).attr('id')];
            if(control)directiveConf['nodesActives'].push($(this).attr('id'));
            var nodos = box.selectAll(".draggableCircle")[0];
            _.each(nodos, function(d){
              if ($.inArray($(d).attr('id'), directiveConf['nodesActives']) == -1) {
                $('#'+$(d).attr('id')+'.nodeElementOver')
                  .removeClass('nodeElementOver')
                  .addClass('nodeElement');
                    d3.select(d)
                      .transition()
                      .duration(500)
                      .style("fill", 'white');
                    nodesActives = false;
                } else {
                $('#'+$(d).attr('id')+'.nodeElement')
                  .removeClass('nodeElement')
                  .addClass('nodeElementOver');
                d3.select(d)
                  .transition()
                  .duration(500)
                  .style("fill", $(d).attr('color'));
                nodesActives = false;
              }
            })
          })
      }

      function transitionNodes(){
        var nodos = box.selectAll(".draggableCircle")[0];
        _.each(nodos, function(d){
          if(directiveConf['nodesActives'].length>0){
            if ($.inArray($(d).attr('id'), directiveConf['nodesActives']) != -1) {
              d3.select(d)
                .transition()
                .duration(2000)
                .attr("cx",  parseInt($(d).attr('cx')) + (Math.floor((Math.random() * 50) - 20)) )
                .attr("cy",  parseInt($(d).attr('cy')) + (Math.floor((Math.random() * 50) - 20)) );
            }
          }
          else{
            d3.select(d)
              .transition()
              .duration(2000)
              .attr("cx",  parseInt($(d).attr('cx')) + (Math.floor((Math.random() * 30) - 20)) )
              .attr("cy",  parseInt($(d).attr('cy')) + (Math.floor((Math.random() * 30) - 20)) );
          }
        })
      };

   function drawRadarLevels(cuadrantes, nivel, Nniveles){

       box.append('svg:circle').attr({
          cx: medRadius,
          cy: medRadius,
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

       box.append('svg:circle')
          .attr('class', 'circleCenterFixed')
          .attr('cx', medRadius)
          .attr('cy', medRadius)
          .attr('r', 7)
          .style('cursor', 'pointer')
          .style('fill', d3.rgb(90, 90, 90));
        }

      function drawRadarSectors(numSectors){
        for (var a=0;a<numSectors;a++){
          var angle1 = ((Math.PI*2)/numSectors)*a;
          var cos = Math.cos(angle1);
          var sin = Math.sin(angle1);
          var coords = {  x: (medRadius)*cos, y: (medRadius)*sin };

          box.append("line")
            .attr("x1", medRadius)
            .attr("y1", medRadius)
            .attr("x2", coords.x+(medRadius))
            .attr("y2", coords.y+(medRadius))
            .attr("stroke-width", 2)
            .attr("stroke", d3.rgb(90, 90, 90));
        }
      }

      function resetNodes(){
        directiveConf['nodesActives'] = [];
        nodesActives = true;
        var nodos = box.selectAll(".draggableCircle")[0];
        _.each(nodos, function(d){
          $('#'+$(d).attr('id')+'.nodeElementOver')
            .removeClass('nodeElementOver')
            .addClass('nodeElement');
          d3.select(d)
            .transition()
            .duration(500)
            .style("fill", $(d).attr('color'));
        })
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
