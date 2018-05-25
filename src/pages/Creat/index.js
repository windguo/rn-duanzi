/**
 * Created by zhangzuohua on 2017/10/19.
 */
import React from 'react';
import {
    StyleSheet,
    Image,
    Text,
    Linking,
    View,
    Dimensions,
    Animated,
    Easing,
    ScrollView,
    PanResponder,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    Platform,
    NativeModules,
    ImageBackground,
    InteractionManager,
    TouchableHighlight,
    TextInput,
    Modal,
    DeviceEventEmitter
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import IconSimple from 'react-native-vector-icons/SimpleLineIcons';
import urlConfig from '../../utils/urlConfig';
import Toast from 'react-native-root-toast';
import storageKeys from '../../utils/storageKeyValue';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
import { ifIphoneX } from '../../utils/iphoneX';
import HttpUtil from '../../utils/HttpUtil';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default class Login extends React.Component {
    static navigationOptions = {
        tabBarLabel: '签名设计',
        tabBarIcon: ({ tintColor, focused }) => (
            <IconSimple name="pencil" size={22} color={focused ? '#027fff' : 'black'} />
        ),
        header: ({ navigation }) => {
            return (
                <ImageBackground style={{ ...header }} source={require('../../assets/backgroundImageHeader.png')} resizeMode='cover'>
                    <TouchableOpacity activeOpacity={1} onPress={() => {
                        navigation.goBack(null);
                    }}>
                        <View style={{ justifyContent: 'center', marginLeft: 10, alignItems: 'center', height: 43.7 }}>
                            
                        </View>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 17, textAlign: 'center', fontWeight: '300', lineHeight: 43.7, color: 'white' }}>签名设计</Text>
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
            inputName: '',
            visble: false,
        }
    }
    componentWillUnmount() {
    }
    componentDidMount() {
    }
    disMissPress = () => {
        this.props.navigation.goBack(null);
    }
    inputNameInputTextChange = (text) => {
        this.setState({ inputName: text });
    }
    loginButtonPress = () => {
        console.log("texttexttexttexttexttexttexttexttexttext---" + this.state.inputName);
        if (this.state.inputName != '') {
            this.login();
        } else {
            alert('请输入您的姓名（2-4个汉字）');
        }
    };
    login = async (resolve) => {
        this.props.navigation.navigate('CreatTag', { data: this.state.inputName });
    }
    // <ScrollView  style={{ backgroundColor:'#eeeeee', width: WIDTH,flex:1}} contentContainerStyle={{alignItems:'center'}}>
    // </ScrollView>
    render() {
        return (
            <KeyboardAwareScrollView
                enableOnAndroid={false}>
                <ScrollView style={{ backgroundColor: '#eeeeee', width: WIDTH, flex: 1 }} contentContainerStyle={{ alignItems: 'center' }}>
                    <View style={{ marginTop: HEIGHT * 0.1, width: WIDTH, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <TextInput
                            numberOfLines={1}
                            placeholder='请输入您的姓名'
                            autoFocus={true}
                            placeholderTextColor='#555555'
                            style={{ width: WIDTH - 80, fontSize: 16, color: '#555555', height: 50, backgroundColor: '#ffffff', borderRadius: 10, marginHorizontal: 40, paddingHorizontal: 20 }}
                            onChangeText={this.inputNameInputTextChange}
                            // value="郭延峰" 
                            value={this.state.inputName} 
                            underlineColorAndroid="transparent"></TextInput>
                    </View>
                    <TouchableOpacity style={{
                        width: WIDTH,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 40,
                    }} activeOpacity={0.7} 
                        onPress={this.loginButtonPress}
                        >
                        <View style={{
                            width: WIDTH - 80,
                            borderRadius: 10,
                            height: 50,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#027fff'
                        }}>
                            <Text style={{ fontSize: FONT(18), paddingTop: 10, paddingBottom: 10, backgroundColor: 'transparent', color: 'white', textAlign: 'center' }}>立即设计</Text>
                        </View>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAwareScrollView>)
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    line1: {
        height: StyleSheet.hairlineWidth,
        width: WIDTH - SCALE(40) - SCALE(50),
        marginLeft: SCALE(40),
        backgroundColor: Color.bebebe,
        marginRight: SCALE(50)
    },
    line2: {
        height: StyleSheet.hairlineWidth,
        width: WIDTH - SCALE(40) - SCALE(50),
        marginLeft: SCALE(40),
        backgroundColor: Color.bebebe,
        marginRight: SCALE(50)
    },
    load_box: {
        width: 100,
        height: 100,
        backgroundColor: '#0008',
        alignItems: 'center',
        marginLeft: SCREEN_WIDTH / 2 - 50,
        marginTop: SCREEN_HEIGHT / 2 - 50,
        borderRadius: 10
    },
    load_progress: {
        position: 'absolute',
        width: 100,
        height: 90
    },
    load_text: {
        marginTop: 70,
        color: '#FFF',
    },
    container: {
        flex: 1,
        paddingTop: 30,
        alignItems: 'center'
    },
    image: {
        borderWidth: 1,
        width: 300,
        height: 100,
        borderRadius: 5,
        borderColor: '#ccc'
    },
    img: {
        height: 98,
        width: 300,
    },
    saveImg: {
        height: 30,
        padding: 6,
        textAlign: 'center',
        backgroundColor: '#3BC1FF',
        color: '#FFF',
        marginTop: 10,
    }

});
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

