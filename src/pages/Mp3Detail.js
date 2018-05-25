import React, { Component } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, Slider, Animated, Easing, Platform, findNodeHandle, Dimensions, ImageBackground } from 'react-native'
import { ifIphoneX } from '../utils/iphoneX';
import HttpUtil from '../utils/HttpUtil';
import storageKeys from '../utils/storageKeyValue'
import IconSimple from 'react-native-vector-icons/SimpleLineIcons';
import * as WeChat from 'react-native-wechat';
import HTMLView from 'react-native-htmlview';
import Toast from 'react-native-root-toast';
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { commonStyle } from '../../commonStyle'
import Video from 'react-native-video'
import { VibrancyView, BlurView } from 'react-native-blur'

export default class MusicPlayer extends Component {
    static navigationOptions = {
        tabBarLabel: '读故事',
        tabBarIcon: ({ tintColor, focused }) => (
            <MaterialIcons name="wrap-text" size={22} color={focused ? "#fe5f01" : 'black'} />
        ),
        header: null
    };
    constructor(props) {
        super(props)
        this.player = ''
        this.rotation = false
        this.musicList = []
        this.state = {
            data: [],
            viewRef: null,
            paused: false, // false: 表示播放，true: 表示暂停
            duration: 0.00,
            slideValue: 0.00,
            currentTime: 0.00,
            currentIndex: 0,
            playMode: 0,
            spinValue: new Animated.Value(0),
            musicInfo: {}
        }
        this.spinAnimated = Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 6000,
            easing: Easing.inOut(Easing.linear)
        })
    }

    formatMediaTime(duration) {
        let min = Math.floor(duration / 60)
        let second = duration - min * 60
        min = min >= 10 ? min : '0' + min
        second = second >= 10 ? second : '0' + second
        return min + ':' + second
    }

    spining() {
        if (this.rotation) {
            this.state.spinValue.setValue(0)
            this.spinAnimated.start(() => {
                this.spining()
            })
        }
    }

    spin() {
        this.rotation = !this.rotation
        if (this.rotation) {
            this.spinAnimated.start(() => {
                this.spinAnimated = Animated.timing(this.state.spinValue, {
                    toValue: 1,
                    duration: 6000,
                    easing: Easing.inOut(Easing.linear)
                })
                this.spining()
            })
        } else {
            this.state.spinValue.stopAnimation((oneTimeRotate) => {
                this.spinAnimated = Animated.timing(this.state.spinValue, {
                    toValue: 1,
                    duration: (1 - oneTimeRotate) * 6000,
                    easing: Easing.inOut(Easing.linear)
                })
            })
        }
    }

    componentDidMount() {
        Toast.show('努力加载故事中......', {
            duration: 10000,
            position: Toast.positions.CENTER,
            textColor:'#fff',
            shadow: true,
            animation: true,
            hideOnPress: true,
            // delay: 100,
        });
        this.spin()
    }

    setDuration(duration) {
        this.setState({
            spinValue: new Animated.Value(1)
        });
        this.setState({ duration: duration.duration })
    }

    setTime(data) {
        let sliderValue = parseInt(this.state.currentTime);
        if (sliderValue){
            console.log('开始播放了');
        };
        this.setState({
            slideValue: sliderValue,
            currentTime: data.currentTime
        })
    }

    nextSong(currentIndex) {
        this.reset()
    }

    preSong(currentIndex) {
        this.reset()
    }

    reset() {
        this.setState({
            currentTime: 0.00,
            slideValue: 0.00,
            musicInfo: {}
        })
    }

    play() {
        this.spin()
        this.setState({
            paused: !this.state.paused
        })
    }

    onEnd(data) {
        this.props.navigation.goBack(null);
    }

    videoError(error) {
        this.showMessageBar('播放器报错啦！')(error)('error')
    }

    showMessageBar = title => msg => type => {
        // 报错信息
    }
    clickToShare = (type) => {
        console.log('XXXXXXXXXXXXX', urlConfig.thumbImage);
        this.close();
        WeChat.isWXAppInstalled().then((isInstalled) => {
            if (isInstalled) {
                if (type === 'Session') {
                    WeChat.shareToSession({
                        imageUrl: this.state.data && this.state.data.nurl,
                        type: 'news',
                        webpageUrl: urlConfig.ShareUrl + this.state.data.classid + '/' + this.state.data.id
                    }).then((message) => { message.errCode === 0 ? this.ToastShow('分享成功') : this.ToastShow('分享失败') }).catch((e) => {
                        if (error.message != -2) {
                            Toast.show(error.message);
                        }
                    });
                } else {
                    WeChat.shareToTimeline({
                        imageUrl: this.state.data && this.state.data.nurl,
                        type: 'news',
                        webpageUrl: urlConfig.ShareUrl + this.state.data.classid + '/' + this.state.data.id
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
                            imageUrl: this.state.data && this.state.data.nurl,
                            type: 'news',
                            webpageUrl: urlConfig.ShareUrl + this.state.data.classid + '/' + this.state.data.id
                        }).then((message) => { message.errCode === 0 ? this.ToastShow('分享成功') : this.ToastShow('分享失败') }).catch((error) => {
                            if (error.message != -2) {
                                Toast.show(error.message);
                            }
                        });
                    } else if (data.wechat === 2) {
                        WeChat.shareToSession({
                            imageUrl: this.state.data && this.state.data.nurl,
                            type: 'news',
                            webpageUrl: urlConfig.ShareUrl + this.state.data.classid + '/' + this.state.data.id
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
    renderPlayer() {
        return (
            <View style={styles.bgContainer}>
                <View>
                    <View style={styles.navBarContent}>
                        <TouchableOpacity
                            style={{ marginLeft:20}}
                            onPress={() => { 
                                this.props.navigation.goBack(null);
                            }}
                        >
                            <IconSimple name="arrow-left" size={20} color={'#ffffff'} />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center', justifyContent: 'center',marginLeft:-30}}>
                            <Text style={styles.title}>{this.props.navigation.state.params.title}</Text>
                        </View>
                        <TouchableOpacity
                            style={{ marginTop: 5 }}
                            onPress={() => alert('分享')}
                        >
                            {/* <Icon name={'oneIcon|share_o'} size={20} color={commonStyle.white} /> */}
                        </TouchableOpacity>
                    </View>
                </View>
                <View
                    style={styles.djCard}>
                </View>
                <Image
                    style={{
                        width: 280, height: 280, alignSelf: 'center', position: 'absolute',
                        top:95,
                        ...ifIphoneX({
                            top: 248,
                        })
                    }}
                    source={require('../../bgCD.png')}
                />
                <Animated.Image
                    style={{
                        width: 170,
                        height: 170,
                        borderRadius: 85,
                        alignSelf: 'center',
                        position: 'absolute', 
                        top: 150,
                        ...ifIphoneX({
                            top:300
                        }),
                        transform: [{
                            rotate: this.state.spinValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg']
                            })
                        }]
                    }}
                    source={{ uri: this.props.navigation.state.params.titlepic }} />
                <View style={{ flex: 1 }}>
                    <View style={styles.progressStyle}>
                        <Text style={{ width: 50, fontSize: 14, color: commonStyle.white, marginLeft: 5 }}>{this.formatMediaTime(Math.floor(this.state.currentTime))}</Text>
                        <Slider
                            style={styles.slider}
                            value={this.state.slideValue}
                            maximumValue={this.state.duration}
                            minimumTrackTintColor={commonStyle.themeColor}
                            maximumTrackTintColor={commonStyle.iconGray}
                            step={1}
                            // thumbImage={(require('../assets/share.jpg'))}
                            onValueChange={value => this.setState({ currentTime: value })}
                            onSlidingComplete={value => this.player.seek(value)}
                        />
                        <View style={{ width: 50, alignItems: 'flex-end', marginRight: 5 }}>
                            <Text style={{ fontSize: 14, color: commonStyle.white }}>{this.formatMediaTime(Math.floor(this.state.duration))}</Text>
                        </View>
                    </View>
                    <View style={styles.toolBar}>
                        <View style={styles.cdStyle}>
                            <TouchableOpacity
                                style={{ width: 35, height: 35, borderRadius: 20, borderWidth: 1, borderColor: commonStyle.white, justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => this.play()}
                            >
                                {this.state.paused ? 
                                    <MaterialIcons name={'play-arrow'} size={30} color='#ffffff' /> : 
                                    <MaterialIcons name={'pause'} size={30} color='#ffffff' />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', marginLeft: 10 }}
                                onPress={() => this.clickToShare('Session')}
                            >
                                <View style={styles.shareContent}>
                                    <Icon name="wechat" size={30} color='white' />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', marginLeft: 10 }}
                                onPress={() => this.clickToShare('TimeLine')}
                            >
                                <View style={styles.shareContent}>
                                    <Image style={{width:30,height:30}} source={require('../assets/share_icon_moments.png')} />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', marginLeft: 10 }}
                                onPress={() => this.clickToReport()}
                            >
                                <View style={styles.shareContent}>
                                    <IconSimple name="exclamation" size={30} color='white' />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Video
                    ref={video => this.player = video}
                    source={{ uri: this.props.navigation.state.params.nurl }}
                    volume={1.0}
                    paused={this.state.paused}
                    playInBackground={true}
                    playWhenInactive={false}
                    onLoadStart={this.loadStart}
                    onLoad={data => this.setDuration(data)}
                    onProgress={(data) => this.setTime(data)}
                    onEnd={(data) => this.onEnd(data)}
                    onError={(data) => this.videoError(data)}
                    onBuffer={this.onBuffer}
                    onTimedMetadata={this.onTimedMetadata} />
            </View>
        )
    }

    clickToReport = () => {
        let url = urlConfig.ReportURL + '/' + this.state.data.classid + '/' + this.state.data.id;
        this.props.navigation.navigate('Web', { url: url });
        this.close();
    };
    close = () => {
        this.setState({
            visible: false
        });
    };
    imageLoaded() {
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) })
    }

    render() {
        return (
            this.props.navigation.state.params.titlepic ?
                <View style={styles.container}>
                    <Image
                        ref={(img) => { this.backgroundImage = img }}
                        style={styles.bgContainer}
                        source={{ uri: this.props.navigation.state.params.titlepic }}
                        resizeMode='cover'
                        onLoadEnd={() => this.imageLoaded()}
                    />
                    <View style={styles.bgContainer}>
                        {
                            Platform.OS === 'ios' ?
                                <VibrancyView
                                    blurType={'dark'}
                                    blurAmount={10}
                                    style={styles.container} /> :
                                <BlurView
                                    style={styles.absolute}
                                    viewRef={this.state.viewRef}
                                    blurType="dark"
                                    blurAmount={10}
                                />
                        }
                    </View>
                    {this.renderPlayer()}
                </View> : <View />
        )
    }
}

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    bgContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    navBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...ifIphoneX({
            paddingTop: 44,
            height: 88
        }, {
                paddingTop: Platform.OS === "ios" ? 30 : SCALE(StatusBarHeight()),
                height: 74,
            }),
    },
    title: {
        color: commonStyle.white,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20
    },
    djCard: {
        width: 300,
        height: 300,
        top: 12,
        ...ifIphoneX({
            top: 150,
        }),
        borderColor: commonStyle.gray,
        borderWidth: 20,
        borderRadius: 190,
        alignSelf: 'center',
        opacity: 0.2
    },
    playerStyle: {
        position: 'absolute'
    },
    progressStyle: {
        flexDirection: 'row',
        marginHorizontal: 10,
        alignItems: 'center',
        position: 'absolute',
        bottom: 110
    },
    slider: {
        flex: 1,
        marginHorizontal: 5,
    },
    toolBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        position: 'absolute',
        bottom: 20,
        marginVertical: 30
    },
    cdStyle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    spinnerTitle: {
        paddingTop: 10,
        color:'white'
    }
})