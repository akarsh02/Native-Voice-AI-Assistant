import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, TextInput, ActivityIndicator, Animated } from 'react-native';
import { ShieldCheck, X, CreditCard, Zap, Bell, Sparkles } from 'lucide-react-native';

export default function CheckoutModal({ visible, onClose, onUpgrade }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePress = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgrade();
    }, 2500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.header}>
             <View style={styles.iconBox}>
                <ShieldCheck size={32} color="#000" strokeWidth={3} />
             </View>
             <Text style={styles.title}>Upgrade to Radar Pro</Text>
             <Text style={styles.subtitle}>Unlock real-time stock alarms, unlimited AI scans, and advanced radars.</Text>
          </View>

          <View style={styles.pricingBox}>
             <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Yearly Access</Text>
                <Text style={styles.pricingValue}>$19.99/mo</Text>
             </View>
             <Text style={styles.pricingPromo}>ALL TOOLS UNLOCKED</Text>
          </View>

          <View style={styles.form}>
             <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput placeholder="xxxx xxxx xxxx 4242" placeholderTextColor="#444" style={styles.input} />
             </View>
             <View style={{ flexDirection: 'row', gap: 15 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                   <Text style={styles.label}>Expiry</Text>
                   <TextInput placeholder="MM/YY" placeholderTextColor="#444" style={styles.input} />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                   <Text style={styles.label}>CVC</Text>
                   <TextInput placeholder="***" placeholderTextColor="#444" style={styles.input} />
                </View>
             </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handlePress} disabled={isProcessing}>
             {isProcessing ? (
                <ActivityIndicator color="#000" />
             ) : (
                <Text style={styles.buttonText}>Activate Pro Status</Text>
             )}
          </TouchableOpacity>

          <Text style={styles.footer}>Secure encrypted payment. Cancel anytime.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20 },
  modal: { backgroundColor: '#111', borderRadius: 32, padding: 30, borderWidth: 1, borderColor: '#333', position: 'relative' },
  closeBtn: { position: 'absolute', top: 20, right: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  iconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#00FF41', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '900', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  pricingBox: { backgroundColor: '#1A1A1A', padding: 20, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: '#222' },
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  pricingLabel: { color: '#888', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  pricingValue: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  pricingPromo: { color: '#00FF41', fontWeight: '900', fontSize: 10, tracking: 1 },
  form: { gap: 15, marginBottom: 30 },
  inputGroup: { gap: 6 },
  label: { fontSize: 10, color: '#555', fontWeight: '900', textTransform: 'uppercase' },
  input: { backgroundColor: '#0A0A0A', padding: 15, borderRadius: 12, color: '#FFF', borderWidth: 1, borderColor: '#222' },
  button: { backgroundColor: '#00FF41', padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#000', fontWeight: '900', fontSize: 16, textTransform: 'uppercase' },
  footer: { textAlign: 'center', color: '#444', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginTop: 20 },
});
