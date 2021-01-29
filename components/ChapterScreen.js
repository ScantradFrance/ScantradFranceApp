import React, { useState, useEffect } from 'react';
import {
	View,
	Image,
	ScrollView,
	TouchableOpacity,
	Pressable
} from 'react-native';
import BackgroundImage from './BackgroundImage';
import LoadingScreen from './LoadingScreen';
import ChapterSettings from './ChapterSettings';
import ViewPager from '@react-native-community/viewpager';
import styles from "../assets/styles/styles";


const ChapterScreen = ({ navigation, route }) => {
	const [isLoadingPages, setLoadingPages] = useState(true);
	const [pages, setPages] = useState([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [readStyle, setReadStyle] = useState('horizontal');
	const [headerVisible, setHeaderVisible] = useState(true);
	const [settingsVisible, setSettingsVisible] = useState(false);
	const [doublePage, setDoublePage] = useState(true);
	const firstPage = route.params.chapter.pages[0];
	let viewPager = null;
	const changeHeaderVisible = () => {
		navigation.setOptions({ headerShown: !headerVisible });
		setHeaderVisible(!headerVisible);
	};
	const settingsChanged = (type, value) => {
		switch (type) {
			case "doublepage":
				setDoublePage(value);
				break;
			case "readstyle":
				value ? setReadStyle("vertical") : setReadStyle("horizontal");
				if (value && pages[0] && pages[0].uri !== firstPage) reversePages();
				break;
			case "japread":
				if (pages[0] && ((pages[0].uri === firstPage) === value)) reversePages();
				break;
		}
	}
	const reversePages = () => {
		if (viewPager) {
			setPages(pages.reverse());
			viewPager.setPage(Math.abs(currentPage - pages.length + 1));
		}
	}
	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity onPress={() => setSettingsVisible(true)} activeOpacity={0.6}>
					<Image source={require('../assets/img/settings.png')} style={styles.settingsLogo}/>
				</TouchableOpacity>
			)
		});
		let chapter = route.params.chapter;
		Promise.all(chapter.pages.map(async uri => {
			let obj = null;
			await Image.getSize(uri, (width, height) => {
				obj = {uri: uri, width: width, height: height};
			});
			return obj;
		})).then(res => {
			if (res && res[0] && res[0].height > 8*res[0].width)
				setReadStyle('vertical');
			setPages(res);
			setLoadingPages(false);
		});
		Image.resolveAssetSource({uri: '../assets/img/settings.png'});
	}, [navigation]);

	if (isLoadingPages)
		return (<LoadingScreen />);
	return (
		<BackgroundImage>
			<ChapterSettings visible={settingsVisible} setVisible={setSettingsVisible} settingsChanged={settingsChanged}/>
			{
				readStyle === 'horizontal' && pages[0].height/pages[0].width < 5 ? // manga
					<ViewPager
						style={styles.fullContainer}
						initialPage={0}
						scrollEnabled={true}
						ref={vp => viewPager = vp}
						onPageSelected={e => setCurrentPage(e.nativeEvent.position)}
					>
						{
							pages.map((page, p) => {
								if (page !== null)
									return (
										<View style={styles.fullContainer} key={p}>
											<Pressable onPress={changeHeaderVisible}>
												<Image
													style={[page.width > page.height && doublePage ? styles.chapterDoublePageImage : styles.chapterPageImage,
														{aspectRatio: page.width / page.height}
														// marginTop: page.height * dimensions.width / page.width > dimensions.height - headerHeight ? 'auto' : ((dimensions.height - headerHeight) - page.height * dimensions.width / page.width) / 2
														]}
													source={{uri: page.uri}}
													fadeDuration={0}
												/>
											</Pressable>
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
