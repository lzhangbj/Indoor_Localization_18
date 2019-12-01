<?php

/**
 * @author Xinyu ZHU
 * @copyright 2016
 */
 

function getInfo($url){
    //Targer URL    
    //Sent a get request to get result
    $ch=curl_init($url);
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,FALSE);
    curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,FALSE);
    $result=curl_exec($ch); //result gotten
    curl_close($ch);//Finish 
    return $result;
   // echo $result;
}
$info=getInfo("https://eek123.ust.hk/Demo/clientAPI/poscal_result/interval");
$result=json_decode($info);
// $result2=json_decode(getInfo("https://eek123.ust.hk/Demo/clientAPI/reporter/0"));
$info=getInfo("https://eek123.ust.hk/Demo/clientAPI/poscal_result/interval");
$result=json_decode($info);
$result2=json_decode(getInfo("http://127.0.0.1/final/sensorApi.php"));
// [[{"mac":"74:51:ba:b6:6f:e5","lat":"22.33500401","long":"114.26315051","ts":"1459412853"}]
// [{"mac":"D0:22:BE:F6:F7:04","rssi":-30,"ts":1510737179,"long":114.2638166,"lat":22.334821,"targer":"20:91:48:26:1D:3F"}l
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Localization System</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="shortcut icon" href="posi.png">
<link href="map.css" type="text/css" rel="stylesheet"/>
<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAY9YouOPuMBFpgwu4vpWhTi9f8_H4dj_Y&callback=initMap"></script>
<script src="Map2JS.js" type="text/javascript"></script>
<script src="control.js" type="text/javascript"></script>
</head>

<body>
<h1 class="title">Trolley Localization System</h1>

<table> 
  <tr>  
    <td width="900px" height="600px">
     <div id="map"></div>
    </td>
    
    <td valign="top">	
    

  <div id="tab1" style="display: block;">
   <div class="controlPanel">
        <h3 class="panelTitle">Control Panel</h3>

        <div class="searchPanel">
       <input list="browsers" id="beaconSearch"> <a class="myButton2" onclick="searchObject('beacon');" id="searchButton" title="searchObject('beacon')">Search target</a> 
            <datalist id="browsers">
            <?php
           
            for($i=0;$i<count($result);$i++){
                echo "<option value=".$result[$i]->mac.">";
            }
            ?>
            
            </datalist>
            <br />
            <br />
            
             <input list="browsers2" id="reporterSearch"> <a class="myButton2" onclick="searchObject('reporter');" id="searchButton2" title="searchObject('reporter')">Search sensor</a> 
            <datalist id="browsers2">
            <?php
            echo "<option value=F0:27:65:28:01:64>";
            echo "<option value=10:A5:D0:11:06:36>";
            echo "<option value=cc:fa:00:a9:39:44>";
            echo "<option value=14:f6:5a:65:1c:07>";
            // for($i=0;$i<count($result2);$i++){
            //     echo "<option value=".$result2[$i][0]->mac.">";
            // }
            ?>
            
            </datalist>
            </div>

    </div>


 
</body>

</html>