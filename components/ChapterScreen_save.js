import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	ScrollView,
	RefreshControl,
	TouchableOpacity,
	Pressable
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import ChapterSettings from './ChapterSettings';
import ViewPager from '@react-native-community/viewpager';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import styles from "../assets/styles/styles";
import secrets from '../config/secrets';
import { get } from 'axios';


const ChapterScreen = ({ navigation, route }) => {
	const [isLoadingPages, setLoadingPages] = useState(true);
	const [pages, setPages] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [readStyle, setReadStyle] = useState('horizontal');
	const [headerVisible, setHeaderVisible] = useState(true);
	const [settingsVisible, setSettingsVisible] = useState(false);
	const [doublePage, setDoublePage] = useState(true);
	let viewPager = null;
	const changeHeaderVisible = () => {
		navigation.setOptions({
			tabBarVisible: false,
			headerShown: !headerVisible
		});
		setHeaderVisible(!headerVisible);
	};
	const settingsChanged = (type, value) => {
		switch (type) {
			case "doublepage":
				setDoublePage(value);
				break;
			case "readstyle":
				value ? setReadStyle("vertical") : setReadStyle("horizontal"); 
				if ((pages[0].number === 1) === value) reversePages();
				break;
			case "japread":
				if ((pages[0].number === 1) === value) reversePages();
				break;
		}
	}
	const reversePages = () => {
		if (viewPager) {
			setPages(pages.reverse());
			viewPager.setPage(Math.abs(currentPage - pages.length + 1));
		}
	}
	const getChapterPages = (manga_id, number) => {
		return get(secrets.sf_api.url + "chapters/" + manga_id + "/" + number, { headers: { Authorization: `Bearer ${secrets.sf_api.token}` } }).then(res => res.data).catch(console.error);
	};
	const loadChapterPages = () => {
		getChapterPages(route.params.chapter.manga.id, route.params.chapter.number).then(pages => {
			Promise.all(pages.map(async (url, i) => {
				return get(url, { headers: { Authorization: `Bearer ${secrets.sf_api.token}` }}).then(async img => {
					const uri = `data:image/png;base64,${img.data}`;
					let ret;
					await Image.getSize(uri,
						(width, height) => ret = { uri: uri, width: width, height: height, number: i+1 },
						() => console.warn("La page n'a pas pu être chargée")
					);
					return ret;
				}).catch(console.error);
			})).then(res => {
				setLoadingPages(false);
				if (res.includes(undefined)) return;
				if (res && res[0] && res[0].height > 8 * res[0].width)
					setReadStyle('vertical');
				setPages(res);
			});
		}).catch(err => {
			console.error(err);
			setLoadingPages(false);
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
			setLoadingPages(true);
			loadChapterPages();
			setRefreshing(false);
		});
	};
	const updateHeader = () => {
		navigation.setOptions({
			headerRight: () => !isLoadingPages ? (
				<Text>
					<View>
						<Text style={[styles.text, styles.pagesIndicator]}>{pages[currentPage].number}/{pages.length}</Text>
					</View>
					<TouchableOpacity onPress={() => setSettingsVisible(true)} activeOpacity={0.6}>
						<Image source={require('../assets/img/settings.png')} style={styles.settingsLogo} />
					</TouchableOpacity>
				</Text>
			) : null
		});
	}

	useEffect(() => {
		updateHeader();
		loadChapterPages();
		Image.resolveAssetSource({uri: '../assets/img/settings.png'});
	}, []);

	useEffect(() => {
		updateHeader();
	}, [currentPage, pages]);

	if (isLoadingPages)
		return (<LoadingScreen />);
	if (!pages.length)
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
				readStyle === 'horizontal' && pages[0].height/pages[0].width < 5 ? // manga
					<ViewPager
						style={styles.fullContainer}
						initialPage={0}
						// scrollEnabled={true}
						ref={vp => viewPager = vp}
						onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
					>
						{
							pages.map((page, p) => {
								if (page !== null)
									return (
										<View style={styles.fullContainer} key={p}>
											<ReactNativeZoomableView
												maxZoom={2.0}
												minZoom={1}
												zoomStep={0.5}
												initialZoom={1}
												bindToBorders={true}
												onDoubleTapBefore={(e, gest, obj) => console.log(gest, obj)}
											>
												<Pressable onLongPress={changeHeaderVisible}>
													<Image
														style={[page.width > page.height && doublePage ? styles.chapterDoublePageImage : styles.chapterPageImage,
															{aspectRatio: page.width / page.height}
															// marginTop: page.height * dimensions.width / page.width > dimensions.height - headerHeight ? 'auto' : ((dimensions.height - headerHeight) - page.height * dimensions.width / page.width) / 2
															]}
														source={{ uri: page.uri }}
														fadeDuration={0}
													/>
												</Pressable>
											</ReactNativeZoomableView>
										</View>
									);
							})
						}
					</ViewPager>
				: // manhwa
					<ScrollView style={styles.scrollView}>
					{
						pages.map((page, p) => {
							if (page !== null)
								return (
									<Pressable onPress={changeHeaderVisible} key={p}>
										<Image
											style={{
												...styles.chapterPageImage,
												aspectRatio: page.width / page.height,
												// marginTop: page.height * dimensions.width / page.width > dimensions.height - headerHeight ? 'auto' : ((dimensions.height - headerHeight) - page.height * dimensions.width / page.width) / 2
											}}
											source={{uri: page.uri}}
											fadeDuration={0}
										/>
									</Pressable>
								);
						})
					}
					</ScrollView>
			}
		</BackgroundImage>
	);
}

module.exports = ChapterScreen;
