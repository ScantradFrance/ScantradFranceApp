import React from 'react';
import {
	View,
	Image,
	Text,
	Linking
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import styles from "../assets/styles/styles";


const AboutScreen = () => {
	const openURL = url => {
		Linking.canOpenURL(url).then(supported => {
			if (supported) Linking.openURL(url).catch(() => {});
		}).catch(() => {});
	}
	return (
		<BackgroundImage>
			<View style={styles.container}>
				<View style={styles.container}>
					<View style={styles.aboutContainer}>
						<Text style={[styles.text, styles.aboutTitle]}>Team Scantrad France :</Text>
						<Text style={styles.text}>Équipe de traduction de divers mangas.</Text>
						<Text style={styles.link} onPress={() => openURL("https://linktr.ee/scantradfrance")}>Linktree</Text>
					</View>
				</View>
				<View style={styles.container}>
					<View style={styles.aboutContainer}>
						<Text style={[styles.text, styles.aboutTitle]}>Dastan21 :</Text>
						<Text style={styles.text}>Développeur de l'application mobile.</Text>
						<Text style={styles.link} onPress={() => openURL("https://github.com/Dastan21")}>Github</Text>
					</View>
				</View>
			</View>
		</BackgroundImage>
	);
}


module.exports = AboutScreen;
