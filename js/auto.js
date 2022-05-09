document.onreadystatechange = Onload;//当页面加载状态改变的时候执行这个方法. 
function Onload() { 
  if(document.readyState =='complete') { //当页面加载状态 
      inject();
  } 
}

function inject(){
  createScript('js/index.js');
}
function createScript(url){
  var t = document.createElement("script");
  t.src = chrome.runtime.getURL(url);
  document.head.appendChild(t);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse("success");
    if(request == "one"){
        document.dispatchEvent(new CustomEvent('downOne'));
    }else if(request == "all"){
        document.dispatchEvent(new CustomEvent('downAll'));
    }

});