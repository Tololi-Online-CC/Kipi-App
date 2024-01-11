import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text } from '../components/Themed';
import { View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Disclaimer</Text>
      <Text>{"\n"}</Text> */}
      <Text style={styles.paragraph}>
      1. <Text style={styles.bold}>Confidentiality:</Text> The data presented in Kipi is confidential and proprietary to the company. Unauthorized access, use, or disclosure of this data is strictly prohibited.
      </Text>
      <Text style={styles.paragraph}>
      2. <Text style={styles.bold}>Authorized Users Only:</Text> Access to Kipi is restricted to authorized users with explicit permission to view and interact with the company's confidential data. Unauthorized access is a violation of company policy and may result in legal action.
      </Text>
      <Text style={styles.paragraph}>
      3. <Text style={styles.bold}>Limited Liability:</Text> The company and the developers of Kipi are not liable for any loss, damage, or inconvenience caused by the use of inaccurate or incomplete data. Users are responsible for validating and verifying the data before making any decisions based on the information presented.
      </Text>
      <Text style={styles.paragraph}>
      4. <Text style={styles.bold}>Data Security:</Text> Kipi employs security measures to protect the confidentiality of company data. Users are urged to follow best practices for information security and report any suspicious activities or vulnerabilities to the designated authorities.
      </Text>
      <Text style={styles.paragraph}>
      5. <Text style={styles.bold}>Data Ownership:</Text> Users acknowledge that all data accessed through Kipi remains the exclusive property of the company. Users have no ownership rights to the data, and any reproduction, distribution, or sharing of the data beyond Kipi's intended use is strictly prohibited.
      </Text>
      <Text style={styles.paragraph}>
      6. <Text style={styles.bold}>Compliance with Policies:</Text> Users must adhere to the company's data usage policies and guidelines when interacting with the data through Kipi. Violation of these policies may result in disciplinary actions, including termination of access and legal consequences.
      </Text>
      <Text style={styles.paragraph}>
      7. <Text style={styles.bold}>Indemnification:</Text> Users agree to indemnify and hold harmless the company, its officers, employees, and developers of Kipi from any claims, losses, or damages arising from unauthorized use or disclosure of confidential data.
      </Text>
      <Text style={styles.paragraph}>
      By using Kipi, you acknowledge that you have read, understood, and agreed to the terms and conditions outlined in this disclaimer. If you do not agree with these terms, refrain from using Kipi and promptly notify the appropriate company authorities.
      </Text>

      {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
      {/* <EditScreenInfo path="app/modal.tsx" /> */}

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      {/* <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    marginTop: 25,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0)'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
