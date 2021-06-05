import React, { useEffect, useState } from 'react';
import {
	View,
	Image,
	RefreshControl,
	Text,
	FlatList,
	TouchableHighlight,
	TouchableOpacity,
	ScrollView,
	ToastAndroid
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import BannerHeader from './BannerHeader';
import styles from "../assets/styles/styles";
import { sf_api } from '../config/secrets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post } from 'axios';

const MangaScreen = ({navigation}) => {

	const [token, setToken] = useState('');
	const [isLoadingMangas, setLoadingMangas] = useState(true);
	const [errorMangas, setErrorMangas] = useState(false);
	const [mangas, setMangas] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [follows, setFollows] = useState([]);

	const getMangas = () => {
		return get(sf_api.url + "mangas/").then(res => res.data);
	};

	const loadMangas = () => {
		getMangas().then(mangas => {
			setMangas(mangas);
		}).catch(() => setErrorMangas(true));
	}
	
	const onRefresh = () => {
		setRefreshing(true);
		setErrorMangas(false);
		setLoadingMangas(true);
		loadFollows();
		loadMangas();
		setRefreshing(false);
	};

	const changeFollowed = manga_id => {
		if (!follows.includes(manga_id)) setFollows(follows.concat(manga_id));
		else setFollows(follows.filter(f => f !== manga_id));
	};

	const loadFollows = async () => {
		setFollows(await post(sf_api.url + "users/follows",
			{ token: token, request: "get" },
			{ headers: { Authorization: `Bearer ${sf_api.token}` }}
		).then(res => res.data));
	};

	const saveFollows = () => {
		post(sf_api.url + "users/follows", { token: token, follows: JSON.stringify(follows), request: "edit" }, { headers: { Authorization: `Bearer ${sf_api.token}` } }).catch(() => { });
	}

	useEffect(() => {
		Image.resolveAssetSource({ uri: '../assets/img/bookmark_filled.png' });
		Image.resolveAssetSource({ uri: '../assets/img/bookmark.png' });

		AsyncStorage.getItem('token').then(token => setToken(token));
	}, []);
	
	useEffect(() => {
		if (token === '') return;
		loadFollows();
		loadMangas();
	}, [token]);
	
	useEffect(() => {
		saveFollows();
	}, [follows]);

	useEffect(() => {
		if (mangas.length || errorMangas) setLoadingMangas(false);
	}, [mangas, errorMangas]);

	if (isLoadingMangas)
		return (<LoadingScreen />);
	if (errorMangas)
		return (
			<BackgroundImage>
				<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={styles.scrollView}>
					<Text style={[styles.text, styles.pagesErrorText]}>
						Une erreur s'est produite lors du chargement des mangas...
					</Text>
				</ScrollView>
			</BackgroundImage>
		);
	return (
		<BackgroundImage>
			<FlatList
				style={styles.listChapters}
				data={mangas}
				renderItem={({ item }) => <ThumbnailManga navigation={navigation} manga={item} isFollowing={follows.includes(item.id)} changeFollowed={changeFollowed} />}
				keyExtractor={item => item.id}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
				ListHeaderComponent={BannerHeader}
			/>
		</BackgroundImage>
	);
}

const ThumbnailManga = ({ navigation, manga, isFollowing, changeFollowed }) => {

	const [followed, setFollowed] = useState(isFollowing);
	const [first, setFirst] = useState(true);

	const change = () => {
		setFollowed(!followed);
		changeFollowed(manga.id);
	}

	const sliceText = (text, max) => {
		if (text.length <= max) return [text, ""];
		let t = text.split(' ');
		let n = 0, i = 0; while (i < t.length && n <= max) { n += t[i].length+1; i++; }
		return [t.slice(0, i-1).join(' '), t.slice(i-1).join(' ')];
	};

	useEffect(() => {
		if (!first)	ToastAndroid.show(followed ? "Manga ajouté aux favoris" : "Manga retiré des favoris", ToastAndroid.SHORT);
		else setFirst(false);
	}, [followed]);

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
								<Text style={[styles.text, styles.mangaPreviewName]}>{sliceText(manga.name, 24)[0]}</Text>
								<Text style={[styles.text, styles.mangaPreviewName]}>{sliceText(manga.name, 24)[1]}</Text>
							</View>
						</View>
					</Text>
					{ manga.last_chapter ?
						<Text style={[styles.text, styles.chapterPreviewDate]}>{manga.last_chapter}</Text>
					: null }
				</View>
			</TouchableHighlight>
			<TouchableOpacity style={styles.chapterPreviewBookmarkContainer} onPress={change} activeOpacity={0.6}>
				<View>
					<Image style={styles.chapterPreviewBookmarkIcon} source={followed ? require('../assets/img/bookmark_filled.png') : require('../assets/img/bookmark.png')} />
				</View>
			</TouchableOpacity>
		</View>
	);
};


module.exports = MangaScreen;
