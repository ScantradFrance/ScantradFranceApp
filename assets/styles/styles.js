import {
	StyleSheet,
	Dimensions
} from 'react-native';
import colors from "./colors";
const dimensions = Dimensions.get('window');


export default StyleSheet.create({
	backgroundImage: {
        flex: 1,
		height: dimensions.height,
		width: dimensions.width
    },
	fullContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
	},
	container: {
		flex: 1,
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	instructions: {
		color: colors.white,
		fontSize: 24,
		marginHorizontal: 20,
		marginBottom: 15,
		// fontFamily: "Source Sans Pro"
	},
	button: {
		backgroundColor: colors.primary,
		padding: 10,
		borderRadius: 4
	},
	text: {
		fontSize: 18,
		color: colors.white
	},
	link: {
		fontSize: 18,
		textDecorationLine: 'underline',
		fontStyle: 'italic',
		color: colors.orange,
		// fontFamily: "Source Sans Pro"
	},
	logo: {
		aspectRatio: 0.2,
		resizeMode: 'contain'
	},
	loadingActivity: {
		paddingTop: 64
	},
	banner: {
		height: 80,
		resizeMode: 'contain',
		marginVertical: 16,
	},
	headerLeftImage: {
		width: 32,
		height: 32,
		marginLeft: 16
	},
	headerRightBookmark: {
		width: 24,
		height: 24,
		marginRight: 16
	},
	headerRightText: {
		fontWeight: 'bold',
		marginRight: 16
	},
	listChapters: {
		paddingHorizontal: 16
	},
	item: {
		paddingVertical: 8
	},
	scrollView: {
		flexGrow: 1,
		justifyContent: 'center'
	},
	tabContainer: {
		backgroundColor: colors.primary,
		borderTopColor: colors.orange,
		borderTopWidth: 3
	},
	tabIcon: {
		width: 24,
		height: 24
	},
	/**** Chapter Preview ****/
	mangaChapterPreview: {
		height: 64,
		backgroundColor: colors.primary,
		borderRadius: 4,
	},
	mangaChapterPreviewShort: {
		width: "50%",
		alignContent: "center"
	},
	chapterPreviewFullContainer: {
		backgroundColor: colors.primary,
		borderRadius: 4
	},
	chapterPreviewThumbnailBorder: {
		borderRightWidth: 3,
		borderRightColor: colors.orange,
		height: 64,
		width: 64,
		marginTop: -64,
		zIndex: 2,
	},
	chapterPreviewThumbnail: {
		height: 64,
		width: 64,
		borderBottomLeftRadius: 4,
		borderTopLeftRadius: 4,
	},
	chapterPreviewContainer: {
		height: 64,
	},
	chapterPreviewName: {
		fontSize: 16,
		fontWeight: 'bold',
		marginLeft: 8,
		overflow: 'hidden'
	},
	mangaPreviewName: {
		left: 8,
		fontSize: 18
	},
	chapterPreviewTitle: {
		fontSize: 13,
		overflow: 'visible',
		marginLeft: 8,
	},
	chapterPreviewProgress: {
		position: 'absolute',
		left: -64,
		zIndex: 1,
		backgroundColor: colors.orange + "aa"
	},
	chapterPreviewNumber: {
		fontSize: 16,
		fontWeight: 'bold',
		position: 'absolute',
		right: 32
	},
	chapterPreviewNumberRight: {
		right: 4,
	},
	chapterPreviewDate: {
		fontSize: 11,
		position: 'absolute',
		right: 4,
		bottom: 4
	},
	chapterPreviewBookmarkContainer: {
		position: 'absolute',
		width: 48,
		height: 48,
		right: 0,
		top: 8,
	},
	chapterPreviewBookmarkIcon: {
		position: 'absolute',
		top: 6,
		right: 4,
		width: 24,
		height: 24,
	},
	chapterPreviewDownloadContainer: {
		position: 'absolute',
		width: 40,
		height: 40,
		right: 0,
		top: 8,
	},
	chapterPreviewDownloadIcon: {
		position: 'absolute',
		top: 2,
		right: 4,
		width: 18,
		height: 18,
	},
	chapterPreviewDeleteIcon: {
		position: 'absolute',
		top: 4,
		right: 6,
		width: 16,
		height: 16,
	},
	/**** Chapter ****/
	chapterPageScreen: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	chapterPageImage: {
		width: dimensions.width,
		// resizeMode: 'contain'
	},
	chapterDoublePageImage: {
		height: dimensions.width,
		resizeMode: 'contain',
		transform: [{ rotate: '90deg' }]
	},
	chapterPagePagePicker: {
		height: 48,
		width: 48,
		marginRight: 8,
		color: colors.white,
	},
	chapterPagePagePickerItem: {
		backgroundColor: colors.secondary
	},
	pagesIndicator: {
		marginRight: 12,
		fontSize: 16
	},
	pagesErrorText: {
		textAlign: 'center',
		padding: 16
	},
	controlPages: {
		position: "absolute",
		height: dimensions.height,
		width: dimensions.width * 0.12,
		top: 0,
		zIndex: 5
	},
	controlPagesNext: {
		right: 0
	},
	controlPagesPrevious: {
		left: 0
	},
	/**** ChangeChapter ****/
	changeChapterContainer: {
		backgroundColor: colors.background + "bb"
	},
	changeChapterTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		borderBottomColor: colors.orange,
		borderBottomWidth: 3
	},
	changeChapterClose: {
		marginTop: 32,
		flexDirection: 'row',
		justifyContent: 'space-around'
	},
	changeChapterButton: {
		marginHorizontal: 32
	},
	/**** Settings ****/
	settingsLogo: {
		height: 24,
		width: 24,
		marginRight: 16
	},
	settingsTitle: {
		position: 'absolute',
		top: 64,
		height: 40,
		fontSize: 24,
		fontWeight: 'bold',
		borderBottomColor: colors.orange,
		borderBottomWidth: 3
	},
	settingsClose: {
		marginTop: 32
	},
	settingsContainer: {
		backgroundColor: colors.background+"ee"
	},
	settingsItemContainer: {
		width: dimensions.width,
		marginVertical: 8
	},
	settingsItemText: {
		marginLeft: 32,
	},
	settingsItemSwitch: {
		position: 'absolute',
		right: 32,
	},
	/**** Manga ****/
	mangaContainer: {
		padding: 16,
		alignItems: 'center',
	},
	mangaThumbnail: {
		height: 256,
		width: 256,
		marginBottom: 16,
		borderRadius: 4,
	},
	mangaSynopsis: {
		textAlign: 'justify'
	},
	mangaInfos: {
		color: colors.orange,
		marginVertical: 8
	},
	mangaText: {
		fontSize: 16
	},
	/**** About ****/
	aboutContainer: {
		flex: 1,
		marginVertical: 32,
		textAlign: 'left',
		alignItems: 'center'
	},
	aboutTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginTop: 8
	},
	aboutImage: {
		width: 80,
		height: 80,
		borderRadius: 80,
		borderColor: colors.orange,
		borderWidth: 1
	},
	aboutVersion: {
		marginBottom: 16,
		marginRight: 32,
		width: "100%"
	},
	aboutVersionText: {
		fontSize: 12,
		color: colors.secondary,
		textAlign: 'right'
	}
});
