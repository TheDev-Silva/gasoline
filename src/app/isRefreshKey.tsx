import React, { useState, useEffect } from 'react';
import { FlatList, Text, View, RefreshControl, StyleSheet } from 'react-native';
import useFuelPrices from './context/fuelPriceAPI';


const FuelPricesPage = () => {
    const { fuelPrices, fetchFuelPrices, refresh } = useFuelPrices();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Função para lidar com o pull-to-refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        refresh(); // Incrementa o refreshKey no contexto
        await fetchFuelPrices(); // Recarrega os dados
        setIsRefreshing(false); // Finaliza o loading
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={fuelPrices}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemText}>{item.name}: {item.price}</Text>
                    </View>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#6200EE']} // Cor do indicador no Android
                        tintColor="#6200EE" // Cor do indicador no iOS
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        Nenhum preço de combustível encontrado.
                    </Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    itemContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    itemText: {
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#999',
    },
});

export default FuelPricesPage;
