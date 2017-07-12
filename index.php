<!DOCTYPE html>
<html class="no-js" lang="">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>ITS4VR</title>
    <meta name="description" content="">
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' name='viewport' />
    <link rel="stylesheet" type="text/css" href="/its4vr/dist/style.min.css">

    <!-- <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script> -->

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>

    <script src="http://d3js.org/d3.v3.js"></script>

    <script src="/its4vr/app/js/vendors/dat.gui.min.js"></script>

    <!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"> -->

    <!-- <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script> -->

</head>

<body>
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
