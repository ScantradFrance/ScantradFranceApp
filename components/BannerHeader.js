import React from 'react';
import {
	View,
	Image
} from 'react-native';
import styles from "../assets/styles/styles";
import { useEffect } from 'react';


const BannerHeader = () => {

	useEffect(() => {
		Image.resolveAssetSource({ uri: '../assets/img/banner.png' });
	}, []);

	return (
		<View style={styles.fullContainer}>
			<Image
				style={styles.banner}
				source={require('../assets/img/banner.png')}
				fadeDuration={0}
			/>
		</View>
	);
}


module.exports = BannerHeader;
