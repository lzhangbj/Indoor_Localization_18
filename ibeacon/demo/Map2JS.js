// JavaScript Document 2016/1/25
var map;
var markerlist=new Array(); //For tracking
var searchMap={};
var reporterMap={};
var updating=true;
var showBeacon=true;
var showReporter=true;
var colorBar={0:"red",1:"blue",2:"purple",3:"yellow",4:"green",5:"pink",6:"orange"};
/////My Helper Functions////
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function initMap() {
   map = new google.maps.Map(document.getElementById('map'),{
    zoom: 19,
    center: {lat:22.334754065936046, lng:114.26302671432495}
  });
  
    //////////////////////////For temp test//////////////////////////////
  google.maps.event.addListener(map, "rightclick", function(event) {
    console.log("{lat:" +  event.latLng.lat() + ", lng:" + event.latLng.lng()+"}");
 });
   //////////////////////Right Click Show Position///////////////////////
 
     
    // updateMap(5000,0);
    myUpdateMap(1000);
   updateReporter(1000);
   //showTrack(60);
   }
function initialMarker(){
    var y=JSON.parse(httpGet('https://143.89.50.151/Demo/clientAPI/loggy/60'));
    var arr=new ibeaconBeanGroup(y).getAllBestLocations();
    //clearMap();
    for(var i=0;i<arr.length;i++){
     // console.log(arr[i]);
     searchMap[arr[i].mac]=new beaconMarker(arr[i]);
       //markerlist.push(new beaconMarker(arr[i]));
    }
}

//Show the moving track for each ibeacon in a period of time
function showTrack(peroid){
     var position=JSON.parse(httpGet("https://143.89.50.151/Demo/clientAPI/loggy/"+peroid));  //Target URL
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
//Show only one marker for each ibeacon
function updateMap(time){
    if(showBeacon){
          var position=JSON.parse(httpGet("http://10.89.116.121:8080/ibeaconCLient/localizationAlgorithm.php"));  //Target URL
          
          for(var i=0;i<position.length;i++){
            for(var j=0;j<position[i].length;j++){
                if(typeof(searchMap[position[i][j].mac])=='undefined'){
                  searchMap[position[i][j].mac]=new beaconMarker(position[i][j]);
                   searchMap[position[i][j].mac].setColor(colorBar[i%7]);
                }else{
                    if(!searchMap[position[i][j].mac].equal(position[i][j])){
                        searchMap[position[i][j].mac].setPosi(position[i][j]);
                    }
                }
            }
          }
         
  }
   window.setTimeout("updateMap("+time+")",time);
}
function updateReporter(time){
    if(showReporter){
         
        var posi=JSON.parse(httpGet("https://143.89.50.151/Demo/clientAPI/reporter"));
        for(var i=0;i<posi.length;i++){
            if(typeof(reporterMap[posi[i].mac])=='undefined'){
                
                reporterMap[posi[i].mac]=new reporterMarker(posi[i]);
               // console.log("Add");
            }else{  
                reporterMap[posi[i].mac].setPosi({"lat":parseFloat(posi[i].lat),"lng":parseFloat(posi[i].long)});  
            }
        }
       
    }else{
        for(var key in reporterMap){
            reporterMap[key].marker.setMap(null);
        }
        reporterMap={};
    }
     window.setTimeout("updateReporter("+time+")",time);
}
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
     var posi=JSON.parse(httpGet("https://143.89.50.151/Demo/clientAPI/reporter"));
        for(var i=0;i<posi.length;i++){
            if(typeof(reporterMap[posi[i].mac])=='undefined'){
                
                reporterMap[posi[i].mac]=new reporterMarker(posi[i]);
               // console.log("Add");
            }else{  
                reporterMap[posi[i].mac].setPosi({"lat":parseFloat(posi[i].lat),"lng":parseFloat(posi[i].long)});  
            }
        }
  }
  
}
function myUpdateMap(time){
  console.log("Add");
    var y=JSON.parse(httpGet('https://143.89.50.151/Demo/clientAPI/loggy/60'));
    var arr=new ibeaconBeanGroup(y).getAllBestLocations();
     //clearMap();
   
   for(var i=0;i<arr.length;i++){
     if(typeof(searchMap[arr[i].mac])=='undefined'){
          searchMap[arr[i].mac]=new beaconMarker(arr[i]);  
           searchMap[arr[i].mac].setColor(colorBar[i%7]);
      }else{
           searchMap[arr[i].mac].setPosi(arr[i]);
        
      }
   }
  if(updating){ 
       window.setTimeout("myUpdateMap("+time+")",time); 
    }
}
/*function clearMap(){
    for(var i=0;i<markerlist.length;i++){
        markerlist[i].setMap(null);
    }
    markerlist=[];
}*/

//{
//    lat:loc.lat,                  //The current latitude of the ibeacon
//    lng:loc.lng,                  //The current longitude of the ibeacon 
//    mac:this.getBean(i,0).mac,      //The mac address used to identify the ibeacon
//    time:this.getBean(i,0).time,    //The last update time
//    accuracy:0                     //The accuracy, haven't been used, but may be useful in the future
// }
function beaconMarker(infoUnit){
    this.lat=parseFloat(infoUnit.lat);
    this.lng=parseFloat(infoUnit.lng);
    this.mac=infoUnit.mac;
    this.time=parseInt(infoUnit.time);
    this.accuracy=infoUnit.accuracy;
    this.marker=new google.maps.Marker({
            position:{"lat":this.lat,"lng":this.lng},   
            title: infoUnit.mac,
            map: map
          
    });
  
    this.marker.addListener('click', function() {
       
         var target=searchMap[this.title];
       map.panTo(target.getPosi(),3000);
    map.setZoom(17);
    var date = new Date(target.time*1000); 
    document.getElementById("beaconInfo").innerHTML="<h3 class='InfoTitle'>Loggy: "+target.mac+"</h3>"+"<p class='InfoBody'>Latitude: "+target.lat+"<br>"+"Longitude: "+target.lng+"<br>Last Update: "+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"  "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"</p>";
    
    
       });

    this.setColor=function(color){
        var path="http://maps.google.com/mapfiles/ms/icons/"+color+"-dot.png";
         this.marker.setIcon(path);
    }
    /*this.setColor=function(R,G,B){
        if(R>255||G>255||B>255||R<0||G<0||B<0){
            return;
        }
        var rv=R.toString(16).toUpperCase();
        var gv=G.toString(16).toUpperCase();
        var bv=B.toString(16).toUpperCase();
        if(rv.length==1) rv="0"+rv;
        if(gv.length==1) gv="0"+gv;
        if(bv.length==1) bv="0"+bv;
        color=rv+gv+bv;
        console.log(color);
         var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color,  new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
        this.marker.setIcon(pinImage);
    } */
    this.setPosi=function(newPosi){  
        this.marker.setPosition(newPosi);    
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

function reporterMarker(infoUnit){
    this.lat=parseFloat(infoUnit.lat);
    this.lng=parseFloat(infoUnit.long);
    this.mac=infoUnit.mac;
    this.time=parseInt(infoUnit.ts);
    
    this.marker=new google.maps.Marker({
            position:{"lat":this.lat,"lng":this.lng},  
            title: infoUnit.mac,
            icon: "reporter.png",
            map: map
          
    });
    
    this.marker.addListener('click', function() {
       
         var target=reporterMap[this.title];
        map.panTo(target.getPosi(),3000);
        map.setZoom(17);
        var date = new Date(target.time*1000); 
        document.getElementById("beaconInfo").innerHTML="<h3 class='InfoTitle'>Truck: "+target.mac+"</h3>"+"<p class='InfoBody'>Latitude: "+target.lat+"<br>"+"Longitude: "+target.lng+"<br>Last Update: "+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"  "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"</p>";
    
    
       });
    
     this.setPosi=function(newPosi){  
        this.marker.setPosition(newPosi);    
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

function searchBeacon(){
    var target=searchMap[document.getElementById('beaconSearch').value];
    toggleBounce(target.marker);
    map.panTo(target.getPosi(),3000);
    map.setZoom(17);
    var date = new Date(target.time*1000); 
    document.getElementById("beaconInfo").innerHTML="<h3 class='InfoTitle'>Loggy: "+target.mac+"</h3>"+"<p class='InfoBody'>Latitude: "+target.lat+"<br>"+"Longitude: "+target.lng+"<br>Last Update: "+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"  "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"</p>";
    
    
}


  /////////////////////////////////////////////////////////////////
 
function toggleBounce(marker) {
     
  if (marker.getAnimation() !== null&&marker.getAnimation()+"" != "undefined") {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null)
    }, 3000);
  }
}




