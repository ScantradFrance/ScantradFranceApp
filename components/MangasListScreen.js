import React, { useEffect, useState } from 'react';
import {
	View,
	Image,
	RefreshControl,
	Text,
	FlatList,
	TouchableHighlight
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import styles from "../assets/styles/styles";
import secrets from '../config/secrets';
import { get } from 'axios';

const MangaScreen = ({navigation}) => {

	const [isLoadingMangas, setLoadingMangas] = useState(true);
	const [mangas, setMangas] = useState([]);
	const [refreshing, setRefreshing] = useState(false);

	const getMangas = () => {
		return get(secrets.sf_api.url + "mangas/", { headers: { Authorization: `Bearer ${secrets.sf_api.token}` } }).then(res => res.data).catch(console.error);
	};
	const loadMangas = () => {
		getMangas().then(mangas => {
			setLoadingMangas(false);
			setMangas(mangas);
		}).catch(err => {
			console.error(err);
			setLoadingMangas(false);
		});
	}
	const wait = timeout => {
		return new Promise(resolve => {
			setTimeout(resolve, timeout);
		});
	}
	const onRefresh = () => {
		setRefreshing(true);
		wait(2000).then(() => {
			setLoadingMangas(true);
			loadMangas();
			setRefreshing(false);
		});
	};

	useEffect(() => {
		loadMangas();
	}, []);

	if (isLoadingMangas)
		return (<LoadingScreen />);
	if (!mangas.length)
		return (
			<View>
				<Text>
					Une erreur s'est produite lors du chargement des mangas...
				</Text>
			</View>
		);
	return (
		<BackgroundImage>
			<FlatList
				style={styles.listChapters}
				data={mangas}
				renderItem={({ item }) => <ThumbnailManga navigation={navigation} manga={item} />}
				keyExtractor={item => item.id}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			/>
		</BackgroundImage>
	);
}

const ThumbnailManga = ({ navigation, manga }) => {
	const sliceText = (text, max) => {
		if (text.length <= max) return [text, ""];
		let t = text.split(' ');
		let n = 0, i = 0; while (i < t.length && n <= max) { n += t[i].length+1; i++; }
		return [t.slice(0, i-1).join(' '), t.slice(i-1).join(' ')];
	};

	return (
		<View style={styles.item}>
			<TouchableHighlight style={styles.chapterPreviewFullContainer} onPress={() => navigation.navigate('Manga', { manga: manga })}>
				<View>
					<Text>
						<View style={styles.chapterPreviewContainer}>
							<View>
								<Image style={styles.chapterPreviewThumbnail} source={{ uri: manga.thumbnail }} fadeDuration={0} />
								<View style={styles.chapterPreviewThumbnailBorder} />
							</View>
						</View>
						<View style={styles.chapterPreviewContainer}>
							<View style={{ flexWrap: 'nowrap' }}>
								<Text style={[styles.text, styles.mangaPreviewName]}>{sliceText(manga.name, 26)[0]}</Text>
								<Text style={[styles.text, styles.mangaPreviewName]}>{sliceText(manga.name, 26)[1]}</Text>
							</View>
						</View>
					</Text>
					{ manga.last_chapter ?
						<Text style={[styles.text, styles.chapterPreviewDate]}>{manga.last_chapter}</Text>
					: null }
				</View>
			</TouchableHighlight>
		</View>
	);
};


module.exports = MangaScreen;
