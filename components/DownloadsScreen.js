import React, { useEffect, useState } from 'react';
import {
	View,
	Image,
	RefreshControl,
	Text,
	FlatList,
	TouchableHighlight,
	ScrollView,
	TouchableOpacity
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import BannerHeader from './BannerHeader';
import styles from "../assets/styles/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const DownloadsScreen = ({navigation}) => {

	const [isLoadingChapters, setLoadingChapters] = useState(true);
	const [errorChapters, setErrorChapters] = useState(false);
	const [chapters, setChapters] = useState(null);
	const [refreshing, setRefreshing] = useState(false);

	const loadChapters = () => {
		AsyncStorage.getItem('downloads').then(d => JSON.parse(d || "{}")).then(downloads => {
			setChapters(Object.values(downloads));
			setLoadingChapters(false);
		}).catch(() => setErrorChapters(true));
	}

	const onRefresh = () => {
		setRefreshing(true);
		setErrorChapters(false);
		setLoadingChapters(true);
		loadChapters();
		setRefreshing(false);
	};

	const deleteDownload = download_id => {
		const folderpath = `${FileSystem.documentDirectory}${download_id}/`;
		AsyncStorage.getItem('downloads').then(d => JSON.parse(d || "{}")).then(downloads => {
			if (!Object.keys(downloads)) return;
			FileSystem.deleteAsync(folderpath, { idempotent: true }).then(() => {
				delete downloads[download_id];
				AsyncStorage.setItem('downloads', JSON.stringify(downloads)).then(() => {
					setLoadingChapters(true);
					loadChapters();
				});
			});
		}).catch(() => ToastAndroid.show("Erreur lors de la suppression du chapitre", ToastAndroid.SHORT));
	};
	
	useEffect(() => {
		Image.resolveAssetSource({ uri: '../assets/img/delete.png' });
		
		loadChapters();
		
		// DEBUG
		// FileSystem.getInfoAsync(`${FileSystem.documentDirectory}le-samoura-insaisissable-018/`).then(res => console.log(res)).catch(console.error);
		// FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(res => console.log(res)).catch(console.error);
	}, []);

	useEffect(() => {
		if (chapters || errorChapters) setLoadingChapters(false);
	}, [chapters, errorChapters]);

	if (isLoadingChapters)
		return (<LoadingScreen />);
	if (!chapters.length)
		return (
			<BackgroundImage>
				<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={styles.scrollView}>
					<Text style={[styles.text, styles.pagesErrorText]}>
						{ errorChapters ?
							"Une erreur s'est produite lors du chargement des chapitres..."
							:
							"Aucun chapitre téléchargé."
						}
					</Text>
				</ScrollView>
			</BackgroundImage>
		);
	return (
		<BackgroundImage>
			<FlatList
				style={styles.listChapters}
				data={chapters}
				renderItem={({ item }) => <ThumbnailChapter navigation={navigation} chapter={item} deleteDownload={deleteDownload} />}
				keyExtractor={item => item.title}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
				ListHeaderComponent={BannerHeader}
			/>
		</BackgroundImage>
	);
}

const ThumbnailChapter = ({ navigation, chapter, deleteDownload }) => {
	const sliceText = (text, max) => {
		if (text.length <= max) return [text, ""];
		let t = text.split(' ');
		let n = t[0].length, i = 0; while (i < t.length && n < max) { n += t[i].length + 1; i++; }
		return [t.slice(0, i - 1).join(' '), t.slice(i - 1).join(' ')];
	};

	return (
		<View style={styles.item}>
			<TouchableHighlight style={styles.chapterPreviewFullContainer} onPress={() => navigation.navigate('Chapter', { chapter: { manga: chapter.manga, number: chapter.number, downloaded: true } })}>
				<View>
					<Text>
						<TouchableHighlight style={styles.chapterPreviewContainer} onPress={() => navigation.navigate('Manga', { manga: chapter.manga })}>
							<View>
								<Image style={styles.chapterPreviewThumbnail} source={{ uri: chapter.manga.thumbnail }} fadeDuration={0} />
								<View style={styles.chapterPreviewThumbnailBorder} />
							</View>
						</TouchableHighlight>
						<View style={styles.chapterPreviewContainer}>
							<View style={{ flexWrap: 'nowrap' }}>
								<Text style={[styles.text, styles.chapterPreviewName]}>{chapter.manga.name.slice(0, 23) + (chapter.manga.name.length > 28 ? "-" : "")}</Text>
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
			<TouchableOpacity style={styles.chapterPreviewDownloadContainer} onPress={() => deleteDownload(chapter.manga.id + "-" + chapter.number)} activeOpacity={0.6}>
				<View>
					<Image style={[styles.chapterPreviewDownloadIcon, styles.chapterPreviewDeleteIcon]} source={require('../assets/img/delete.png')} />
				</View>
			</TouchableOpacity>
		</View>
	);
};


module.exports = DownloadsScreen;
