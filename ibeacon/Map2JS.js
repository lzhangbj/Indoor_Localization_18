// JavaScript Document 2016/1/25
document.write("<script language=javascript src='localizationAlgorithm.js'></script>")
var map;						//Google Map Instance

var updating=true;				//Whether the map is updating

var showBeacon=true;			//Whether the beacon is being shown

var showReporter=true;			//Whether the reporter is being shown

var showingBeaconPath=false;	//Whether the ibeacon path is being shown

var showingReporterPath=false;	//Whether the reporter path is being shown

var markerlist=new Array(); 	//A list to temporally store marker instance when showing tracking

var beaconMap={};				//Marker instance showing the current location of all the ibeacon(MAC obj)

var reporterMap={};				//Marker instance showing the current location of all the reporter(MAC obj)

var path=new Array();			//array to save path, inorder to clean the map;

var beaconpath=new Array();		//array to save path, inorder to clean the map;

var colorBar={0:"red",1:"blue",2:"purple",3:"yellow",4:"green",5:"pink",6:"orange"}; //Color store

var beaconUpdateTime	=5000; //Time to update the position of all ibeacon

var reporterUpdateTime	=5000; //Time to update the position of all reporter

// var beaconPosiSource="https://eek123.ust.hk/Demo/clientAPI/poscal_result/interval"; //Two dimensional json array
// var beaconPosiSource="text.txt";
// var reporterPosiSource="https://eek123.ust.hk/Demo/clientAPI/reporter/0"; //Two dimensional json array OK
var reporterPosiSource = "sensorApi.php";
var beaconPosiSource = "rawDataApi.php";
var beaconPosiSourcePlus="https://eek123.ust.hk/Demo/clientAPI/poscal_result/interval/";// Two dimensional json array with the history position of all beacon, need a time parameter or two

var beaconPosiSourcePlus2="https://eek123.ust.hk/Demo/clientAPI/poscal_result/start/";// Two dimensional json array with the history position of all beacon, need a time parameter or two

var reporterPosiSourcePlus="https://eek123.ust.hk/Demo/clientAPI/reporter/"; //Two dimensional json array with the position record for reporters, need a time parameter or two

var reporterPathPeriod="https://eek123.ust.hk/Demo/clientAPI/reporter_period/"; //Two dimensional json array with the position record for reporters during a period specified by start and end in seconds
/////My Helper Functions////

//Get the Http responce from theUrl
function httpGet(theUrl){
    var xmlHttp = new XMLHttpRequest();
    // console.log(theUrl);
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}


//initial the google map and start to update the information
function initMap() {
	//Initial the map
	map = new google.maps.Map(document.getElementById('map'),{
		zoom: 19,
		center: {lat:22.334754065936046, lng:114.26302671432495}
	});


	
    //////////////////////////For temp test//////////////////////////////
	google.maps.event.addListener(map, "rightclick", function(event) {
		console.log("{lat:" +  event.latLng.lat() + ", lng:" + event.latLng.lng()+"}");
	});
   //////////////////////Right Click Show Position///////////////////////
 
    //Start updating
    updateMap(1000);
   updateReporter(1000);

   //showTrack(60);
}
//Show only one marker for each ibeacon every time ms
function updateMap(time){
    // console.log("----------------------------");
    if(showBeacon){
        var position1 = JSON.parse(httpGet(beaconPosiSource));  //two dimensional JSON array
        // console.log("----------------------------");
        var position = new ibeaconBeanGroup(position1).getAllBestLocations();

        // console.log(position1);
        
        // console.log(position);

		for(var i=0;i<position.length;i++){
			if(typeof(beaconMap[position[i].mac])=='undefined'){
				beaconMap[position[i].mac] = new beaconMarker(position[i]);
				beaconMap[position[i].mac].setColor(colorBar[i%7]);
                console.log("beaconMap[position[i].mac])=='undefined'");
			}else{

				if(!beaconMap[position[i].mac].equal(position[i])){
					beaconMap[position[i].mac].setPosi(position[i]);
                    console.log(position[i]);
					beaconMap[position[i].mac].time=parseInt(position[i].time);

				}
			}
		}
        
         
  }
  window.setTimeout("updateMap("+time+")",time);
}

// Update all the reporter's position on the map every time ms
function updateReporter(time){
	
    if(showReporter){

		var posi=JSON.parse(httpGet(reporterPosiSource)); //Two dimensional array with reporter position

		for(var i=0;i<posi.length;i++){
			if(typeof(reporterMap[posi[i][0].mac])=='undefined'){
			
				reporterMap[posi[i][0].mac]=new reporterMarker(posi[i][0]);
                // console.log(reporterMap);
				// console.log("Add");
			}else{  
				reporterMap[posi[i][0].mac].setPosi({"lat":parseFloat(posi[i][0].lat),"lng":parseFloat(posi[i][0].long)}); 
				reporterMap[posi[i][0].mac].time=parseInt(posi[i][0].ts);
                reporterMap[posi[i][0].mac].rssi=parseInt(posi[i][0].rssi);
				// console.log(reporterMap);
				// console.log(posi[i][0]);
			}
		}
		
	}else{

		// Clear memory
		for(var key in reporterMap){
			reporterMap[key].marker.setMap(null);
		}
		reporterMap={};
		
	}
    
    window.setTimeout("updateReporter("+time+")",time);
}





//Show or hide the reporter Debug on 2016/2/29 no problem now
function switchReporter(){
	showReporter=!showReporter;
	if(!showReporter){
		document.getElementById("reporterSwitch").innerHTML="Show Trucks";
		for(var key in reporterMap){
			reporterMap[key].marker.setMap(null);
		}
		reporterMap={};
	}else{
		document.getElementById("reporterSwitch").innerHTML="Hide Trucks";
		var posi=JSON.parse(httpGet(reporterPosiSource));
		for(var i=0;i<posi.length;i++){		
			if(typeof(reporterMap[posi[i][0].mac])=='undefined'){			
				reporterMap[posi[i][0].mac]=new reporterMarker(posi[i][0]);
			}else{  
				reporterMap[posi[i][0].mac].setPosi({"lat":parseFloat(posi[i][0].lat),"lng":parseFloat(posi[i][0].long)});  
			}	
		}
	} 
}

//Show path of all the beacons
//put the result line into beaconpath
function showBeaconPath(){
        document.getElementById("error").innerHTML="";
        for(var i=0;i<beaconpath.length;i++){
            beaconpath[i].setMap(null);
        }
        beaconpath=[];
        try{
        var time=parseInt(document.getElementById("loggyTime").value);
        showingBeaconPath=true;
        var source=JSON.parse(httpGet(beaconPosiSourcePlus+time));
		
        
        for(var i=0;i<source.length;i++){

            var record=new Array();
            for(var j=0;j<source[i].length;j++){
                record.push({"lat":parseFloat(source[i][j].lat),"lng":parseFloat(source[i][j].long)});
			
            }
            beaconpath.push(new google.maps.Polyline({
                path: record,
                geodesic: true,
                strokeColor: beaconMap[source[i][0].mac].pathColor,
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map:map
            }));
        
    }
        //Get information from the server and show it
    }catch(err){
        document.getElementById("error").innerHTML="Format Error, please input a number";
    }
}

//show all reporter path
//Put the result line into path
//result record into record
function showReporterPath(){
     document.getElementById("error").innerHTML="";
     for(var i=0;i<path.length;i++){
        path[i].setMap(null);
     }
     path=[];
    try{
     var time=parseInt(document.getElementById("trackerTime").value);
     var source=JSON.parse(httpGet(reporterPosiSourcePlus+time));
    
     showingReporterPath=true;
     for(var i=0;i<source.length;i++){
        var record=new Array();
        for(var j=0;j<source[i].length;j++){
          
            record.push({"lat":parseFloat(source[i][j].lat),"lng":parseFloat(source[i][j].long)});
			
        }
          
         path.push( new google.maps.Polyline({
                path: record,
                geodesic: true,
                strokeColor:reporterMap[source[i][0].mac].pathColor,
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map:map
            }));
        
     }
    }catch(err){
        document.getElementById("error").innerHTML="Format Error, please input a number";
    }
}

//Clear beaconpath and path
//Clear the result from search all
function resetMap(){
    for(var i=0;i<beaconpath.length;i++){
            beaconpath[i].setMap(null);
        }
        beaconpath=[];
    for(var i=0;i<path.length;i++){
        path[i].setMap(null);
    }
    path=[];
	showingBeaconPath=false;	
	showingReporterPath=false;
}


//Search object on map
function searchObject(type){
	var target;
    console.log("123");
	if(type=="beacon"){
		 target=beaconMap[document.getElementById('beaconSearch').value];
	}else{
		 target=reporterMap[document.getElementById('reporterSearch').value];
         console.log(target);
	}
	 toggleBounce(target.marker);
    map.panTo(target.getPosi(),3000);
   if(map.getZoom()<17){
	    map.setZoom(17);
	}
    var date = new Date(target.time*1000);
	
    document.getElementById("beaconInfo").innerHTML="<h3 class='InfoTitle'>Loggy: "+target.mac+"</h3>"+"<p class='InfoBody'>Latitude: "+target.lat+"<br>"+"Longitude: "+target.lng+"<br>Last Update: "+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"  "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"</p>";
   
}

//Show path in a period type is beacon or reporter
function searchPathInPeriod(type){
	var start=document.getElementById("start").value;
	var end=document.getElementById("end").value;
	start=new Date(start).getTime()/1000;
	end=new Date(end).getTime()/1000;
	var mac;
	var source;
	var targetArray;
	if(type=="beacon"){
		mac= document.getElementById("beaconPathSearch").value;
		source=beaconPosiSourcePlus2+start+"/end/"+end;//Another URL In need
		
		var record=JSON.parse(httpGet(source));
		targetArray=new Array();
		for(var i=0;i<record.length;i++){	
			if(record[i].mac==mac){
				targetArray.push(record[i]);	
			}
		} 
	}else{
		 mac= document.getElementById("reporterPathSearch").value;
		 source=reporterPathPeriod+start+"/"+end;//Reporter URL
		 var record=JSON.parse(httpGet(source));
		for(var i=0;i<record.length;i++){	
			if(record[i][0].mac==mac){
				targetArray=record[i];
				break;
			}else{
				continue;
			}	
		} 
	}
	
	
	drawPath(targetArray);
}
var reporter_path=new Array();
var reporter_record=new Array();
//Draw all points in targetArray and link them with line, the object used will be stored into reporter_path and reporter_record. The datetime of the marker and the mac will be shown on the map
function drawPath(targetArray){
    var posiSet=new Array(); //To Store all recorded position
   var mac=targetArray[0].mac;
   // put points to array
   for(var i=0;i<targetArray.length;i++){
	   
    var posi={
            "lat":parseFloat(targetArray[i].lat),
            "lng":parseFloat(targetArray[i].long)
    };
    posiSet.push(posi);
	
    var date = new Date(parseInt(targetArray[i].ts)*1000); 
	
    var time=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"  "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
	
	//show all position with a cross
    reporter_record.push(
        new google.maps.Marker({
            position:posi,
            icon:"wrong.png" ,  
            title: mac+" "+time,
            map: map
          
    })
    );
	//Draw a set of line
    reporter_path.push(new google.maps.Polyline({
            path: posiSet,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map:map
        }));
        
    
   }
}

//clear reporter_path(reproter path) and reporter_record(reporter marker), clear the result from search period
function clearSearch(){
    for(var i=0;i<reporter_path.length;i++){
        reporter_path[i].setMap(null);
    }
    for(var i=0;i<reporter_record.length;i++){
        reporter_record[i].setMap(null);
    }
    reporter_path=[];
    reporter_record=[];
}







//Main Data Structure
function beaconMarker(infoUnit){
    this.lat=parseFloat(infoUnit.lat);
    this.lng=parseFloat(infoUnit.lng);
    this.mac=infoUnit.mac;
    this.time=parseInt(infoUnit.ts);
    this.accuracy=parseFloat(infoUnit.accuracy);
    var pathColor=getRandomColor();

    this.marker=new google.maps.Marker({
        // console.log("setPosi");
        position:{"lat":this.lat,"lng":this.lng},   
        title: infoUnit.mac,
        map: map
          
    });
  	var mac=this.mac;
    this.marker.addListener('click', function(){
       
    	var target=beaconMap[mac];
    	
        map.panTo(target.getPosi(),3000);
        if(map.getZoom()<17) {
    		map.setZoom(17);
    	}
        var date = new Date(target.time*1000); 
        document.getElementById("beaconInfo").innerHTML="<h3 class='InfoTitle'>Loggy: "+target.mac+"</h3>"+"<p class='InfoBody'>Latitude: "+target.lat+"<br>"+"Longitude: "+target.lng+"<br>Last Update: "+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"  "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"</p>";
    
    
    });

    this.setColor=function(color){
        var path=color+".png";
        this.marker.setIcon(path);
    }
    
     
    this.setPosi=function(newPosi){
		 newPosi={lat:parseFloat(newPosi.lat),lng:parseFloat(newPosi.lng)};
        var loc=this.getPosi();
        var pathColor=this.pathColor;
        // console.log(newPosi);
        if(showingBeaconPath){

            var line=[
                loc,
                newPosi
             ];
            beaconpath.push( new google.maps.Polyline({
                path: line,
                geodesic: true,
                strokeColor: pathColor,
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map:map
            }));
           
            // console.log("1");
            this.marker.setPosition(newPosi); 
    
        }else{
            // console.log("2");
            this.marker.setPosition(newPosi);    
        }
         this.lat=newPosi.lat;
        this.lng=newPosi.lng;
    }
    this.equal=function(point){
        return this.lat==point.lat&&this.lng==point.lng&&this.mac==point.mac;
    }
    
    this.getPosi=function(){
        return {
          "lat":this.lat,
          "lng":this.lng  
        };
    }
    this.getPathColor=function(){
        return pathColor;
    }
}

function reporterMarker(infoUnit){
	
    this.lat=parseFloat(infoUnit.lat);
    this.lng=parseFloat(infoUnit.long);
    this.mac=infoUnit.mac;
    this.time=parseInt(infoUnit.ts);
    this.pathColor=getRandomColor();
    this.marker=new google.maps.Marker({
            position:{"lat":this.lat,"lng":this.lng},  
            title: infoUnit.mac,
            icon: "reporter.png",
            map: map
          
    });
    
    this.marker.addListener('click', function() {
       
         var target=reporterMap[this.title];
        map.panTo(target.getPosi(),3000);
        if(map.getZoom()<17) map.setZoom(17);
        var date = new Date(target.time*1000); 
        document.getElementById("beaconInfo").innerHTML="<h3 class='InfoTitle'>Tracker: "+target.mac+"</h3>"+"<p class='InfoBody'>Latitude: "+target.lat+"<br>"+"Longitude: "+target.lng+"<br>Last Update: "+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"  "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"</p>";
    
    
       });
    
	//IF Showing path, we need to add line also
     this.setPosi=function(newPosi){  
		
         var loc=this.getPosi();
         var pathColor=this.pathColor;
        if(showingReporterPath){

             var line=[
                loc,
                newPosi
             ];
            path.push(new google.maps.Polyline({
                path: line,
                geodesic: true,
                strokeColor: pathColor,
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map:map
            }) );
            
            
           this.marker.setPosition(newPosi); 
    
        }else{
            this.marker.setPosition(newPosi); 
        }   
        this.lat=newPosi.lat;
        this.lng=newPosi.lng;
    }
    this.equal=function(point){
        return this.lat==point.lat&&this.lng==point.lng&&this.mac==point.mac;
    }
     this.getPosi=function(){
        return {
          "lat":this.lat,
          "lng":this.lng  
        };
    }
    
}






//Didn't used functions

function initialMarker(){
    var y=JSON.parse(httpGet(reporterPosiSourcePlus+60));
    var arr=new ibeaconBeanGroup(y).getAllBestLocations();
    //clearMap();
    for(var i=0;i<arr.length;i++){
     // console.log(arr[i]);
     beaconMap[arr[i].mac]=new beaconMarker(arr[i]);
       //markerlist.push(new beaconMarker(arr[i]));
    }
}

//Show the moving track for each ibeacon in a period of time
function showTrack(peroid){
	var position=JSON.parse(httpGet(beaconPosiSourcePlus+peroid));  //Target URL Two dimensional json array
	 
	for(var i=0;i<position.length;i++){
		var list=new Array();
		for(var j=0;j<position[i].length;j++){
		   list.push(new beaconMarker(position[i][j]));
		}
		var flightPath = new google.maps.Polyline({
			path: list,
			geodesic: true,
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 2,
			map:map
		});
		markerlist.push(list);
	}
}
