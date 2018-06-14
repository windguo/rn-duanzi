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
            <MaterialIcons name="wrap-text" size={22} color={focused ? "#fe5f01" : 'black'} />
        ),
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
                    <Text style={{ fontSize: 17, textAlign: 'center', lineHeight: 43.7, color: '#ffffff' }}>
                        看故事详情页
                    </Text>
                    <View style={{ justifyContent: 'center', marginLeft: 10, alignItems: 'center', height: 43.7, width: 20 }}>

                    </View>
                </ImageBackground>
            )
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            videoUrl: this.props.navigation.state.params.mp4_url,
            videoCover: this.props.navigation.state.params.titlepic,
            videoWidth: screenWidth,
            videoHeight: screenWidth * 9 / 16, // 默认16：9的宽高比
            showVideoCover: true,    // 是否显示视频封面
            showVideoControl: true, // 是否显示视频控制组件
            isPlaying: false,        // 视频是否正在播放
            currentTime: 0,        // 视频当前播放的时间
            duration: 0,           // 视频的总时长
            isFullScreen: true,     // 当前是否全屏显示
            playFromBeginning: true, // 是否从头开始播放
            resizeMode:'cover'
        };
        this.onLoad = this.onLoad.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onBuffer = this.onBuffer.bind(this);
    }
    componentWillMount() {
        const init = Orientation.getInitialOrientation();
        this.setState({
            init,
            orientation: init,
            specificOrientation: init,
        });
        if (init === 'PORTRAIT') {
            console.log('111111111');
        } else {
            console.log('2222222222');
            // do something else
        }

    }

    componentDidMount() {

        Orientation.addOrientationListener(this._updateOrientation);
        Orientation.addSpecificOrientationListener(this._updateSpecificOrientation);
    }

    componentWillUnmount() {
        Orientation.removeOrientationListener(this._updateOrientation);
        Orientation.removeSpecificOrientationListener(this._updateSpecificOrientation);
    }

    _getOrientation() {
        Orientation.getOrientation((err, orientation) => {
            Alert.alert(`Orientation is ${orientation}`);
        });
    }

    _getSpecificOrientation() {
        Orientation.getSpecificOrientation((err, orientation) => {
            Alert.alert(`Specific orientation is ${orientation}`);
        });
    }

    _updateOrientation = (orientation) => this.setState({ orientation });
    _updateSpecificOrientation = (specificOrientation) => this.setState({ specificOrientation });

    //以上为横向
    onEnd(data) {
        this.player.seek(0)
    }

    onLoad(data) {

        //视频总长度
        this.setState({ duration: data.duration });
    }

    onProgress(data) {
        //播放进度
        this.setState({ currentTime: data.currentTime });
    }

    onBuffer({ isBuffering }: { isBuffering: boolean }) {
        this.setState({ isBuffering });
    }

    getCurrentTimePercentage() {
        if (this.state.currentTime > 0) {
            return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
        } else {
            return 0;
        }
    }

    renderNativeSkin() {
        const videoStyle = styles.fullScreen;
        const { init, orientation, specificOrientation } = this.state;
        return (
            <View style={styles.container} onLayout={this._onLayout}>
                <View>
                    <TouchableOpacity
                        onPress={() => { this.setState({ paused: !this.state.paused }) }}
                        style={{ width: this.state.videoHeight, height: this.state.videoWidth}}>
                        <Video
                            ref={ref => this.player = ref}
                            source={{ uri: this.props.navigation.state.params.mp4_url }}
                            style={styles.fullScreen}
                            rate={this.state.rate}
                            paused={this.state.paused}
                            volume={this.state.volume}
                            muted={this.state.muted}
                            ignoreSilentSwitch={this.state.ignoreSilentSwitch}
                            resizeMode={this.state.resizeMode}//视频尺寸设置
                            onLoad={this.onLoad}
                            onBuffer={this.onBuffer}
                            onProgress={this.onProgress}
                            onEnd={(data) => this.onEnd(data)}
                            repeat={true}
                            controls={this.state.controls}
                        />
                    </TouchableOpacity>
                    <View style={{ width: '100%', backgroundColor: '#898989', height: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>

                        <TouchableOpacity
                            onPress={() => {
                                if (this.state.paused) {
                                    this.setState({
                                        paused: false
                                    })
                                } else if (!this.state.paused) {
                                    this.setState({
                                        paused: true
                                    })
                                }
                            }}
                        >
                            {/* //播放暂停按钮判断 */}
                            {/* <Image source={this.state.paused ? require('./img/player.png') : require('./img/base.png')} style={{ marginLeft: 5, width: 35, height: 35 }} /> */}
                            {this.state.paused ?
                                <MaterialIcons name={'play-arrow'} size={30} color='#ffffff' /> :
                                <MaterialIcons name={'pause'} size={30} color='#ffffff' />}
                        </TouchableOpacity>
                        <View style={{ width: 35 }}>
                            <Text style={{ color: '#000' }}>{this.state.currentTime.toFixed(0)}S</Text>
                        </View>

                        {/* //Slider大家直接去官网查看就行，没有什么难度   */}

                        <Slider
                            style={styles.slider}
                            value={this.state.currentTime}
                            minimumValue={0}
                            maximumValue={this.state.duration}
                            minimumTrackTintColor='orange'
                            maximumTrackTintColor='#fff'
                            step={1}
                            onValueChange={value => {
                                console.log(value);
                                this.setState({ currentTime: value })
                            }}
                            onSlidingComplete={value => this.player.seek(value)}
                        />

                        {/* //视频总时长 */}
                        <View style={{ width: 35 }}>
                            <Text style={{ color: '#000'.white, fontSize: 12 }}>{this.state.duration.toFixed(0)}S</Text>
                        </View>

                        {/* //全屏切换 */}
                        {
                            this.state.showVideoControl ?
                                <View style={[styles.control, { width: this.state.videoWidth }]}>
                                    <TouchableOpacity activeOpacity={0.3} onPress={() => { this.onControlPlayPress() }}>
                                        {this.state.paused ?
                                            <MaterialIcons name={'play-arrow'} size={30} color='#ffffff' /> :
                                            <MaterialIcons name={'pause'} size={30} color='#ffffff' />}
                                    </TouchableOpacity>
                                    <Text style={styles.time}>{formatTime(this.state.currentTime)}</Text>
                                    <Slider
                                        style={{ flex: 1 }}
                                        maximumTrackTintColor={'#999999'}
                                        minimumTrackTintColor={'#00c06d'}
                                        // thumbImage={require('../../assets/image/icon_control_slider.png')}
                                        value={this.state.currentTime}
                                        minimumValue={0}
                                        maximumValue={this.state.duration}
                                        onValueChange={(currentTime) => { this.onSliderValueChanged(currentTime) }}
                                    />
                                    <Text style={styles.time}>{formatTime(this.state.duration)}</Text>
                                    <TouchableOpacity activeOpacity={0.3} onPress={() => { this.onControlShrinkPress() }}>
                                        {this.state.isFullScreen ?
                                            <MaterialIcons name={'fullscreen'} size={30} color='#ffffff' /> :
                                            <MaterialIcons name={'fullscreen-exit'} size={30} color='#ffffff' />}
                                    </TouchableOpacity>
                                </View> : null
                        }
                        <TouchableOpacity activeOpacity={0.3} onPress={() => { this.onControlShrinkPress() }}>
                            {this.state.isFullScreen ?
                                <MaterialIcons name={'fullscreen'} size={30} color='#ffffff' /> :
                                <MaterialIcons name={'fullscreen-exit'} size={30} color='#ffffff' />}
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        );
    }
    
    render() {
        return this.renderNativeSkin();
    }

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
        this.setState({
            currentTime: 0,
            isPlaying: false,
            playFromBeginning: true
        });
    };

    _onPlayError = () => {
        console.log('视频播放失败');
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

    /// 点击了播放器正中间的播放按钮
    onPressPlayButton() {
        let isPlay = !this.state.isPlaying;
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

    onControlShrinkPress() {
        if (this.state.isFullScreen) {
            Orientation.lockToPortrait();
        } else {
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
        backgroundColor: '#f0f0f0'
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    buttonContainer: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    button: {
        padding: 5,
        margin: 5,
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 3,
        backgroundColor: 'grey',
    },
    slider: {
        flex: 1,
        width: '80%',
        height: 20
    }
});