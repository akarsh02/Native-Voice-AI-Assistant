import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Briefcase, User, DollarSign, ArrowUpRight } from 'lucide-react-native';

const mockInsiders = [
  { id: '1', name: 'Jensen Huang', role: 'CEO', ticker: 'NVDA', type: 'BUY', amount: '$42M', date: '2h ago' },
  { id: '2', name: 'Tim Cook', role: 'CEO', ticker: 'AAPL', type: 'SELL', amount: '$12M', date: '5h ago' },
  { id: '3', name: 'Mark Zuckerberg', role: 'CEO', ticker: 'META', type: 'SELL', amount: '$85M', date: '1d ago' },
];

export default function InsiderScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Briefcase size={24} color="#00E5FF" />
         <Text style={styles.title}>Insider Radar</Text>
      </View>
      <ScrollView style={styles.feed}>
        {mockInsiders.map((trade) => (
          <View key={trade.id} style={styles.card}>
            <View style={styles.row}>
               <View style={styles.userIcon}>
                  <User size={20} color="#00E5FF" />
               </View>
               <View style={styles.userInfo}>
                  <Text style={styles.userName}>{trade.name}</Text>
                  <Text style={styles.userRole}>{trade.role} • {trade.date}</Text>
               </View>
               <View style={styles.tickerBadge}>
                  <Text style={styles.tickerText}>{trade.ticker}</Text>
               </View>
            </View>
            <View style={styles.stats}>
               <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Action</Text>
                  <Text style={[styles.statValue, trade.type === 'BUY' ? {color: '#00FF41'} : {color: '#FF4141'}]}>{trade.type}</Text>
               </View>
               <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Amount</Text>
                  <Text style={styles.statValue}>{trade.amount}</Text>
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
  card: { backgroundColor: '#111', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  userIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#00E5FF22', alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1, marginLeft: 16 },
  userName: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  userRole: { color: '#666', fontSize: 12, fontWeight: '600', marginTop: 2 },
  tickerBadge: { backgroundColor: '#222', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tickerText: { color: '#00E5FF', fontWeight: '900', fontSize: 12 },
  stats: { flexDirection: 'row', gap: 30, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 15 },
  statBox: { gap: 4 },
  statLabel: { fontSize: 10, color: '#555', fontWeight: '900', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: '900', color: '#EEE' },
});
