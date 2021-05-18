import React, { useState, useEffect } from 'react';
import {
	View,
	Image,
	FlatList,
	RefreshControl,
	Text,
	TouchableHighlight, Button
} from 'react-native';
import LoadingScreen from './LoadingScreen';
import BackgroundImage from './BackgroundImage';
import secrets from '../config/secrets';
import styles from "../assets/styles/styles";
import { get } from 'axios';


const HomeScreen = ({ navigation }) => {
	const [isLoadingChapters, setLoadingChapters] = useState(true);
	const [chapters, setChapters] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const getLastChapters = async limit => {
		return get(secrets.sf_api.url + "chapters/" + limit, { headers: { Authorization: `Bearer ${secrets.sf_api.token}` } }).then(res => res.data).catch(console.error);
	};
	const loadChapters = () => {
		getLastChapters(15)
			.then(chaps => {
				if (!chaps) return;
				setChapters(chaps);
				setLoadingChapters(false);
			}).catch(err => {
				console.error(err);
				setLoadingChapters(false);
			});
	};
	const wait = timeout => {
		return new Promise(resolve => {
			setTimeout(resolve, timeout);
		});
	}
	const onRefresh = () => {
		setRefreshing(true);
		wait(2000).then(() => {
			setLoadingChapters(true);
			loadChapters();
			setRefreshing(false);
		});
	};
	useEffect(() => {
		loadChapters();
		Image.resolveAssetSource({uri: '../assets/img/banner.png'});
	},[]);

	if (isLoadingChapters)
		return (<LoadingScreen />);
	if (!chapters.length)
		return (
			<View>
				<Text>
					Une erreur s'est produite lors du chargement des chapitres...
				</Text>
			</View>
		);
	return (
		<BackgroundImage>
			<FlatList
				style={styles.listChapters}
				data={chapters}
				renderItem={({ item }) => <ThumbnailChapter navigation={navigation} chapter={item} />}
				keyExtractor={item => item.title}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
				ListHeaderComponent={ChaptersListHeader}
			/>
		</BackgroundImage>
	);
}


const ChaptersListHeader = () => {
	return (
		<View style={styles.fullContainer}>
			<Image
				style={styles.banner}
				source={require('../assets/img/banner.png')}
				fadeDuration={0}
			/>
		</View>
	);
}

const ThumbnailChapter = ({navigation, chapter}) => {
	const sliceText = (text, max) => {
		if (text.length <= max) return [text, ""];
		let t = text.split(' ');
		let n = t[0].length, i = 0; while(i < t.length && n < max) { n += t[i].length+1; i++; }
		return [t.slice(0, i-1).join(' '), t.slice(i-1).join(' ')];
	};

	return (
		<View style={styles.item}>
			<TouchableHighlight style={styles.chapterPreviewFullContainer} onPress={() => navigation.navigate('Chapter', { chapter: chapter })}>
				<View>
					<Text>
						<TouchableHighlight style={styles.chapterPreviewContainer} onPress={() => navigation.navigate('Manga', { manga: chapter.manga })}>
							<View>
								<Image style={styles.chapterPreviewThumbnail} source={{uri: chapter.manga.thumbnail}} fadeDuration={0}/>
								<View style={styles.chapterPreviewThumbnailBorder}/>
							</View>
						</TouchableHighlight>
						<View style={styles.chapterPreviewContainer}>
							<View style={{ flexWrap: 'nowrap' }}>
								<Text style={[styles.text, styles.chapterPreviewName]}>{chapter.manga.name.slice(0, 28)+(chapter.manga.name.length>28?"-":"")}</Text>
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
		</View>
	);
};


module.exports = HomeScreen;
