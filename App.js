import React, { useEffect, useState, useRef } from 'react';
import {
	StatusBar,
	Image,
	Platform,
	ToastAndroid
} from 'react-native';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import colors from './assets/styles/colors';
import styles from './assets/styles/styles';
import { sf_api } from './config/secrets';
import { HomeScreen, ChapterScreen, MangaScreen, AboutScreen, MangasScreen, FollowsScreen, DownloadsScreen } from './components/screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post } from 'axios';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

function getTabIcon(route, focused) {
	let icon_image;
	switch (route) {
		case "Mangas": icon_image = focused ? require(`./assets/img/listfilled_tabicon.png`) : require(`./assets/img/list_tabicon.png`); break;
		case "Follows": icon_image = focused ? require(`./assets/img/bookmark_filled.png`) : require(`./assets/img/bookmark.png`); break;
		case "Downloads": icon_image = focused ? require(`./assets/img/download_filled.png`) : require(`./assets/img/download.png`); break;
		case "About": icon_image = focused ? require(`./assets/img/infofilled_tabicon.png`) : require(`./assets/img/info_tabicon.png`); break;
		default: icon_image = focused ? require(`./assets/img/homefilled_tabicon.png`) : require(`./assets/img/home_tabicon.png`);
	}
	return <Image style={styles.tabIcon} source={icon_image} />;
}

function TabScreens({navigation, route}) {

	useEffect(() => {
		const routeName = getFocusedRouteNameFromRoute(route);
		let options;
		switch (routeName) {
			case "About":
				options = {
					title: 'À PROPOS',
				}
				break;
			case "Follows":
				options = {
					title: 'CHAPITRES SUIVIS',
				};
				break;
			case "Downloads":
				options = {
					title: 'CHAPITRES TÉLÉCHARGÉS',
				};
				break;
			case "Mangas":
				options = {
					title: 'LISTE DES MANGAS',
				};
				break;
			default:
				options = {
					title: 'DERNIERS CHAPITRES',
				};
		}
		navigation.setOptions(options);
	});

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused }) => getTabIcon(route.name, focused),
			})}
			tabBarOptions={{
				tabStyle: styles.tabContainer,
				showLabel: false
			}}

		>
			<Tab.Screen name="Home" component={HomeScreen} />
			<Tab.Screen name="Follows" component={FollowsScreen} />
			<Tab.Screen name="Downloads" component={DownloadsScreen} />
			<Tab.Screen name="Mangas" component={MangasScreen} />
			<Tab.Screen name="About" component={AboutScreen} options={{ title: 'À propos' }} />
		</Tab.Navigator>
	);
}

const App = () => {

	const [token, setToken] = useState('');

	useEffect(() => {
    	Image.resolveAssetSource({uri: './assets/img/homefilled_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/home_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/listfilled_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/list_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/infofilled_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/info_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/bookmark_filled.png'});
    	Image.resolveAssetSource({uri: './assets/img/bookmark.png'});
		Image.resolveAssetSource({uri: './assets/img/download_filled.png'});
		Image.resolveAssetSource({uri: './assets/img/download.png'});

		checkUpdate();
		initPushNotifs();
	}, []);

	useEffect(() => {
		AsyncStorage.setItem('token', token).catch(() => {});
	}, [token]);

	const checkUpdate = async () => {
		try {
			const update = await Updates.checkForUpdateAsync().catch(() => {});
			if (update.isAvailable) {
				ToastAndroid.show("Mise à jour de l'application...", ToastAndroid.SHORT);
				await Updates.fetchUpdateAsync().catch(() => {});
				await Updates.reloadAsync().catch(() => {});
			}
		} catch (_) {}
	};

	const initPushNotifs = async () => {
		registerForPushNotificationsAsync().then(token => {
			setToken(token);
			post(sf_api.url + "users/token",
				{ token: token },
				{ headers: { Authorization: `Bearer ${sf_api.token}` }}
			).catch(() => {});
		}).catch(() => {});
	};

	async function registerForPushNotificationsAsync() {
		let token;
		
		// Must use physical device for Push Notifications
		if (Constants.isDevice) {
			const { status: existingStatus } = await Notifications.getPermissionsAsync();
			let finalStatus = existingStatus;
			if (existingStatus !== 'granted') {
				const { status } = await Notifications.requestPermissionsAsync();
				finalStatus = status;
			}
			// Failed to get push token for push notification!
			if (finalStatus !== 'granted') return;
			token = ((await Notifications.getExpoPushTokenAsync()) || {}).data;
		}
		
		if (Platform.OS === 'android') {
			Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
			});
		}
		
		return token;
	}

	return (
		<NavigationContainer theme={{ colors: { background: colors.background }}}>
			<StatusBar barStyle="light-content" hidden={true} animated={true} translucent={true} backgroundColor="transparent" />
			<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.primary, borderBottomWidth: 3, borderBottomColor: colors.orange, elevation: 0, shadowOpacity: 0 }, headerTintColor: colors.white, headerTitleStyle: { fontSize: 18, fontWeight: "bold" } }}>
				<Stack.Screen name="Home" component={TabScreens} />
				<Stack.Screen name="Chapter" component={ChapterScreen} options={({ route }) => ({
					title: route.params.chapter.number + " - " + route.params.chapter.manga.name.slice(0, 13) + (route.params.chapter.manga.name.length > 13 ? "..." : "" ),
				})} />
				<Stack.Screen name="Manga" component={MangaScreen} options={({ route }) => ({
					title: route.params.manga.name
				})} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}


export default App;