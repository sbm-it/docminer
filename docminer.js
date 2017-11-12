console.log('loaded docminer.js')

function docminer(){
    if(document.getElementById('docminerDiv')){ // call it by default only if from the default index.html
        docminer.addFilePicker()
    }
    
    //debugger

}

docminer.addFilePicker=function(el){
    el = el || document.getElementById('docminerDiv')
    //var h = '<img id="pickBoxImg" src="pickBox.png">'
    var pickBoxImg = document.createElement('img')
    pickBoxImg.src="pickBox.png"
    pickBoxImg.style.height="36px"
    pickBoxImg.id="pickBoxImg"
    pickBoxImg.style.cursor="pointer"
    el.appendChild(pickBoxImg)
    //debugger

    pickBoxImg.onclick=function(){
        var boxSelect = new BoxSelect({
            clientId: "lmhp028lnor0shfxxzvk7n1puci688yt",
            linkType: "direct",
            multiselect: false
        })
        boxSelect.success(function(files) {
            parentURLinput.value=files[0].url
            bco = new BCO(parentURLinput.value)
            //console.log(response);
        });
        boxSelect.launchPopup()
    }
}

$(function(){
    docminer()
})






/*
getFromBox.onclick=function(){
        var boxSelect = new BoxSelect({
            clientId: "ho63k2awp6akn574ruy9wzazhp106y20",
            linkType: "direct",
            multiselect: false
        })
        boxSelect.success(function(files) {
            parentURLinput.value=files[0].url
            bco = new BCO(parentURLinput.value)
            //console.log(response);
        });
        boxSelect.launchPopup()
    }

*/
