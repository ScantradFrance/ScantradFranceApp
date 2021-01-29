import React, { useEffect } from 'react';
import {
	StatusBar,
	Image
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import colors from './assets/styles/colors';
import styles from './assets/styles/styles';
import { HomeScreen, ChapterScreen, MangaScreen, AboutScreen } from './components/screens';
const Stack = createStackNavigator();


const App = () => {
	useEffect(() => {
    	Image.resolveAssetSource({uri: './assets/img/flamme.png'});
	}, []);
	return (
		<NavigationContainer theme={{ colors: { background: colors.background }}}>
			<StatusBar barStyle="light-content" hidden={true} animated={true} translucent={true} backgroundColor="transparent"/>
			<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.primary, borderBottomWidth: 3, borderBottomColor: colors.orange, elevation: 0,	shadowOpacity: 0 }, headerTintColor: colors.white, headerTitleStyle: { fontSize: 18, fontWeight: "bold" }}}>
				<Stack.Screen name="Home" component={HomeScreen} options={{
					title: 'LES DERNIÈRES SORTIES',
					headerLeft: () => <Image style={styles.headerLeftImage} source={require('./assets/img/flamme.png')}/>
				}} />
				<Stack.Screen name="Chapter" component={ChapterScreen} options={({ route }) => ({
					title: route.params.chapter.number + " - " + route.params.chapter.manga.name
				})} />
				<Stack.Screen name="Manga" component={MangaScreen} options={({ route }) => ({
					title: route.params.manga.name
				})} />
				<Stack.Screen name="About" component={AboutScreen} options={{ title: 'À propos' }}/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}


export default App;