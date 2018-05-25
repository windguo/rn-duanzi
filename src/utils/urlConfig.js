/**
 * Created by zhangzuohua on 2018/1/22.
 */

export default urlConfig = {
    //  baseURL: 'http://jianjie.92kaifa.com',
   // baseURL: 'http://www.jianjie8.com',
    //举报URL
    ReportURL: 'http://m.jianjie8.com/report',
    // 收藏url
    FavasURL: 'http://m.jianjie8.com/fava',
    agreementURL: 'http://m.jianjie8.com/agreementErtongwenxue',
    suggestURL: "http://www.jianjie8.com/e/tool/feedback/?bid=1",
    // 文字
    sectionList:'/e/api/ertongwenxue?getJson=class&classid=157',
    // 音频
    sectionListRand:'/e/api/ertongwenxue?getJson=classSound&classid=158',
    // 视频地址
    sectionListVideo: '/e/api/ertongwenxue?getJson=classSound&classid=159',
    //栏目列表数据后面拼接&classid=3
    // sectionListData:'/e/api/?getJson=column',
    sectionListData:'/e/api/ertongwenxue?getJson=column',
    // 内容api
    contentApi:'/e/api/ertongwenxue?getJson=content',
//随机
    sectionListDataRand:'/e/api/ertongwenxue?getJson=column',
    //发布地址
    pubLishUrl:'http://m.jianjie8.com/ertongFromapp',
    //点赞或者踩 {classid:2,id:2,dotop:1,doajax:1,ajaxarea:'diggnum'dotop这个字段 传0 是踩踩 传1是赞}
    thumbUpUrl:'/e/public/digg/post/index.php',
    thumbDownUrl:'/e/public/digg/post/diggbot.php',
    LoginUrl:  '/e/member/doaction.php',
    // 我发布的内容
    MyPublishUrl:  '/e/api/ertong?getJson=article',
    // 我收藏的内容
    MyFavasUrl: '/e/api/ertong/?getJson=favas',
    userInfo: '/e/api/ertong?getJson=article',
    //更新检测地址
    CheckUpdate:"/e/api/ertongwenxue?getJson=version",
    //分享出去的图片
    thumbImage: 'http://jianjie8.com/skin/ertong/images/icon_share.png',
    //复制完跳去详情
     ShareUrl: "http://ertong.jianjie8.com/detail/",
    Search:'/e/api/ertongwenxue/?classid=55&getJson='


}

