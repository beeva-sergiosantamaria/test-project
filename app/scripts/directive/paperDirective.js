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
      var tooltip;
      var radius = directiveConf['boxHeight'];
      var medRadius = radius/2;
      var Nniveles = directiveConf.radar_arcs.length;
      var calculateMedia = (medRadius)/300;
      var doble = 16*calculateMedia;
      var normal = 8*calculateMedia;
      var control = false;
      var prevAngle = 0;
      var scale = (window.innerHeight/(scope.height));

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
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight)
        .attr("transform", "scale(" + scale/1.4 + "," + scale/1.4 + ")")
        .append("g")
        .attr("id", "boxGroup")
        .attr("transform", "scale(" + scale/1.4 + "," + scale/1.4 + ")");

      radarData.then(function(data){
          drawRadarSectors(data.length, data);
          _.each(data, function(value,a){
            CreateTableInf(value.quadrant,a);
            CreateClusterTitle(value.quadrant);
            _.each(value.items, function(val){
              CreateNodeList(val.name, value.quadrant, value.color);
              createNodes(val, value.color, value.colorover);
              tooltip = box.append('text')
                .style('opacity', 1)
                .style('font-family', 'sans-serif')
                .style('font-size', '13px');
            })
          })
        });

      _.each(directiveConf.radar_arcs, function(d,i){
        drawRadarLevels(d, i, Nniveles );
      })

      $(window).resize(function(){
        scope.$apply(function(){
          scale = (window.innerHeight/(scope.height));
          document.getElementById("chart").style.height = window.innerHeight + "px";
          document.getElementById("chart").style.width = window.innerWidth + "px";
          d3.select("#boxGroup")
            .transition()
            .attr("transform", "scale(" + scale + "," + scale + ")");
        });
      });

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
           .attr('r', doble)
           .style("fill", coloreDark);
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
           .style("fill",'transparent')
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
               .style("fill", 'transparent')
               .attr('r', normal);
             nodesActives = false;
           } else {
             $('#'+$(d).attr('id')+'.nodeElement')
               .removeClass('nodeElement')
               .addClass('nodeElementOver');
             d3.select(d)
               .transition()
               .duration(500)
               .style("fill", $(d).attr('color'))
               .attr('r', doble);
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
                .transition()
                .style('fill',$(this).attr('colorover'))
                .attr('r', doble);
            }
            $('#'+$(this).attr('id')+'.nodeElement')
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
              $('#' + $(this).attr('id') + '.nodeElementOver')
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
                  .style("fill",$(this).attr('color'))
                  .attr('r', normal);
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
                      .style("fill", 'transparent')
                      .attr('r', normal);
                    nodesActives = false;
                } else {
                $('#'+$(d).attr('id')+'.nodeElement')
                  .removeClass('nodeElement')
                  .addClass('nodeElementOver');
                d3.select(d)
                  .transition()
                  .duration(500)
                  .style("fill", $(d).attr('color'))
                  .attr('r', doble);
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

      function drawRadarSectors(numSectors, val){
        var anglesForArc = [];var nombres = []; var colores = [];
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

              nombres.push(val[a].quadrant);
              colores.push(val[a].color);
              anglesForArc.push(100 / numSectors);
              prevAngle = prevAngle + (360/numSectors);
          }

          var arc = d3.svg.arc()
            .innerRadius(medRadius)
            .outerRadius(medRadius+25)

          var pie = d3.layout.pie()
            .value(function(d){ return d; })

          box.selectAll(".arc")
            .data(pie(anglesForArc))
            .enter()
            //.append("g")
            .insert("g",":first-child")
            .attr("id",function(d, i){ return nombres[i];})
            .attr("class","arc")
            //.attr("transform","rotate(-90)")
            .attr("transform", "translate(" + medRadius + "," + medRadius + ")")
            .append("svg:path")
            .style("cursor", "pointer")
            //.insert("svg:path",":first-child")
            .attr("class", "arcpath")
            .attr("id",function(d, i){return nombres[i]+"sub";})
            .attr("d",arc)
            .attr("fill",function(d, i){return colores[i];})
            .attr("original",function(d, i){return colores[i];})
            .attr("idforclasif",function(d, i){return nombres[i];});

          box.selectAll(".arctext")
            .data(pie(anglesForArc))
            .enter()
            //.append("text")
            .insert("text",".serctorCircles")
            .style("cursor", "pointer")
            .style("font-size",15)
            .style("font-weight","bold")
            .style("fill","#333")
            //.attr("transform","rotate(-90)")
            .attr("transform", "translate(" + medRadius + "," + medRadius + ")")
            .attr("class","arctext")
            .attr("dy",17)
            .append("textPath")
            .style("text-anchor","middle")
            .attr("xlink:href",function(d, i){return "#"+nombres[i]+"sub";})
            .attr("startOffset","25%")
            .attr("class","arctextInside")
            .attr("id",function(d, i){return nombres[i];})
            .attr("idforclasif",function(d, i){return nombres[i];})
            .text(function(d, i){return nombres[i];})
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
            .style("fill", $(d).attr('color'))
            .attr('cx', $(d).attr('originalcx'))
            .attr('cy', $(d).attr('originalcy'));
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

.directive('divideChart', function(radarData) {
    return {
      restrict: 'EA',
      scope:{} ,
      link: function(scope) {
        var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          width = window.innerWidth/1.1 - margin.left - margin.right,
          height = window.innerHeight - margin.top - margin.bottom;

        var scale = (window.innerHeight/(scope.height));

        radarData.then(function (data) {
          scope = data;
          init();
        });

        $('#graficaBusqueda').each(function () {
          $(this).remove();
        });

        $(window).resize(function(){
            scale = (window.innerHeight/(height));
            console.log(window.innerHeight, height);
            document.getElementById("graficaBubbles").style.height = window.innerHeight + "px";
            document.getElementById("graficaBubbles").style.width = window.innerWidth + "px";
            d3.select("#grupoBubbles")
              .transition()
              .attr("transform", "translate(" + margin.left + "," + margin.top + ") scale(" + scale + "," + scale + ")");
        });

    function init(){

        var nodes = [];
        var centros = [];
        var clasificacion = _.uniq(_.pluck(scope, 'quadrant'));
        var colores = _.uniq(_.pluck(scope, 'color'));

        var m = clasificacion.length,
          padding = 6,
          radius = d3.scale.sqrt().range([3, 12]);

        var coef3 = 0.45;
        if(m>2) {var coef = 4; var coef2 = 1.8; }
        else { var coef = 7; var coef2 = 1.7; }

      _.each(scope, function(values, i){
        //console.log(values);
        values.items.map(function (elem){
          for (var a = 0; a < m; a++) {
            if (values.quadrant == clasificacion[a]) {
               var pos = a;
            }
          }
          var rad =  Math.floor((Math.random() * 15) + 8);
          var angle1 = ((Math.PI*2)/m)*pos;
          var cos = Math.cos(angle1);
          var sin = Math.sin(angle1);
          var coords = {  x: ((width/coef)*cos) + (width/coef2), y: ((height/4)*sin) + (height*coef3) };

          nodes.push( {
            datos: values,
            tipo: elem.name,
            id: elem.name,
            radius: rad,
            radiusplus: rad+10,
            color: values.color,
            opacity: Math.random(),
            cx: coords.x-50,
            cy: coords.y
          });
          var data = _.find(centros, function(voteItem){ /*console.log(voteItem)*/;return voteItem.nombre == values.quadrant; });
          if(data==undefined) {
            centros.push({nombre :values.quadrant, px: coords.x+50 , py: coords.y - 100, color: values.color});
          }
        });
      })
          var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(0)
            .charge(0)
            .on("tick", tick)
            .start();

          var svg = d3.select("#chartBubble").append("svg")
            .attr("id", 'graficaBubbles')
            .attr("class", "bubbles")
            .append("g")
            .attr("id", "grupoBubbles")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          document.getElementById("graficaBubbles").style.height = window.innerHeight + "px";
          document.getElementById("graficaBubbles").style.width = window.innerWidth + "px";

          var circle = svg.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("id", function (d) {return d.id; })
            .attr("class", "node")
            .attr("r", function (d) {return d.radius;})
            .attr("rplus", function (d) {return d.radius+10; })
            .style("fill", function (d) {return d.color;})
            .style("fill-opacity", function (d) {return d.opacity;})
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
            .call(force.drag);
          labels(centros);

         var tooltip = svg.append('text')
            .style('opacity', 1)
            .style('font-family', 'sans-serif')
            .style('fill', 'white')
            .style('cursor', 'default')
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
          console.log('popover: ', this, d);
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
            .attr("style", "cursor:default")
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
      }};
  })
