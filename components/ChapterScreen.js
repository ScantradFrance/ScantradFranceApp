import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	ScrollView,
	RefreshControl,
	TouchableOpacity,
	Pressable,
	FlatList,
	Modal,
	Button
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import ChapterSettings from './ChapterSettings';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import styles from "../assets/styles/styles";
import colors from "../assets/styles/colors";
import { sf_api } from '../config/secrets';
import { get as fetch } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChangeChapterModal = ({ visible, setVisible, next, changeChapter }) => {
	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType={'slide'}
		>
			<View style={[styles.fullContainer, styles.changeChapterContainer]}>
				<Text style={[styles.text, styles.changeChapterTitle]}>{next ? "Aller au prochain chapitre ?" : "Aller au chapitre précédent ?"}</Text>
				<View style={styles.changeChapterClose}>
					<View style={styles.changeChapterButton}>
						<Button
							title="Rester"
							onPress={() => setVisible(false)}
							color={colors.secondary}
						/>
					</View>
					<View style={styles.changeChapterButton}>
						<Button
							title="Aller"
							onPress={() => changeChapter(next ? "next" : "previous")}
							color={colors.orange}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}

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
	const [nbPages, setNbPages] = useState(0);
	const [type, setType] = useState(null);
	const [pages, setPages] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [readStyle, setReadStyle] = useState('horizontal');
	const [headerVisible, setHeaderVisible] = useState(true);
	const [settingsVisible, setSettingsVisible] = useState(false);
	const [doublePage, setDoublePage] = useState(true);
	const [japRead, setJapRead] = useState(true);
	const [nextChapter, setNextChapter] = useState(null);
	const [previousChapter, setPreviousChapter] = useState(null);
	const [changeChapterVisible, setChangeChapterVisible] = useState(false);

	const changeHeaderVisible = (state) => {
		navigation.setOptions({
			tabBarVisible: false,
			headerShown: state !== undefined ? state : !headerVisible
		});
		setHeaderVisible(state !== undefined ? state : !headerVisible);
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

	const changePage = async op => {
		const page = pages[currentPage + 2];
		if (page !== undefined && !page.downloaded) {
			const uri = page.uri;
			Image.queryCache([uri]).then(cache => {
				if (!cache[uri]) Image.prefetch(uri);
			});
		}
		if (op === "next") {
			if (currentPage + 1 < pages.length) setCurrentPage(currentPage + 1);
			else if (nextChapter) setChangeChapterVisible(true);
		}
		if (op === "previous") {
			if (currentPage > 0) setCurrentPage(currentPage - 1);
			else if (previousChapter) setChangeChapterVisible(true);
		}
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

	const loadManga = (manga_id) => {
		return fetch(sf_api.url + "mangas/" + manga_id).then(m => m.data);
	};

	const loadChapters = () => {
		loadManga(route.params.chapter.manga.id).then(manga => {
			const number = Number(route.params.chapter.number);
			manga.chapters.forEach(c => {
				if (Number(c.number) === number + 1) setNextChapter({ manga: { id: manga.id, name: manga.name }, number: c.number });
				if (Number(c.number) === number - 1) setPreviousChapter({ manga: { id: manga.id, name: manga.name }, number: c.number });
			});
		}).catch(console.error);
	};

	const getChapterPages = (manga_id, number) => {
		return fetch(sf_api.url + "chapters/" + manga_id + "/" + number).then(res => res.data);
	};

	const loadChapterPages = () => {
		const chapter = route.params.chapter;
		if (chapter.downloaded) {
			AsyncStorage.getItem('downloads').then(d => JSON.parse(d || "{}")).then(async downloads => {
				const dl_chap = downloads[chapter.manga.id + "-" + chapter.number];
				if (!dl_chap) return setErrorChapters(true);
				setNbPages(dl_chap.pages.length);
				const pages = await Promise.all(dl_chap.pages.map(async (p, i) => {
					let ret = null;
					await Image.getSize(p, (width, height) => ret = { uri: p, width: width, height: height, number: i + 1 });
					return ret;
				}));
				if (pages.includes(null)) return setErrorChapters(true);
				setType(dl_chap.type || "manga");
				setPages(pages);
				setLoadingPages(false);
				changeHeaderVisible(true);
			}).catch(() => setErrorChapters(true));
		} else {
			getChapterPages(chapter.manga.id, chapter.number).then(async chapter => {
				setNbPages(chapter.length);
				setType(chapter.pages[0].uri.includes("?top=") ? "webtoon" : "manga");
				const uris = chapter.pages.map(p => p.uri);
				Image.queryCache(uris).then(cache => {
					uris.forEach(uri => {
						if (!cache[uri]) Image.prefetch(uri);
					});
				});
				setPages(chapter.pages.map((p, i) => ({ uri: p.uri, width: p.width, height: p.height, number: i + 1 })));
				setLoadingPages(false);
				changeHeaderVisible(false);
			}).catch(() => setErrorChapters(true));
		}
	};

	const onRefresh = () => {
		setRefreshing(true);
		setLoadingPages(true);
		loadNextPreviousChapter();
		loadChapterPages();
		setRefreshing(false);
	};
	const updateHeader = () => {
		navigation.setOptions({
			headerRight: () => !isLoadingPages && type === "manga" ? (
				<Text>
					{ readStyle === 'horizontal' ? (
						<View>
							<Text style={[styles.text, styles.pagesIndicator]}>{(pages[currentPage] && pages[currentPage].number) || 0}/{nbPages}</Text>
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

	const changeChapter = (op) => {
		setChangeChapterVisible(false);
		route.params.chapter = op === "next" ? nextChapter : previousChapter;
		setLoadingPages(true);
		setNextChapter(null); setPreviousChapter(null);
		setNbPages(0); setPages([]); setCurrentPage(0);
		updateHeader();
		loadChapterPages();
		loadChapters();
	}

	useEffect(() => {
		Image.resolveAssetSource({uri: '../assets/img/settings.png'});
		
		updateHeader();
		loadChapterPages();
		loadChapters();
	}, []);

	useEffect(() => {
		updateHeader();
	}, [currentPage, pages, readStyle, isLoadingPages]);

	useEffect(() => {
		if (type === "webtoon" && readStyle === 'horizontal') setReadStyle('vertical');
		if (pages.length && !isLoadingPages) setLoadingPages(false);
	}, [pages]);

	if (isLoadingPages)
		return (<LoadingScreen />);
	if (errorChapters)
	return (
		<BackgroundImage>
			<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={styles.scrollView}>
				<Text style={[styles.text, styles.pagesErrorText]}>
					Une erreur s'est produite lors du chargement des pages...
				</Text>
			</ScrollView>
		</BackgroundImage>
	)
	return (
		<BackgroundImage>
			<ChapterSettings visible={settingsVisible} setVisible={setSettingsVisible} settingsChanged={settingsChanged} />
			<ChangeChapterModal visible={changeChapterVisible} setVisible={setChangeChapterVisible} changeChapter={changeChapter} next={japRead ? currentPage === 0 : currentPage > 0} />
			{
				type === "manga" && readStyle === 'horizontal' ? // manga
					<View style={styles.fullContainer} key={(pages[currentPage] && pages[currentPage].number) || 0}>
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
				: // webtoon
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
							keyExtractor={item => item.number + ""}
						/>
					</ReactNativeZoomableView>
			}
		</BackgroundImage>
	);
}

module.exports = ChapterScreen;
