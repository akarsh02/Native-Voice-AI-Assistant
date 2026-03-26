import React from 'react';
import { StyleSheet, Text, View, ScrollView, Animated } from 'react-native';
import { Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react-native';

const mockOptions = [
  { id: '1', ticker: 'NVDA', type: 'CALL', strike: '950', expiry: 'Apr 19', value: '$1.2M', sentiment: 'Bullish' },
  { id: '2', ticker: 'TSLA', type: 'PUT', strike: '160', expiry: 'May 17', value: '$850K', sentiment: 'Bearish' },
  { id: '3', ticker: 'AAPL', type: 'CALL', strike: '190', expiry: 'Jun 21', value: '$2.1M', sentiment: 'Bullish' },
  { id: '4', ticker: 'META', type: 'CALL', strike: '520', expiry: 'Apr 26', value: '$1.5M', sentiment: 'Bullish' },
];

export default function OptionsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Zap size={24} color="#00FF41" />
         <Text style={styles.title}>Options Radar</Text>
      </View>
      <ScrollView style={styles.feed}>
        {mockOptions.map((opt) => (
          <View key={opt.id} style={styles.card}>
            <View style={styles.cardHeader}>
               <Text style={styles.ticker}>{opt.ticker}</Text>
               <View style={[styles.badge, opt.sentiment === 'Bullish' ? styles.bullish : styles.bearish]}>
                  {opt.sentiment === 'Bullish' ? <TrendingUp size={12} color="#000" /> : <TrendingDown size={12} color="#FFF" />}
                  <Text style={[styles.badgeText, opt.sentiment === 'Bullish' ? {color: '#000'} : {color: '#FFF'}]}>{opt.sentiment}</Text>
               </View>
            </View>
            <View style={styles.details}>
               <View style={styles.detailItem}>
                 <Text style={styles.detailLabel}>Type</Text>
                 <Text style={styles.detailValue}>{opt.type}</Text>
               </View>
               <View style={styles.detailItem}>
                 <Text style={styles.detailLabel}>Strike</Text>
                 <Text style={styles.detailValue}>{opt.strike}</Text>
               </View>
               <View style={styles.detailItem}>
                 <Text style={styles.detailLabel}>Value</Text>
                 <Text style={styles.detailValue}>{opt.value}</Text>
               </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', tracking: -1, textTransform: 'uppercase' },
  feed: { flex: 1 },
  card: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  ticker: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bullish: { backgroundColor: '#00FF41' },
  bearish: { backgroundColor: '#DC2626' },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  details: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { gap: 4 },
  detailLabel: { fontSize: 10, color: '#666', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  detailValue: { fontSize: 14, color: '#EEE', fontWeight: '700' },
});
