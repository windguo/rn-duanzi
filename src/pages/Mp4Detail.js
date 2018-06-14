import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Slider, Animated, Easing, Platform, findNodeHandle, Dimensions, ImageBackground, TouchableWithoutFeedback, Button } from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import { ifIphoneX } from '../utils/iphoneX';
import IconSimple from 'react-native-vector-icons/SimpleLineIcons';
import * as WeChat from 'react-native-wechat';
import Toast from 'react-native-root-toast';
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ScrollView } from 'react-native-gesture-handler';
import storageKeys from '../utils/storageKeyValue'

const screenWidth = Dimensions.get('window').width;

function formatTime(second) {
    let h = 0, i = 0, s = parseInt(second);
    if (s > 60) {
        i = parseInt(s / 60);
        s = parseInt(s % 60);
    }
    // 补零
    let zero = function (v) {
        return (v >> 0) < 10 ? "0" + v : v;
    };
    return [zero(h), zero(i), zero(s)].join(":");
}

export default class VideoPlayScreen extends Component {
    
    static navigationOptions = {
        tabBarLabel: '看故事',
        tabBarIcon: ({ tintColor, focused }) => (
            <MaterialIcons name="ondemand-video" size={22} color={focused ? "#fe5f01" : 'black'} />
        ),
        header: ({ navigation }) => {
            if (!navigation.state.routes[1].params.fullVideo){
                return (
                    <ImageBackground style={{ ...header }} source={require('../assets/backgroundImageHeader.png')} resizeMode='cover'>
                        <TouchableOpacity activeOpacity={1} onPress={() => {
                            navigation.goBack(null);
                        }}>
                            <View style={{ justifyContent: 'center', marginLeft: 10, alignItems: 'center', height: 43.7, width: 20 }}>
                                <IconSimple name="arrow-left" size={20} color={'#ffffff'} />
                            </View>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 17, textAlign: 'center', lineHeight: 43.7, color: '#ffffff' }}>故事播放页</Text>
                        <View style={{ justifyContent: 'center', marginLeft: 10, alignItems: 'center', height: 43.7, width: 20 }}>

                        </View>
                    </ImageBackground>
                )
            }
            else{
                return null;
            }
        }
    };


    constructor(props) {
        super(props);
        this.state = {
            data: [],
            videoUrl: this.props.navigation.state.params.nurl,
            videoCover: this.props.navigation.state.params.titlepic,
            videoWidth: screenWidth,
            videoHeight: screenWidth * 9 / 16, // 默认16：9的宽高比
            showVideoCover: true,    // 是否显示视频封面
            showVideoControl: false, // 是否显示视频控制组件
            isPlaying: false,        // 视频是否正在播放
            currentTime: 0,        // 视频当前播放的时间
            duration: 0,           // 视频的总时长
            isFullScreen: false,     // 当前是否全屏显示
            playFromBeginning: false, // 是否从头开始播放
        };
        this.resuleArray = [];
        READ_CACHE(storageKeys.localMp4, (res) => {
            if (res && res.length > 0) {
                this.flatList && this.flatList.setData(res, 0);
                this.resuleArray = res;
            } else {
                console.log('nothings');
                this.resuleArray = [];
            }
        })
    }

    clickToFava = () => {
        let resu = {
            title: this.props.navigation.state.params.title,
            id: this.props.navigation.state.params.id,
            classid: this.props.navigation.state.params.classid,
            nurl: this.props.navigation.state.params.nurl,
            titlepic: this.props.navigation.state.params.titlepic,
        };
        console.log('resuuuuuuuuu====',resu);
        this.resuleArray.push(resu);
        WRITE_CACHE(storageKeys.localMp4, this.resuleArray);
        Toast.show('本地收藏【' + this.props.navigation.state.params.title + '】成功,\n请到本地收藏的看故事查看。', {
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
            <View style={styles.container} onLayout={this._onLayout}>
                <View style={{ width: this.state.videoWidth, height: this.state.videoHeight, backgroundColor: '#000000' }}>
                    <Video
                        ref={(ref) => this.videoPlayer = ref}
                        source={{ uri: this.props.navigation.state.params.nurl }}
                        rate={1.0}
                        volume={1.0}
                        muted={false}
                        paused={!this.state.isPlaying}
                        resizeMode={'contain'}
                        playWhenInactive={false}
                        playInBackground={false}
                        ignoreSilentSwitch={'ignore'}
                        progressUpdateInterval={250.0}
                        onLoadStart={this._onLoadStart}
                        onLoad={this._onLoaded}
                        onProgress={this._onProgressChanged}
                        onEnd={this._onPlayEnd}
                        onError={this._onPlayError}
                        onBuffer={this._onBuffering}
                        style={{ width: this.state.videoWidth, height: this.state.videoHeight,paddingTop:20 }}
                    />
                    {
                        this.state.showVideoCover ?
                            <Image
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: this.state.videoWidth,
                                    height: this.state.videoHeight
                                }}
                                resizeMode={'cover'}
                                source={{ uri: this.state.videoCover }}
                            /> : null
                    }
                    <TouchableWithoutFeedback onPress={() => { this.hideControl() }}>
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: this.state.videoWidth,
                                height: this.state.videoHeight,
                                backgroundColor: this.state.isPlaying ? 'transparent' : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                            {this.state.isPlaying ?
                                null:
                                <TouchableWithoutFeedback onPress={() => { this.onPressPlayButton() }}>
                                    <MaterialIcons name="play-circle-outline" size={45} color='#fe5f01' />
                                </TouchableWithoutFeedback>}
                        </View>
                    </TouchableWithoutFeedback>
                    {
                        this.state.showVideoControl ?
                            <View style={[styles.control, { width: this.state.videoWidth }]}>
                                <TouchableOpacity activeOpacity={0.3} onPress={() => { this.onControlPlayPress() }}>
                                    {this.state.isPlaying ?
                                        <MaterialIcons name="pause" size={30} color='#ffffff' />
                                         :
                                        <MaterialIcons name={'play-circle-outline'} size={30} color='#ffffff' />
                                    }
                                </TouchableOpacity>
                                <Text style={styles.time}>{formatTime(this.state.currentTime)}</Text>
                                <Slider
                                    style={{ flex: 1 }}
                                    maximumTrackTintColor={'#999999'}
                                    minimumTrackTintColor={'#00c06d'}
                                    thumbImage={require('../../assets/image/icon_control_slider.png')}
                                    value={this.state.currentTime}
                                    minimumValue={0}
                                    maximumValue={this.state.duration}
                                    onValueChange={(currentTime) => { this.onSliderValueChanged(currentTime) }}
                                />
                                <Text style={styles.time}>{formatTime(this.state.duration)}</Text>
                                <TouchableOpacity activeOpacity={0.3} onPress={() => { this.onControlShrinkPress() }}>
                                    {this.state.isFullScreen ?
                                        <MaterialIcons name={'fullscreen-exit'} size={30} color='#ffffff' /> :
                                        <MaterialIcons name={'fullscreen'} size={30} color='#ffffff' />}
                                </TouchableOpacity>
                            </View> : null
                    }
                </View>
                <View style={styles.toolBar}>
                    <View style={styles.cdStyle}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginLeft: 10 }}
                            onPress={() => this.clickToShare('Session')}
                        >
                            <View style={styles.shareContent}>
                                <Icon name="wechat" size={30} color={'#fe5f01'} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginLeft: 10 }}
                            onPress={() => this.clickToShare('TimeLine')}
                        >
                            <View style={styles.shareContent}>
                                <Image style={{ width: 30, height: 30 }} source={require('../assets/share_icon_moments.png')} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginLeft: 10 }}
                            onPress={() => {
                                this.clickToFava()
                            }}
                        >
                            <View style={styles.shareContent}>
                                <IconSimple name="folder-alt" size={30} color='#fe5f01' />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', marginLeft: 10 }}
                            onPress={() => this.clickToReport()}
                        >
                            <View style={styles.shareContent}>
                                <IconSimple name="exclamation" size={30} color={'#fe5f01'} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView style={{marginBottom:60}}>
                    <View style={{paddingLeft:30,paddingRight:30}}>
                        <View style={{alignItems:'center',justifyContent:'center'}}>
                            <Text style={{ paddingBottom: 30, fontSize: 28 }}>
                                {this.props.navigation.state.params.title}
                            </Text>
                        </View>
                        <Text style={{lineHeight:24}}>
                            {this.props.navigation.state.params.smalltext}
                        </Text>
                    </View>
                </ScrollView>
            </View>
        )
    }

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
                        thumbImage: this.props.navigation.state.params.titlepic,
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
                        thumbImage: this.props.navigation.state.params.titlepic,
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
                            imageUrl: this.props.navigation.state.params.titlepic,
                            type: 'news',
                            webpageUrl: urlConfig.ShareUrl + this.props.navigation.state.params.classid + '/' + this.props.navigation.state.params.id
                        }).then((message) => { message.errCode === 0 ? this.ToastShow('分享成功') : this.ToastShow('分享失败') }).catch((error) => {
                            if (error.message != -2) {
                                Toast.show(error.message);
                            }
                        });
                    } else if (data.wechat === 2) {
                        WeChat.shareToSession({
                            imageUrl: this.props.navigation.state.params.titlepic,
                            type: 'news',
                            webpageUrl: urlConfig.ShareUrl + this.props.navigation.state.params.classid + '/' + this.props.navigation.state.params.id
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
        let url = urlConfig.ReportURL + '/' + this.props.navigation.state.params.classid + '/' + this.props.navigation.state.params.id;
        this.props.navigation.navigate('Web', { url: url });
        this.close();
    };
    /// -------Video组件回调事件-------

    _onLoadStart = () => {
        console.log('视频开始加载');
    };

    _onBuffering = () => {
        console.log('视频缓冲中...')
    };

    _onLoaded = (data) => {
        console.log('视频加载完成');
        
        this.setState({
            duration: data.duration,
        });
    };

    _onProgressChanged = (data) => {
        console.log('视频进度更新');
        if (this.state.isPlaying) {
            this.setState({
                currentTime: data.currentTime,
            })
        }
    };

    _onPlayEnd = () => {
        console.log('视频播放结束');
        this.props.navigation.setParams({
            fullVideo: true
        })
        Orientation.lockToPortrait();
        this.props.navigation.goBack(null);
        
    };

    _onPlayError = () => {
        Toast.show('视频播放失败，请稍后再试。')
    };

    ///-------控件点击事件-------

    /// 控制播放器工具栏的显示和隐藏
    hideControl() {
        if (this.state.showVideoControl) {
            this.setState({
                showVideoControl: false,
            })
        } else {
            this.setState(
                {
                    showVideoControl: true,
                },
                // 5秒后自动隐藏工具栏
                () => {
                    setTimeout(
                        () => {
                            this.setState({
                                showVideoControl: false
                            })
                        }, 5000
                    )
                }
            )
        }
    }
    componentDidMount(){
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
    /// 点击了播放器正中间的播放按钮
    onPressPlayButton() {
        let isPlay = !this.state.isPlaying;
        if (isPlay){

        }
        this.setState({
            isPlaying: isPlay,
            showVideoCover: false
        });
        if (this.state.playFromBeginning) {
            this.videoPlayer.seek(0);
            this.setState({
                playFromBeginning: false,
            })
        }
    }

    /// 点击了工具栏上的播放按钮
    onControlPlayPress() {
        this.onPressPlayButton();
    }

    /// 点击了工具栏上的全屏按钮
    onControlShrinkPress() {
        if (this.state.isFullScreen) {
            this.props.navigation.setParams({
                fullVideo: false
            })
            Orientation.lockToPortrait();
        } else {
            this.props.navigation.setParams({
                fullVideo:true
            })
            Orientation.lockToLandscape();
        }
    }

    /// 进度条值改变
    onSliderValueChanged(currentTime) {
        this.videoPlayer.seek(currentTime);
        if (this.state.isPlaying) {
            this.setState({
                currentTime: currentTime
            })
        } else {
            this.setState({
                currentTime: currentTime,
                isPlaying: true,
                showVideoCover: false
            })
        }
    }

    /// 屏幕旋转时宽高会发生变化，可以在onLayout的方法中做处理，比监听屏幕旋转更加及时获取宽高变化
    _onLayout = (event) => {
        //获取根View的宽高
        let { width, height } = event.nativeEvent.layout;
        console.log('通过onLayout得到的宽度：' + width);
        console.log('通过onLayout得到的高度：' + height);

        // 一般设备横屏下都是宽大于高，这里可以用这个来判断横竖屏
        let isLandscape = (width > height);
        if (isLandscape) {
            this.setState({
                videoWidth: width,
                videoHeight: height,
                isFullScreen: true,
            })
        } else {
            this.setState({
                videoWidth: width,
                videoHeight: width * 9 / 16,
                isFullScreen: false,
            })
        }
        Orientation.unlockAllOrientations();
    };

    /// -------外部调用事件方法-------

    ///播放视频，提供给外部调用
    playVideo() {
        this.setState({
            isPlaying: true,
            showVideoCover: false
        })
    }

    /// 暂停播放，提供给外部调用
    pauseVideo() {
        this.setState({
            isPlaying: false,
        })
    }

    /// 切换视频并可以指定视频开始播放的时间，提供给外部调用
    switchVideo(videoURL, seekTime) {
        this.setState({
            videoUrl: videoURL,
            currentTime: seekTime,
            isPlaying: true,
            showVideoCover: false
        });
        this.videoPlayer.seek(seekTime);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    playButton: {
        width: 50,
        height: 50,
    },
    playControl: {
        width: 24,
        height: 24,
        marginLeft: 15,
    },
    shrinkControl: {
        width: 15,
        height: 15,
        marginRight: 15,
    },
    time: {
        fontSize: 12,
        color: 'white',
        marginLeft: 10,
        marginRight: 10
    },
    control: {
        flexDirection: 'row',
        height: 44,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: 'absolute',
        bottom: 0,
        left: 0
    },
    cdStyle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    toolBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 30
    },
});

const header = {
    backgroundColor: '#eee',
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