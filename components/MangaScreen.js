import React, { useEffect, useState } from 'react';
import {
	View,
	Image,
	Text,
	TouchableHighlight,
	FlatList
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import styles from "../assets/styles/styles";
import secrets from '../config/secrets';
import { get } from 'axios';

const ThumbnailChapter = ({ navigation, chapter, manga }) => {
	return (
		<View style={[styles.item, { alignItems: "center" }]}>
			<TouchableHighlight style={[styles.mangaChapterPreview, styles.mangaChapterPreviewShort]} onPress={() => navigation.navigate('Chapter', { chapter: { ...chapter, manga: manga }})}>
				<View>
					<Text>
						<View>
							<Image style={styles.chapterPreviewThumbnail} source={{ uri: manga.thumbnail }} fadeDuration={0} />
							<View style={styles.chapterPreviewThumbnailBorder} />
						</View>
					</Text>
					<View>
						<Text style={[styles.text, styles.chapterPreviewNumber, { top: -64 }]}>Chapitre {chapter.number}</Text>
						<Text style={[styles.text, styles.chapterPreviewDate]}>{`Il y a ${chapter.release_date}`}</Text>
					</View>
				</View>
			</TouchableHighlight>
		</View>
	);
};

const MangaHeader = manga => {
	return (
		<View style={styles.mangaContainer}>
			<Image style={styles.mangaThumbnail} source={{uri: manga.thumbnail}} />
			<Text style={[styles.text, styles.mangaSynopsis, styles.mangaText]}>{manga.synopsis}</Text>
			<View style={styles.mangaInfos}>
				{manga.authors ? <Text><Text style={[styles.text, styles.mangaText]}>Auteurs : </Text><Text style={[styles.text, styles.mangaInfos, styles.mangaText]}>{manga.authors}</Text></Text> : null}
				{manga.licence ? <Text><Text style={[styles.text, styles.mangaText]}>Licence : </Text><Text style={[styles.text, styles.mangaInfos, styles.mangaText]}>{manga.licence || 'Aucune'}</Text></Text> : null}
				<Text><Text style={[styles.text, styles.mangaText]}>Status : </Text><Text style={[styles.text, styles.mangaInfos, styles.mangaText]}>{manga.status}</Text></Text>
				{manga.genres ? <Text><Text style={[styles.text, styles.mangaText]}>Genres : </Text><Text style={[styles.text, styles.mangaInfos, styles.mangaText]}>{manga.genres.join(', ')}</Text></Text> : null}
			</View>
		</View>
	)
}

const MangaScreen = ({ navigation, route }) => {
	
	const [isLoadingManga, setLoadingManga] = useState(true);
	const [manga, setManga] = useState(null);

	const loadChapters = manga_id => {
		return get(secrets.sf_api.url + "mangas/" + manga_id, { headers: { Authorization: `Bearer ${secrets.sf_api.token}` } }).then(res => res.data).catch(console.error);
	};

	useEffect(() => {
		loadChapters(route.params.manga.id)
		.then(manga => {
			setLoadingManga(false);
			setManga(manga);
		})
		.catch(console.error);
	}, []);

	if (isLoadingManga)
		return (<LoadingScreen />);
	if (!manga)
		return (
			<View>
				<Text>
					Une erreur s'est produite lors du chargement du manga...
				</Text>
			</View>
		);
	return (
		<BackgroundImage>
			<FlatList
				data={manga.chapters}
				renderItem={({ item }) => <ThumbnailChapter navigation={navigation} chapter={item} manga={{ id: manga.id, name: manga.name, thumbnail: manga.thumbnail }} />}
				keyExtractor={(_, i) => i+""}
				ListHeaderComponent={MangaHeader(manga)}
			/>
		</BackgroundImage>
	);
}


module.exports = MangaScreen;
