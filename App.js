import React, { useEffect } from 'react';
import {
	StatusBar,
	Image
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import colors from './assets/styles/colors';
import styles from './assets/styles/styles';
import secrets from './config/secrets';
import { HomeScreen, ChapterScreen, MangaScreen, AboutScreen, MangasScreen, FollowsScreen } from './components/screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Notifications } from "expo/build/deprecated.web";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { post } from 'axios';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function getTabIcon(route, focused) {
	let icon_image;
	switch (route) {
		case "Mangas": icon_image = focused ? require(`./assets/img/listfilled_tabicon.png`) : require(`./assets/img/list_tabicon.png`); break;
		case "Follows": icon_image = focused ? require(`./assets/img/bookmark_filled.png`) : require(`./assets/img/bookmark.png`); break;
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
			<Tab.Screen name="Mangas" component={MangasScreen} />
			<Tab.Screen name="About" component={AboutScreen} options={{ title: 'À propos' }} />
		</Tab.Navigator>
	);
}

const App = () => {
	useEffect(() => {
    	Image.resolveAssetSource({uri: './assets/img/homefilled_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/home_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/listfilled_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/list_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/infofilled_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/info_tabicon.png'});
    	Image.resolveAssetSource({uri: './assets/img/bookmark_filled.png'});
    	Image.resolveAssetSource({uri: './assets/img/bookmark.png'});

		initPushNotifs();
	}, []);
	

	const initPushNotifs = async () => {
		let tokenShared;
		try {
			tokenShared = (await AsyncStorage.getItem('tokenShared')) === "true";
		} catch (err) { console.error(err); }
		if (!tokenShared) {
			Notifications.getExpoPushTokenAsync().then(token => {
				post(secrets.sf_api.url + "users/token", {
					token: token
				}, {
					headers: { Authorization: `Bearer ${secrets.sf_api.token}` }
				}).finally(async () => {
					try {
						await AsyncStorage.setItem('tokenShared', "true");
					} catch (err) { console.error(err); }
				});
			}).catch(console.error);
		}
	};

	return (
		<NavigationContainer theme={{ colors: { background: colors.background }}}>
			<StatusBar barStyle="light-content" hidden={true} animated={true} translucent={true} backgroundColor="transparent" />
			<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.primary, borderBottomWidth: 3, borderBottomColor: colors.orange, elevation: 0, shadowOpacity: 0 }, headerTintColor: colors.white, headerTitleStyle: { fontSize: 18, fontWeight: "bold" } }}>
				<Stack.Screen name="Home" component={TabScreens} />
				<Stack.Screen name="Chapter" component={ChapterScreen} options={({ route }) => ({
					title: route.params.chapter.number + " - " + route.params.chapter.manga.name.slice(0, 15) + (route.params.chapter.manga.name.length > 15 ? "..." : "" ),
					// headerShown: false
				})} />
				<Stack.Screen name="Manga" component={MangaScreen} options={({ route }) => ({
					title: route.params.manga.name
				})} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}


export default App;