<!DOCTYPE html>
<html class="no-js" lang="">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>BOILERPLATE</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" type="text/css" href="/boilerplate/dist/style.min.css">
    <!--<link rel="stylesheet" type="text/css" href="/dist/style.min.css">-->

    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.indigo-pink.min.css">
    <script defer src="https://code.getmdl.io/1.3.0/material.min.js"></script>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>

    <script src="http://d3js.org/d3.v3.js"></script>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>

    <style type="text/css">

        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            cursor: default;
        }

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
            vector-effect:non-scaling-stroke;
            fill:none;
        }

        .highway:hover {
            stroke-width:5;
        }


		.circle {
			fill: black;
		}

    </style>

    <?php
        ini_set('display_errors', 1);
        ini_set('display_startup_errors', 1);
        error_reporting(E_ALL);
    ?>

</head>

<body>
    <script type="text/javascript" src="/boilerplate/dist/script.min.js"></script>

    <script type="text/javascript">
        var i = 0.0025;
        d3.select("svg")
            .call(d3.behavior.zoom().on("zoom", function () {
                d3.select("g").attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                i = (0.0025/d3.event.scale);
                $(".circle").attr("r", " " + i + "");
                $(".node").attr("r", " " + i + "");
            }));
    </script>

</body>

</html>
