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
		color: colors.white,
		// fontFamily: "Source Sans Pro"
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
		resizeMode: 'contain',
	},
	loadingActivity: {
		paddingTop: 48
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
	headerRightText: {
		fontWeight: 'bold',
		marginRight: 16
	},
	listChapters: {
		paddingHorizontal: 16,
	},
	item: {
		paddingVertical: 8,
	},
	scrollView: {
		flex: 1,
	},
	homeFooter: {
		marginTop: 32,
		marginBottom: 16
	},
	/**** Chapter Preview ****/
	chapterPreviewFullContainer: {
		backgroundColor: colors.primary,
		borderRadius: 4,
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
	chapterPreviewTitle: {
		fontSize: 13,
		overflow: 'visible',
		marginLeft: 8,
	},
	chapterPreviewNumber: {
		fontSize: 16,
		fontWeight: 'bold',
		position: 'absolute',
		right: 4,
	},
	chapterPreviewDate: {
		fontSize: 11,
		position: 'absolute',
		right: 4,
		bottom: 4
	},
	/**** Chapter ****/
	chapterPageScreen: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	chapterPageImage: {
		width: dimensions.width,
		resizeMode: 'contain'
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
		marginBottom: 16
	},
	mangaSynopsis: {
		textAlign: 'justify'
	},
	mangaInfos: {
		color: colors.orange,
		marginVertical: 8
	},
	/**** About ****/
	aboutContainer: {
		flex: 1,
		marginVertical: 32,
		textAlign: 'left'
	},
	aboutTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginTop: 16,
		marginBottom: 8
	}
});