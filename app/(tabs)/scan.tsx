
import { StyleSheet, Text, View } from 'react-native';

export default function ScanScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Scanner</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }, // Dark for scan usually
    text: { fontSize: 20, fontFamily: 'Outfit_600SemiBold', color: '#fff' },
});
