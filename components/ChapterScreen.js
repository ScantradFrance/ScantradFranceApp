import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	ScrollView,
	RefreshControl,
	TouchableOpacity,
	Pressable,
	FlatList
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import ChapterSettings from './ChapterSettings';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import styles from "../assets/styles/styles";
import secrets from '../config/secrets';
import { get as fetch } from 'axios';
const CUT_NUMBER = 10;

const VerticalPage = ({ onDoublePress, page }) => {
	return (
		<Pressable onPress={onDoublePress} key={page.number}>
			<Image
				style={{
					...styles.chapterPageImage,
					aspectRatio: page.width / page.height,
				}}
				source={{ uri: page.uri }}
				fadeDuration={0}
			/>
		</Pressable>
	);
}

const ChapterScreen = ({ navigation, route }) => {
	const [isLoadingPages, setLoadingPages] = useState(true);
	const [errorChapters, setErrorChapters] = useState(false);
	const [pages, setPages] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [readStyle, setReadStyle] = useState('horizontal');
	const [headerVisible, setHeaderVisible] = useState(true);
	const [settingsVisible, setSettingsVisible] = useState(false);
	const [doublePage, setDoublePage] = useState(true);
	const [japRead, setJapRead] = useState(true);


	const isManga = () => !(pages[0] && pages[0].manhwa);
	const changeHeaderVisible = () => {
		navigation.setOptions({
			tabBarVisible: false,
			headerShown: !headerVisible
		});
		setHeaderVisible(!headerVisible);
	};
	let lastPress = 0;
	const onDoublePress = () => {
		const time = new Date().getTime();
		const delta = time - lastPress;

		const DOUBLE_PRESS_DELAY = 300;
		if (delta < DOUBLE_PRESS_DELAY)
			changeHeaderVisible();
		lastPress = time;
	};
	const changePage = op => {
		if (op === "next" && currentPage + 1 < pages.length) setCurrentPage(currentPage + 1);
		if (op === "previous" && currentPage > 0) setCurrentPage(currentPage - 1);
	}
	const settingsChanged = (type, value) => {
		switch (type) {
			case "doublepage":
				setDoublePage(value);
				break;
			case "readstyle":
				value ? setReadStyle("vertical") : setReadStyle("horizontal");
				break;
			case "japread":
				setJapRead(value);
				break;
		}
	}
	const getChapterPages = (manga_id, number) => {
		return fetch(secrets.sf_api.url + "chapters/" + manga_id + "/" + number, { headers: { Authorization: `Bearer ${secrets.sf_api.token}` } }).then(res => res.data);
	};
	const loadChapterPages = () => {
		getChapterPages(route.params.chapter.manga.id, route.params.chapter.number).then(pages => {
			Promise.all(pages.map(async (url, i) => {
				return fetch(`${url}?cut=${CUT_NUMBER}`, { headers: { Authorization: `Bearer ${secrets.sf_api.token}` }}).then(async data => {
					data = data.data.flatMap(arr => arr);
					return await Promise.all(data.map(async (uri, j) => {
						let ret;
						await Image.getSize(uri, (width, height) => ret = { uri: uri, width: width, height: height, number: i * data.length + j + 1, manhwa: data.length > 1 });
						return ret;
					}));
				}).catch(() => setErrorChapters(true));
			})).then(res => {
				if (res.includes(undefined)) return;
				if (!res[0].height) {
					const pages = [];
					res.forEach(r => pages.push(...r));
					res = pages;
				}
				if (res[0].manhwa) setReadStyle('vertical');
				setPages(res);
				changeHeaderVisible();
			});
		}).catch(() => setErrorChapters(true));
	};
	const wait = timeout => {
		return new Promise(resolve => {
			setTimeout(resolve, timeout);
		});
	}
	const onRefresh = () => {
		setRefreshing(true);
		wait(2000).then(() => {
			setLoadingPages(true);
			loadChapterPages();
			setRefreshing(false);
		});
	};
	const updateHeader = () => {
		navigation.setOptions({
			headerRight: () => !isLoadingPages && isManga() ? (
				<Text>
					{ readStyle === 'horizontal' ? (
						<View>
							<Text style={[styles.text, styles.pagesIndicator]}>{pages[currentPage].number}/{pages.length}</Text>
						</View>
						) : null
					}
					<TouchableOpacity onPress={() => setSettingsVisible(true)} activeOpacity={0.6}>
						<Image source={require('../assets/img/settings.png')} style={styles.settingsLogo} />
					</TouchableOpacity>
				</Text>
			) : null
		});
	}

	useEffect(() => {
		Image.resolveAssetSource({uri: '../assets/img/settings.png'});
		
		updateHeader();
		loadChapterPages();
	}, []);

	useEffect(() => {
		updateHeader();
	}, [currentPage, pages, readStyle, isLoadingPages]);

	useEffect(() => {
		if (pages.length) setLoadingPages(false);
	}, [pages]);

	if (isLoadingPages)
		return (<LoadingScreen />);
	if (errorChapters)
	return (
		<BackgroundImage>
			<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} style={styles.scrollView}>
				<Text style={[styles.text, styles.pagesError]}>
					Une erreur s'est produite lors du chargement des pages...
				</Text>
			</ScrollView>
		</BackgroundImage>
	)
	return (
		<BackgroundImage>
			<ChapterSettings visible={settingsVisible} setVisible={setSettingsVisible} settingsChanged={settingsChanged}/>
			{
				isManga() && readStyle === 'horizontal' ? // manga
					<View style={styles.fullContainer} key={pages[currentPage].number}>
						<Pressable style={[styles.controlPages, styles.controlPagesPrevious]} onPress={() => changePage(japRead ? "next" : "previous")}></Pressable>
						<Pressable style={[styles.controlPages, styles.controlPagesNext]} onPress={() => changePage(japRead ? "previous" : "next")}></Pressable>
						<ReactNativeZoomableView
							maxZoom={2.0}
							minZoom={1}
							zoomStep={0.2}
							initialZoom={1}
							bindToBorders={true}
						>
							<Pressable onPress={onDoublePress}>
								<Image
									style={[pages[currentPage].width > pages[currentPage].height && doublePage ? styles.chapterDoublePageImage : styles.chapterPageImage,
									{ aspectRatio: pages[currentPage].width / pages[currentPage].height }
									]}
									source={{ uri: pages[currentPage].uri }}
									fadeDuration={0}
								/>
							</Pressable>
						</ReactNativeZoomableView>
					</View>
				: // manhwa
					<ReactNativeZoomableView
						maxZoom={2.0}
						minZoom={1}
						zoomStep={0.2}
						initialZoom={1}
						bindToBorders={true}
					>			
						<FlatList
							data={pages}
							renderItem={({ item }) => <VerticalPage onDoublePress={onDoublePress} page={item} />}
							keyExtractor={item => item.number+""}
						/>
					</ReactNativeZoomableView>
			}
		</BackgroundImage>
	);
}

module.exports = ChapterScreen;
