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
    var h ='<i class="fa fa-book" aria-hidden="true" style="color:green;font-size:x-large"></i> '
    h += '<span style="color:green">Connected :-)</span>'
    docminerDiv.innerHTML=h 
    headMsg.textContent='connected at '+Date()
    setTimeout(docminer.UI,1000)
}

docminer.UI=function(){
    var h = '<i class="fa fa-book" aria-hidden="true" style="color:green;font-size:x-large" id="bookPrompt"></i> '
    h += '<input id="inputSearch">'
    h += '<p id="searchMsg" style="color:navy;font-size:x-small">&nbsp;</p>'
    h += '<div id="searchDiv"></div>'
    docminerDiv.innerHTML=h
    inputSearch.style.width="60%"
    inputSearch.style.border=0
    inputSearch.style.color="silver"
    inputSearch.value='> type query and then Enter'
    inputSearch.onclick=function(ev){
        if(this.style.color=="silver"){
            this.value=''
        }
        bookPrompt.style.color='orange'
        this.style.color='navy'
         
    }
    inputSearch.onkeyup=function(ev){
        //inputSearch.style.color="orange"
        bookPrompt.style.color='orange'
        if(ev.keyCode==13){ // Enter
            this.style.color='orange'
            searchMsg.textContent="searching ..."
            docminer.search(this.value)
            
        }
        
    }
    //debugger
}

docminer.search=function(q){
    console.log('searching for "'+q+'" at ',Date())
    debugger
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

docminer.searchDivs=[]

docminer.search=function(q){
    // ref at https://developer.box.com/reference#searching-for-content
    // create new Div
    setTimeout(_=>{inputSearch.style.color='navy';bookPrompt.style.color='green'},1000)
    var div = docminer.newDiv(q)
    searchDiv.prepend(div)
    docminer.getSearch(q,function(res){
        var responseDiv = div.querySelector('#responseDiv')
        responseDiv.innerHTML='' // reset
        var pre = document.createElement('pre')
        responseDiv.appendChild(pre)
        pre.style.fontSize="xx-small"
        pre.style.color="green"
        pre.innerHTML=JSON.stringify(res,null,3)
        //debugger
    })
    // time to do teh search work now

    //debugger
}

docminer.getSearch=function(q,fun){ // https://api.box.com/2.0/search
    fun=fun||console.log
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://api.box.com/2.0/search?query="+q,
      "method": "GET",
      "headers": {
        "Authorization": "Bearer UWJQcHgminC3GD2RBQc4YqPio7Yq80Ya",
        "Cache-Control": "no-cache",
        "Postman-Token": "342bb31a-6f78-25f1-4206-df542f0afe04"
      }
    }

    $.ajax(settings).done(function (response) {
      fun(response);
    });

    /*
    var data = null;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () { // callback
      if (this.readyState === 4) {
        fun(this);
      }
    });

    xhr.open("GET", "https://api.box.com/2.0/search?query="+q);
    xhr.setRequestHeader("Authorization", "Bearer UWJQcHgminC3GD2RBQc4YqPio7Yq80Ya");
    xhr.send(data);
    */

}

docminer.newDiv=function(q){ //creates a search div
    var div = document.createElement('div')
    docminer.searchDivs.push(div)
    var i = docminer.searchDivs.length
    div.i=i // the Array index would be i-1
    var h = '<p>Q#'+i+': <span style="color:green">'+q+'</span> <i id="minDiv" style="color:blue;background-color:yellow;cursor:pointer" class="fa fa-minus-square-o" aria-hidden="true"></i> <i id="closeDiv" style="color:red;cursor:pointer" class="fa fa-window-close" aria-hidden="true"></i></p>'
    div.innerHTML=h
    var responseDiv = document.createElement('div')
    responseDiv.id="responseDiv"
    responseDiv.style.color="orange"
    responseDiv.innerHTML= 'searching ... '+Date()
    div.appendChild(responseDiv)
    div.appendChild(document.createElement('hr'))
    // event driven actions
    var minDiv = div.querySelector('#minDiv')
    var closeDiv = div.querySelector('#closeDiv')
    closeDiv.onclick=function(){
        this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement)
        //debugger
    }
    minDiv.onclick=function(){
        if(this.className=="fa fa-minus-square-o"){ //hide
            this.className="fa fa-plus-square-o"
            this.style.backgroundColor="cyan"
            responseDiv.hidden=true
        }else{
            this.className="fa fa-minus-square-o"
            this.style.backgroundColor="yellow"
            responseDiv.hidden=false
        }
    }
    return div
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
