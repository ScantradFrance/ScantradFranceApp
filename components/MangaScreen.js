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

const BookmarkHeader = ({ followed, changeFollowed }) => {
	return (
		<TouchableOpacity onPress={changeFollowed} activeOpacity={0.6}>
			<Image style={styles.headerRightBookmark} source={followed ? require('../assets/img/bookmark_filled.png') : require('../assets/img/bookmark.png')} />
		</TouchableOpacity>
	)
}

const MangaScreen = ({ navigation, route }) => {
	
	const [token, setToken] = useState('');
	const [isLoadingManga, setLoadingManga] = useState(true);
	const [errorManga, setErrorManga] = useState(false);
	const [manga, setManga] = useState(null);
	const [follows, setFollows] = useState([]);

	const loadManga = manga_id => {
		return get(secrets.sf_api.url + "mangas/" + manga_id, { headers: { Authorization: `Bearer ${secrets.sf_api.token}` } }).then(res => res.data);
	};

	const updateBookmark = () => {
		navigation.setOptions({
			headerRight: () => <BookmarkHeader followed={follows.includes(manga.id)} changeFollowed={changeFollowed} />
		});
	};

	const changeFollowed = () => {
		if (!follows.includes(manga.id)) setFollows(follows.concat(manga.id));
		else setFollows(follows.filter(f => f !== manga.id));
	};

	const loadFollows = async () => {
		setFollows(await post(secrets.sf_api.url + "users/follows",
			{ token: token, request: "get" },
			{ headers: { Authorization: `Bearer ${secrets.sf_api.token}` }
		}).then(res => res.data));
	};	

	const saveFollows = () => {
		post(secrets.sf_api.url + "users/follows", { token: token, follows: JSON.stringify(follows), request: "edit" }, { headers: { Authorization: `Bearer ${secrets.sf_api.token}` }}).catch(() => {});
	}

	useEffect(() => {
		Image.resolveAssetSource({ uri: '../assets/img/bookmark_filled.png' });
		Image.resolveAssetSource({ uri: '../assets/img/bookmark.png' });

		AsyncStorage.getItem('token').then(token => setToken(token));
	}, []);

	useEffect(() => {
		if (token === '') return;
		loadManga(route.params.manga.id).then(manga => {
			setManga(manga);
			loadFollows();
		}).catch(() => setErrorManga(true));
	}, [token]);

	useEffect(() => {
		if (!manga) return;
		updateBookmark();
		saveFollows();
	}, [follows]);

	useEffect(() => {
		if (manga) setLoadingManga(false);
	}, [manga]);

	if (isLoadingManga)
		return (<LoadingScreen />);
	if (errorManga)
		return (
			<BackgroundImage>
				<View>
					<Text style={[styles.text, styles.pagesError]}>
						Une erreur s'est produite lors du chargement du manga...
					</Text>
				</View>
			</BackgroundImage>
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
