import React, { useState, useEffect } from 'react';
import {
	View,
	Image,
	FlatList,
	RefreshControl,
	Text,
	TouchableHighlight,
	TouchableOpacity,
	ScrollView,
	ToastAndroid
} from 'react-native';
import LoadingScreen from './LoadingScreen';
import BackgroundImage from './BackgroundImage';
import BannerHeader from './BannerHeader';
import { sf_api } from '../config/secrets';
import styles from "../assets/styles/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from 'axios';
import * as FileSystem from 'expo-file-system';

const HomeScreen = ({ navigation }) => {
	const [isLoadingChapters, setLoadingChapters] = useState(true);
	const [isLoadingDownloads, setLoadingDownloads] = useState(true);
	const [errorChapters, setErrorChapters] = useState(false);
	const [chapters, setChapters] = useState([]);
	const [downloads, setDownloads] = useState({});
	const [refreshing, setRefreshing] = useState(false);
	
	const getLastChapters = async limit => {
		return get(sf_api.url + "chapters/" + limit).then(res => res.data);
	};

	const loadChapters = () => {
		getLastChapters(20)
			.then(chaps => {
				if (!chaps) return;
				setChapters(chaps);
			}).catch(() => setErrorChapters(true));
	};

	const onRefresh = () => {
		setRefreshing(true);
		setErrorChapters(false);
		setLoadingChapters(true);
		setLoadingDownloads(true);
		loadChapters();
		loadDownloads();
		setRefreshing(false);
	};

	const loadDownloads = () => {
		AsyncStorage.getItem('downloads').then(d => JSON.parse(d || "{}")).then(downloads => {
			setDownloads(downloads);
			setLoadingDownloads(false);
		});
	}

	useEffect(() => {
		Image.resolveAssetSource({ uri: '../assets/img/download_filled.png' });
		Image.resolveAssetSource({ uri: '../assets/img/download.png' });
		Image.resolveAssetSource({ uri: '../assets/img/download_white.png' });

		loadChapters();
		loadDownloads();
	},[]);

	useEffect(() => {
		if (chapters.length || errorChapters) setLoadingChapters(false);
	}, [chapters, errorChapters]);

	if (isLoadingChapters || isLoadingDownloads)
		return (<LoadingScreen />);
	if (errorChapters)
		return (
			<BackgroundImage>
				<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={styles.scrollView}>
					<Text style={[styles.text, styles.pagesErrorText]}>
						Une erreur s'est produite lors du chargement des chapitres...
					</Text>
				</ScrollView>
			</BackgroundImage>
		);
	return (
		<BackgroundImage>
			<FlatList
				style={styles.listChapters}
				data={chapters}
				renderItem={({ item }) => <ThumbnailChapter navigation={navigation} chapter={item} isDownloaded={!!downloads[item.manga.id + "-" + item.number]} />}
				keyExtractor={item => item.title}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
				ListHeaderComponent={BannerHeader}
			/>
		</BackgroundImage>
	);
}

const ThumbnailChapter = ({ navigation, chapter, isDownloaded }) => {

	const [downloaded, setDownloaded] = useState(isDownloaded);
	const [downloadProgress, setDownloadProgress] = useState(0);
	const folderpath = `${FileSystem.documentDirectory}${chapter.manga.id}-${chapter.number}/`;
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

	const getChapterPages = () => get(sf_api.url + "chapters/" + chapter.manga.id + "/" + chapter.number).then(res => res.data.pages);

	const downloadPages = async () => {
		if (downloaded) return;
		ToastAndroid.show("Téléchargement du chapitre", ToastAndroid.SHORT);

		// create directory
		await FileSystem.makeDirectoryAsync(folderpath).catch(() => {});

		// download pages
		const id = chapter.manga.id + "-" + chapter.number;
		getChapterPages().then(pages => {
			progress.total = pages.length;
			Promise.all(pages.map((p, i) => FileSystem.createDownloadResumable(p.uri, `${folderpath + (i + 1)}.jpg`).downloadAsync().then(res => { progressHandler(); return res.uri; })))
			.then(uris => {
				AsyncStorage.getItem('downloads').then(d => JSON.parse(d || "{}")).then(downloads => {
					downloads[id] = { ...chapter, pages: uris, type: pages[0].uri.includes("?top") ? "webtoon" : "manga" };
					AsyncStorage.setItem('downloads', JSON.stringify(downloads)).then(() => {
						setDownloaded(true);
						progressHandler(true);
						ToastAndroid.show("Chapitre téléchargé", ToastAndroid.SHORT);
					}).catch(() => setErrorChapters(true));
				});
			});
		}).catch(() => ToastAndroid.show("Erreur lors du téléchargement du chapitre", ToastAndroid.SHORT));
	}

	const sliceText = (text, max) => {
		if (text.length <= max) return [text, ""];
		let t = text.split(' ');
		let n = t[0].length, i = 0; while(i < t.length && n < max) { n += t[i].length+1; i++; }
		return [t.slice(0, i-1).join(' '), t.slice(i-1).join(' ')];
	};

	return (
		<View style={styles.item}>
			<TouchableHighlight style={styles.chapterPreviewFullContainer} onPress={() => navigation.navigate('Chapter', { chapter: { manga: chapter.manga, number: chapter.number, downloaded: downloaded } })}>
				<View>
					<View style={[styles.chapterPreviewThumbnail, styles.chapterPreviewProgress, { transform: [{ translateX: Math.ceil(downloadProgress * 64) }]}]}></View>
					<Text>
						<TouchableHighlight style={styles.chapterPreviewContainer} onPress={() => navigation.navigate('Manga', { manga: chapter.manga })}>
							<View>
								<Image style={styles.chapterPreviewThumbnail} source={{uri: chapter.manga.thumbnail}} fadeDuration={0}/>
								<View style={styles.chapterPreviewThumbnailBorder}/>
							</View>
						</TouchableHighlight>
						<View style={styles.chapterPreviewContainer}>
							<View style={{ flexWrap: 'nowrap' }}>
								<Text style={[styles.text, styles.chapterPreviewName]}>{chapter.manga.name.slice(0, 23) + (chapter.manga.name.length > 23 ? "-" : "")}</Text>
							</View>
							<View>
								<Text style={[styles.text, styles.chapterPreviewTitle]}>{sliceText(chapter.title, 43)[0]}</Text>
								<Text style={[styles.text, styles.chapterPreviewTitle]}>{sliceText(chapter.title, 43)[1]}</Text>
							</View>
						</View>
					</Text>
					<Text style={[styles.text, styles.chapterPreviewNumber]}>{chapter.number}</Text>
					<Text style={[styles.text, styles.chapterPreviewDate]}>{`Il y a ${chapter.release_date}`}</Text>
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


module.exports = HomeScreen;
