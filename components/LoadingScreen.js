import React, { useEffect } from 'react';
import {
	View,
	Image,
	ActivityIndicator
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import styles from "../assets/styles/styles";
import colors from "../assets/styles/colors";


const LoadingScreen = () => {

	useEffect(() => {
		Image.resolveAssetSource({ uri: './assets/img/logo_nom.png' });
	}, []);

	return (
		<BackgroundImage>
			<View style={styles.fullContainer}>
				<View style={styles.container}>
					<Image source={require('../assets/img/logo_nom.png')} style={styles.logo}/>
				</View>
				<View style={styles.container}>
					<ActivityIndicator size="large" color={colors.orange} style={styles.loadingActivity}/>
				</View>
			</View>
		</BackgroundImage>
	);
}


module.exports = LoadingScreen;
