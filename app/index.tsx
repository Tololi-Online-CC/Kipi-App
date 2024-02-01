import { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, TextInput, Image, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from "react-native";
import { router } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';


interface SheetData {
    range: string;
    majorDimension: string;
    values: Array<Array<string>>;
}

export default function Login() {

    const [passwordList, setPasswordList] = useState<SheetData | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const fetchData = async (sheetName: string, setDataFunction: React.Dispatch<React.SetStateAction<SheetData | null>>) => {
        try {
            const response = await axios.get<SheetData>(
                `https://sheets.googleapis.com/v4/spreadsheets/12QHibGovQw1GcadvE9ktOx3bfImMOxL3NASpZLpFLF8/values/${sheetName}?valueRenderOption=FORMATTED_VALUE&key=AIzaSyBi1vBNxajCCA26JnTVZBv80rZ12bufTkA`
            );

            response.data.values = response.data.values.slice(1);

            setDataFunction(response.data);
            await AsyncStorage.setItem(`${sheetName}Data`, JSON.stringify(response.data));
        } catch (error) {
            console.error(`Error fetching ${sheetName} data:`, error);
        }
    };

    const loadData = async (sheetName: string, setDataFunction: React.Dispatch<React.SetStateAction<SheetData | null>>) => {
        try {
            const storedData = await AsyncStorage.getItem(`${sheetName}Data`);
            if (storedData) {
                setDataFunction(JSON.parse(storedData));
            }
        } catch (error) {
            console.error(`Error loading ${sheetName} data from AsyncStorage:`, error);
        }
    };

    const checkInternetConnectivity = async () => {
        const netInfo = await NetInfo.fetch();
        return netInfo.isConnected;
    };

    useEffect(() => {
        const fetchDataAndLoad = async () => {
            await fetchData('Sheet1', setPasswordList);
            loadData('Sheet1', setPasswordList);
        };

        fetchDataAndLoad();

        const networkListener = NetInfo.addEventListener((state) => {
            if (state.isConnected) {
                fetchDataAndLoad();
            }
        });

        return () => networkListener();
    }, []);


    function checkCredentials(email: string, password: string, passwordList: SheetData) {
        for (let i = 0; i < passwordList.values.length; i++) {
            const row = passwordList.values[i];
            if (row[0].trim() === email.trim() && row[1].trim() === password.trim()) {
                return true;
            }
        }
        return false;
    }


    const handleLogin = () => {
        try {
            // Check if both email and phone number are entered
            if (email && password) {
                // Perform login logic
                passwordList && (
                    checkCredentials(email, password, passwordList) === true ? router.push("/(tabs)") : Alert.alert("Incorrect Credentials") 
                )
            } else {
                Alert.alert("Please enter both Email and Phone Number");
            }
        } catch (err) {
            console.log(err);
            Alert.alert("Login failed");
        }

        // passwordList && console.log(passwordList)

    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingContainer}
            >

                <View style={styles.header}>
                    <Image
                        source={require('./../assets/images/icon.png')}
                        style={styles.profileImage}
                        resizeMode="cover"
                    />
                </View>

                <TextInput
                    style={styles.card}
                    placeholder="Email"
                    keyboardType="email-address"
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                />
                <TextInput
                    style={styles.card}
                    placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                />
                <TouchableOpacity style={styles.loginCard} onPress={handleLogin}>
                    <Text style={styles.cardTitle}>Login</Text>
                </TouchableOpacity>

            </KeyboardAvoidingView>

        </ScrollView>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 16,
        alignItems: "center",
        // justifyContent: "center",
    },
    keyboardAvoidingContainer: {
        // flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        alignItems: 'center',
        marginTop: 120,
    },
    profileImage: {
        width: 160,
        height: 160,
        borderRadius: 80,
        marginBottom: 60,
        // borderWidth: 1,
        // borderColor: "#c1d1d1",
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
        height: 55,
        width: "90%",
        fontSize: 18,
        color: "black"
    },
    cardTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    loginCard: {
        backgroundColor: 'black',
        color: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
        height: 55,
        width: "90%",
        fontSize: 18,
    },
});