<?php

$sensor2 = array('mac' => "D0:22:BE:F6:F7:04", 'targer_rssi' => 0, 'lat' => 0, 'long' => 0, 'ts' => 0);
$sensor3 = array('mac' => "10:A5:D0:11:06:36", 'targer_rssi' => 0, 'lat' => 0, 'long' => 0, 'ts' => 0);
$sensor1 = array('mac' => "cc:fa:00:a9:39:44", 'targer_rssi' => 0, 'lat' => 0, 'long' => 0, 'ts' => 0);

$sensor = [$sensor1,$sensor2];

function getLastFewLines($handle,$n){
	$pos = -2;
	$str = "";
	while($n>0){
		$eof = "";
		while($eof!="\n"){
			if(!fseek($handle, $pos, SEEK_END)){
				$eof = fgetc($handle);
				$pos--;
			}else{
				break;
			}
		}
		if($n == 20){
			$temp = fgets($handle);
		}else{
			$temp = fgets($handle).",";
		}		
		$str = $temp.$str;
		$n--;
	}
	$str = "[[".$str."]]";
	return $str;
}

$handle = fopen("sensor.txt", "r+");


echo getLastFewLines($handle,20);

// $result = json_decode(getLastFewLines($handle,10));
// // print_r($result[0][0]);
// // echo $result[0][0]->mac;
// // echo count($result[0]); 
// // echo $result[0][0]->mac;
// for ($i=0; $i < count($result[0]); $i++) {

// 	if ($sensor1['mac'] == $result[0][$i]->mac) {
// 		if ($sensor1['targer_rssi'] == 0) {
// 			$sensor1['targer_rssi'] = $result[0][$i]->rssi;

// 		}else{
// 			$sensor1['targer_rssi'] = ($result[0][$i]->rssi + $sensor1['targer_rssi'])/2;
// 		}
// 		// echo $sensor1['mac']." ".$result[0][$i]->rssi."</br>" ;

// 		if ($sensor1['lat'] == 0) {
// 			$sensor1['lat'] = $result[0][$i]->lat;

// 		}else{
// 			$sensor1['lat'] = ($result[0][$i]->lat + $sensor1['lat'])/2;
// 		}
// 		// echo $sensor1['lat']." ".$result[0][$i]->lat."</br>" ;

// 		if ($sensor1['long'] == 0) {
// 			$sensor1['long'] = $result[0][$i]->long;

// 		}else{
// 			$sensor1['long'] = ($result[0][$i]->long + $sensor1['long'])/2;
// 		}
// 		// echo $sensor1['long']." ".$result[0][$i]->long."</br>" ;
// 	}
// }
// echo $sensor1['targer_rssi']."</br>";
// echo $sensor1['lat']."</br>";
// echo $sensor1['long']."</br>";
