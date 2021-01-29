import React from 'react';
import {
	View,
	Image,
	Text,
	ScrollView
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import styles from "../assets/styles/styles";


const MangaScreen = ({ route }) => {
	let manga = route.params.manga;
	return (
		<BackgroundImage>
			<View style={styles.container}>
				<ScrollView style={styles.scrollView} contentContainerStyle={styles.mangaContainer} centerContent={true}>
					<Image style={styles.mangaThumbnail} source={{uri: manga.thumbnail}} />
					<Text style={[styles.text, styles.mangaSynopsis]}>{manga.synopsis}</Text>
					<View style={styles.mangaInfos}>
						<Text><Text style={styles.text}>Licencié chez : </Text><Text style={[styles.text, styles.mangaInfos]}>{manga.licence || 'Aucune'}</Text></Text>
						<Text><Text style={styles.text}>En VO : </Text><Text style={[styles.text, styles.mangaInfos]}>{manga.vo}</Text></Text>
						<Text><Text style={styles.text}>Status de la série : </Text><Text style={[styles.text, styles.mangaInfos]}>{manga.status}</Text></Text>
					</View>
				</ScrollView>
			</View>
		</BackgroundImage>
	);
}


module.exports = MangaScreen;
