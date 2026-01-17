
import { StyleSheet, Text, View } from 'react-native';

export default function CartonsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Mes Cartons</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FB' },
    text: { fontSize: 20, fontFamily: 'Outfit_600SemiBold', color: '#000833' },
});
