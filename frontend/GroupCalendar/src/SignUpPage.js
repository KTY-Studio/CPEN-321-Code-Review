//this page is used for sign up
//this should be navigated from introPage
import React, {Component} from 'react';
import {StyleSheet, TextInput, Text, View, 
		Button, Alert, ScrollView, KeyboardAvoidingView} from 'react-native';
import {TextField} from 'react-native-material-textfield';
import cs from './common/CommonStyles';
import Network from './common/GCNetwork';
import validate from 'validate.js';
import {constraint} from './common/validation';

export default class SignUpPage extends Component {
	static navigationOptions = {
	}

	constructor(props) {
		super(props);
	
		this.state = {
			user_email: '',
			user_lastname: '',
			user_firstnmae: '',
			user_name: '',
			user_pwd: '',
			isLoading: false,
			errors: {},
		};

		//general callback when focusing text field
		this._onFocus = this._onFocus.bind(this);
		//general callback when submit all info
		this._onSubmit = this._onSubmit.bind(this);

		//on submit callback
		this._onSubmitEmail = this._onSubmitEmail.bind(this);
		this._onSubmitLastname = this._onSubmitLastname.bind(this);
		this._onSubmitFirstname = this._onSubmitFirstname.bind(this);
		this._onSubmitUsername = this._onSubmitUsername.bind(this);
		this._onSubmitPassword = this._onSubmitPassword.bind(this);

		//seting up references
		this.firstnameRef = this._updateRef.bind(this, 'firstname');
		this.lastnameRef = this._updateRef.bind(this, 'lastname');
		this.usernameRef = this._updateRef.bind(this, 'username');
		this.passwordRef = this._updateRef.bind(this, 'password');
		this.emailRef = this._updateRef.bind(this, 'email');
	}

	_updateRef = (name, ref) => {
		this[name] = ref;
	}
	//remove error
	_onFocus = () => {
		let {errors} = this.state;
		for (let name in errors) {
			let ref = this[name];
			if(ref.isFocused()){
				delete errors[name];
			}
		}

		this.setState({errors});
	}

	//check error
	_onSubmit = async () => {
		let {user_email, user_lastname, user_firstname, 
			user_name, user_pwd, errors} = this.state;
		//validate user input here
		let invalid = validate({
			//attributes
			email: user_email, 
			lastname: user_lastname,
			firstname: user_firstname,
			username: user_name,
			password: user_pwd,
			}, constraint, {fullMessages: false});
		//some error occured
		if (invalid) {
			for (let key in invalid) {
				let val = invalid[key][0];
				errors[key] = val;
			}
			this.setState(errors);
			return;
		}
		//correct info, create a new user
		this.setState({isLoading: true});
		let res = await Network.createUser(
				{
					user_email,
					user_lastname,
					user_firstname,
					user_name,
					user_pwd,
				});
		//Alert.alert(JSON.stringify(res.body));
		if (res !== null) {
			if(res.status == 200) {
				this.setState({isLoading: false});
				this.props.navigation.navigate('Main',
					{user: res.body, signInByGoogle: false});
			} else if (res.status == 400) {
				Alert.alert('Invalid Inputs');
			} else {
				Alert.alert("Internet Error", JSON.stringify(res.error));
			}
		}
		this.setState({isLoading: false});
	}

	_onSubmitEmail = () => {
		this.lastname.focus();
	}

	_onSubmitLastname = () => {
		this.firstname.focus();
	}

	_onSubmitFirstname = () => {
		this.username.focus();
	}

	_onSubmitUsername = () => {
		this.password.focus();
	}

	_onSubmitPassword = () => {
		this.password.blur();
	}

	render() {
		let {user_email, user_lastname, user_firstname, user_name, user_pwd, errors} = 
			this.state;
		return (
			<KeyboardAvoidingView 
				behavior="padding" 
				style = {[cs.container, s.scrollContainer]}
			>
			<ScrollView
				style = {[s.scrollContainer]}
				keyboardShouldPersistTaps = 'never'
			>
				<View style = {[cs.container, s.welcomeContainer]}>
					<Text style = {s.welcomeMsg}>Sign Up</Text>
				</View>
				<View style = {[s.contentContainer]}>
				{/*Email*/}
					<TextField
						ref = {this.emailRef}
						label = 'Email'
						value = {user_email}
						autoCorrect = {false}
						returnKeyType = 'next'
						autoCapitalize = 'none'
						onChangeText = {(text) => this.setState({user_email: text})}
						onSubmitEditing = {this._onSubmitEmail}
						onFocus = {this._onFocus}
						error = {errors.email}
						keyboardType = 'email-address'
					/>
				{/*Last name*/}
					<TextField
						ref = {this.lastnameRef}
						label = 'Last Name'
						value = {user_lastname}
						autoCorrect = {false}
						autoCapitalize = 'words'
						returnKeyType = 'next'
						onChangeText = {(text) => this.setState({user_lastname: text})}
						onSubmitEditing = {this._onSubmitLastname}
						onFocus = {this._onFocus}
						error = {errors.lastname}
					/>
				{/*Fist name*/}
					<TextField
						ref = {this.firstnameRef}
						label = 'First Name'
						value = {user_firstname}
						autoCorrect = {false}
						autoCapitalize = 'words'
						returnKeyType = 'next'
						onChangeText = {(text) => this.setState({user_firstname: text})}
						onSubmitEditing = {this._onSubmitFirstname}
						onFocus = {this._onFocus}
						error = {errors.firstname}
					/>
				{/*Username*/}
					<TextField
						ref = {this.usernameRef}
						label = 'Username'
						value = {user_name}
						autoCorrect = {false}
						autoCapitalize = 'none'
						returnKeyType = 'next'
						onChangeText = {(text) => this.setState({user_name: text})}
						onSubmitEditing = {this._onSubmitUsername}
						onFocus = {this._onFocus}
						error = {errors.username}
					/>
				{/*Password*/}
					<TextField
						ref = {this.passwordRef}
						label = 'Password'
						value = {user_pwd}
						autoCorrect = {false}
						autoCapitalize = 'none'
						returnKeyType = 'done'
						onChangeText = {(text) => this.setState({user_pwd: text})}
						onSubmitEditing = {this._onSubmitPassword}
						onFocus = {this._onFocus}
						error = {errors.password}
						secureTextEntry = {true}
						clearTextOnFocus = {true}
					/>
					<View style = {[cs.container, s.signUpContainer]}>
					<Button
						title = 'Submit'
						color = '#66a3ff'
						onPress = {this._onSubmit}
					/>
					</View>
				</View>
				
			</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}

const s = StyleSheet.create({
	scrollContainer:{
		backgroundColor: '#ffffff',
		width: '100%',
		height: '100%',
	},
	welcomeContainer: {
		alignItems: 'flex-start',
		width: '100%',
		flex: 2,
		paddingLeft: '15%',
	},
	welcomeMsg: {
		fontSize: 50,
		color: '#000000',
		fontWeight: 'bold',
		paddingTop: '10%',
	},
	contentContainer: {
		marginLeft: '15%',
		width: '70%',
		flex: 5,
	},
	signUpContainer: {
		flex: 2,
		marginTop: 5,
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
})