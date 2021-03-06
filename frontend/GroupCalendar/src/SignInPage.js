'use strict';
//This file is for the login page
//We will also implement sign up here

import React, {Component} from 'react';
import {Text, TextInput, View, StyleSheet, KeyboardAvoidingView,
		Alert, Button, ActivityIndicator, ScrollView, AsyncStorage} 
		from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes} from 'react-native-google-signin';
import {TextField} from 'react-native-material-textfield';
import Ripple from 'react-native-material-ripple';
import Network from './common/GCNetwork';
import cs from './common/CommonStyles';
import * as config from './../config.json';

/**
 * CODE-REVIEW:
 * - Avoid self-explanatory comments. For example, checkUserSignedIn() has a comment at the top
 *  saying "//check whether user has signed in".
 * - Avoid Magic numbers. For example, color hex values
 * - Use consistent nameing conventions. For example id_token does not follow camelCases convention
 * as is followed by the whole doc
 * - Use white-spaces and line-breaks to improve readability. For example, 
 * the return value of the render function can be made much readable with good use of line-breaks.
 * 
 */



export default class SignInPage extends Component {
	//this page dont need a header
	static navigationOptions = {
		header: null
	}

	constructor(props) {
		super(props);
	
		this.state = {
			//checking whether user has signed in
			isChecking: true,
			//user is signing by app
		  	isLoading: false,
		  	//user is signing by google
		  	isSigning: false, 
		  	user_email: '',
		  	user_pwd: '',
		  	errors: {},
		};

		//general callback when focusing text field
		this._onFocus = this._onFocus.bind(this);

		this._onSubmitEmail = this._onSubmitEmail.bind(this);
		this._onSubmitPassword = this._onSubmitPassword.bind(this);

		//setting up references
		this.emailRef = this._updateRef.bind(this, 'email');
		this.passwordRef = this._updateRef.bind(this, 'password');
		this._onSignInButtonPressed = this._onSignInButtonPressed.bind(this);
	}

	//only called once
	//we will check whether user has signed out
	//if not, we will just sign in automatically
	async componentDidMount() {
    	GoogleSignin.configure(config.googleSignIn);
    	await this.checkUserSignedIn();
	}

	//check whether user has signed in
	async checkUserSignedIn(){
		let {isChecking} = this.state;
		try {
			let id_token = await AsyncStorage.getItem('id_token');
			let profile = await AsyncStorage.getItem('profile');
			if (id_token === null){
				//user hasn't signed in
				this.setState({isChecking: false});
			} else {
				//we already have id_token, we use it to sign in
				this.setState({isChecking: false});
				this.props.navigation.navigate('Main');
			}
		} catch (error) {
			Alert.alert('Something Bad Happened');
		}
	}

	_onFocus = () => {
		let {errors} = this.state;
		for (let key in errors) {
			let ref = this[key];
			if(ref.isFocused()){
				delete errors[key];
			}
		}
		this.setState({errors});
	}

	_updateRef = (name, ref) => {
		this[name] = ref;
	}

	_onSubmitEmail = () => {
		this.password.focus();
	}

	_onSubmitPassword = () => {
		this.password.blur();
		this._onSignInButtonPressed();
	}

	//Function handles sign in button press
	// we will send email and password to 
	_onSignInButtonPressed = async () => {
		let {user_email, user_pwd} = this.state;
		//we first get the user info by the username
		this.setState({isLoading: true});
		let res = await Network.verifyUser(user_email, user_pwd);
		switch (res.status) {
			//correct user_email and user_pwd
			//we save the user info to async storage and jump to main pages
			case 200: {
				//on success, user profile and id_token are returned
				//store id_token and profile for other screens to use
				await AsyncStorage.setItem('id_token', res.id_token);
				await AsyncStorage.setItem('profile', JSON.stringify(res.profile));
				await AsyncStorage.setItem('signInByGoogle', 'false');

				this.setState({isLoading: false});
				//jump to main page
				this.props.navigation.navigate('Main');
			}
			break;
			case 400:
			case 404: this.setState(
					{errors: {
						email: 'incorrect email or password',
						password: 'incorrect email or password',
					}});
			break;
			default: Alert.alert("Internet Error", JSON.stringify(res.error));
		}
		this.setState({isLoading: false});
	}

	//sign in by google
	//on successful signin, we send the google id_token to server and get 
	//	our id_token
	_onGoogleSignInPressed = async () => {
		this.setState({isSigning: true});
		await GoogleSignin.hasPlayServices();
		await GoogleSignin.signIn()
			.then(async (userInfo) => 
			{
				let res = await Network.verifyUserByGoogle(userInfo);
				switch (res.status) {
					case 200: {
						//store id_token and profile for other screens to use
						AsyncStorage.setItem('id_token', res.id_token);
						AsyncStorage.setItem('profile', JSON.stringify(res.profile));
						AsyncStorage.setItem('signInByGoogle', 'true');
						this.setState({isSigning: false});
						this.props.navigation.navigate('Main');
					}
					break;
					case 400: {
						Alert.alert('Something Wrong with Your Google Account');
					}
					break;
					default: {
						Alert.alert('Internet Error', JSON.stringify(res.error));
					}
				}
			})
			.catch((error) => {
				if (error.code === statusCodes.SIGN_IN_CANCELLED) {
					//user canceled the login flow
   				} else if (error.code === statusCodes.IN_PROGRESS) {
					//in progress
				} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
					// play services not available or outdated
      				Alert.alert('Play Service Not Avaliable');
				} else {
      				//some other error happened
      				Alert.alert('Something Bad Happend\n', JSON.stringify(error));
    			}
			});
		this.setState({isSigning: false});
	}

	render() {
		let {isSigning, isLoading, isChecking, errors} = this.state;
		if (isChecking) {
			return (
				<View></View>
			);
		}
		//let {errors} = this.state;
		return (
			<KeyboardAvoidingView 
				behavior="padding" 
				style = {[cs.container, cs.wholePage, s.scrollContainer]}
			>
			<ScrollView
				style = {[s.scrollContainer]}
				keyboardShouldPersistTaps = 'never'
				scrollEnabled = {false}
			>
				{/*sign up button*/}
				<View style = {[cs.container, s.signUpContainer]}>
					<Button 
						title = 'Sign up'
						color = '#66a3ff'
						onPress = {() => this.props.navigation.push('SignUp')}
					/>
				</View>
				{/*title*/}
				<View style = {[cs.container, s.titleContainer]}>
					<Text style = {cs.title}>Group</Text>
					<Text style = {cs.title}>Calendar</Text>
					<Text style = {[cs.h3, s.welcome]}>Welcome Back</Text>
				</View>
				{/*user email and password*/}
				<View style = {[s.contentContainer]}>
					<TextField
						ref = {this.emailRef}
						label = 'Email'
						fontSize = {18}
						labelHeight = {24}
						onChangeText = {(text) => this.setState({user_email: text})}
						autoCorrect = {false}
						autoCapitalize = 'none'
						onSubmitEditing = {this._onSubmitEmail}
						returnKeyType = 'next'
						keyboardType = 'email-address'
						textContentType = 'username'
						error = {errors.email}
						onFocus = {this._onFocus}
					/>
					<TextField
						ref = {this.passwordRef}
						fontSize = {18}
						labelHeight = {24}
						label = 'Password'
						inputContainerPadding = {4}
						onChangeText = {(text) => this.setState({user_pwd: text})}
						secureTextEntry= {true}
						keyboardType = 'default'
						returnKeyType = 'go'
						onSubmitEditing = {this._onSubmitPassword}
						textContentType = 'password'
						clearTextOnFocus = {true}
						error = {errors.password}
						onFocus = {this._onFocus}
					/>
				</View>

			{/*sign in buttons*/}
				
				<Ripple
					disabled = {isLoading}
					onPress = {this._onSignInButtonPressed}
					style = {[cs.container, s.buttonContainer]}
				>
						<Text style = {s.buttonMsg}>
							{isLoading ? 'Signing in...' : 'Sign in'}
						</Text>
				</Ripple>
				<Ripple
					onPress = {this._onGoogleSignInPressed}
					disabled = {isSigning} 
					style = {[cs.container, s.buttonContainer]}
				>
    					<Text style = {s.buttonMsg}>Sign in by Google</Text>
    			</Ripple>
			</ScrollView>
			</KeyboardAvoidingView>
			);
	}
} 



const s = StyleSheet.create({
	welcome: {
		color: '#e6e6e6',
	},
	scrollContainer: {
		flex: 1,
		width: '100%',
		height: '100%',
	},
	signUpContainer: {
		flex: 1,
		width: '100%',
		paddingRight: 20,
		paddingTop: 30,
		alignItems: 'flex-end',
	},
	titleContainer: {
		marginLeft: '10%',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		flex: 1,
	},
	contentContainer: {
		marginLeft: '10%',
		width: '80%',
		flex: 1,
	},
	buttonContainer: {
		flex: 1,
		marginLeft: '10%',
		marginTop: 5,
		marginBottom: 5,
		width: '80%',
		height: 40,
		backgroundColor: '#66a3ff',
	},
	buttonMsg: {
		color : '#ffffff',
		fontSize: 18,
	},
	failLogin: {
		alignItems: 'center',
		fontSize: 14,
		color: '#ff0000',
	},
});