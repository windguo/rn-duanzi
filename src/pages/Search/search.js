import React, { Component } from 'react';
import {
    StyleSheet,
    Image,
    Text,
    Linking,
    View,
    Dimensions,
    Animated,
    Easing,
    PanResponder,
    Platform,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    InteractionManager,
    BackHandler,
    ScrollView,
    TouchableWithoutFeedback,
    RefreshControl,
    DeviceEventEmitter,
    LayoutAnimation,
    NativeModules,
    ImageBackground,
    FlatList,
    WebView,
    TextInput, Clipboard,
} from 'react-native';
import _fetch from '../../utils/_fetch'
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
import { ifIphoneX } from '../../utils/iphoneX';
import IconSimple from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import urlConfig from '../../utils/urlConfig';
import PureModalUtil from '../../utils/PureModalUtil';
import * as WeChat from 'react-native-wechat';
import storageKeys from '../../utils/storageKeyValue'
import ScrollTabView from "../ScrollTabView";
import PullList from '../../components/pull/PullList'
import ModalUtil from '../../utils/modalUtil';
import HttpUtil from "../../utils/HttpUtil";
import formatData from "../../utils/formatData";
import Toast from "react-native-root-toast";
import ImageProgress from 'react-native-image-progress';
import {Pie,Bar,Circle,CircleSnail} from 'react-native-progress';
import AutoHeightImage from 'react-native-auto-height-image';
import CustomImage from '../../components/CustomImage'
import GuessText from  '../../components/GuessText'
export default class Search extends Component {

    static key = "";
    static navigationOptions = {
        tabBarLabel: '搜索',
        tabBarIcon: ({ tintColor, focused }) => (
            <IconSimple name="user" size={22} color={focused ? '#027fff' : 'black'} />
        ),
        header: ({ navigation }) => {
            let textinput;
            return (
                <ImageBackground style={{ ...header }} source={require('../../assets/backgroundImageHeader.png')} resizeMode='cover'>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        navigation.goBack(null);
                    }}>
                        <View style={{ justifyContent: 'center', marginLeft: 10, alignItems: 'center', height: 43.7 }}>
                            <IconSimple name="arrow-left" size={20} color='white' />
                        </View>
                    </TouchableOpacity>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginLeft: 10,
                        alignItems: 'center',
                        height: 43.7
                    }}>
                        <TextInput
                            ref = {(text)=>{textinput = text}}
                            placeholder='请输入关键字'
                            placeholderTextColor='#555555'
                            autoFocus={true}
                            onChangeText={(keywords) => {
                                Search.key = keywords;
                                navigation.state.routes[navigation.state.routes.length-1].params && navigation.state.routes[navigation.state.routes.length-1].params.changeText(Search.key)
                                console.log("navigation",navigation)
                            }}
                            defaultValue={navigation.state.routes[navigation.state.routes.length-1].params && navigation.state.routes[navigation.state.routes.length-1].params.key}
                            style={{
                                fontSize: 16,
                                color: '#555555',
                                borderRadius: 10,
                                marginHorizontal: 20,
                                width: WIDTH - 140,
                                height: 32,
                                paddingTop:0,
                                paddingBottom:0,
                                paddingHorizontal: 20,
                                backgroundColor: '#ffffff'
                            }}
                            underlineColorAndroid="transparent">

                        </TextInput>
                        <View style={{
                            position:'absolute',
                            right:navigation.state.routes[navigation.state.routes.length-1].params
                            && navigation.state.routes[navigation.state.routes.length-1].params.changetext
                            && navigation.state.routes[navigation.state.routes.length-1].params.changetext.length>0?70:1000}}>
                            <TouchableOpacity activeOpacity={0.8} onPress={
                                ()=>{
                                    Search.key = "";
                                    textinput&&textinput.clear();
                                    navigation.state.routes[navigation.state.routes.length-1].params && navigation.state.routes[navigation.state.routes.length-1].params.changeText(Search.key)

                                }
                            }>
                                <IconSimple name="close" size={22}/>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={{}} activeOpacity={0.7} onPress={() => {
                            console.log("header navigation",navigation)
                            navigation.state.routes[navigation.state.routes.length-1].params && navigation.state.routes[navigation.state.routes.length-1].params.searchKey(Search.key);
                        }}>
                            <View>
                                <Text style={{color: '#ffffff',fontWeight:'bold',fontSize:16,marginRight:10}}>搜 索</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            )
        }
    };


    constructor(props) {
        super(props);
        this.requestPageNumber = 1;
        this.state = {
            refreshing: false,
            loadError:false,
            loadNewData:false,
            visible:false,
            ViewHeight:new Animated.Value(0)
        };
    }
    componentWillMount() {
        this._ViewHeight = new Animated.Value(0);
    }
    componentDidMount() {
        this.keyWord = this.props.navigation.getParam("key");//获取上一个页面的key
        this.props.navigation.setParams({
            searchKey:this.searchKey,
            changeText:this.changeText,
            changetext:this.keyWord, //初始化是否显示取消按钮，length>0即显示
        });
        console.log('search this.keyWord',this.keyWord);
        this.loadData();
    }

    searchKey = (keyword)=>{
        this.props.navigation.setParams({ key: keyword,changetext:keyword });
        this.keyWord = keyword;
        this.loadData();
    }


    changeText = (text)=>{
        this.props.navigation.setParams({
            changetext:text
        })
    }

    ToastShow = (message) => {
        Toast.show(message, {
            duration: Toast.durations.SHORT,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
        });
    }

    onPullRelease = async (resolve) => {
        this.loadData(resolve);
    };

    loadMore = async()=>{
        let url = '';
        this.requestPageNumber += 1;
        url =  urlConfig.Search + 'search&key=' + this.keyWord+"&page="+this.requestPageNumber;
        let res = await HttpUtil.GET(url);
        if(!res||!res.result){
            return;
        }
        let result = res.result ? res.result:[];
        this.flatList && this.flatList.setData(this.dealWithLoadMoreData(result));
        console.log('res', res);
    };

    loadData = async(resolve)=>{
        let url = '';
        url =  urlConfig.Search + 'search&key=' + this.keyWord;

        console.log('search loadUrl',url);
        let res = await HttpUtil.GET(url);
        console.log('search res',res);
        resolve && resolve();
        let result = res.result ? res.result:[];
        this.flatList && this.flatList.setData(this.dealWithLongArray(result), 0);
        console.log('res', res);
    };


    share = async()=>{
        let data = await NativeModules.NativeUtil.showDialog();
        if (data.wechat === 3){
            this.clickToReport();
            return;
        }
        if(data){
            WeChat.isWXAppInstalled().then((isInstalled) => {
                if (isInstalled) {
                    if (data.wechat === 1) {
                        WeChat.shareToSession({
                            title: "【儿童文学分享】",
                            description: this._shareItem && this._shareItem.title.replace(/^(\r\n)|(\n)|(\r)/,""),
                            type: 'news',
                            webpageUrl: urlConfig.ShareUrl + this._shareItem.classid + '/' + this._shareItem.id,
                            thumbImage: urlConfig.thumbImage,
                        }).then((message)=>{message.errCode === 0  ? this.ToastShow('分享成功') : this.ToastShow('分享失败')}).catch((error) => {
                            if (error.message != -2) {
                                Toast.show(error.message);
                            }
                        });
                    } else if(data.wechat === 2){
                        WeChat.shareToTimeline({
                            title: "【儿童文学分享】" + this._shareItem && this._shareItem.title.replace(/^(\r\n)|(\n)|(\r)/,""),
                            description: this._shareItem && this._shareItem.title.replace(/^(\r\n)|(\n)|(\r)/,""),
                            type: 'news',
                            webpageUrl: urlConfig.ShareUrl + this._shareItem.classid + '/' + this._shareItem.id,
                            thumbImage: urlConfig.thumbImage,
                        }).then((message)=>{message.errCode === 0  ? this.ToastShow('分享成功') : this.ToastShow('分享失败')}).catch((error) => {
                            if (error.message != -2) {
                                Toast.show(error.message);
                            }
                        });
                    }
                } else {
                    Toast.show("没有安装微信软件，请您安装微信之后再试");
                }
            });
            console.log('data',data)
        }
    }
    clickToReport = () => {
        let url = urlConfig.ReportURL + '/' + this._shareItem.classid + '/' + this._shareItem.id;
        this.props.navigation.navigate('Web', {url:url});
        this.close();
    }
    clickToShare = (type) => {
        this.close();
        WeChat.isWXAppInstalled().then((isInstalled) => {
            if (isInstalled) {
                if (type === 'Session') {
                    WeChat.shareToSession({
                        title: "【儿童文学分享】",
                        description: this._shareItem && this._shareItem.title.replace(/^(\r\n)|(\n)|(\r)/,""),
                        type: 'news',
                        webpageUrl: urlConfig.ShareUrl + this._shareItem.classid + '/' + this._shareItem.id,
                        thumbImage: urlConfig.thumbImage,
                    }).then((message)=>{message.errCode === 0  ? this.ToastShow('分享成功') : this.ToastShow('分享失败')}).catch((e)=>{if (error.message != -2) {
                        Toast.show(error.message);
                    }});
                } else {
                    WeChat.shareToTimeline({
                        title: "【儿童文学分享】" + this._shareItem && this._shareItem.title.replace(/^(\r\n)|(\n)|(\r)/,""),
                        description: this._shareItem && this._shareItem.title.replace(/^(\r\n)|(\n)|(\r)/,""),
                        type: 'news',
                        webpageUrl: urlConfig.ShareUrl + this._shareItem.classid + '/' + this._shareItem.id,
                        thumbImage: urlConfig.thumbImage,
                    }).then((message)=>{message.errCode === 0  ? this.ToastShow('分享成功') : this.ToastShow('分享失败')}).catch((error) => {
                        if (error.message != -2) {
                            Toast.show(error.message);
                        }
                    });
                }
            } else {
            }
        });
    }
    renderSpinner = (text) => {
        return (
            <TouchableWithoutFeedback
                onPress={() => {this.setState({visible: false});}}>
                <View key="spinner" style={styles.spinner}>
                    <Animated.View style={{  justifyContent: 'center',
                        width:WIDTH,
                        height: this._ViewHeight,
                        backgroundColor: '#fcfcfc',
                        position:'absolute',
                        left:0,
                        right:0,
                        bottom:0,
                        overflow:'hidden'}}>
                        <View style={styles.shareParent}>
                            <TouchableOpacity
                                style={styles.base}
                                onPress={()=>this.clickToShare('Session')}
                            >
                                <View style={styles.shareContent}>
                                    <Image style={styles.shareIcon} source={require('../../assets/share_icon_wechat.png')} />
                                    <Text style={styles.spinnerTitle}>微信好友</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.base}
                                onPress={()=>this.clickToShare('TimeLine')}
                            >
                                <View style={styles.shareContent}>
                                    <Image style={styles.shareIcon} source={require('../../assets/share_icon_moments.png')} />
                                    <Text style={styles.spinnerTitle}>微信朋友圈</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.base}
                                onPress={()=>this.clickToReport()}
                            >
                                <View style={styles.shareContent}>
                                    <IconSimple name="exclamation" size={40} color='black'/>
                                    <Text style={styles.spinnerTitle}>举报</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{height:10,backgroundColor:'#f5f5f5'}}></View>
                        <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
                            <Text style={{ fontSize: 16, color: 'black',textAlign: 'center' }}>取消</Text>
                        </View>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        );
    };
    show = (item)=>{
        this._shareItem = item;
        if(Platform.OS==='android'){
            this.share()
            return;
        }
        this._ViewHeight.setValue(0);
        this.setState({
            visible:true
        },  Animated.timing(this._ViewHeight, {
            fromValue:0,
            toValue: 140, // 目标值
            duration: 200, // 动画时间
            easing: Easing.linear // 缓动函数
        }).start());
    };


    close = ()=>{
        this.setState({
            visible:false
        });
    };

    dealWithLoadMoreData = (dataArray) => {
        console.log('loadMoreData',dataArray);
        let waitDealArray =this.FlatListData.concat(dataArray).filter((value)=>{return !(!value || value === "");});
        console.log('loadMoreDatacontact',waitDealArray);
        if (waitDealArray.length >= 50) {
            waitDealArray = waitDealArray.slice(waitDealArray.length -50, waitDealArray.length);
            console.log('处理过的array', waitDealArray);
        }
        this.FlatListData = waitDealArray;
        return waitDealArray;
    }

    dealWithLongArray = (dataArray) => {
        //下拉刷新来几条数据，就对应的删除几条数据 ，以便填充
        let initArray = [];
        if (this.FlatListData){
            if (this.FlatListData.length > dataArray.length ){
                initArray = this.FlatListData.slice(dataArray.length,this.FlatListData.length);
            }else{
                initArray = [];
            }
        }
        let waitDealArray = dataArray.concat(initArray).filter((value)=>{return !(!value || value === "");});
        if (waitDealArray.length >= 50) {
            waitDealArray = waitDealArray.slice(0, 50);
            console.log('处理过的array', waitDealArray);
        }
        this.FlatListData = waitDealArray;
        return waitDealArray;
    }

    setClipboardContent = (text,index,item) => {
        if(item.classid === '41' || item.classid === '44' || item.classid === '39'){
            return ;
        }
        try {
            let DeepCopyData = [].concat(JSON.parse(JSON.stringify(this.FlatListData)));
            DeepCopyData[index].isCopyed = true;
            this.flatList.setData(DeepCopyData);
            Clipboard.setString(item.title && item.title.replace(/^(\r\n)|(\n)|(\r)/,"") + urlConfig.DetailUrl + item.classid + '/' + item.id);
            Toast.show('复制成功', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.CENTER,
                shadow: true,
                animation: true,
                hideOnPress: true,
                delay: 0,
            });
        }catch (e){}
    }


    PostThumb = async(item,dotop,index) => {
        try {
            let upDownData = [].concat(JSON.parse(JSON.stringify(this.FlatListData)));
            if (dotop === 0) {
                upDownData[index].isUnLike = true;
                upDownData[index].diggbot = (parseInt(upDownData[index].diggbot) - 1).toString();

            }
            if (dotop === 1) {
                upDownData[index].isLike = true;
                upDownData[index].diggtop = (parseInt(upDownData[index].diggtop) + 1).toString();
            }

            let url = '';
            if (dotop === 0) {
                url =  urlConfig.thumbDownUrl;
            } else if (dotop === 1) {
                url =  urlConfig.thumbUpUrl;
            }
            //不用formdate后台解析不出来
            let formData = new FormData();
            formData.append("id", item.id);
            formData.append("classid", item.classid);
            formData.append("dotop", '' + dotop);
            formData.append("doajax", '' + 1);
            formData.append("ajaxarea", "diggnum");
            let res = await HttpUtil.POST(url,formData,'dotop');
            if (!res){
                return ;
            }
            let message = '';
            let array = res._bodyInit.split('|');
            if (array.length > 0) {
                message = array[array.length - 1];
            }
            if (message === '谢谢您的支持' || message === '谢谢您的意见') {
                this.flatList.setData(upDownData);
                //只能操作数据源修改列表数据  很大的损耗啊
                this.FlatListData = upDownData;
            }
            this.ToastShow(message);
        }catch (e){}
    }
    renderTextAndImage = (item, index) => {
        return <View style={{
            paddingTop: 10,
            paddingBottom: 10,
        }}>
            <Text style={{
                fontSize: 18,
                lineHeight: 26,
                paddingBottom: 10,
                fontWeight: '300'
            }} onPress={() => {
                this.props.navigation.navigate('Detail', { id: item.id, title: item.title });
            }}>
                {item.title && item.title.replace(/^(\r\n)|(\n)|(\r)/, "")}
            </Text>
            <Text style={{
                fontSize: 16,
                lineHeight: 26,
                fontWeight: '300'
            }} onPress={() => {
                this.props.navigation.navigate('Detail', { id: item.id, title: item.title });
            }}>
                {item.smalltext && item.smalltext.replace(/^(\r\n)|(\n)|(\r)/, "")}
            </Text>
        </View>
    }
    clickToFavas = (classid,id) => {
        let url = urlConfig.FavasURL + '/' + classid + '/' + id;
        if (global.userInfo) {
            this.props.navigation.navigate('Web', { url: url });
        } else {
            this.props.navigation.navigate('Login');
        }
    }
    _renderItem = ({item, index}) => {
        if (item.adType && item.picUrl) {
            return  <TouchableOpacity activeOpacity={1} onPress={() => {
            }}>
                <View style={{backgroundColor:'#ffffff',flexDirection: 'row', paddingHorizontal: 20, paddingVertical:15, justifyContent: 'center',alignItems:'center'}}>
                    { item.picUrl ? <ImageProgress
                        source={{ uri: item.picUrl }}
                        resizeMode={'cover'}
                        indicator={Pie}
                        indicatorProps={{
                            size: 40,
                            borderWidth: 0,
                            color: 'rgba(255, 160, 0, 0.8)',
                            unfilledColor: 'rgba(200, 200, 200, 0.1)'
                        }}
                        style={{width:WIDTH-40,height:100}} />  : null }
                </View>
            </TouchableOpacity>
        }
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {
            }}>
                <View>
                    {index === 0 ? <View style={{width:WIDTH,height:10,backgroundColor:Color.f5f5f5}}/> :<View/>}
                    <View style={{ backgroundColor: 'white', paddingHorizontal: 20,paddingTop:10}}>
                        {this.renderTextAndImage(item,index)}
                        <View
                            style={{
                                flexDirection: 'row',
                                marginTop: 15,
                                marginBottom:15,
                                justifyContent: 'space-between',
                            }}>
                            <View style={{ flexDirection: 'row' }}>
                                {item.classname ? <Text style={{
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    fontWeight: '100',
                                    borderColor: '#eee'
                                }}
                                    onPress={() => {
                                        this.props.pageNumber(parseInt(item.classid))
                                    }}>
                                    {item.classname && item.classname}
                                </Text> : <View />}

                            </View>
                            <View style={{flexDirection: 'row'}}>
                                <View style={{flexDirection: 'row',marginLeft: 10}}>
                                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.PostThumb(item,1,index)}} hitSlop={{left:10,right:10,top:10,bottom:10}}>
                                        {item.isLike ?   <IconSimple name="like" size={15} color='#027fff'/> : <IconSimple name="like" size={15} color='#5C5C5C'/>}
                                    </TouchableOpacity>
                                    <Text style={{marginLeft: 5,fontWeight:'100'}}>{item.diggtop && item.diggtop}</Text>
                                </View>
                                <View style={{flexDirection: 'row', marginLeft: 10}}>
                                    <TouchableOpacity activeOpacity={1} onPress={()=>{this.PostThumb(item,0,index)}} hitSlop={{left:10,right:10,top:10,bottom:10}}>
                                        {item.isUnLike ?   <IconSimple name="dislike" size={15} color='#027fff'/> : <IconSimple name="dislike" size={15} color='#5C5C5C'/>}
                                    </TouchableOpacity>
                                    <Text style={{marginLeft: 5,fontWeight:'100'}}>{item.diggbot && item.diggbot}</Text>
                                </View>
                                <View style={{flexDirection: 'row', marginLeft: 10}}>
                                    <TouchableOpacity activeOpacity={1} onPress={()=> { this.show(item)}} hitSlop={{left:10,right:10,top:10,bottom:10}}>
                                        <IconSimple name="share" size={15} color='#5C5C5C'/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    _keyExtractor = (item, index) => index;

    render() {
        return (
            <View style={{flex: 1}} >
                <PullList
                    //  data={this.state.data}
                  //  contentContainerStyle={{justifyContent:"center", alignItems:'center'}}
                    keyExtractor={this._keyExtractor}
                    onPullRelease={this.onPullRelease}
                    renderItem={this._renderItem}
                    onEndReached={this.loadMore}
                    style={{backgroundColor: Color.f5f5f5}}
                    ref={(c) => {this.flatList = c}}
                    ifRenderFooter={true}
                />
                <ModalUtil
                    visible = {this.state.visible}
                    close = {this.close}
                    contentView = {this.renderSpinner}/>

            </View>
        );
    }

}
const header = {
    backgroundColor: '#027fff',
    ...ifIphoneX({
        paddingTop: 44,
        height: 88
    }, {
            paddingTop: Platform.OS === "ios" ? 20 : SCALE(StatusBarHeight()),
            height: 64,
        }),
    flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'flex-end'
}
const styles = StyleSheet.create({
    base: {
        flex: 1
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFF'
    },
    spinner: {
        width: WIDTH,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)'
    },
    spinnerContent: {
        justifyContent: 'center',
        width: WIDTH,
        backgroundColor: '#fcfcfc',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    spinnerTitle: {
        fontSize: 14,
        color: '#313131',
        textAlign: 'center',
        marginTop: 5
    },
    shareParent: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10
    },
    shareContent: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    shareIcon: {
        width: 40,
        height: 40
    },
});





