import React, { useEffect, useState } from 'react';
import {
	View,
	Image,
	Text,
	TouchableHighlight,
	FlatList,
	TouchableOpacity,
	ToastAndroid
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import styles from "../assets/styles/styles";
import { sf_api } from '../config/secrets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post } from 'axios';
import * as FileSystem from 'expo-file-system';

const ThumbnailChapter = ({ navigation, chapter, manga, isDownloaded }) => {

	const [downloaded, setDownloaded] = useState(isDownloaded);
	const [downloadProgress, setDownloadProgress] = useState(0);
	const folderpath = `${FileSystem.documentDirectory}${manga.id}-${Number(chapter.number)}/`;
	const progress = { done: 0, total: 0 };

	const progressHandler = reset => {
		if (reset) {
			progress.done = 0;
			progress.total = 0;
			setDownloadProgress(0);
			return;
		}
		progress.done++;
		setDownloadProgress(progress.done / progress.total);
	}

	const getChapterPages = () => get(`${sf_api.url}chapters/${manga.id}/${chapter.number}`).then(res => res.data.pages);

	const downloadPages = async () => {
		if (downloaded) return;
		ToastAndroid.show("Téléchargement du chapitre", ToastAndroid.SHORT);

		// create directory
		await FileSystem.makeDirectoryAsync(folderpath).catch(() => {});

		// download pages
		const id = manga.id + "-" + Number(chapter.number);
		getChapterPages().then(pages => {
			progress.total = pages.length;
			Promise.all(pages.map((p, i) => FileSystem.createDownloadResumable(p.uri, `${folderpath + (i + 1)}.jpg`).downloadAsync().then(res => { progressHandler(); return res.uri; })))
				.then(uris => {
					AsyncStorage.getItem('downloads').then(d => JSON.parse(d || "{}")).then(downloads => {
						downloads[id] = { ...chapter, manga: manga, pages: uris, type: pages[0].uri.includes("?top") ? "webtoon" : "manga" };
						AsyncStorage.setItem('downloads', JSON.stringify(downloads)).then(() => {
							setDownloaded(true);
							progressHandler(true);
							ToastAndroid.show("Chapitre téléchargé", ToastAndroid.SHORT);
						}).catch(() => setErrorChapters(true));
					});
				});
		}).catch(() => ToastAndroid.show("Erreur lors du téléchargement du chapitre", ToastAndroid.SHORT));
	}

	return (
		<View style={styles.item}>
			<TouchableHighlight style={styles.chapterPreviewFullContainer} onPress={() => navigation.navigate('Chapter', { chapter: { ...chapter, manga: manga }})}>
				<View>
					<View style={[styles.chapterPreviewThumbnail, styles.chapterPreviewProgress, { transform: [{ translateX: Math.ceil(downloadProgress * 64) }] }]}></View>
					<Text>
						<View style={styles.chapterPreviewContainer}>
							<View>
								<Image style={styles.chapterPreviewThumbnail} source={{ uri: manga.thumbnail }} fadeDuration={0} />
								<View style={styles.chapterPreviewThumbnailBorder} />
							</View>
						</View>
					</Text>
					<View>
						<Text style={[styles.text, styles.chapterPreviewNumber, styles.chapterPreviewNumberLeft, { top: -64 }]}>Chapitre {chapter.number}</Text>
						<Text style={[styles.text, styles.chapterPreviewDate]}>{`Il y a ${chapter.release_date}`}</Text>
					</View>
				</View>
			</TouchableHighlight>
			<TouchableOpacity style={styles.chapterPreviewDownloadContainer} onPress={downloadPages} activeOpacity={0.6}>
				<View>
					<Image style={styles.chapterPreviewDownloadIcon} source={downloaded ? require('../assets/img/download_filled.png') : require('../assets/img/download_white.png')} />
				</View>
			</TouchableOpacity>
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
	const [isLoadingDownloads, setLoadingDownloads] = useState(true);
	const [errorManga, setErrorManga] = useState(false);
	const [manga, setManga] = useState(null);
	const [downloads, setDownloads] = useState({});
	const [follows, setFollows] = useState([]);

	const loadManga = manga_id => {
		return get(sf_api.url + "mangas/" + manga_id).then(res => res.data);
	};

	const loadDownloads = () => {
		AsyncStorage.getItem('downloads').then(d => JSON.parse(d || "{}")).then(downloads => {
			setDownloads(downloads);
			setLoadingDownloads(false);
		});
	}

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
		setFollows(await post(sf_api.url + "users/follows",
			{ token: token, request: "get" },
			{ headers: { Authorization: `Bearer ${sf_api.token}` }
		}).then(res => res.data));
	};	

	const saveFollows = () => {
		post(sf_api.url + "users/follows", { token: token, follows: JSON.stringify(follows), request: "edit" }, { headers: { Authorization: `Bearer ${sf_api.token}` }}).catch(() => {});
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
		loadDownloads();
	}, [token]);

	useEffect(() => {
		if (!manga) return;
		updateBookmark();
		saveFollows();
	}, [follows]);

	useEffect(() => {
		if (manga) setLoadingManga(false);
	}, [manga]);

	if (isLoadingManga || isLoadingDownloads)
		return (<LoadingScreen />);
	if (errorManga)
		return (
			<BackgroundImage>
				<View>
					<Text style={[styles.text, styles.pagesErrorText]}>
						Une erreur s'est produite lors du chargement du manga...
					</Text>
				</View>
			</BackgroundImage>
		);
	return (
		<BackgroundImage>
			<FlatList
				style={styles.listChapters}
				data={manga.chapters}
				renderItem={({ item }) => <ThumbnailChapter navigation={navigation} chapter={item} manga={{ id: manga.id, name: manga.name, thumbnail: manga.thumbnail }} isDownloaded={!!downloads[manga.id + "-" + Number(item.number)]} />}
				keyExtractor={(_, i) => i + ""}
				ListHeaderComponent={MangaHeader(manga)}
			/>
		</BackgroundImage>
	);
}


module.exports = MangaScreen;
