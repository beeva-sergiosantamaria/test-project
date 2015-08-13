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
      var normal = 8*calculateMedia;
      var control = false;
      var prevAngle = 90;

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
          _.each(data, function(value,a){
            //CreateTableInf(value.quadrant,a);
            //CreateClusterTitle(value.quadrant);
            //CreateNodeList(val.name, value.quadrant, value.color);
            createNodes(value, value.colorover);
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

   function createNodes(datos, colorOver){
        //var nombreTrim = datos.name.match(/^\w+|\s\w/g).join("").replace(/\s/g, '');
        //console.log(datos);
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
          .attr('cx', datos.pc.r*calculateMedia)
          .attr('cy', datos.pc.t*calculateMedia)
          .attr('r', normal)
          .attr('nombre', datos.name)
          .attr('family', datos.family)
          .attr('subfamily', datos.subfamily)
          .attr('color', datos.color)
          .attr('colorover', datos.colorover)
          .attr('originalcx', datos.pc.r*calculateMedia)
          .attr('originalcy', datos.pc.t*calculateMedia)
          .attr('id', datos.name)
          .text( datos.name )
          .call(drag)
          .style('fill', datos.color)
          .style('stroke', datos.color);

        box.selectAll(".draggableCircle")
          .on("mouseover", function() {
            if(nodesActives){
              d3.select(this)
                .style('fill',$(this).attr('colorover'));
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
                  .style('fill',$(this).attr('color'));
              }
            }
          })
          .on("mousedown", function(){
            //console.log($(this).attr('id'));
            if(!control)directiveConf['nodesActives'] = [$(this).attr('id')];
            if(control)directiveConf['nodesActives'].push($(this).attr('id'));
            //console.log(directiveConf['nodesActives']);
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

      function drawRadarSectors(numSectors, datos){
        console.log('datos para ciruclo: ', datos);

        var colores = _.uniq(_.pluck(datos, 'color'));
        var nombresSubfamily = _.uniq(_.pluck(datos, 'subfamily'));
        var arcDatas = [];
        for (var a=0;a<numSectors;a++){
          arcDatas.push({ start: prevAngle, end: prevAngle + (360/numSectors), color: colores[a], subfam:nombresSubfamily[a]  })
          prevAngle = prevAngle + (360/numSectors);
        }
        console.log(arcDatas);

        var arct = d3.svg.arc()
          .innerRadius(medRadius)
          .outerRadius(medRadius+50)
          .startAngle(function(d,i) {
            console.log('prev angle: ',prevAngle, (360/numSectors));
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
          .attr("xlink:href", function(d, i){
            return "#"+d.subfam;
          })
          .attr("startOffset",function(d,i){
            return 70 - d.subfam.length;
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

.directive('divideChart', function(radarData) {
    return {
      restrict: 'EA',
      scope:{} ,
      link: function(scope) {
        radarData.then(function (data) {
          scope = data;
          init();
        });
        $('#graficaBusqueda').each(function () {
          $(this).remove();
        });
        //scope.$watch('clasif', function () {
        //  draw(scope.clasif);
        //})
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
        var clasificacion = _.uniq(_.pluck(scope, 'subfamily'));

        var m = clasificacion.length,
          padding = 6,
          radius = d3.scale.sqrt().range([3, 12]);

      _.each(scope, function(values,i){
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
            radius: values.committers/4,
            radiusplus: (values.committers/4)+10,
            color: values.color,
            opacity: values.pc.score/100,
            cx: coords.x,
            cy: coords.y
          });
        centros.push({nombre :values.subfamily, px: coords.x , py: coords.y});
      })

          var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .gravity(0)
            .charge(0)
            .on("tick", tick)
            .start();

          var svg = d3.select("#chartBubble").append("svg")
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
            //.on("click", function (d) {
            //  $localStorage.ID = d.datos.id;
            //  scope.$apply(function () {
            //    scope.porciento = (d.datos.coincidencia * 100);
            //    scope.nombreTooltip = (d.datos.nombre);
            //    if (d.datos.categoria != undefined) {
            //      scope.categoriaTooltip = (d.datos.categoria);
            //    }else{
            //      scope.categoriaTooltip = (d.datos.tipo);
            //    }
            //    scope.idTooltip = d.datos.id;
            //    scope.tipoTooltip = d.datos.tipo;
            //    $localStorage.coincidencia = d.datos.coincidencia;
            //  })
            //  $('#tooltip').addClass('show');
            //})
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
        //function draw(dat) {
        //  clasificacion = _.uniq(_.pluck(scope.datasgraph, dat));
        //  colores = _.uniq(_.pluck(scope.datasgraph, 'tipo'));
        //  foci = getCenters(dat, width, height); //crea un objeto por cada uno de los grupos identificados por tipo
        //  m = clasificacion.length,
        //    col = colores.length,
        //    radius = d3.scale.sqrt().range([3, 12]),
        //    color = d3.scale.category10().domain(d3.range(col)),
        //    x = d3.scale.ordinal().domain(d3.range(m)).rangePoints([0, width], 1);
        //  var conNodos = 0;
        //  var filas = 1;
        //  //mejoresNodos = clasificacion[0];
        //  nodes = scope.datasgraph.map(function (elem) {
        //    var i = 0;
        //    var coinc = 0.1;
        //    //if (elem.tipo == mejoresNodos && conNodos < 3) {coinc = 20; conNodos = conNodos + 1;}
        //    //if(conNodos>=3 && conNodos<6 && elem.tipo != mejoresNodos) {coinc = 20; conNodos = conNodos + 1;}
        //    for (var a = 0; a < m; a++) {
        //      if (elem[scope.clasif] == clasificacion[a]) {
        //        i = a;
        //        //if(i>2 && i<6) filas = 2;
        //        //if(i>5 && i<9) filas = 3;
        //        //if(i>8 && i<12) filas = 4;
        //      }
        //    }
        //    return {
        //      datos: elem,
        //      tipo: elem.tipo,
        //      id: elem.id,
        //      radius: (elem.coincidencia * 20) + coinc,
        //      color: color(i),
        //      cx: x(i),
        //      cy: (height / 2)*filas
        //    };
        //  });
        //  centros = _.uniq(_.pluck(nodes, 'cx'));
        //  objetoCentros = _.object(clasificacion, centros);
        //  _.each(foci, function (elem, i) {
        //    _.each(objetoCentros, function (elemem, a) {
        //      if (i == a) foci[i].x = elemem;
        //    });
        //  });
        //  force
        //    .nodes(nodes)
        //    .size([width, height])
        //    .on("tick", tick)
        //    .start();
        //  circle
        //    .data(nodes)
        //    .enter().append("circle").attr("id", function (d) {
        //      return d.id;
        //    })
        //    .attr("class", "node")
        //    .attr("r", function (d) {
        //      return d.radius;
        //    })
        //
        //  labels(foci)
        //  force.start();
        //}
        //
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
      function shuffle(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
      }
      }
      }};
  })
