import React from 'react';
import { ImageBackground } from 'react-native';
import styles from "../assets/styles/styles";


const BackgroundImage = ({ children }) => {
	return (
		<ImageBackground source={require('../assets/img/motif.png')} style={styles.backgroundImage} imageStyle={{ resizeMode: 'repeat' }}>
			{children}
		</ImageBackground>
	);
}

module.exports = BackgroundImage;
