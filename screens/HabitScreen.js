import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckCircle, Trophy, Flame, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const initialHabits = [
  { id: '1', name: 'Exercise', streak: 5, lastDone: '' },
  { id: '2', name: 'Read Finance News', streak: 12, lastDone: '' },
  { id: '3', name: 'Review Options Flow', streak: 3, lastDone: '' },
];

export default function HabitScreen() {
  const [habits, setHabits] = useState(initialHabits);

  const toggleHabit = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        return { ...h, streak: h.streak + 1 };
      }
      return h;
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Trophy size={24} color="#A855F7" />
         <Text style={styles.title}>Habit Tracker</Text>
      </View>
      
      <View style={styles.statRow}>
         <View style={styles.statBox}>
            <Flame size={20} color="#FF4500" />
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>MAX STREAK</Text>
         </View>
         <View style={styles.statBox}>
            <CheckCircle size={20} color="#00FF41" />
            <Text style={styles.statNum}>85%</Text>
            <Text style={styles.statLabel}>CONSISTENCY</Text>
         </View>
      </View>

      <ScrollView style={styles.list}>
        {habits.map(h => (
          <TouchableOpacity key={h.id} style={styles.card} onPress={() => toggleHabit(h.id)}>
             <View style={styles.cardInfo}>
                <Text style={styles.habitName}>{h.name}</Text>
                <View style={styles.streakRow}>
                   <Flame size={12} color="#A855F7" />
                   <Text style={styles.streakText}>{h.streak} day streak</Text>
                </View>
             </View>
             <View style={[styles.checkBtn, { backgroundColor: '#A855F722' }]}>
                <CheckCircle size={24} color="#A855F7" />
             </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addBtn}>
           <Plus size={24} color="#FFF" />
           <Text style={styles.addBtnText}>Add New Habit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', tracking: -1, textTransform: 'uppercase' },
  statRow: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statBox: { flex: 1, backgroundColor: '#111', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  statNum: { fontSize: 24, fontWeight: '900', color: '#FFF', marginVertical: 5 },
  statLabel: { fontSize: 10, color: '#666', fontWeight: '900' },
  list: { flex: 1 },
  card: { backgroundColor: '#111', borderRadius: 24, padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#222' },
  cardInfo: { gap: 6 },
  habitName: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakText: { color: '#A855F7', fontSize: 12, fontWeight: '700' },
  checkBtn: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#1A1A1A', padding: 20, borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: '#333', marginTop: 10 },
  addBtnText: { color: '#666', fontWeight: '800', fontSize: 14, textTransform: 'uppercase' },
});
