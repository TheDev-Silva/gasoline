import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, } from "react-native-reanimated";
import { FuelPrice } from "@/types/fuelPrice";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Dimensions, Linking, ScrollView } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import useFuelPrices from "../context/fuelPriceAPI";
import { fuelTypes } from "./welcome";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const URL_API_GASOLINE = process.env.BASE_URL_API_GASOLINE
const { height: screenHeight } = Dimensions.get("window");

export default function Profile() {
   const {
      fuelPrices,
      address,
      latitude, // Latitude atual do usuário
      longitude, // Longitude atual do usuário
      handleFetchLocation,
      isLoadingLocation,
   } = useFuelPrices();

   const [routeCoordinates, setRouteCoordinates] = useState([]);
   const [routeDistance, setRouteDistance] = useState<string | null>(null);
   const [routeDuration, setRouteDuration] = useState<string | null>(null);
   const [selectedGasStationId, setSelectedGasStationId] = useState<number | null>(null);
   const [selectedFuelStation, setSelectedFuelStation] = useState<FuelPrice | null>(null);
   const [isModalVisible, setIsModalVisible] = useState(false);
   const [isGeocodingDone, setIsGeocodingDone] = useState(false);
   const [validGeocodedData, setValidGeocodedData] = useState<FuelPrice[]
   >([]);
   const [isExpanded, setIsExpanded] = useState(false);
   const panelHeight = useSharedValue(50); // Altura inicial com apenas o ícone visível

   //const [isRotation, setIsRotation] = useState(true)


   const animatedStyle = useAnimatedStyle(() => ({
      height: panelHeight.value,
   }));


   const togglePanel = () => {
      panelHeight.value = withTiming(isExpanded ? 50 : Math.min(screenHeight * 0.5, 300), {
         duration: 300, // Duração da animação em milissegundos
      });
      setIsExpanded(!isExpanded);
   };


   const lastFuelPriceUser: FuelPrice | null =
      fuelPrices.length > 0
         ? [...fuelPrices].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
         )[0]
         : null;

   useEffect(() => {
      if (latitude !== null && longitude !== null) {
         handleFetchLocation(); // Obtém localização do usuário
      } else {
         Alert.alert("Erro", "Localização atual não disponível.");
      }
   }, [latitude, longitude]);

   useEffect(() => {
      if (!isGeocodingDone && fuelPrices.length > 0) {
         geocodeFuelPrices();
         setIsGeocodingDone(true); // Marca como concluído
      }
   }, [fuelPrices, isGeocodingDone]);

   const mapRef = useRef<MapView | null>(null);
   const adjustMapToRoute = (points: { latitude: number; longitude: number }[]) => {
      if (mapRef.current && points.length > 0) {
         mapRef.current.fitToCoordinates(points, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 }, // Aumente o espaçamento
            animated: true,
         });
      }
   };

   // Simulando coordenadas da rota
   React.useEffect(() => {
      if (routeCoordinates.length > 0) {
         adjustMapToRoute(routeCoordinates); // Ajustar o mapa à rota
      }
   }, [routeCoordinates]);





   const geocodeFuelPrices = async () => {
      const apiKey = "AIzaSyBiCdjL4WFleM7GYQWnpk4qo2piZ8k8N7A"; // Sua chave da API Google

      try {
         const geocodedData = await Promise.all(
            fuelPrices.map(async (fuelPrice) => {
               if (!fuelPrice.GasStation?.address) {
                  console.warn(`Endereço não disponível: ${JSON.stringify(fuelPrice)}`);
                  return null;
               }

               const encodedAddress = encodeURIComponent(fuelPrice.GasStation.address);

               try {
                  const response = await fetch(
                     `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
                  );
                  const data = await response.json();

                  if (data.results.length > 0) {
                     const { lat, lng } = data.results[0].geometry.location;

                     return {
                        ...fuelPrice,
                        latitude: lat,
                        longitude: lng,
                     };
                  } else {
                     console.warn(`Endereço não encontrado: ${fuelPrice.GasStation.address}`);
                     return null;
                  }
               } catch (error) {
                  //console.error(`Erro ao geocodificar o endereço: ${fuelPrice.GasStation.address}`, error);
                  return null;
               }
            })
         );

         const validData = geocodedData.filter(
            (item): item is Exclude<typeof item, null> => item !== null
         );

         setValidGeocodedData(validData); // Atualiza os dados válidos
      } catch (error) {
         console.error("Erro geral ao geocodificar endereços:", error);
      }
   };



   const fetchRoute = async (destination: { latitude: number; longitude: number }) => {

      //setIsRotation(true)


      try {
         if (latitude === null || longitude === null) {
            Alert.alert("Erro", "Localização atual não disponível.");
            return;
         }
         const apiKeyRoute = "AIzaSyBqXz88MXF38uOyoV_oTBzQo9-X1B_XY6o"; // Substitua pela sua chave da Google API
         const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKeyRoute}`
         );
         const data = await response.json();

         if (data.routes.length) {
            const points = decodePolyline(data.routes[0].overview_polyline.points);
            setRouteCoordinates(points as any);

            // Pegando distância e duração
            const routeLeg = data.routes[0].legs[0]; // Pega a primeira "leg" da rota
            setRouteDistance(routeLeg.distance.text); // Exemplo: "5.6 km"
            setRouteDuration(routeLeg.duration.text); // Exemplo: "12 min"
         } else {
            Alert.alert("Erro", "Não foi possível calcular a rota.");
         }
      } catch (error) {
         console.log(error);
      } finally {
         //setIsRotation(false)
      }


   };

   const decodePolyline = (t: string) => {
      let points = [];
      let index = 0,
         len = t.length;
      let lat = 0,
         lng = 0;

      while (index < len) {
         let b, shift = 0,
            result = 0;
         do {
            b = t.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
         } while (b >= 0x20);
         let dlat = result & 1 ? ~(result >> 1) : result >> 1;
         lat += dlat;

         shift = 0;
         result = 0;
         do {
            b = t.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
         } while (b >= 0x20);
         let dlng = result & 1 ? ~(result >> 1) : result >> 1;
         lng += dlng;

         points.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
         });
      }

      return points;
   };

   if (isLoadingLocation) {
      return <ActivityIndicator size="large" color="#0000ff" />;
   }

   if (latitude === null || longitude === null) {
      return <Text>Localização não disponível.</Text>;
   }

   const openModal = async (fuelStation: FuelPrice) => {
      await fetchRoute({
         latitude: fuelStation.latitude,
         longitude: fuelStation.longitude,
      });
      setSelectedFuelStation(fuelStation);
      setIsModalVisible(true);
      setSelectedGasStationId(fuelStation.gasStationId)
      if (!isExpanded) {
         togglePanel()
      }
   };


   const getFuelTypeName = (id: number | undefined): string => {
      const fuelType = fuelTypes.find((type) => type.id === id);
      return fuelType ? fuelType.name : 'Tipo não encontrado';
   };
   const createdAt = lastFuelPriceUser?.createdAt
      ? new Intl.DateTimeFormat('pt-BR', {
         dateStyle: 'short',
         timeStyle: 'short',
      }).format(new Date(lastFuelPriceUser.createdAt))
      : 'Data não disponível';

   const openGoogleMaps = (destination: { latitude: number; longitude: number }) => {
      if (latitude && longitude) {
         const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination.latitude},${destination.longitude}`;
         Linking.openURL(url).catch(err => console.error("Erro ao abrir o Google Maps: ", err));
      }
   };

   return (
      <GestureHandlerRootView style={{ flex: 1 }}>
         <View style={styles.container}>
            <Text style={styles.header}>Postos Próximos</Text>

            <MapView
               ref={mapRef}
               style={styles.map}
               initialRegion={{
                  latitude: latitude ?? 0,
                  longitude: longitude ?? 0,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
               }}
            /* onPress={() => { toggleModal() }} */
            >
               {/* Marker para a localização atual */}
               {latitude && longitude && (
                  <Marker
                     coordinate={{
                        latitude,
                        longitude,
                     }}
                     title={`Você está aqui: ${address}`}
                  />
               )}

               {/* Markers para os postos de combustível */}
               {validGeocodedData.map((fuelPrice, index) => {
                  /* if (
                    !fuelPrice.latitude ||
                    !fuelPrice.longitude ||
                    isNaN(fuelPrice.latitude) ||
                    isNaN(fuelPrice.longitude)
                  ) {
                    return null;
                  } */

                  return (
                     <Marker
                        key={index}
                        title={fuelPrice.GasStation.name}
                        coordinate={{
                           latitude: fuelPrice.latitude,
                           longitude: fuelPrice.longitude,
                        }}
                        pinColor="#1a1a1a"
                        onPress={() => openModal(fuelPrice)}
                     />
                  );
               })}

               {/* Linha que mostra a rota calculada */}
               {routeCoordinates.length > 0 && (
                  <Polyline
                     coordinates={routeCoordinates}
                     strokeWidth={4}
                     strokeColor="#1a1a"
                     tappable={true}
                     onPress={() => {
                        if (!isExpanded) {
                           togglePanel()
                        }; // Atualiza com base no posto associado à rota
                     }}
                  />
               )}
            </MapView>

            {/* Modal para informações do posto selecionado */}
            {isModalVisible && selectedFuelStation && (

               <View style={[styles.modalOverlay]}>

                  <Animated.View
                     style={[styles.modalContainer, animatedStyle]}
                  /* onLayout={(event) => {
                     const { height } = event.nativeEvent.layout;
                     setCalculatedHeight(height); // Atualiza a altura medida
                  }} */
                  >
                     <TouchableOpacity
                        onPress={togglePanel}
                        style={{ alignItems: "center", justifyContent: "center", paddingBottom: isExpanded ? 5 : -10,  }}
                     >
                        <Ionicons name={isExpanded ? 'arrow-down' : 'arrow-up'} size={24} color="black" style={{ textAlign: 'center' }} />
                     </TouchableOpacity>
                     {isExpanded ? (
                        <View style={{ flex: 1, width: 350 }}>
                           <View style={{ flexDirection: "column", flex: 1, width: '100%' }}>
                              <Text style={styles.modalTitle}>{selectedFuelStation?.GasStation.name || ""}</Text>
                              <Text style={styles.modalText}>Endereço: {selectedFuelStation?.GasStation.address || ""}</Text>
                              <View style={{flexDirection: 'row', justifyContent: "space-between"}}>
                                 <Text style={[styles.modalText, {fontWeight: 'bold'}]}><Text style={{fontWeight: '400'}}>Distância:</Text> {routeDistance || "Calculando..."}</Text>
                              <Text style={[styles.modalText, {fontWeight: 'bold'}]}><Text style={{fontWeight: '400'}}>Tempo:</Text> {routeDuration || "Calculando..."}</Text>
                              </View>
                              
                           </View>
                           <Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 5, marginBottom: 10 }}>
                              Preços e Combustíveis
                           </Text>
                           <View style={{ flex: 1 }}>
                              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                                 {fuelPrices
                                    .filter((item) => item.gasStationId === selectedGasStationId)
                                    .map((item) => (
                                       <View key={item.id} style={styles.fuelPriceContainer}>
                                          <Text style={styles.fuelType}>
                                             {getFuelTypeName(parseInt(item.fuelType))}
                                          </Text>
                                          <View style={styles.priceDetails}>
                                             <Text>R$ {item.price.toFixed(2)}</Text>
                                             <Text>{createdAt}</Text>
                                          </View>
                                       </View>
                                    ))}
                              </ScrollView>
                           </View>
                           <TouchableOpacity
                              style={styles.button}
                              onPress={() => openGoogleMaps({ latitude: selectedFuelStation.latitude, longitude: selectedFuelStation.longitude })}
                           >
                              <Text style={styles.buttonText}>Abrir no Google Maps</Text>
                           </TouchableOpacity>
                        </View>
                     ) : (
                        <View style={styles.icon}>
                           <Text></Text>
                        </View>
                     )}
                  </Animated.View>

                  {/* </PanGestureHandler> */}
               </View>

            )}
         </View>
         {/* {isRotation === true} */}
      </GestureHandlerRootView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
   },
   header: {
      fontSize: 18,
      marginTop: 100,
      position: "absolute",
   },
   map: {
      width: "100%",
      height: "100%",
   },
   infoBox: {
      position: "absolute",
      top: 60,
      left: 10,
      right: 10,
      backgroundColor: "white",
      padding: 10,
      borderRadius: 5,
      elevation: 3,
      zIndex: 10,
   },
   infoText: {
      fontSize: 16,
      color: "#333",
   },
   customTooltip: {
      width: "100%",
      backgroundColor: "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 5,
   },
   icon: {
      alignItems: "center",
      justifyContent: "center",
   },
   tooltipTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
      color: "#333",
   },
   tooltipText: {
      fontSize: 14,
      color: "#555",
      marginBottom: 3,
   },
   modalOverlay: {

      flex: 1,
      width: '100%',
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
   },
   modalContainer: {
      height: 500,
      width: "100%",
      backgroundColor: "#fff",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 5,
   },

   modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
   },
   modalText: {
      fontSize: 14,
      marginTop: 4,
   },
   button: {
      backgroundColor: "#1a1a1a", // Cor de fundo do botão
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
   },
   buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
   },

   scrollViewContainer: {
      paddingBottom: 10,
   },
   fuelPriceContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: 'center',
      padding: 5,
      borderWidth: 1,
      borderColor: "#c5c5c5",
      borderRadius: 5,
      marginBottom: 10,
   },
   fuelType: {
      fontWeight: "bold",
      textTransform: "uppercase",
      width: "50%",
   },
   priceDetails: {
      flexDirection: "column",
      alignItems: "flex-end",
   },


});
