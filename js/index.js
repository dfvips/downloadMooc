let cid,ti,vid,ln = 0,islist = false,isfree = true,files,cname,delay = (n) => {
    const date = Date.now()
    let currentDate = null
    do {
        currentDate = Date.now()
    } while (currentDate - date < n*1000)
}
  
if(typeof(course_id) != 'undefined') {
    islist = false
    cid = course_id
    ti = videoTitle
    vid = pageInfo.mid
    cname = courseName
    console.log(cid,ti,vid)
} else {
    islist = true
    if(typeof(_cid) != 'undefined')
    {   
        isfree = false
        cid = _cid
        cname = _name
    }else {
        isfree = true
        if(typeof GC !== 'undefined') {
            cid = GC.course.id
            cname = GC.course.name
        }
    }
}
document.addEventListener('downOne', function (event) {
    ln = 1
    files = new Array()
    //单集下载
    if(islist) { //是否列表页面
        alert ('列表页面，页面不支持单集下载')
    } else {
        down(ti,'https://www.imooc.com/course/playlist/'+vid+'?t=m3u8&cdn=aliyun',0)
    }
})
document.addEventListener('downAll', function (event) {
    files = new Array()
    //全集下载
	if(!islist){//是否播放页面
        var l = $('.sec-li').length
        $('.sec-li').each(function(ind){
            let vid = $(this).data('id'),
            ti = $(this).text().replace(/\r?\n/g,'').replace(/.*?：/,'').replace(/\(.*/,'').trim().replace(/\s{2,}.*/g,'')
            if($(this).find('a').attr('href').indexOf('code') == -1) {
                down(ti,'https://www.imooc.com/course/playlist/'+vid+'?t=m3u8&cdn=aliyun',ind)
            } else {
                l--
            }
        })
        ln = l
        console.log(l)
    } else {
        var l = $('.J-media-item').length
        if (isfree){//是否免费课程
            $('.J-media-item').parent().each(function(ind){
                let vid = $(this).data('media-id'),
                ti = $(this).find('a').text().replace(/\r?\n/g,'').replace(/.*?：/,'').replace(/\(.*/,'').trim().replace(/\s{2,}.*/g,'')
                if($(this).find('a').attr('href').indexOf('code') == -1) {
                    down(ti,'https://www.imooc.com/course/playlist/'+vid+'?t=m3u8&cdn=aliyun',ind)
                } else {
                    l--
                }
            })
            ln = l
            console.log(l)
            if(l == 0) {
                alert('请切换到“章节目录”')
            }
        }else {
            let l = $('.js-watchForFree').length
            $('.js-watchForFree').each(function(ind){
                let p = $(this).parent(),
                vid = p.children('input').val(),
                ti = p.children('span.title_info').text().replace(/\r?\n/g,'').replace(/\(.*?\)/,'').replace(/\s{2,}.*/g,'')
                down(ti,'https://coding.imooc.com/lesson/m3u8h5?mid=' + vid + '&cid=' + cid + '&ssl=1&cdn=aliyun',down)
            })
            ln = l
            console.log(l)
            if(l == 0) {
                alert('请切换到“章节目录”')
            }
        }
    }
})
//下载
function down(ti,url,ind){
    let m3
    getData(url).then(data => {//请求Api
        if(ind%20 === 0 && ind !== 0) {
            delay(2);
        }
        if (typeof data !== 'object') {
            data = JSON.parse(data)
        }
        m3 = decode(data.data.info)
		u = m3.split('\n'),
		arr = new Array()
		for (let i in u) {
			let l = u[i]
			if(l.indexOf('http') != -1){
				let mediaInfo = '{"' + u[i-1].replace(/#.*?:/g,'').replace('-','').replace(/=/g,'":').replace(/,/g,',"').replace('RESOLUTION":','RESOLUTION":"').replace(/\s+/g,'') + '"}'
				mediaInfo = mediaInfo.toLowerCase()
				let obj = JSON.parse(mediaInfo)
				obj.url = l
				arr.push(obj)
			}
		}
        arr = arr.sort((a,b) => b.bandwidth - a.bandwidth)
		let m3u  = arr[0].url
        return getData(m3u)
    }).then (data => {//获取m3u8
        m3 = decode(data.data.info),
        key = m3.match('(?<=URI=").*?(?=")')[0]
        return getData(key)
    }).then (data => {//获取密钥
        let key = getkey(data.data.info)
        m3 = m3.replace(/#EXT-X-KEY.*/, `#EXT-X-KEY:METHOD=AES-128,URI="base64:${key}"`)
    }).then(() => {//下载
        let obj = {
            'fileName' : `${ti}.m3u8`,
            'content' : m3
        }
        files.push(obj)
    }).then(() => {
        if (files.length === ln) {
            if (typeof JSZip === 'undefined' || files.length === 1) {
                files.forEach(data => {
                    download(data.content, data.fileName)
                });
            }else {
                let zip = new JSZip();
                files.forEach(data => {
                    zip.file(data.fileName, data.content)
                });
                zip.generateAsync({type:'blob'}).then(function(content) {
                    // see FileSaver.js
                    saveAs(content, `${cname}.zip`)
                });
            }
        }
    }).catch(err => {
        console.log(err)
    })  
}
//ajax
function getData (url) {
    return new Promise((resolve,reject) => {
        $.ajax({
            url,
            success (data) {
                resolve(data)
            },
            error(err) {
                reject(err)
            }
        })
    })
 }
//解密
function decode(t, e) {
    function r(t, e) {
        var r = "";
        if ("object" == typeof t)
            for (var n = 0; n < t.length; n++)
                r += String.fromCharCode(t[n]);
        t = r || t;
        for (var i, o, a = new Uint8Array(t.length), s = e.length, n = 0; n < t.length; n++)
            o = n % s,
            i = t[n],
            i = i.toString().charCodeAt(0),
            a[n] = i ^ e.charCodeAt(o);
        return a
    }

    function n(t) {
        var e = "";
        if ("object" == typeof t)
            for (var r = 0; r < t.length; r++)
                e += String.fromCharCode(t[r]);
        t = e || t;
        var n = new Uint8Array(t.length);
        for (r = 0; r < t.length; r++)
            n[r] = t[r].toString().charCodeAt(0);
        var i, o, r = 0;
        for (r = 0; r < n.length; r++)
            0 != (i = n[r] % 3) && r + i < n.length && (o = n[r + 1],
                n[r + 1] = n[r + i],
                n[r + i] = o,
                r = r + i + 1);
        return n
    }

    function i(t) {
        var e = "";
        if ("object" == typeof t)
            for (var r = 0; r < t.length; r++)
                e += String.fromCharCode(t[r]);
        t = e || t;
        var n = new Uint8Array(t.length);
        for (r = 0; r < t.length; r++)
            n[r] = t[r].toString().charCodeAt(0);
        var r = 0,
            i = 0,
            o = 0,
            a = 0;
        for (r = 0; r < n.length; r++)
            o = n[r] % 2,
            o && r++,
            a++;
        var s = new Uint8Array(a);
        for (r = 0; r < n.length; r++)
            o = n[r] % 2,
            s[i++] = o ? n[r++] : n[r];
        return s
    }

    function o(t, e) {
        var r = 0,
            n = 0,
            i = 0,
            o = 0,
            a = "";
        if ("object" == typeof t)
            for (var r = 0; r < t.length; r++)
                a += String.fromCharCode(t[r]);
        t = a || t;
        var s = new Uint8Array(t.length);
        for (r = 0; r < t.length; r++)
            s[r] = t[r].toString().charCodeAt(0);
        for (r = 0; r < t.length; r++)
            if (0 != (o = s[r] % 5) && 1 != o && r + o < s.length && (i = s[r + 1],
                    n = r + 2,
                    s[r + 1] = s[r + o],
                    s[o + r] = i,
                    (r = r + o + 1) - 2 > n))
                for (; n < r - 2; n++)
                    s[n] = s[n] ^ e.charCodeAt(n % e.length);
        for (r = 0; r < t.length; r++)
            s[r] = s[r] ^ e.charCodeAt(r % e.length);
        return s
    }
    for (var a = {
            data: {
                info: t
            }
        }, s = {
            q: r,
            h: n,
            m: i,
            k: o
        }, l = a.data.info, u = l.substring(l.length - 4).split(""), c = 0; c < u.length; c++)
        u[c] = u[c].toString().charCodeAt(0) % 4;
    u.reverse();
    for (var d = [], c = 0; c < u.length; c++)
        d.push(l.substring(u[c] + 1, u[c] + 2)),
        l = l.substring(0, u[c] + 1) + l.substring(u[c] + 2);
    a.data.encrypt_table = d,
        a.data.key_table = [];
    for (var c in a.data.encrypt_table)
        "q" != a.data.encrypt_table[c] && "k" != a.data.encrypt_table[c] || (a.data.key_table.push(l.substring(l.length - 12)),
            l = l.substring(0, l.length - 12));
    a.data.key_table.reverse(),
        a.data.info = l;
    var f = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    a.data.info = function(t) {
        var e, r, n, i, o, a, s;
        for (a = t.length,
            o = 0,
            s = ""; o < a;) {
            do {
                e = f[255 & t.charCodeAt(o++)]
            } while (o < a && -1 == e);
            if (-1 == e)
                break;
            do {
                r = f[255 & t.charCodeAt(o++)]
            } while (o < a && -1 == r);
            if (-1 == r)
                break;
            s += String.fromCharCode(e << 2 | (48 & r) >> 4);
            do {
                if (61 == (n = 255 & t.charCodeAt(o++)))
                    return s;
                n = f[n]
            } while (o < a && -1 == n);
            if (-1 == n)
                break;
            s += String.fromCharCode((15 & r) << 4 | (60 & n) >> 2);
            do {
                if (61 == (i = 255 & t.charCodeAt(o++)))
                    return s;
                i = f[i]
            } while (o < a && -1 == i);
            if (-1 == i)
                break;
            s += String.fromCharCode((3 & n) << 6 | i)
        }
        return s
    }(a.data.info);
    for (var c in a.data.encrypt_table) {
        var h = a.data.encrypt_table[c];
        if ("q" == h || "k" == h) {
            var p = a.data.key_table.pop();
            a.data.info = s[a.data.encrypt_table[c]](a.data.info, p)
        } else
            a.data.info = s[a.data.encrypt_table[c]](a.data.info)
    }
    if (e)
        return a.data.info;
    var g = "";
    for (c = 0; c < a.data.info.length; c++)
        g += String.fromCharCode(a.data.info[c]);
    return g
}
//转码
function getkey(key) {
    return _arrayBufferToBase64(decode(key, 1))
}
//arrayBuffer转base64
function _arrayBufferToBase64(buffer) {
    let binary = ""
    let bytes = new Uint8Array(buffer)
    let len = bytes.byteLength;
    for (let i = 0; i < len ; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}
//下载单个M3u8
function download(content,title) {
    let d = new Blob([content], {
        type: "text/plain"
    })
    saveAs(d,title)
 }
 /**
 * 定义休眠函数
 * @param {number} time 休眠时间，毫秒
 */
let sleep = (time) => {
    return new Promise(resolve => setTimeout(resolve({
        success: true,
        time: time
    }), time));
};
