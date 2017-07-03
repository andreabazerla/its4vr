<!DOCTYPE html>
<html class="no-js" lang="">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>ITS4VR</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' name='viewport' />
    <link rel="stylesheet" type="text/css" href="/its4vr/dist/style.min.css">

    <!-- <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script> -->

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>

    <script src="http://d3js.org/d3.v3.js"></script>

    <script src="/its4vr/vendors/dat.gui.min.js"></script>

    <!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"> -->

    <!-- <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script> -->

    <style type="text/css">

      html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          cursor: default;
      }

      /*
      #gui {
          position: relative;
      }
       */

      svg {
          width: 100%;
          height: 100%;
          display: block;
          shape-rendering: auto;
      }

      .highway {
          stroke:black;
          stroke-width:1;
          stroke-linecap:butt;
          stroke-dasharray: 0;
          vector-effect:non-scaling-stroke;
          fill:none;
      }

      .circle {
        fill: black;
        stroke: black;
        stroke-width: 2px;
        vector-effect:non-scaling-stroke;
		  }

      /*.circle:hover {
        r: 0.0001em;
		  }*/

      .circle:hover + .data {
        display: block;
		  }

      .data {
        position: relative;
        width: 100px;
        height: 100px;
        background: #000;
      }

      .dg .c .slider .slider-fg {
        background: #ff0000;
      }

      .dg .c .slider:hover .slider-fg {
        background: #ff0000;
      }

      .dg .cr.number {
        border-left: 3px solid #ff0000;
      }

      .dg .cr.number input[type=text] {
        color: #ff0000;
      }

      .dg .cr.boolean {
        border-left: 3px solid #ff0000;
      }

      .dg .cr.function {
        border-left: 3px solid #ff0000;
      }

    </style>

    <?php
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    ?>

</head>

<body>
    <script>var x = 1;</script>
    <script type="text/javascript" src="/its4vr/dist/script.min.js"></script>

    <script type="text/javascript">
        var i = 0.005;
        d3.select("svg")
            .call(d3.behavior.zoom().on("zoom", function () {
                d3.select("g").attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                i = (0.005/d3.event.scale);
                $(".circle").attr("r", " " + i + "px");
            }));
    </script>

    <script>
      $('.circle').mouseover(function() {
         $('#data_'+this.id).show();
      });

      var tooltip = document.querySelectorAll('.coupontooltip');

      document.addEventListener('mousemove', fn, false);

      function fn(e) {
          for (var i=tooltip.length; i--;) {
              tooltip[i].style.left = e.pageX + 'px';
              tooltip[i].style.top = e.pageY + 'px';
          }
      }
    </script>

</body>

</html>
