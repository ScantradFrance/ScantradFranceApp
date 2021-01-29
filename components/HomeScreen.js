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
import colors from "../assets/styles/colors.json";
const fetch = require('node-fetch');


const HomeScreen = ({ navigation }) => {
	const [isLoadingChapters, setLoadingChapters] = useState(true);
	const [chapters, setChapters] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const getLastChapters = async limit => {
		return fetch(secrets.sf_api.url + "chapters/last/" + limit, {headers: new fetch.Headers({'Authorization': 'Bearer ' + secrets.sf_api.token})})
		.then(res => res.json())
		.catch(console.error);
	};
	const wait = timeout => {
		return new Promise(resolve => {
			setTimeout(resolve, timeout);
		});
	}
	const loadChapters = () => {
		getLastChapters(10)
			.then(chaps => {
				setLoadingChapters(false);
				if (!chapters.length || chaps[0].title !== chapters[0].title)
					setChapters(chaps);
			}).catch(console.error);
	};
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
	return (
		<BackgroundImage>
			<FlatList
				style={styles.listChapters}
				data={chapters}
				renderItem={({item}) => <ThumbnailChapter navigation={navigation} chapter={item} />}
				keyExtractor={item => item.title}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
				ListHeaderComponent={ChaptersListHeader}
				ListFooterComponent={<ChaptersListFooter navigation={navigation}/>}
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

const ChaptersListFooter = ({ navigation }) => {
	return (
		<View style={[styles.container, styles.homeFooter]}>
			{/*<Text style={styles.text} onPress={() => navigation.navigate('About')}>À propos</Text>*/}
			<Button title="À propos" onPress={() => navigation.navigate('About')} color={colors.primary}/>
		</View>
	);
}

const ThumbnailChapter = ({navigation, chapter}) => {
	const sliceText = (text, max) => {
		let t = text.split(' ');
		let n = t[0].length, i = 0; while(i < t.length && n < max) { n += t[i].length; i++; }
		if (text.length >= max) return [t.slice(0, i-1).join(' '), t.slice(i-1).join(' ')];
		return [t.slice(0, i).join(' '), t.slice(i).join(' ')];
	};
	const getTimePassed = () => {
		let timePassed = Date.now() - new Date(chapter.release_date);
		let time;
		if (timePassed <= 1000*60) { // secondes
			time = {
				number: timePassed,
				type: "secondes"
			};
		} else if (timePassed <= 1000*60*60) { // minutes
			time = {
				number: timePassed/1000/60,
				type: "minutes"
			}
		} else if (timePassed <= 1000*60*60*24) { // heures
			time = {
				number: timePassed/1000/60/60,
				type: "heures"
			}
		} else { // jours
			time = {
				number: timePassed/1000/60/60/24,
				type: "jours"
			}
		}
		time.number = Math.round(time.number);
		if (time.number < 2) time.type = time.type.slice(0, -1);
		return time;
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
					<Text style={[styles.text, styles.chapterPreviewDate]}>{`Il y a ${getTimePassed().number} ${getTimePassed().type}`}</Text>
				</View>
			</TouchableHighlight>
		</View>
	);
};


module.exports = HomeScreen;
