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
        'boxWidth': 1800,
        'boxHeight': 1800,
        'tooltip': '',
        'top': 250,
        'left': 300,
        'nodeActive': false,
        'radar_arcs' : ['Hold', 'Assess', 'Trial', 'Adopt'],
        'new_positions': []
      }
      var activateNodeAnimation = true;
      var radius = directiveConf['boxWidth']/3;
      var medRadius = radius/2;
      var Nniveles = directiveConf.radar_arcs.length;
      var calculateMedia = (radius/2)/300;
      var doble = 12*calculateMedia;
      var normal = 6*calculateMedia;

      radarData.then(function(data){
          _.each(data, function(value,a){
            CreateTableInf(value.quadrant,a);
            CreateClusterTitle(value.quadrant);
            _.each(value.items, function(val){
              CreateNodeList(val.name, value.quadrant, value.color);
              createNodes(val, value.color, value.colorover);
            })
          })
        });

      document.getElementById("chart").style.height = window.innerHeight + "px";
      document.getElementById("chart").style.width = window.innerWidth + "px";
      document.getElementById("chart").style.backgroundColor = 'rgb(40, 44, 52)';

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

    function PlayButton(){
      var button = document.createElement("div");
      button.className = 'playButton';
      button.textContent = '>'
      button.id= 'playButton';
      $('#chart').append(button);
    }

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
         var radioAmp = d3.select('#'+$(this).attr('id'))[0][0].attributes.r.value;
           d3.select('#'+$(this).attr('id'))
             .transition()
             .style("fill",coloreDark)
             .attr('r', doble);
           activateNodeAnimation = false;

         })
       .on("mouseout", function(d, i) {
         console.log(d3.select('#'+$(this).attr('id')));
         var radioAmp = d3.select('#'+$(this).attr('id'))[0][0].attributes.r.value;
         var colore = d3.select('#'+$(this).attr('id'))[0][0].attributes.color.value;
           d3.select('#'+$(this).attr('id'))
             .transition()
             .style("fill",colore)
             .attr('r', normal);
           activateNodeAnimation = true;

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

            //console.log(circle[0][0].attributes.cx.value+' - '+circle[0][0].attributes.cy.value);
            //console.log(circle);
          })
          .on('drag', function() {
            circle.attr('cx', d3.event.x)
            .attr('cy', d3.event.y); })
          .on('dragend', function() {
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
          });

        var circle = box.append('svg:circle')
          .attr('class', 'draggableCircle')
          .attr('cx', datos.pc.r*calculateMedia)
          .attr('cy', datos.pc.t*calculateMedia)
          .attr('r', normal)
          .attr('nombre', datos.name)
          .attr('color', color)
          .attr('colorover', colorOver)
          .attr('id', nombreTrim)
          .text( datos.name )
          .call(drag)
          .style('fill', color);

        box.selectAll(".draggableCircle")
          .on("mouseover", function() {
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

            d3.select(this)
              .style('fill',$(this).attr('colorover'));
          })
          .on("mouseout", function(d, i) {
            $('#'+$(this).attr('id')+'.nodeElementOver')
              .removeClass('nodeElementOver')
              .addClass('nodeElement');
            if(!directiveConf['nodeActive']){
              directiveConf['tooltip']
                .transition(200)
                .style('opacity', 0);
              d3.select(this)
                .style("fill",$(this).attr('color'));
            }
          })
          .on("click", function(d,i){
            console.log(this);
          })
      }
    function transitionNodes(){
       console.log('entra');
        box.selectAll(".draggableCircle")
          .transition()
          .duration(2000)
          .attr("cx", function(d,i){ return Math.floor((Math.random() * 600) + 10); })
          //.attr("cx", function(d,i){ return +d3.selectAll(".draggableCircle")[0][i].cy.animVal.value - 5 })
          .attr("cy", function(d,i){ return Math.floor((Math.random() * 600) + 10); })
          //.attr("cy", function(d,i){ return +d3.selectAll(".draggableCircle")[0][i].cy.animVal.value - 5 });
      };

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
