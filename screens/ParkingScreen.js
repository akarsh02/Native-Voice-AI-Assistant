import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';

const mockSpots = [
  { id: '1', title: 'Golden Gate Park (Free)', coords: { latitude: 37.7694, longitude: -122.4862 } },
  { id: '2', title: 'Ocean Beach Parking', coords: { latitude: 37.7610, longitude: -122.5110 } },
];

export default function ParkingScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        customMapStyle={darkMapStyle}
      >
        {mockSpots.map(spot => (
          <Marker key={spot.id} coordinate={spot.coords}>
            <View style={styles.marker}>
               <MapPin size={24} color="#FFD700" />
            </View>
          </Marker>
        ))}
      </MapView>
      <View style={styles.overlay}>
         <Text style={styles.overlayTitle}>Parking Radar</Text>
         <Text style={styles.overlayText}>Scanning San Francisco for free spots...</Text>
      </View>
    </View>
  );
}

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  // ... simplified dark style
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { width: '100%', height: '100%' },
  marker: { backgroundColor: '#000', padding: 6, borderRadius: 10, borderWidth: 1, borderColor: '#FFD700' },
  overlay: { position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: '#050505CC', padding: 20, borderRadius: 20, backdropFilter: 'blur(10px)', borderWidth: 1, borderColor: '#333' },
  overlayTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', textTransform: 'uppercase' },
  overlayText: { color: '#FFD700', fontSize: 12, fontWeight: '700', marginTop: 4 },
});
