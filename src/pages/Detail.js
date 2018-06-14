/**
 * Created by zhangzuohua on 2018/1/18.
 */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
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
    FlatList
} from 'react-native';
import { ifIphoneX } from '../utils/iphoneX';
import HttpUtil from '../utils/HttpUtil';
import Toast from 'react-native-root-toast';
import storageKeys from '../utils/storageKeyValue'
import IconSimple from 'react-native-vector-icons/SimpleLineIcons';
import * as WeChat from 'react-native-wechat';
import HTMLView from 'react-native-htmlview';
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
export  default  class Detail extends Component {
    static navigationOptions = {
        title: '详情页',
        header: ({ navigation }) => {
            return (
                <ImageBackground style={{ ...header }} source={require('../assets/backgroundImageHeader.png')} resizeMode='cover'>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        navigation.goBack(null);
                    }}>
                        <View style={{ justifyContent: 'center', marginLeft: 10, alignItems: 'center', height: 43.7, width: 20 }}>
                            <IconSimple name="arrow-left" size={20} color={'#ffffff'} />
                        </View>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 17, textAlign: 'center', lineHeight: 43.7, color: '#ffffff' }}>详情页</Text>
                    <View style={{ justifyContent: 'center', marginLeft: 10, alignItems: 'center', height: 43.7,width:20 }}>
                        
                    </View>
                </ImageBackground>
            )
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            refreshing: false,
        };
        this.resuleArray = [];
        READ_CACHE(storageKeys.localTxt, (res) => {
            if (res && res.length > 0) {
                this.flatList && this.flatList.setData(res, 0);
                this.resuleArray = res;
            } else {
                console.log('nothings');
                this.resuleArray = [];
            }
        })
    }
    componentDidMount() {
        this.loadData();
    }
    loadData = async (resolve) => {
        let url = urlConfig.contentApi + '&id=' + this.props.navigation.state.params.id;
        console.log('loadUrl', url);
        let res = await HttpUtil.GET(url);
        console.log(res);
        resolve && resolve();
        if (this.props.index !== 0) { this.isNotfirstFetch = true };
        let result = res.result ? res.result : [];
        this.setState({
            data: result,
        });
        console.log('res', res);
    };
    clickToShare = (type) => {
        console.log('XXXXXXXXXXXXX', urlConfig.thumbImage);
        this.close();
        WeChat.isWXAppInstalled().then((isInstalled) => {
            if (isInstalled) {
                if (type === 'Session') {
                    WeChat.shareToSession({
                        title: "【儿童文学分享】",
                        description: this.props.navigation.state.params.title,
                        type: 'news',
                        webpageUrl: urlConfig.ShareUrl + this.props.navigation.state.params.classid + '/' + this.props.navigation.state.params.id,
                        thumbImage: urlConfig.thumbImage,
                    }).then((message) => { message.errCode === 0 ? this.ToastShow('分享成功') : this.ToastShow('分享失败') }).catch((e) => {
                        if (error.message != -2) {
                            Toast.show(error.message);
                        }
                    });
                } else {
                    WeChat.shareToTimeline({
                        title: "【儿童文学分享】" + this.props.navigation.state.params.title,
                        // description: this.props.navigation.state.params.title,
                        type: 'news',
                        webpageUrl: urlConfig.ShareUrl + this.props.navigation.state.params.classid + '/' + this.props.navigation.state.params.id,
                        thumbImage: urlConfig.thumbImage,
                    }).then((message) => { message.errCode === 0 ? this.ToastShow('分享成功') : this.ToastShow('分享失败') }).catch((error) => {
                        if (error.message != -2) {
                            Toast.show(error.message);
                        }
                    });
                }
            } else {
            }
        });
    }
    show = (item) => {
        this.state.data = item;
        if (Platform.OS === 'android') {
            this.share()
            return;
        }
        this._ViewHeight.setValue(0);
        this.setState({
            visible: true
        }, Animated.timing(this._ViewHeight, {
            fromValue: 0,
            toValue: 140, // 目标值
            duration: 200, // 动画时间
            easing: Easing.linear // 缓动函数
        }).start());
    };
    close = () => {
        this.setState({
            visible: false
        });
    };
    share = async () => {
        let data = await NativeModules.NativeUtil.showDialog();
        if (data.wechat === 3) {
            this.clickToReport();
            return;
        }
        if (data) {
            WeChat.isWXAppInstalled().then((isInstalled) => {
                if (isInstalled) {
                    if (data.wechat === 1) {
                        WeChat.shareToSession({
                            title: "【儿童文学分享】",
                            description: this.props.navigation.state.params.title,
                            type: 'news',
                            webpageUrl: urlConfig.ShareUrl + this.props.navigation.state.params.classid + '/' + this.props.navigation.state.params.id,
                            thumbImage: urlConfig.thumbImage,
                        }).then((message) => { message.errCode === 0 ? this.ToastShow('分享成功') : this.ToastShow('分享失败') }).catch((error) => {
                            if (error.message != -2) {
                                Toast.show(error.message);
                            }
                        });
                    } else if (data.wechat === 2) {
                        WeChat.shareToSession({
                            title: "【儿童文学分享】",
                            description: this.props.navigation.state.params.title,
                            type: 'news',
                            webpageUrl: urlConfig.ShareUrl + this.props.navigation.state.params.classid + '/' + this.props.navigation.state.params.id,
                            thumbImage: urlConfig.thumbImage,
                        }).then((message) => { message.errCode === 0 ? this.ToastShow('分享成功') : this.ToastShow('分享失败') }).catch((error) => {
                            if (error.message != -2) {
                                Toast.show(error.message);
                            }
                        });
                    }
                } else {
                    Toast.show("没有安装微信软件，请您安装微信之后再试");
                }
            });
            console.log('data', data)
        }
    };
    clickToReport = () => {
        let url = urlConfig.ReportURL + '/' + this.state.data.classid + '/' + this.state.data.id;
        this.props.navigation.navigate('Web', { url: url });
        this.close();
    }
    clickToFava = () => {
        let resu = {
            title: this.state.data.title,
            id: this.state.data.id,
            classid: this.state.data.classid,
            nurl: this.state.data.nurl,
            titlepic: this.state.data.titlepic,
        };
        this.resuleArray.push(resu);
        WRITE_CACHE(storageKeys.localTxt, this.resuleArray);
        Toast.show('本地收藏【' + this.state.data.title + '】成功,\n请到本地收藏的读故事查看。', {
            duration: Toast.durations.SHORT,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
        });
    }
    render() {
        return (
            <View>
                <View style={{ alignItems: 'center', justifyContent: 'center',paddingTop:20,paddingBottom:20}}>
                    <Text style={{
                        fontSize: 18
                    }}>
                        {this.state.data.title}
                    </Text>
                </View>
                <ScrollView style={{height:HEIGHT-260,marginBottom:20}}>
                    <View style={{ 
                            padding: 20, 
                            // backgroundColor:'#f8f8f8',
                            marginTop: StyleSheet.hairlineWidth,
                            marginBottom: StyleSheet.hairlineWidth
                            }}>
                        <HTMLView
                            stylesheet={htmlStyles}
                            value={
                                this.state.data.newstext ? 
                                this.state.data.newstext :
                                '努力加载中...'
                            }
                        />
                    </View>
                </ScrollView>
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginLeft: 10 }}
                            onPress={() => this.clickToFava()}
                        >
                            <View style={styles.shareContent}>
                                <IconSimple name="folder-alt" size={40} color='black' />
                                <Text style={styles.spinnerTitle}>收藏</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginLeft: 10 }}
                            onPress={() => this.clickToShare('Session')}
                        >
                            <View style={styles.shareContent}>
                                <Image style={styles.shareIcon} source={require('../assets/share_icon_wechat.png')} />
                                <Text style={styles.spinnerTitle}>微信好友</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginLeft: 10 }}
                            onPress={() => this.clickToShare('TimeLine')}
                        >
                            <View style={styles.shareContent}>
                                <Image style={styles.shareIcon} source={require('../assets/share_icon_moments.png')} />
                                <Text style={styles.spinnerTitle}>微信朋友圈</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginLeft: 10 }}
                            onPress={() => this.clickToReport()}
                        >
                            <View style={styles.shareContent}>
                                <IconSimple name="exclamation" size={40} color='black' />
                                <Text style={styles.spinnerTitle}>举报</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const htmlStyles = StyleSheet.create({
    span: {
        fontSize: 16,
        lineHeight: 24,
        color:'#333',
        marginBottom:20
    },
});

const header = {
    backgroundColor: '#C7272F',
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
    shareParent: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10
    },
    shareContent: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    shareIcon: {
        width: 40,
        height: 40
    },
    spinnerTitle: {
        paddingTop: 10
    }

})



