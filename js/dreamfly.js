var optIdTwo = chrome.contextMenus.create({
	"title" : "单集下载",
	"contexts" : ["page"],
	"onclick" : downOne
});
var optIdOne = chrome.contextMenus.create({
	"title" : "全集下载",
	"contexts" : ["page"],
	"onclick" : downAll
});
function downOne(info) {
	sedReq("one");
}
function downAll(info) {
	sedReq("all")
}
function sedReq(t){
	chrome.tabs.query({
	  active: true,
	  currentWindow: true
	}, (tabs) => {
	  chrome.tabs.sendMessage(tabs[0].id, t, res => {
	    console.log(res)
	  })
	})
}