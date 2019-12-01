
//////////////////////////Created by Xinyu ZHU on 18th, Jan 2016///////////////////////////////////////

////////////Helper functions/////////////////



function rssi2distance(rssi,A,n){  
    var result=Math.pow(10,(A-rssi)/(10*n));
    //console.log("The rssi "+rssi+" Dist:"+result);
    return result;
}

function dist2latdiffer(dist){
    return dist/3600/30.887;
}


function dist2lngdiffer(dist,lat){
    return Math.abs(dist/3600/(30.887*Math.cos(lat * (Math.PI / 180))));
}


function distanceOnEarth(lat1,lng1,lat2,lng2){ 
    var x=(lat1-lat2)*30.887*3600;
    var y=(lng1-lng2)*(30.887*Math.cos((lat1+lat2)/2 * (Math.PI / 180)))*3600;
    
    return Math.pow(Math.pow(x,2)+Math.pow(y,2),0.5);
}

// Returns the inverse of matrix `M`. http://blog.acipo.com/matrix-inversion-in-javascript/
  function matrix_invert(M){
    // I use Guassian Elimination to calculate the inverse:
    // (1) 'augment' the matrix (left) by the identity (on the right)
    // (2) Turn the matrix on the left into the identity by elemetry row ops
    // (3) The matrix on the right is the inverse (was the identity matrix)
    // There are 3 elemtary row ops: (I combine b and c in my code)
    // (a) Swap 2 rows
    // (b) Multiply a row by a scalar
    // (c) Add 2 rows
    
    //if the matrix isn't square: exit (error)
     // console.log("Input M is" + M);
    if(M.length !== M[0].length){
      
        return;
    }
    
    //create the identity matrix (I), and a copy (C) of the original
    var i=0, ii=0, j=0, dim=M.length, e=0, t=0;
    var I = [], C = [];
    for(i=0; i<dim; i+=1){
        // Create the row
        I[I.length]=[];
        C[C.length]=[];
        for(j=0; j<dim; j+=1){
            
            //if we're on the diagonal, put a 1 (for identity)
            if(i==j){ I[i][j] = 1; }
            else{ I[i][j] = 0; }
            
            // Also, make the copy of the original
            C[i][j] = M[i][j];
        }
    }
    
    // Perform elementary row operations
    for(i=0; i<dim; i+=1){
        // get the element e on the diagonal
        e = C[i][i];
        
        // if we have a 0 on the diagonal (we'll need to swap with a lower row)
        if(e==0){
            //look through every row below the i'th row
            for(ii=i+1; ii<dim; ii+=1){
                //if the ii'th row has a non-0 in the i'th col
                if(C[ii][i] != 0){
                    //it would make the diagonal have a non-0 so swap it
                    for(j=0; j<dim; j++){
                        e = C[i][j];       //temp store i'th row
                        C[i][j] = C[ii][j];//replace i'th row by ii'th
                        C[ii][j] = e;      //repace ii'th by temp
                        e = I[i][j];       //temp store i'th row
                        I[i][j] = I[ii][j];//replace i'th row by ii'th
                        I[ii][j] = e;      //repace ii'th by temp
                    }
                    //don't bother checking other rows since we've swapped
                    break;
                }
            }
            //get the new diagonal
            e = C[i][i];
            //if it's still 0, not invertable (error)
            if(e==0){
                for(var i=0;i<M.length;i++){
                      M[i][i]*=1.000001;
                }
             
                return matrix_invert(M);
            }
        }
        
        // Scale this row down by e (so we have a 1 on the diagonal)
        for(j=0; j<dim; j++){
            C[i][j] = C[i][j]/e; //apply to original matrix
            I[i][j] = I[i][j]/e; //apply to identity
        }
        
        // Subtract this row (scaled appropriately for each row) from ALL of
        // the other rows so that there will be 0's in this column in the
        // rows above and below this one
        for(ii=0; ii<dim; ii++){
            // Only apply to other rows (we want a 1 on the diagonal)
            if(ii==i){continue;}
            
            // We want to change this element to 0
            e = C[ii][i];
            
            // Subtract (the row above(or below) scaled by e) from (the
            // current row) but start at the i'th column and assume all the
            // stuff left of diagonal is 0 (which it should be if we made this
            // algorithm correctly)
            for(j=0; j<dim; j++){
                C[ii][j] -= e*C[i][j]; //apply to original matrix
                I[ii][j] -= e*I[i][j]; //apply to identity
            }
        }
    }
    
    //we've done all operations, C should be the identity
    //matrix I should be the inverse:
   
    return I;

}
function multiplyMatrix(a, b) {
   var aNumRows = a.length, aNumCols = a[0].length,
      bNumRows = b.length, bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}
function MatrixTranspose (M){
    var I=new Array(M[0].length);
    for(var i=0;i<M[0].length;i++){
        var row=new Array(M.length);
        for(var j=0;j<M.length;j++){
            row[j]=M[j][i];
        }
       I[i]=row;  
    }
   
    return I;
}
//calculate for lattidute only
function getTrilaterationForMultiPointsForLat(points,A,n){
  // console.log(points.length);
    if(points.length>=3){
        var MatrixA=new Array();
        var MatrixB=new Array();
        var x02plussy02=Math.pow(points[0].lat,2)+Math.pow(points[0].lng,2);
        
        for(var i=1;i<points.length;i++){
            if(!points[i].equal(points[0])){
                var row=new Array();
                row.push(2*(points[i].lat-points[0].lat));
                row.push(2*(points[i].lng-points[0].lng));
                MatrixA.push(row);
                var rowB=new Array();
                rowB.push(Math.pow(points[0].getDistForLat(A,n),2)-Math.pow(points[i].getDistForLat(A,n),2)+Math.pow(points[i].lat,2)+Math.pow(points[i].lng,2)-x02plussy02);
              
                MatrixB.push(rowB);
            }
        }
        var transposeA=MatrixTranspose(MatrixA); 
        var ATA=multiplyMatrix(transposeA,MatrixA); 
        var ATB=multiplyMatrix(transposeA,MatrixB);     
        var rATA=matrix_invert(ATA);   
        var result=multiplyMatrix(rATA,ATB);     
        // console.log(result[0][0]);
        // console.log(result[1][0]);
        return{
          lat:result[0][0],
          lng:result[1][0]
        };
        
    
    }else if(points.length==2){
             //Only two samples

             return{
             lat:(points[0].lat+points[1].lat)/2,
             lng:(points[0].lng+points[1].lng)/2
         };
        }else if(points.length==1){
             //Only one samples
             return{
             lat:points[0].lat,
             lng:points[0].lng
         };
     }else{
         //No Samples
          return{
             lat:0,
             lng:0
         };
     }
}
function getTrilaterationForMultiPointsForLng(points,A,n){
    if(points.length>=3){
        var MatrixA=new Array();
        var MatrixB=new Array();
        var x02plussy02=Math.pow(points[0].lat,2)+Math.pow(points[0].lng,2);
        for(var i=1;i<points.length;i++){
             if(!points[i].equal(points[0])){
                var row=new Array();
                row.push(2*(points[i].lat-points[0].lat));
                row.push(2*(points[i].lng-points[0].lng));
                MatrixA.push(row);
                var rowB=new Array();
                rowB.push(Math.pow(points[0].getDistForLng(A,n),2)-Math.pow(points[i].getDistForLng(A,n),2)+Math.pow(points[i].lat,2)+Math.pow(points[i].lng,2)-x02plussy02); //This line is the only line different from  getTrilaterationForMultiPointsForLat()
                MatrixB.push(rowB);
            }
        }
        var transposeA=MatrixTranspose(MatrixA);
        
        var ATA=multiplyMatrix(transposeA,MatrixA);var rATA=matrix_invert(ATA);
        var ATB=multiplyMatrix(transposeA,MatrixB);
       
        var result=multiplyMatrix(rATA,ATB);
      
        return{
          lat:result[0][0],
          lng:result[1][0]
        };
    
    }else if(points.length==2){
             //Only two samples
             return{
             lat:(points[0].lat+points[1].lat)/2,
             lng:(points[0].lng+points[1].lng)/2
         };
        }else if(points.length==1){
             //Only one samples
             return{
             lat:points[0].lat,
             lng:points[0].lng
         };
     }else{
         //No Samples
          return{
             lat:0,
             lng:0
         };
     }
}
function getTrilaterationForMultiPoints(points,A,n){
  // console.log(getTrilaterationForMultiPointsForLat(points,A,n).lat);
  // console.log(getTrilaterationForMultiPointsForLat(points,A,n).lng);
    return {
        lat:getTrilaterationForMultiPointsForLat(points,A,n).lat,
        lng:getTrilaterationForMultiPointsForLng(points,A,n).lng
    };
}



//////////////////////Data structure//////////////////////////////////

//One single ibeacon
function ibeaconBean(beacon){

    this.mac        =beacon.mac;                                         
    this.reporter    =beacon.reporter;                                  
    this.lat        =parseFloat(beacon.lat);
    this.lng        =parseFloat(beacon.long);
    this.rssi       =parseFloat(beacon.rssi);
    this.time       =parseInt(beacon.ts);
   
    
    
    this.getRadius=function(A,n){
        return rssi2distance(this.rssi,A,n);
    };
    
    this.getDistForLat=function(A,n){
        return rssi2distance(this.rssi,A,n)/30.887/3600;
    }
    this.getDistForLng=function(A,n){
         return rssi2distance(this.rssi,A,n)/(30.887*Math.cos(this.lat * (Math.PI / 180)))/3600;
    }
    this.getPosi=function(){
        return {"lat" :this.lat, "lng" :this.lng};
    };
    

    this.equal=function(ibeacon){
        if(this.lat==ibeacon.lat &&this.lng==ibeacon.lng){
            return true;
        }else{
            return false;
        }
    };

     this.isSameAs=function(ibeacon){
        if(this.lat==ibeacon.lat &&this.lng==ibeacon.lng&&this.mac==ibeacon.mac&&this.time==ibeacon.time&&this.reporter==ibeacon.reporter&&this.rssi==ibeacon.rssi){
            return true;
        }else{
            return false;
        }
    };
}
//A list of ibeacon with the same MAC
//JsonBeans should be in the following format(one dimensional)
//[{"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33763532","long":"114.26810866","rssi":"-95","ts":"1452761090"},{"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33765308","long":"114.26816469","rssi":"-91","ts":"1452761083"},{"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33765956","long":"114.2681932","rssi":"-92","ts":"1452761081"}]
function ibeaconBeanList(jsonBeans){
   
    this.beans = new Array();     //The list of the bean
    this.A = -75;               //Default A
    this.n = 2;                 //Default n 2 is relatively good for outdoor environment
    this.threshold = rssi2distance(-100,this.A,this.n);
    // console.log(jsonBeans[0].mac);
    for(var i = 0; i < jsonBeans.length; i++){
        var jsonBean = new ibeaconBean(jsonBeans[i]);
        //Do not keep samples that is reported at the same time and at the same position with the same rssi 
       if(i >= 1 && this.beans[this.beans.length-1].isSameAs(jsonBean)){
           continue; 
        }else{
             this.beans.push(jsonBean);    
        }
    }
    
    this.setAN=function(A,N){
        this.A=A;
        this.n=N;
        this.threshold= rssi2distance(-100,this.A,this.n);
    };
    
   //Good 
    this.getLocationByWeightedNonLinearTest=function(times,removeError){
        if(removeError) this.removeError(this.threshold);
        if(this.beans.length<3){
            var result=this.getCurrentLocation();
             // console.log("Less then 3 points The result is "+result.lat+" "+result.lng);
            return result
        }
        var loc=this.getCurrentLocation();
        // console.log(this.beans.length);
        var rlat;var rlng;
        for(var i=0;i<times;i++){
            rlat=this.getLocationByWeightedNonLinearForLat(loc.lat,loc.lng).lat;
            rlng=this.getLocationByWeightedNonLinearForLng(loc.lat,loc.lng,loc.lat).lng;
            // console.log(rlat);
            // console.log(rlng);
            loc={lat:rlat,lng:rlng};
        }
        if(!(isNaN(rlat)||isNaN(rlng))){
               // console.log("The result is "+rlat+" "+rlng);
          return {
              lat:rlat,
              lng:rlng};
        }else{
               console.log("NonLinearTest is not good The result is "+loc.lat+" "+loc.lng);
          return{
              lat:loc.lat,
              lng:loc.lng};
        }
        };
    
    //helper function good
    this.getLocationByWeightedNonLinearForLat=function(x0,y0){
        //Get di Ai Bi
        var di=new Array();
        var Ai=new Array();
        var Bi=new Array();
        var harmonicSum=0;
        for(var i=0;i<this.beans.length;i++){
             di.push(dist2latdiffer(rssi2distance(this.beans[i].rssi,this.A,this.n)));//

             // console.log(i);
              harmonicSum+=1/di[i];
              Ai.push((x0-this.beans[i].lat)/Math.pow(Math.pow(x0-this.beans[i].lat,2)+Math.pow(y0-this.beans[i].lng,2),0.5));
              Bi.push((y0-this.beans[i].lng)/Math.pow(Math.pow(x0-this.beans[i].lat,2)+Math.pow(y0-this.beans[i].lng,2),0.5));
        }
        //Get ki
        var ki=new Array();
        var kiSum=0;
        var resultX=0;
       // var resultY=0;
        for(var i=0;i<this.beans.length;i++){
            ki.push(1/di[i]*harmonicSum);
            resultX+=(ki[i]*this.beans[i].lat-ki[i]*di[i]*Ai[i]);
            //resultY+=(ki[i]*this.beans[i].lng-ki[i]*di[i]*Bi[i]);
            kiSum+=ki[i];
        }
        resultX/=kiSum;
       // resultY/=kiSum;
     
        return {
            lat:resultX,
            //lng:resultY
        };
    };
    //helper function
    this.getLocationByWeightedNonLinearForLng=function(x0,y0,lat){
         //Get di Ai Bi
        var di=new Array();
        var Ai=new Array();
        var Bi=new Array();
        var harmonicSum=0;
        for(var i=0;i<this.beans.length;i++){
             di.push(dist2lngdiffer(rssi2distance(this.beans[i].rssi,this.A,this.n),lat));//This line is the only one that differ from getLocationByWeightedNonLinearForLat()
               
              harmonicSum+=1/di[i];
              Ai.push((x0-this.beans[i].lat)/Math.pow(Math.pow(x0-this.beans[i].lat,2)+Math.pow(y0-this.beans[i].lng,2),0.5));
              Bi.push((y0-this.beans[i].lng)/Math.pow(Math.pow(x0-this.beans[i].lat,2)+Math.pow(y0-this.beans[i].lng,2),0.5));
        }
       //Get ki
        var ki=new Array();
        var kiSum=0;
       // var resultX=0;      
        var resultY=0;
        for(var i=0;i<this.beans.length;i++){
            ki.push(1/di[i]*harmonicSum);
           // resultX+=(ki[i]*this.beans[i].lat-ki[i]*di[i]*Ai[i]);
            resultY+=(ki[i]*this.beans[i].lng-ki[i]*di[i]*Bi[i]);
            kiSum+=ki[i];
        }
       // resultX/=kiSum;
        resultY/=kiSum;
     
        return {
            //lat:resultX,
            lng:resultY       //Here is differ from getLocationByWeightedNonLinearForLat()!
        };
       };
    
    //The function to remove error points start from behind
    this.removeError=function(threshold){
         var posi;
         var needMore;       
        do{
            needMore=false;
          posi=this.getCurrentLocation();
            var jj=this.beans.length-1;
            for(var j=jj;j>=0;j--){
                if(distanceOnEarth(this.beans[j].lat,this.beans[j].lng,posi.lat,posi.lng)>threshold){
                    needMore=true;                
                    this.beans.pop();            
                    posi=this.getCurrentLocation();              
                }
            }
        }while(needMore);
    }
    this.getCurrentLocation=function(){
       return getTrilaterationForMultiPoints(this.beans,this.A,this.n);
     
    };
    
    //Add these information to another table in the database
    this.generateInfoUnit=function(){
         var loc=this.getLocationByWeightedNonLinearTest(3,true);  //3 or 2 or other
         return  {
            lat:loc.lat,                  //The current location of the ibeacon
            lng:loc.lng,                  //The current location of the ibeacon 
            mac:this.beans[0].mac,      //The mac address used to identify the ibeacon
            time:this.beans[0].time,    //The last update time
            accuracy:0                     //The accuracy, haven't been used, but may be useful in the future
         };
    }
}

//The set of all record, grouped by mac address
//jsonList are expected to be in the following format (two dimensional)
//[[{"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33763532","long":"114.26810866","rssi":"-95","ts":"1452761090"}],[{"mac":"78:A5:04:13:3C:AF","reporter":"74:51:ba:b6:72:b1","lat":"22.33744713","long":"114.26782729","rssi":"-92","ts":"1452761123"}],[{"mac":"78:A5:04:13:3D:E8","reporter":"74:51:ba:b6:72:b1","lat":"22.33767033","long":"114.26791522","rssi":"-96","ts":"1452761045"}],[{"mac":"78:A5:04:13:3B:6E","reporter":"74:51:ba:b6:72:b1","lat":"22.33757817","long":"114.2679699","rssi":"-88","ts":"1452761099"}],[{"mac":"78:A5:04:13:3D:D5","reporter":"74:51:ba:b6:72:b1","lat":"22.33735357","long":"114.26778675","rssi":"-99","ts":"1452760955"}]]
function ibeaconBeanGroup(jsonList){
    this.beanlists=new Array();

    for(var i=0;i<jsonList.length;i++){
      this.beanlists.push(new ibeaconBeanList(jsonList[i]));
    }
    
    this.getAllBestLocations=function(){
      // console.log("getAllBestLocations");
      result=new Array();
      // console.log(this.beanlists[0]);
      for(var i=0;i<this.beanlists.length;i++){     
           result.push(this.beanlists[i].generateInfoUnit());
      }
      return result;
    }

    this.getNearestLocation = function(){
      result=new Array();
      var result;
      console.log(jsonList[0][0].mac);
      for (var i = 0; i < jsonList[0].length; i++) {
        if (result.rssi >= jsonList[0][i].rssi) {

        }else{
          result = jsonList[0][i];
          console.log("getNearestLocation");
        }
      }
      
    }    
}




//Appendix : How to use these function
//1. System start, use 
//var ibp=new ibeaconBeanGroup(jsonlist); to get the object ibp, which contains all the initial position information of all ibeacon
//where jsonlist is the two dimensional array gotten from https://143.89.144.241/Demo/clientAPI/loggy/60 (60 seconds)
//ibo.getAllBestLocations() will return an array of json format. Each of the object in this array is a record like this:

//{
//    lat:loc.lat,                  //The current latitude of the ibeacon
//    lng:loc.lng,                  //The current longitude of the ibeacon 
//    mac:this.getBean(i,0).mac,      //The mac address used to identify the ibeacon
//    time:this.getBean(i,0).time,    //The last update time, This is the time when the ibeacon is last seen by the detector
//    accuracy:0                     //The accuracy, haven't been used, but may be useful in the future
// }

//This record will then be stored into another table in the database with a timestamp, we use this method to ensure that every ibeacon is going to be shown on the map after the system start

//2. When using
//Everytime, when a mobilephone or other device send a post request to the server which means add a sample record for a ibeacon to the database
//The server need to generate a one dimensional json array containing the information about that  ibeacon in the latest 60 seconds (according to the mac address of the ibeacon, here is 78:A5:04:13:3F:AB)
//like [{"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33763532","long":"114.26810866","rssi":"-95","ts":"1452761090"},
//    {"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33765308","long":"114.26816469","rssi":"-91","ts":"1452761083"},
//    {"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33765956","long":"114.2681932","rssi":"-92","ts":"1452761081"},
//    {"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33772016","long":"114.2681686","rssi":"-87","ts":"1452761072"},
//    {"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33772582","long":"114.26817716","rssi":"-87","ts":"1452761072"},
//    {"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.337707","long":"114.26814845","rssi":"-96","ts":"1452761069"},
//    {"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33772764","long":"114.26803553","rssi":"-96","ts":"1452761059"},
//    {"mac":"78:A5:04:13:3F:AB","reporter":"74:51:ba:b6:72:b1","lat":"22.33772764","long":"114.26803553","rssi":"-96","ts":"1452761059"}] (named by 'jsonarray')
//and use var newlist=new ibeaconBeanList(jsonarray) to get an object containing the above information
//Call function newlist.generateInfoUnit() to get a calculated record
//{
//    lat:loc.lat,                  //The current latitude of the ibeacon
//    lng:loc.lng,                  //The current longitude of the ibeacon 
//    mac:this.getBean(i,0).mac,      //The mac address used to identify the ibeacon
//    time:this.getBean(i,0).time,    //The last update time
//    accuracy:0                     //The accuracy, haven't been used, but may be useful in the future
// }
//Add this record to the server with a time stamp, not update, here we need to add so that we can trace the target with some historical record
//The only difference between ibo.getAllBestLocations() and newlist.generateInfoUnit() is the former return an array of record for all ibeacons and the latter return exact one record for a specified ibeacon

//60 seconds mentioned above is a recommended value, it should be a parameter so that we can change it easily


//3 How to response to GET request
//
//Just like the behaviour of https://143.89.144.241/Demo/clientAPI/loggy/60
//NO time means latest information only
//The time here is relative to the last update time(the last time when we see the record of the ibeacon), not the time when finishing calculating// 主要是第一次初始化的时候，这两个时间会有误差

/////My Helper Functions////
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

///////My action to return information//////

 
 //document.write(JSON.stringify(arr));
// console.log(new ibeaconBeanGroup(ibeaconlist).getAllBestLocations());

