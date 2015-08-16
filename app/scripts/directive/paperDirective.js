/**
 * Created by sergiosantamaria on 16/07/15.
 */
angular.module('testProjectApp')

.directive('radarInteractive', function(radarData, $localStorage) {
  return {
    restrict: 'EA',
    scope: {
      height: '=',
      width: '=',
      levels: '='
    },
    link: function(scope) {

      if(scope.width == undefined) scope.width = window.innerWidth/1.5;
      if(scope.height == undefined) scope.height = window.innerHeight/1.5;
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
      scope.clasificacion= [];
      var nodesActives = true;
      var tooltip;
      var radius = directiveConf['boxHeight'];
      var medRadius = radius/2;
      var Nniveles = directiveConf.radar_arcs.length;
      var calculateMedia = (medRadius)/300;
      var doble = 16*calculateMedia;
      var normal = 10*calculateMedia;
      var control = false;
      var prevAngle = 90;
      var datosParaDetalles = {};

      document.getElementById("chart").style.height = window.innerHeight + "px";
      document.getElementById("chart").style.width = window.innerWidth + "px";
      //document.getElementById("chart").style.backgroundColor = 'rgb(40, 44, 52)';

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
        .attr('height', radius)
        .append("g");

      radarData.then(function(data){
          scope.clasificacion = _.uniq(_.pluck(data, 'subfamily'));
          drawRadarSectors(scope.clasificacion.length, data);
          _.each(data, function(value){
            datosParaDetalles[value.name] = value;
            //CreateTableInf(value.quadrant,a);
            //CreateClusterTitle(value.quadrant);
            //CreateNodeList(val.name, value.quadrant, value.color);
            createNodes(value, scope.clasificacion);
            console.log(datosParaDetalles);
            tooltip = box.append('text')
              .style('opacity', 1)
              .style('font-family', 'sans-serif')
              .style('font-size', '13px');
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
       .on("mousedown", function(d){
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

   function createNodes(datos, numSectors){
     //var nombreTrim = datos.name.match(/^\w+|\s\w/g).join("").replace(/\s/g, '');
    var m = numSectors.length;
     for (var a = 0; a < m; a++) {
       if (datos.subfamily == numSectors[a]) {
         var pos = a;
       }
     }
     var angleNode = ((Math.PI*2)/m)*pos;
     var cosNode = Math.cos(angleNode+(Math.random() * (0.2 - 0.8) + 0.8));
     var sinNode = Math.sin(angleNode+(Math.random() * (0.2 - 0.8) + 0.8));
     var coordsNode = {  x: (((medRadius-(3*datos.pc.score))*cosNode)+medRadius), y: (((medRadius-(3*datos.pc.score))*sinNode)+medRadius) };

        var drag = d3.behavior.drag()
          .on('dragstart', function() {
            console.log('this en drag: ',$(this).attr('cxpami')+' - '+$(this).attr('subfamily'))
            circle.style('fill', d3.rgb(41, 58, 82));

            tooltip
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
                    "score": circle[0][0].attributes.cx.value,
                    "t": circle[0][0].attributes.cy.value },
                  "movement": "c" })
              console.log(directiveConf['new_positions']);
            }
          });

        var circle = box.append('svg:circle')
          .attr('class', 'draggableCircle')
          .attr('cx', coordsNode.x*calculateMedia)
          .attr('cy', coordsNode.y*calculateMedia)
          .attr('r', normal)
          .attr('nombre', datos.name)
          .attr('family', datos.family)
          .attr('subfamily', datos.subfamily)
          .attr('color', datos.color)
          .attr('colorover', datos.colorover)
          .attr('originalcx', coordsNode.x*calculateMedia)
          .attr('originalcy', coordsNode.y*calculateMedia)
          .attr('id', datos.name)
          .text( datos.name )
          .call(drag)
          .style('fill', datos.color)
          .style('stroke', datos.color);

        box.selectAll(".draggableCircle")
          .on("mouseover", function() {
            if(nodesActives){
              d3.select(this)
                .transition()
                .style('fill',$(this).attr('colorover'))
                .style('stroke',$(this).attr('colorover'))
                .attr('r', doble);
            }
            $('#'+$(this).attr('id'))
              .removeClass('nodeElement')
              .addClass('nodeElementOver');
            directiveConf['nodeActive']=false;
            tooltip
              .attr('x', parseInt($(this).attr('cx'))+15)
              .attr('y', $(this).attr('cy'))
              .attr("font-weight", "bold")
              .attr("fill", "white")
              .text($(this).attr('nombre'))
              .transition(200)
              .style('opacity', 1);
          })
          .on("mouseout", function() {
            if ($.inArray($(this).attr('id'), directiveConf['nodesActives']) == -1) {
              $('#' + $(this).attr('id'))
                .removeClass('nodeElementOver')
                .addClass('nodeElement');
            }
            if(!directiveConf['nodeActive']){
              tooltip
                .transition(200)
                .style('opacity', 0);
              if(nodesActives){
                d3.select(this)
                  .transition()
                  .style('fill',$(this).attr('color'))
                  .style('stroke',$(this).attr('color'))
                  .attr('r', normal);
              }
            }
          })
          .on("mousedown", function(){
            var nombreParaDetalles = $(this).attr('id');
            scope.$apply(function () {
              $localStorage.nodeDatasBubbles = datosParaDetalles[nombreParaDetalles];
              $localStorage.activeDetails = true;
            })

            if(!control)directiveConf['nodesActives'] = [$(this).attr('id')];
            if(control)directiveConf['nodesActives'].push($(this).attr('id'));
            console.log(directiveConf['nodesActives']);
            var nodos = box.selectAll(".draggableCircle")[0];
            _.each(nodos, function(d){
              if ($.inArray($(d).attr('id'), directiveConf['nodesActives']) == -1) {
                $('#'+$(d).attr('id'))
                  .removeClass('nodeElementOver')
                  .addClass('nodeElement');
                    d3.select(d)
                      .transition()
                      .duration(500)
                      .style("fill", 'white');
                    nodesActives = false;
                } else {
                $('#'+$(d).attr('id'))
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
      scope.$watch(function () {
        return $localStorage.playAnimation;
      }, function (newVal, oldVal) {
        if(newVal != oldVal) transitionNodes();
      }, true);

      function transitionNodes(){
        var nodos = box.selectAll(".draggableCircle")[0];
        _.each(nodos, function(d){
          if(directiveConf['nodesActives'].length>0){
            if ($.inArray($(d).attr('id'), directiveConf['nodesActives']) != -1) {
              d3.select(d)
                .transition()
                .duration(2000)
                .attr("cx",  parseInt($(d).attr('cx')) + (Math.floor((Math.random() * 100) - 20)) )
                .attr("cy",  parseInt($(d).attr('cy')) + (Math.floor((Math.random() * 100) - 20)) );
            }
          }
          else{
            d3.select(d)
              .transition()
              .duration(2000)
              .attr("cx",  parseInt($(d).attr('cx')) + (Math.floor((Math.random() * 50) - 20)) )
              .attr("cy",  parseInt($(d).attr('cy')) + (Math.floor((Math.random() * 50) - 20)) );
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
         .attr("fill", "white")
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

      function drawRadarSectors(numSectors, datos){

        var colores = _.uniq(_.pluck(datos, 'color'));
        var nombresSubfamily = _.uniq(_.pluck(datos, 'subfamily'));
        var arcDatas = [];

        for (var a=0;a<numSectors;a++){
          arcDatas.push({ start: prevAngle, end: prevAngle + (360/numSectors), color: colores[a], subfam:nombresSubfamily[a]  })
          prevAngle = prevAngle + (360/numSectors);
        }

        var arct = d3.svg.arc()
          .innerRadius(medRadius)
          .outerRadius(medRadius+50)
          .startAngle(function(d,i) {
            return d.start * (Math.PI/180);
          })
          .endAngle((function (d, i){
            return (d.end * (Math.PI/180))
          }));

        var g = d3.select("#chart")
          .append("svg")
          .attr("width", window.innerWidth)
          .attr("height", window.innerHeight)
          .append("g")

        var path = g.selectAll("path")
          .data(arcDatas)
          .enter()
          .append("svg:path")
          .attr("id", function(d, i){
            return d.subfam;
          })
          .attr("d", arct)
          .style("fill", function(d, i){
            return d.color;
          })
          .attr("transform", "translate("+window.innerWidth/2+","+window.innerHeight/2 +")");

        var text = g.selectAll("text")
          .data(arcDatas)
          .enter()
          .append("text")
          .style("font-size",30)
          .style("fill","#313131")
          .style("font-weight","bold")
          .attr("dy",40)
          .append("textPath")
          .attr("xlink:href", function(d){
            return "#"+d.subfam;
          })
          .attr("startOffset",function(d){
            return 70 - (2*d.subfam.length);
          })
          .style("text-anchor","start")
          .text(function(d,i){
            return d.subfam
          });


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
})

.directive('divideChart', function(radarData, $localStorage) {
    return {
      restrict: 'EA',
      scope: {} ,
      link: function(scope) {
        var svg;
        scope.$watch( function () {
          return $localStorage.playAnimation;
        }, function (newVal, oldVal) {
          if(newVal != oldVal) transitionNodes();
          //console.log('lolailo');
        }, true );

        radarData.then(function (data) {
          scope.datas = data;
          init();
        });

        $('#graficaBusqueda').each(function () {
          $(this).remove();
        });

    function init(){
        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          width = window.innerWidth - margin.left - margin.right,
          height = window.innerHeight - margin.top - margin.bottom;

        var nodes = [];
        var centros = [];
        var clasificacion = _.uniq(_.pluck(scope.datas, 'subfamily'));

        var m = clasificacion.length,
          padding = 6,
          radius = d3.scale.sqrt().range([3, 12]);

      _.each(scope.datas, function(values,i){
          for (var a = 0; a < m; a++) {
            if (values.subfamily == clasificacion[a]) {
               var pos = a;
            }
          }
        var angle1 = ((Math.PI*2)/m)*pos;
        var cos = Math.cos(angle1);
        var sin = Math.sin(angle1);
        var coords = {  x: ((300*cos) + (window.innerWidth/2)), y: (300*sin) + (window.innerHeight*0.4) };
          nodes.push( {
            datos: values,
            tipo: values.name,
            id: values.name,
            radius: values.pc.score/2,
            radiusplus: (values.pc.score/2)+10,
            color: values.color,
            opacity: values.pc.score/100,
            cx: coords.x,
            cy: coords.y
          });
        centros.push({nombre :values.subfamily, px: coords.x , py: coords.y - 100});
      })

          var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(0)
            .charge(0)
            .on("tick", tick)
            .start();

          svg = d3.select("#chartBubble").append("svg")
            .attr("id", 'graficaBusqueda')
            .attr("class", "bubbles")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          var circle = svg.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            //.attr("coincidencia", function (d) {
            //  return d.datos.coincidencia;
            //})
            .attr("id", function (d) {
              return d.id;
            })
            .attr("class", "node")
            .attr("r", function (d) {
              return d.radius;
            })
            .attr("rplus", function (d) {
              return d.radius+10;
            })
            .style("fill", function (d) {
              return d.color;
            })
            .style("fill-opacity", function (d) {
              return d.opacity;
            })
            .style("cursor", "pointer")
            .on("mouseover", function (d) {
              showPopover.call(this, d);
              d3.select(this)
                .transition()
                .attr('r', d.radiusplus);
              tooltip
                .attr('x', d.x)
                .attr('y', d.y)
                .attr("font-weight", "bold")
                .text(d.tipo)
                .transition(200)
                .style('opacity', 1);
            })
            .on("mouseout", function (d) {
              removePopovers();
              d3.select(this)
                .transition()
                .attr('r', d.radius);
            })
            .on("click", function (d) {
              scope.$apply(function () {
                $localStorage.nodeDatasBubbles = d.datos;
                $localStorage.activeDetails = true;
              })
            })
            .call(force.drag);
          labels(centros);

         var tooltip = svg.append('text')
            .style('opacity', 1)
            .style('font-family', 'sans-serif')
            .style('fill', 'white')
            .style('cursor', 'pointer')
            .style('font-size', '16px');

        function gravity(alpha) {
          return function (d) {//d son los objetos de nodes
            d.y += (d.cy - d.y) * alpha;
            d.x += (d.cx - d.x) * alpha;
          };
        }
        function tick(e) {
          circle.each(gravity(.08 * e.alpha))
            .each(collide(.6))
            .attr("cx", function (d) {
              return d.x;
            })
            .attr("cy", function (d) {
              return d.y;
            });
        }

        function removePopovers() {
          $('.popover').each(function () {
            $(this).remove();
          });
        }

        function showPopover(d) {
          //console.log('popover: ', this, d);
          $(this).popover({
            placement: 'auto top',
            container: '#coin',
            trigger: 'manual',
            html: true,
            content: function () {
              return "nombre: " + d.tipo + "";
            }
          });
          $(this).popover('show')
        }

        function labels(foci) {
          svg.selectAll(".label").remove();
          svg.selectAll(".label")
            .data(_.toArray(foci)).enter().append("text")
            .attr("class", "label")
            .attr("style", "cursor:pointer")
            .attr("style", "font-size: 25px")
            .attr("fill", "white")
            .text(function (d) {
              return d.nombre
            })
            .attr("transform", function (d) {
              return "translate(" + (d.px - ((d.nombre.length) * 3)) + ","+ d.py+")";
            })
        }
        //
        //// Resolve collisions between nodes.
        function collide(alpha) {
          var quadtree = d3.geom.quadtree(nodes);
          return function (d) {
            var r = d.radius + radius.domain()[1] + padding,
              nx1 = d.x - r,
              nx2 = d.x + r,
              ny1 = d.y - r,
              ny2 = d.y + r;
            quadtree.visit(function (quad, x1, y1, x2, y2) {
              if (quad.point && (quad.point !== d)) {
                var x = d.x - quad.point.x,
                  y = d.y - quad.point.y,
                  l = Math.sqrt(x * x + y * y),
                  r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
                if (l < r) {
                  l = (l - r) / l * alpha;
                  d.x -= x *= l;
                  d.y -= y *= l;
                  quad.point.x += x;
                  quad.point.y += y;
                }
              }
              return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
          };
        }
      }
       function transitionNodes(){
          var nodos = svg.selectAll(".node")[0];
          _.each(nodos, function(d){
            d3.select(d)
              .transition()
              .duration(2000)
              .style("fill-opacity", function (d) {
                return Math.random();;
              })
              .attr('r', function (d) {
                return Math.floor((Math.random() * 30) + 10);
              });
          })
        };
      }
    };
  })
