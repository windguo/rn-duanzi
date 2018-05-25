/**
 * Created by zhangzuohua on 2018/1/18.
 */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

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
    FlatList
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
import { Pie, Bar, Circle, CircleSnail } from 'react-native-progress';
import AutoHeightImage from 'react-native-auto-height-image';
import CustomImage from '../../components/CustomImage'
import GuessText from '../../components/GuessText'
export default class Cdetail extends Component {
    static navigationOptions = {
        title: '详情页',
        header: ({ navigation }) => {
            return (
                <ImageBackground style={{ ...header }} source={require('../../assets/backgroundImageHeader.png')} resizeMode='cover'>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        navigation.goBack(null);
                    }}>
                        <View style={{ justifyContent: 'center', marginLeft: 10, alignItems: 'center', height: 43.7 }}>
                            <IconSimple name="arrow-left" size={20} color='white' />
                        </View>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 17, textAlign: 'center', fontWeight: 'bold', lineHeight: 43.7, color: 'white' }}>签名设计</Text>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                    }}>
                        <View style={{ justifyContent: 'center', marginRight: 10, alignItems: 'center', height: 43.7, backgroundColor: 'transparent', width: 20 }}>
                        </View>
                    </TouchableOpacity>
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
    }
    //this.props.navigation.state.params.data.content && JSON.parse(this.props.navigation.state.params.data.content).content
    componentDidMount() {
    }
    render() {
        return (
            <View>
                <Text style={{ fontSize: 18 }}>{this.props.navigation.state.params.data && this.props.navigation.state.params.data.picUrls.replace(/\s+/g, "")}</Text>
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




