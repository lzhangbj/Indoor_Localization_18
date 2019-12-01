//Show Tab 1
function switchToOne(){
 document.getElementById("tab1").style.display="block";  
 document.getElementById("tab2").style.display="none";   
 
   
}
//SHow Tab 2
function switchToTwo(){
     document.getElementById("tab2").style.display="block";  
 document.getElementById("tab1").style.display="none";  
}
//Get a random color in base 16 format
function getRandomColor(){
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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




