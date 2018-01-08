console.log('loaded docminer.js at '+ Date())

//
if(document.location.origin.match('http://localhost')){ 
    // SBM-IT DocMiner Dev <-- local development
    docminer.clientId="lmhp028lnor0shfxxzvk7n1puci688yt"
    localStorage.setItem('connectBoxAuth','6sXS01ZrUTlozu4SAh4tSy9I3dMWzgZJ')
}else{                                                  
    // SBM-IT DocMiner <-- gh-page deployment at https://sbm-it.github.io/docminer
    docminer.clientId="yp20iu02pociuui5zo329copq2m2hrjo"
    localStorage.setItem('connectBoxAuth','1EWktNu0dMj67A2XVzGHoEnewdkgNXZf')
}

function docminer(){
    if(document.getElementById('docminerDiv')){ // call it by default only if from the default index.html
        //docminer.addFilePicker()
        if(!localStorage.boxSecurityToken){
            docminer.auth()
        }else{
            var boxParms={}
            if(location.search.length>0){ // if there are parameters to harvest
                location.search.slice(1).split('&').forEach(function(pp){
                    pp=pp.split('=')
                    boxParms[pp[0]]=pp[1]
                })
                localStorage.setItem('boxParms',JSON.stringify(boxParms))
                location.href=location.origin+location.pathname
            }else{
                docminer.boxParms=JSON.parse(localStorage.getItem('boxParms'))
                if(!docminer.boxParms.access_token){
                    console.log('code:',docminer.boxParms.code)
                    docminer.getAccessToken()
                }else{
                    console.log('authenticated as',docminer.boxParms)
                }
                
            }
        }
        //docminer.auth()
    }
}





docminer.getAccessToken=function(){ // get bearer token
    var form = new FormData();
    form.append("grant_type", "authorization_code");
    form.append("client_id", docminer.clientId);
    form.append("client_secret", localStorage.connectBoxAuth);
    form.append("code", docminer.boxParms.code);
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://api.box.com/oauth2/token",
      "method": "POST",
      "headers": {
        "Cache-Control": "no-cache",
        "Postman-Token": "efd72d80-e7e8-4d1e-36a5-a7728fa87ad6"
      },
      "processData": false,
      "contentType": false,
      "mimeType": "multipart/form-data",
      "data": form
    }
    $.ajax(settings)
     .done(function (response) {
        response=JSON.parse(response)
        console.log('response:',response);
        for(var v in response){
            docminer.boxParms[v]=response[v]
            //console.log(v)
        }
        localStorage.removeItem('boxKeepGoing')
        console.log('connection successful :-)',docminer.boxParms)
        docminer.loggedIn()
        //debugger
    })
    .fail(function(err){
        console.log('deu erro, retry:',err)
        localStorage.removeItem('boxSecurityToken')
        if(localStorage.getItem('boxKeepGoing')){
            localStorage.removeItem('boxKeepGoing')
            console.log('second time access failed, contact developer')
        }else{
            location.href=location.origin+location.pathname //reload
            localStorage.setItem('boxKeepGoing',true)
        }
        
     });
}

docminer.loggedIn=function(){ // assembling UI after OAUTH dance is finished or UI reset is in order
    var h = '<span style="color:blue">Connected :-)</span>'
    docminerDiv.innerHTML=h 
    headMsg.textContent='connected at '+Date()
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
            clientId: docminer.clientId,
            linkType: "direct",
            multiselect: false
        })
        boxSelect.success(function(files) {
            console.log('files found',files)
            //parentURLinput.value=files[0].url
            //bco = new BCO(parentURLinput.value)
            //console.log(response);
        });
        boxSelect.launchPopup()
    }
}

docminer.auth=function(){
    localStorage.boxSecurityToken = 'st'+Math.random().toString().slice(2)+Date.now() // client state to keep an eye on man in the middle attacks
    var url = 'https://account.box.com/api/oauth2/authorize?response_type=code&client_id='+docminer.clientId+'&redirect_uri='+location.href+'&state='+localStorage.boxSecurityToken
    location.href=url
}

docminer.search=function(q){
    // ref at https://developer.box.com/reference#searching-for-content
    debugger
}

$(function(){
    // make sure secret is known
    var connectBoxAuth = localStorage.connectBoxAuth
    if(connectBoxAuth){
        document.getElementById('connectBoxAuth').value=connectBoxAuth
    }
    document.getElementById('connectDocminerButton').onclick=function(){
        if(document.getElementById('connectBoxAuth').value.length==0){ // if button was clicked with no token then delete auth key from localstorage
            localStorage.removeItem('connectBoxAuth')
        }else{ // otherwise save it (potentially replaceing by a new key) and start Auth
            localStorage.setItem('connectBoxAuth',document.getElementById('connectBoxAuth').value)
            docminerDiv.innerHTML='<span id="connecting" style="color:red">connecting ...</span>'
            docminer()
        }
        //debugger
    }
    if(localStorage.getItem('boxKeepGoing')){
        document.getElementById('connectDocminerButton').click()
    }

    //docminer()
})




// reference
// https://developer.box.com/reference
