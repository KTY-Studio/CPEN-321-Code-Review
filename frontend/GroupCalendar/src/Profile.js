'use strict';
/**
 * This page constructs the user profile
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Alert,
		ScrollView, RefreshControl, AsyncStorage, ActivityIndicator} from 'react-native';
import cs from './common/CommonStyles';
import Network from './common/GCNetwork'


/**
 * CODE-REVIEW:
 * - Avoid Magic numbers. For example, color hex values
 * - Use consistent nameing conventions. For example id_token does not follow camelCases convention
 * as is followed by the whole doc
 * - Use white-spaces and line-breaks to improve readability. For example, 
 * the return value of the render function can be made much readable with good use of line-breaks.
 * 
 */



export default class Profile extends Component {
	constructor(props) {
		super(props);
		this.state = {
			//this only set to true when we have found the user id somehow changed
			//when this is set to false, we will need to log in again
			isRefreshing: false, 
			isLoading: true,
			profile: {},
		}
		this._onRefresh = this._onRefresh.bind(this);
	}

	async componentDidMount() {
		let id_token = await AsyncStorage.getItem('id_token');

		let profile = await AsyncStorage.getItem('profile')
			.then((res) => JSON.parse(res));
		//Alert.alert(id_token);

		this.setState ({
			profile: profile,
			id_token: id_token,
			isLoading: false,
		});
	}

	//callback function for refreshing
	_onRefresh = async () => {
		let {profile, id_token} = this.state;

		this.setState({isRefreshing: true});
		let res = await Network.fetchProfile(profile.user_id, id_token);
		switch(res.status) {
			case 200: this.setState({profile: res.profile});
			break;
			//fetch failed, probably user has expired the session
			//we will log out
			case 400:
			case 404: this.props.onSessionOut();
			break;
			default: Alert.alert("HTTP ERROR", JSON.stringify(res.error));
		}
		this.setState({isRefreshing: false});
	}

	render() { 
		let {isLoading, isRefreshing} = this.state;
		if (isLoading) {
			return (
				<View style = {cs.container}>
					<ActivityIndicator size = 'large'/>
				</View>
			);
		}
		let {profile} = this.state;
		return(
			<View style = {[cs.container, s.content]}>
				<ScrollView 
					style = {s.content}
					refreshControl = {
						<RefreshControl 
							refreshing = {isRefreshing}
							onRefresh = {this._onRefresh}
						/>
					}
				>
					{/*Username and email*/}
					<View style = {[cs.container, s.userNameContainer]}>
						<Text style = {cs.h2}>
						{profile.user_lastname} {profile.user_firstname}
						</Text>
						<Text style = {cs.h5}
							selectable = {true}>{profile.user_email}</Text>
					</View>
					{/*gender*/}
					{/*log out button*/}
					<View style = {[cs.container, cs.flowLeft]}>
						<View style = {[cs.container, s.buttonContainer]}>
							<Button 
								title = 'Sign out'
								color = '#66a3ff'
								onPress = {() => this.props.onSignOut()}
							/>
						</View>
					</View>
				</ScrollView>
			</View> 
		);
	}
}

const s = StyleSheet.create({
	content: {
		width: '100%',
	},
	buttonContainer: {
		width: 50,
		height: 40,
	},
	userNameContainer: {
		alignItems: 'flex-start',
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#e6e6e6',
	},
	generalContainer: {
		justifyContent: 'space-between',
	},
});