import React, {useEffect, useState} from 'react';
import {
    View,
    Modal,
    Text,
    Button,
    Switch, RefreshControl, FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "../assets/styles/styles";
import colors from "../assets/styles/colors";


const ChapterSettings = ({ visible, setVisible, settingsChanged }) => {
    const [doublePageEnabled, setDoublePageEnabled] = useState(true);
    const [japReadEnabled, setJapReadEnabled] = useState(false);
    const [verticalReadEnabled, setVerticalReadEnabled] = useState(false);
    const saveSettings = async () => {
        try {
            await AsyncStorage.setItem('doublePageEnabled', doublePageEnabled.toString());
            await AsyncStorage.setItem('japReadEnabled', japReadEnabled.toString());
            await AsyncStorage.setItem('verticalReadEnabled', verticalReadEnabled.toString());
        } catch (err) { console.error(err); }
    }
    const loadSettings = async () => {
        try {
            setDoublePageEnabled(await AsyncStorage.getItem('doublePageEnabled') === "true");
            setJapReadEnabled(await AsyncStorage.getItem('japReadEnabled') === "true");
            setVerticalReadEnabled(await AsyncStorage.getItem('verticalReadEnabled') === "true");
        } catch(err) { console.error(err); }
    }
    useEffect(() => {
        loadSettings().catch(console.error);
    }, []);
    useEffect(() => settingsChanged("doublepage", doublePageEnabled), [doublePageEnabled]);
    useEffect(() => settingsChanged("japread", japReadEnabled), [japReadEnabled]);
    useEffect(() => { settingsChanged("readstyle", verticalReadEnabled); setJapReadEnabled(false); }, [verticalReadEnabled]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType={'slide'}
        >
            <View style={[styles.fullContainer, styles.settingsContainer]}>
                <Text style={[styles.text, styles.settingsTitle]}>PARAMÈTRES</Text>
                <SettingItem title={"Doubles-pages en paysage"} value={doublePageEnabled} setValue={setDoublePageEnabled} disabled={verticalReadEnabled}/>
                <SettingItem title={"Lecture japonaise"} value={japReadEnabled} setValue={setJapReadEnabled} disabled={verticalReadEnabled} />
                <SettingItem title={"Lecture verticale"} value={verticalReadEnabled} setValue={setVerticalReadEnabled} disabled={false} />
                <View style={styles.settingsClose}>
                    <Button
                        title="Fermer"
                        onPress={() => { setVisible(false); saveSettings().catch(console.error); }}
                        color={colors.orange}
                    />
                </View>
            </View>
        </Modal>
    );
}

const SettingItem = ({ title, value, setValue, disabled }) => {
    return(
        <View style={styles.settingsItemContainer}>
            <Text style={[styles.text, styles.settingsItemText]}>{title}</Text>
            <Switch
                trackColor={disabled ? { false: colors.secondary, true: colors.secondary } : { false: colors.white, true: colors.orange }}
                thumbColor={disabled ? colors.secondary : value ? colors.orange : colors.white}
                ios_backgroundColor={colors.secondary}
                onValueChange={() => setValue(previousState => !previousState)}
                value={value}
                style={styles.settingsItemSwitch}
                disabled={disabled}
            />
        </View>
    );
}


module.exports = ChapterSettings;