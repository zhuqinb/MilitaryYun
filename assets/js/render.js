const {ipcRenderer: ipc} = require('electron');

const fullViewMapping = [
    {'name':'东西湖体育中心','Lon':30.639313,'Lat':114.128394,'guid':'16ff272df5dc43ebb4dccd1bed69d4ea'},
    {'name':'华中科技大学光谷体育馆','Lon':30.510376,'Lat':114.412677,'guid':'51e1bdfb6058406e854a14c044c55cc9'},
    {'name':'军运村','Lon':30.429769,'Lat':114.286175,'guid':'585d2e5ede7d4e6983961fd9524eb05f'},
    {'name':'青山江滩沙滩排球场','Lon':30.649802,'Lat':114.391083,'guid':'b905bbff0e974acfbb0daea824d7b4b7'},
    {'name':'武汉城市职业学院体育馆','Lon':30.441521,'Lat':114.310110,'guid':'19a5235749814d158eded3adb0d3e6cd'},
    {'name':'武汉理工大学体育馆','Lon':30.507939,'Lat':114.325134,'guid':'68cbc7f88c3b44ae98ca971fceb02515'},
    {'name':'武汉体育学院体育馆','Lon':30.521164,'Lat':114.372854,'guid':'f2ee7dcc47b84fbe812939338c4c9961'},
    {'name':'武汉商学院马术场','Lon':30.467238,'Lat':114.079359,'guid':'834700922bb546028990baf5592e6d3d'},
    {'name':'武汉商学院体育馆','Lon':30.461873,'Lat':114.080053,'guid':'12b62a20c00045cfabfd140b57e8c834'},
    {'name':'武汉商学院游泳馆','Lon':30.464681,'Lat':114.079155,'guid':'5e30d8756bc642598a55878864512aac'},
    {'name':'沌口体育中心及媒体中心','Lon':30.506171,'Lat':114.167545,'guid':'a51961b810ab4280af31fc90f17d9ab6'},
    {'name':'江大体育馆','Lon':30.521103,'Lat':114.150366,'guid':'15a5d8b99b4c4de4b5f7ffe8297e4dbf'},
    {'name':'军运会高尔夫场馆','Lon':30.501313,'Lat':114.504136,'guid':'6b559c8fa22342c285ecd4a318c0ce58'},
    {'name':'军运会射击馆','Lon':30.501212,'Lat':114.467463,'guid':'244a0d1f78ee4f46bebe57f50e09b10a'},
    {'name':'武汉工程软件学院摔跤馆','Lon':30.446381,'Lat':114.426072,'guid':'364e4fd312b449d1ae000e740249331a'},
    {'name':'武汉体育馆','Lon':30.579585,'Lat':114.254749,'guid':'b694c62960d141f3905b40e312f54fb1'},
    {'name':'光谷国际网球中心','Lon':30.475166,'Lat':114.457290,'guid':'b2a574b60f694bd8af38547a796c2119'}
]
let fullViewData = null
let getFullViewData = (guid) => {
    return fullViewData.filter(element => {
        return element.id == guid
    })
}
let getNavIndex = (guid) => {
    const nav_items = $('.nav_items section')
    for(let i = 0 ; i< nav_items.length ; i++) {
        if(nav_items.eq(i).data('guid') == guid){
            return i
        }
    }
}

let fullViewUrl = (guid) => 'http://fly.cigem.cn/fullView/index.html?deleteBtnShow=true&amp;guid='+guid+'&amp;baseUrl=http://fly.cigem.cn:7000&amp;isThird=true&amp;token=594df53f8fb4ae8330472205'

let createFullView = (guid) => {
    $('.fullview').append(`<iframe allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" name="callframe" id="callframe" frameborder="0" style="height: 100%;width: 100%; position: absolute; bottom: 0px; right: 0; background: #000;z-index: 999" src=${fullViewUrl(guid)}>sdfsadfs46546666666666666666</iframe>`)
}
 
$.ajax({
    url: 'http://fly.cigem.cn/api/thirdPanoramas?t=1547629594412&filter=%7B%22where%22:%7B%22accountId%22:%225be279d8e77523272c1ebf1d%22,%22recycled%22:0%7D,%22order%22:%5B%22created+desc%22%5D%7D',
    success: function(data) {
        if(data.length > 0) {
            // createFullView(data[0].id)
        }
        fullViewData = data
            data.forEach(element => {
                let item = `
                    <section data-guid=${element.id}>
                `
                if('thumbnail' in element) {
                    item += `<div class='img-box'><img src="http://fly.cigem.cn${element.thumbnail}" alt=""></div>`
                    
                }else {
                    item += `<div class="thumbnail">暂无缩略图</div>`
                }
                item += `
                        <div>
                            <span class="fullViewTitle">${element.sceneName}</span>
                        </div>
                    </section>`
                $('.nav_items').append(item)

                // for(const i = 0 ; i$('.nav_items section'))
                
            });
        
        console.log(data)
    }
})

// 根据guid 跳转到 iframe
let selectIframe = (guid) => {
    if($('iframe').length > 0  && $('iframe').attr('src').search(guid) == -1) {
        $('iframe').remove()
        createFullView(guid)
    }else if($('iframe').length > 0  && $('iframe').attr('src').search(guid) != -1){
        $('iframe').show()
    }else if($('iframe').length < 1) {
        createFullView(guid)
    }
    $('.back').css('display', 'block')
    selectNavItems(guid)
    
    // $(this).find('div.img-box').addClass('nav_items_active')
    // $(this).siblings().find('div.img-box').removeClass('nav_items_active')

    setTimeout( () => {
        $('.back').css({opacity: .7, transform: 'translateY(-120px)'})
    }, 0)
}

// 根据guid修改 nav_items section的样式
let selectNavItems = (guid) => {
    for(let i = 0 ; i < $('.nav_items section').length ; i++) {
        if($('.nav_items section').eq(i).data('guid') == guid) {
            $('.nav_items section').eq(i).find('div.img-box').addClass('nav_items_active')
        }else {
            $('.nav_items section').eq(i).find('div.img-box').removeClass('nav_items_active')
        }
    }
}
$('.nav_items').on('click','section', function() {
    selectIframe($(this).data('guid'))
})

$('.back').on('click', function (e) {
    $('.back').css({opacity: 0, transform: 'translateY(0)'})
    setTimeout( () => {
        $('.back').css({display: 'none'})
    }, 200)
    $('iframe').hide()
    $('.nav_items section').find('div.img-box').removeClass('nav_items_active')
})



$('.nav').on('click','.toggleSlide', function() {
    
    if(parseInt($('.nav_items').css('marginLeft')) >= 0) {

        $('.nav_items').css('marginLeft', '-245px')
        $('.toggleSlide i').removeClass('left-arrow').addClass('right-arrow')
   
    }else {
        $('.nav_items').css('marginLeft', '0')
        $('.toggleSlide i').removeClass('right-arrow').addClass('left-arrow')
    }

})
  
  

$('header').on('click', 'span', function(e) {
    let className = e.target.className
    if(className === 'anastole') {
        ipc.send('anastole');
    }else if(className === 'minimize' || className === 'maximization') {
        if(className === 'maximization') {
            $(this).removeClass('maximization').addClass('minimize')
        }else {
            $(this).removeClass('minimize').addClass('maximization')
        }
        ipc.send('minimize');
    }else if(className === 'close') {
        ipc.send('close');
    }else if(className === 'acritochromacy-btn') {
        $('.acritochromacy').toggle()
    }
})


let nowDate = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}-${month > 9 ? month : '0' + month}-${day > 9 ? day : '0' + day}`
}

$('.date').text(nowDate())

// 渲染进程监听到 应用尺寸的变化，通知主进程判断是否为全屏
window.onresize = function() {
    console.log('window-resize')
    // ipc.send('aaa')
    ipc.send('window-resize')
}

//监听到屏幕的变化后， 通过主线程检查是否为全屏，来修改对应的样式
ipc.on('message', (event, data) => {
    if(data.message === "isMaximized") {
        if(data.data) {
            $('.maximization').addClass('minimize').removeClass('maximization')
        }else {
            $('.minimize').addClass('maximization').removeClass('minimize')
        }
    }
})