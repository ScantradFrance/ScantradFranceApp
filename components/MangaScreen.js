import React, { useEffect, useState } from 'react';
import {
	View,
	Image,
	Text,
	TouchableHighlight,
	FlatList,
	TouchableOpacity
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import styles from "../assets/styles/styles";
import secrets from '../config/secrets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notifications } from "expo/build/deprecated.web";
import { get, post } from 'axios';

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

const BookmarkHeader = ({ followed, setFollowed }) => {
	return (
		<TouchableOpacity onPress={() => setFollowed(!followed)} activeOpacity={0.6}>
			<Image style={styles.headerRightBookmark} source={followed ? require('../assets/img/bookmark_filled.png') : require('../assets/img/bookmark.png')} />
		</TouchableOpacity>
	)
}

const MangaScreen = ({ navigation, route }) => {
	
	const [isLoadingManga, setLoadingManga] = useState(true);
	const [manga, setManga] = useState(null);
	const [followed, setFollowed] = useState(false);

	const loadChapters = manga_id => {
		return get(secrets.sf_api.url + "mangas/" + manga_id, { headers: { Authorization: `Bearer ${secrets.sf_api.token}` } }).then(res => res.data).catch(console.error);
	};

	const loadFollows = async manga_id => {
		try {
			setFollowed(!!(JSON.parse((await AsyncStorage.getItem('follows')) || "[]").find(e => e === manga_id)));
		} catch (err) { console.error(err); }
	};

	const updateBookmark = () => {
		navigation.setOptions({
			headerRight: () => <BookmarkHeader followed={followed} setFollowed={setFollowed} />
		});
	};

	const saveFollows = async () => {
		if (!manga) return;
		try {
			let follows = JSON.parse((await AsyncStorage.getItem('follows')) || "[]");
			follows = follows.filter(f => f !== manga.id);
			if (followed) follows.push(manga.id);
			await AsyncStorage.setItem('follows', JSON.stringify(follows));
			Notifications.getExpoPushTokenAsync().then(token => {
				post(secrets.sf_api.url + "users/follows", {
					token: token,
					follows: JSON.stringify(follows)
				}, {
					headers: { Authorization: `Bearer ${secrets.sf_api.token}` }
				}).catch(console.error);
			}).catch(console.error);
		} catch (err) { console.error(err); }
	}

	useEffect(() => {
		Image.resolveAssetSource({ uri: '../assets/img/bookmark_filled.png' });
		Image.resolveAssetSource({ uri: '../assets/img/bookmark.png' });

		loadChapters(route.params.manga.id)
		.then(manga => {
			setLoadingManga(false);
			setManga(manga);
			loadFollows(manga.id);
		})
		.catch(console.error);
	}, []);

	useEffect(() => {
		updateBookmark();
		saveFollows();
	}, [followed]);

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
