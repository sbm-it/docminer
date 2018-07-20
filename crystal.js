console.log('load crystal.js')

var crystal=(div0)=>{ // ini
    console.log('initializing crystal')
    var ini=()=>{
        if(typeof(localforage)=='undefined'){
            console.log('loading localforage')
            var s = document.createElement('script')
            //s.src='https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.2/localforage.js'
            s.src='localforage.js'
            document.head.appendChild(s)
        }
        var div=div0||document.createElement('div')
        if(!div0){document.body.appendChild(div)}
        var h='<h2 id="crystalAppHead" style="color:maroon">Crystal Miner</h2>'
        h +='<p id="crystalIntro" style="color:green">This is a prototype <a href="https://github.com/sbm-it/docminer" target="_blank" style="background-color:yellow;color:blue">DocMiner</a> application to mine JSON exports from Crystal reports.</p>'
        h +='<h3 style="color:navy">Import Crystal JSON extract</h3>'
        h +='<p style="color:green">Use one of the methods:</p>'
        h +='<ul>'
        h +='<li style="color:green">URL: <input> <button>Load</button></li>'
        h +='<li style="color:green">From Box: [under development]</li>'
        h +='<li style="color:green">Available extracts: <select id="selectDemo"><option value="_">Select One:</option></select> <span style="color:red;background-color:yellow"><-- use this one for now</span></li>'
        h +='</ul>'
        h +='<h3 id="mineCrystalHeader" style="color:navy" hidden=true>Mine Crystal</h3>'
        h +='<div id="processingDiv" hidden=true><span style="color:red">processing...<span></div>'
        div.innerHTML=h
        // finish DOM
        var selDemo=div.querySelector('#selectDemo') // add data source options to #selectDemo
        Object.keys(crystal.dataUrls).forEach((k)=>{
            var op = document.createElement('option')
            op.textContent=k
            op.value=crystal.dataUrls[k]
            op.onselect=()=>{
                console.log(k+' selected')
            }
            selDemo.appendChild(op)
        })
        selDemo.onchange=()=>{
            if(selDemo.value.length>1){
                crystal.load(selDemo.value)
            }
            //debugger
        }
        console.log('ini at '+Date())
        crystal.div=div
        //setTimeout(()=>{
            // check for search
            if(location.search.length>1){
                var selDemo=div.querySelector('#selectDemo')
                let m = location.search.match(/file=([^&]+)/)
                if(m){
                    for(var i=0 ; i<selDemo.options.length ; i++){
                        if(selDemo.options[i].textContent==decodeURI(m[1])){
                            selDemo.options[i].selected=true
                            selDemo.onchange()
                            break
                        }
                    }
                    4
                }
            }
        //},2000)
    }

    crystal.load=async (url)=>{
        crystal.div.querySelector('#mineCrystalHeader').hidden=false
        crystal.div.querySelector('#processingDiv').hidden=false
        if(url[0]=='/'){
            url = location.href.replace(/\/[^/]+$/g,'')+url
        }
        console.log('loading '+url+' ...');
        // cached loading
        localforage.getItem(url).then(async (x)=>{
            if(x){
                console.log('... from cache')
                crystal.divUI(x,url)
            }else{
                console.log('... from source');
                (await fetch(url)).json().then((x)=>{
                    crystal.divUI(x,url)
                    localforage.setItem(url,x)
                })
            }
        })
        // uncached loading
        //(await fetch(url)).json().then((x)=>{crystal.divUI(x)})        
    }
    

    // making sure initialization doesn't happen before DOM is ready 
    if(document.body){
        console.log('no need to queue ini')
        ini()
    }else{
        console.log('queuing ini')
        document.onreadystatechange=()=>{
            if(document.readyState=='complete'){
                ini()
            }
        }
    }
}

crystal.divUI=(x,url)=>{
    crystal.index(x) // index report names and fields
    var div = crystal.div.querySelector('#processingDiv')
    //var h = '<h4 style="color:maroon">Reports found</h4>'
    var h = ''
    h += '<br><a href="'+url+'">'+url+'</a>'
    h += '<br>'+Date()
    h += '<p><table>'
    h += '<col width="30"><col width="30"><col width="30">'
    h += '<tr><td><h3 style="color:navy">Report Name (<span id="numReports">...</span>)</h3></td><td><h3 style="color:green">Report Fields (<span id="numFields">...</span>)</h3></td><td>Info</td></tr>'
    h += '<tr><td><input id="inputReport" size=50></td><td><input id="inputField" size=30></td><td></td></tr>'
    h += '<tr><td style="vertical-align:top"><select id="selectReport" size=30 style="width:40em" multiple></select></td><td style="vertical-align:top"><select id="selectField" size=30 style="width:30em" multiple></select></td><td style="vertical-align:top"><div id="tdInfo" style="overflow-y:scroll;width:30em"></div></td></tr>'
    h += '</table></p>'
    //h += '<button>Graph</button> <button>Request report</button> <button>Annotate</button>'
    h += '<button id="focusReport" class="btn btn-primary" disabled=true>Focus on report (select one first)</button>'
    h += ' <button id="focusField" class="btn btn-success" disabled=true>Focus on field (select one first)</button>'
    div.innerHTML=h
    tdInfo.style.width='30em'
    // fill select
    var funSort=(a,b)=>{ // sort report names
        a=a.toUpperCase(a)
        b=b.toUpperCase(b)
        var s=0
        if(a>b){s=1}
        if(a<b){s=-1}
        return s
    }
    var selReport=div.querySelector('#selectReport')
    Object.keys(crystal.dt.reports).sort(funSort).forEach((nm)=>{
        var op=document.createElement('option')
        op.textContent=nm
        op.style.color="navy"
        op.onmouseover=()=>{
            crystal.onReport(op)
        }
        selReport.appendChild(op)
        // index option
        crystal.dt.reportOptions[op.value]=op
    })
    selReport.onchange=crystal.changeReport
    var selField=div.querySelector('#selectField')
    Object.keys(crystal.dt.fields).sort(funSort).forEach((fld)=>{
        var op=document.createElement('option')
        op.textContent=fld
        op.style.color="green"
        op.onmouseover=()=>{
            crystal.onField(op)
        }
        selField.appendChild(op)
        // index option
        crystal.dt.fieldOptions[op.value]=op
    })
    selField.onchange=crystal.changeField
    div.querySelector('#tdInfo').style.height=selReport.clientHeight
    crystal.div.querySelector('#inputReport').onkeyup=crystal.div.querySelector('#inputReport').onclick=crystal.reportFilter
    crystal.div.querySelector('#inputField').onkeyup=crystal.div.querySelector('#inputField').onclick=crystal.fieldFilter
    // look for parameters in the query 
    if(location.search.length>1){
        let m = location.search.match(/report=([^&]+)/)
        let ipRep = crystal.div.querySelector('#inputReport')
        let ipFld = crystal.div.querySelector('#inputField')
        if(m){
            ipRep.value=decodeURI(m[1])
            ipRep.onkeyup()
        }
        m = location.search.match(/field=([^&]+)/)
        if(m){
            ipFld.value=decodeURI(m[1])
            if(ipRep.value==''){
                ipFld.onkeyup()
            }
        }

    }
    // unhide disqus_thread
    document.body.querySelector('#disqus_thread').hidden=false
    crystal.countVisibleReports()
    crystal.countVisibleFields()
}
//crystal.reportOptions={}
//crystal.fieldOptions={}

crystal.index=(x)=>{
    crystal.dt={ // note this will reset previous index if there is one
        x:x,
        reports:{},
        fields:{}
    }
    // index report names
    x.forEach((xi,i)=>{ // ith report
        if(!crystal.dt.reports[xi.ReportName]){
            crystal.dt.reports[xi.ReportName]={}
        }
        xi.reportFields.forEach((fj,j)=>{ // jth field 
            if(!crystal.dt.reports[xi.ReportName][fj.field_name]){
                crystal.dt.reports[xi.ReportName][fj.field_name]=[]
            }
            crystal.dt.reports[xi.ReportName][fj.field_name].push({
                i:i,
                j:j,
                type:fj.field_type
            })
            // index field names
            if(!crystal.dt.fields[fj.field_name]){
                crystal.dt.fields[fj.field_name]={}
            }
            if(!crystal.dt.fields[fj.field_name][xi.ReportName]){
                crystal.dt.fields[fj.field_name][xi.ReportName]=[]
            }
            crystal.dt.fields[fj.field_name][xi.ReportName].push({
                i:i,
                j:j,
                tables:xi.tables
            })
        })
    })
    crystal.dt.reportOptions={}
    crystal.dt.fieldOptions={}
    crystal.x=x // <-- original data is here

}

crystal.onReport=(op)=>{
    var tdI = crystal.div.querySelector('#tdInfo')
    var info=Object.keys(crystal.dt.reports[op.value]).map((v)=>{
      var fld=crystal.dt.reports[op.value][v]
      var typ={}
      fld.forEach((f)=>{
          typ[f.type]=true
      })
      return v+' ('+fld.length+') ['+Object.keys(typ).join(',')+']' 
    })
    tdI.innerHTML='<h4>In the Report: "'+op.value+'" we found these Fields:</h4>'+info.join('<br>')
}

crystal.onField=(op)=>{
    var tdI = crystal.div.querySelector('#tdInfo')
    var info=Object.keys(crystal.dt.fields[op.value]).map((v)=>{
      var rep=crystal.dt.fields[op.value][v]
      var tbl={}
      rep.forEach((rp)=>{
          tbl[rp.tables.table_name]=true
      })
      return v+' ('+rep.length+') ['+Object.keys(tbl).join(',')+']' 
    })
    tdI.innerHTML='<h4>The Field "'+op.value+'" was found these Reports:</h4>'+info.join('<br>')
}

crystal.changeReport=()=>{ // selections changed in 
    var selReport=crystal.div.querySelector('#selectReport')
    var selField=crystal.div.querySelector('#selectField')
    // show only fields of selected reports
    // 1. hide all fields
    for(var i=0 ; i<selField.length ; i++){
        selField.options[i].hidden=true
    }
    // 2. show only the fields of selected reports
    var nSelected=0
    var rSelected='' // name of the one report selected
    for(var i=0 ; i<selReport.length ; i++){
        let op = selReport.options[i]
        let v = op.value
        if(op.selected){ // find fields
            nSelected++
            //console.log(op)
            Object.keys(crystal.dt.reports[v]).forEach(fn=>{ // for each field name
                crystal.dt.fieldOptions[fn].hidden=false
            })
            rSelected=v 
        }
    }
    if(nSelected==1){
        let bt = crystal.div.querySelector('#focusReport')
        bt.disabled=false
        bt.style.color='yellow'
        bt.textContent='Focus on report "'+rSelected+'"'
        bt.onclick=()=>{
            window.open(location.origin+location.pathname+'?file='+crystal.div.querySelector('#selectDemo').selectedOptions[0].textContent+'&report='+encodeURI(rSelected))
        }
    }else{
        bt.disabled=true
        bt.style.color='white'
        bt.textContent='Focus on report (select one first)'
    }
    crystal.countVisibleFields()
}

crystal.changeField=()=>{ // selections changed in 
    var selReport=crystal.div.querySelector('#selectReport')
    var selField=crystal.div.querySelector('#selectField')
    // show only fields of selected reports
    // 1. hide all Reports
    for(var i=0 ; i<selReport.length ; i++){
        selReport.options[i].hidden=true
    }
    // 2. show only the Reports with the selected fields
    var nSelected=0
    var fSelected='' // name of the one report selected
    for(var i=0 ; i<selField.length ; i++){
        let op = selField.options[i]
        let v = op.value
        if(op.selected){ // find Reports
            fSelected=v 
            nSelected++
            //console.log(op)
            Object.keys(crystal.dt.fields[v]).forEach(rn=>{ // for each report name 
                crystal.dt.reportOptions[rn].hidden=false
            })
            //console.log
        }
    }
    if(nSelected==1){
        let bt = crystal.div.querySelector('#focusField')
        bt.disabled=false
        bt.style.color='yellow'
        bt.textContent='Focus on field "'+fSelected+'"'
        bt.onclick=()=>{
            window.open(location.origin+location.pathname+'?file='+crystal.div.querySelector('#selectDemo').selectedOptions[0].textContent+'&field='+encodeURI(fSelected))
        }
    }else{
        bt.disabled=true
        bt.style.color='white'
        bt.textContent='Focus on field (select one first)'
    }
    crystal.countVisibleReports()
}

crystal.countVisibleReports=()=>{
    var ops=crystal.div.querySelector('#selectReport').options
    var numRep=crystal.div.querySelector('#numReports')
    var n = 0;
    [...Array(ops.length).keys()].forEach(i=>{
        n+=ops[i].hidden
    })
    numRep.textContent=ops.length-n;
}
crystal.countVisibleFields=()=>{
    var ops=crystal.div.querySelector('#selectField').options
    var numFld=crystal.div.querySelector('#numFields')
    var n = 0;
    [...Array(ops.length).keys()].forEach(i=>{
        n+=ops[i].hidden
    })
    numFld.textContent=ops.length-n;
}

/*
crystal.selectReport=(op)=>{
    var tdI = crystal.div.querySelector('#tdInfo')
    var info=Object.keys(crystal.dt.reports[op.value]).map((v)=>{
      var fld=crystal.dt.reports[op.value][v]
      var typ={}
      fld.forEach((f)=>{
          typ[f.type]=true
      })
      return v+' ('+fld.length+') ['+Object.keys(typ).join(',')+']' 
    })
    tdI.innerHTML='<h4>In the Report: "'+op.value+'" we found these Fields:</h4>'+info.join('<br>')
}

crystal.selectField=(op)=>{
    var tdI = crystal.div.querySelector('#tdInfo')
    var info=Object.keys(crystal.dt.fields[op.value]).map((v)=>{
      var rep=crystal.dt.fields[op.value][v]
      var tbl={}
      rep.forEach((rp)=>{
          tbl[rp.tables.table_name]=true
      })
      return v+' ('+rep.length+') ['+Object.keys(tbl).join(',')+']' 
    })
    tdI.innerHTML='<h4>The Field "'+op.value+'" was found these Reports:</h4>'+info.join('<br>')
}
*/

crystal.selectFilter=(input,select)=>{
    var ex=input.value;if(ex.length==0){ex='.*'} // expression to match
    var re = RegExp(ex,'i')
    var ops = select.options
    for(var i=0 ; i<ops.length ; i++){
        let op=ops[i]
        op.hidden=!op.value.match(re)
    }
}

crystal.reportFilter=()=>{
    crystal.selectFilter(
        crystal.div.querySelector('#inputReport'),
        crystal.div.querySelector('#selectReport')
    )
    crystal.countVisibleReports()
}

crystal.fieldFilter=()=>{
    crystal.selectFilter(
        crystal.div.querySelector('#inputField'),
        crystal.div.querySelector('#selectField')
    )
    crystal.countVisibleFields()
}

crystal.dataUrls={
    'CrystalReports_dev_server.json':'/files/CrystalReports_dev_server.json',
    'CrystalReports.json':'/files/CrystalReports.json'
}





// run
crystal(document.body.querySelector('#crystalDiv'))
