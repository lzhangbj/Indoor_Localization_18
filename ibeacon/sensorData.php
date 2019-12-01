<?php

//$url = "http://localhost/test.php?name=10&age=20";  
   
// $a = basename($url);  //test.php?name=10&age=20

//$a = $_SERVER['QUERY_STRING'];
$a = $_GET["info"];

$file="sensor.txt"; 
$fp=fopen($file,"a");
fwrite($fp,$a."\r\n");
fclose($fp);
