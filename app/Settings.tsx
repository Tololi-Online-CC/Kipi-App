import { ScrollView, View, Text, TextInput, Image, StyleSheet, Button } from "react-native";

export default function Settings() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require('./../assets/images/icon.png')}
                    style={styles.profileImage}
                    resizeMode="contain"
                />
            </View>

            <TextInput style={styles.card} placeholder="Email" />
            <TextInput style={styles.card} placeholder="Phone Number" />

            <Text style={styles.cardTitle}>Change Password</Text>

            <TextInput style={styles.card} placeholder="Current Password" />
            <TextInput style={styles.card} placeholder="New Password" />
            <TextInput style={styles.card} placeholder="Confirm Password" />

            <Button title="Save Settings" onPress={() => { }}></Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 16,
        alignItems: "center"
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: "#c1d1d1",
    },
    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        elevation: 2,
        height: 55,
        width: "90%",
        fontSize: 18,
        color: "black"
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 25,
        marginBottom: 15,
    },
});