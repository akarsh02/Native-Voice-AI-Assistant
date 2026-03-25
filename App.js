import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Linking, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import * as Notifications from 'expo-notifications';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const functionDeclarations = [
  {
    name: "open_app",
    description: "Launch native mobile apps like YouTube, WhatsApp, or Instagram directly.",
    parameters: {
      type: "object",
      properties: { app_name: { type: "string", description: "Target app name like youtube, whatsapp, instagram, facebook" } },
      required: ["app_name"],
    },
  },
  {
    name: "open_gallery",
    description: "Physically opens the user's photo gallery on their phone.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_market_price",
    description: "Get the live price of gold, silver, or specific stocks.",
    parameters: {
      type: "object",
      properties: { asset: { type: "string", description: "The name of the asset, e.g., Gold, TSLA, Apple" } },
      required: ["asset"],
    },
  },
  {
    name: "calculate_math",
    description: "Evaluates a mathematical expression.",
    parameters: {
      type: "object",
      properties: { expression: { type: "string", description: "Math expression, e.g., 7+8" } },
      required: ["expression"],
    },
  },
  {
    name: "schedule_reminder",
    description: "Schedules a local notification reminder. Use this when the user asks to be reminded about a daily routine or task.",
    parameters: {
      type: "object",
      properties: { 
        title: { type: "string", description: "Title of the reminder" },
        body: { type: "string", description: "Body/details text of the reminder" },
        seconds_from_now: { type: "number", description: "How many seconds from now to show the reminder. Calculate based on the user's requested time." }
      },
      required: ["title", "body", "seconds_from_now"],
    },
  },
  {
    name: "read_clipboard",
    description: "Reads the text currently stored in the device's clipboard. Use this when the user asks to summarize, translate, or interact with text they just copied.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_location",
    description: "Gets the user's current GPS location coordinates (latitude, longitude). Use this when the user asks about their surrounding area, weather, or needs location context.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_calendar_events",
    description: "Fetches today's events from the user's default device calendar. Use this when the user asks about their schedule.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "create_calendar_event",
    description: "Creates a new event in the user's default calendar. Use this to schedule meetings or tasks.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Title of the event" },
        startDateISO: { type: "string", description: "ISO 8601 formatted start date and time" },
        endDateISO: { type: "string", description: "ISO 8601 formatted end date and time" }
      },
      required: ["title", "startDateISO", "endDateISO"],
    },
  },
  {
    name: "save_memory",
    description: "Saves a piece of information permanently to the Assistant's brain (e.g., 'my wife's favorite color is blue', 'wifi password is 123').",
    parameters: {
      type: "object",
      properties: {
        key: { type: "string", description: "A simple, snake_case key to organize this memory (e.g., 'wife_favorite_color')" },
        value: { type: "string", description: "The actual information to remember" }
      },
      required: ["key", "value"],
    },
  },
  {
    name: "recall_memory",
    description: "Recalls a saved piece of information from the Assistant's brain using the key. Provide the key to fetch facts you previously memorized.",
    parameters: {
      type: "object",
      properties: {
        key: { type: "string", description: "The snake_case key you used to save the memory" }
      },
      required: ["key"],
    },
  }
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('AIzaSyB-QUm5m49OSv3dX-GU-JGuujMEX-kiJrk');
  const [isListening, setIsListening] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(-2);
  const [sweetVoiceId, setSweetVoiceId] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening && volume > 0) {
      Animated.timing(pulseAnim, {
        toValue: 1 + (volume / 20),
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [volume, isListening]);

  const chatSession = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (apiKey) {
      const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [{ functionDeclarations }],
        systemInstruction: "You are a helpful mobile AI assistant. Your name is Assistant. When the user asks a general question (like 'famous movies', 'how to code', 'capital of France'), answer it directly using your incredibly vast, built-in LLM knowledge. DO NOT trigger a tool unless the user explicitly asks for a device action (like 'Open YouTube', 'Set a reminder', 'What is my location'). Be concise, as your response will be spoken out loud.",
      });
      chatSession.current = model.startChat({});
      addMessage("AI", "Hello! I am your Native Mobile Agent. Ask me to open your gallery, calculate math, check today's gold price, or set a daily routine reminder!");
    }
  }, [apiKey]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS !== 'web') {
        const { status: notifStatus } = await Notifications.requestPermissionsAsync();
        if (notifStatus !== 'granted') {
          console.warn('Notifications permissions not granted');
        }
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
          console.warn('Location permissions not granted');
        }
        const { status: calStatus } = await Calendar.requestCalendarPermissionsAsync();
        if (calStatus !== 'granted') {
          console.warn('Calendar permissions not granted');
        }
      } else {
        Location.requestForegroundPermissionsAsync().catch(e => console.warn(e));
      }

      // Find a sweet/female voice natively
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const preferred = ['samantha', 'female', 'karen', 'moira', 'victoria', 'siri'];
        let selected = null;
        for (const name of preferred) {
          const found = voices.find(v => 
            (v.name && v.name.toLowerCase().includes(name)) || 
            (v.identifier && v.identifier.toLowerCase().includes(name))
          );
          if (found) {
            selected = found.identifier;
            break;
          }
        }
        if (selected) setSweetVoiceId(selected);
      } catch (e) {
        console.warn('Error fetching voices:', e);
      }
    };
    requestPermissions();
  }, []);

  // Handle Speech Recognition Events
  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    // Auto-restart if in continuous mode and not processing an AI request
    if (continuousMode && !isProcessing) {
      setTimeout(() => startListening(), 1000);
    }
  });
  
  useSpeechRecognitionEvent("volumechange", (event) => {
    setVolume(event.value);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const currentTranscript = event.results[event.results.length - 1]?.transcript || '';
    setTranscript(currentTranscript);
    
    // Check for wake word "hey assistant"
    const lower = currentTranscript.toLowerCase();
    const wakeWord = 'hey assistant';
    
    if (event.isFinal) {
      if (lower.includes(wakeWord)) {
        const commandIndex = lower.indexOf(wakeWord) + wakeWord.length;
        const command = currentTranscript.substring(commandIndex).trim();
        
        if (command.length > 2) {
          ExpoSpeechRecognitionModule.stop();
          setTranscript('');
          handleVoiceCommand(command);
        }
      } else if (!continuousMode && currentTranscript.length > 0) {
        // If not continuous (tap to speak), process anything said
        ExpoSpeechRecognitionModule.stop();
        setTranscript('');
        handleVoiceCommand(currentTranscript);
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("Speech Error:", event.error, event.message);
    if (event.error === 'no-speech' && continuousMode && !isProcessing) {
      setTimeout(() => startListening(), 1000); // Restart listening loop
    }
  });

  const startListening = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      alert("Microphone permission required for voice commands.");
      return;
    }
    
    // Stop any ongoing speech before listening
    Speech.stop();
    
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: continuousMode,
      requiresOnDeviceRecognition: false,
      iosCategory: {
        category: "playAndRecord",
        categoryOptions: ["defaultToSpeaker", "allowBluetooth"],
        mode: "voiceChat", // Echo cancellation
      },
      iosVoiceProcessingEnabled: true,
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 100,
      },
      androidIntentOptions: {
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
      }
    });
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
    setContinuousMode(false);
  };

  const toggleContinuousMode = () => {
    const newMode = !continuousMode;
    setContinuousMode(newMode);
    if (newMode) {
      startListening();
    } else {
      stopListening();
    }
  };

  const speakText = (text) => {
    const options = {
      language: 'en-US',
      pitch: 1.1,
      rate: 0.95,
    };
    if (sweetVoiceId) {
      options.voice = sweetVoiceId;
    }
    Speech.speak(text.replace(/<[^>]*>?/gm, ''), options);
  };

  const addMessage = (role, text, imageUri = null) => {
    setMessages(prev => [...prev, { role, text, imageUri, id: Date.now().toString() + Math.random() }]);
    if (role === "AI" && text) {
      speakText(text);
    }
  };

  const handleFunctions = async (functionCall) => {
    console.log("Function Call:", functionCall.name, functionCall.args);
    let result = "";

    switch (functionCall.name) {
      case 'open_app':
        const appName = (functionCall.args.app_name || '').toLowerCase();
        let url = '';
        if (appName.includes('youtube')) url = 'vnd.youtube://';
        else if (appName.includes('whatsapp')) url = 'whatsapp://';
        else if (appName.includes('instagram')) url = 'instagram://app';
        else if (appName.includes('facebook')) url = 'fb://';
        else if (appName.includes('twitter')) url = 'twitter://';
        
        if (url) {
          speakText(`Opening ${appName}`);
          try {
            await Linking.openURL(url);
            result = `Successfully launched ${appName}.`;
          } catch (e) {
            result = `Failed to open ${appName}. App not installed on device.`;
          }
        } else {
          result = `I do not know how to open ${appName} yet.`;
        }
        break;
      case 'open_gallery':
        speakText("Opening your gallery now!");
        let pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
        if (!pickerResult.canceled) {
          result = "User successfully opened gallery and selected an image. The UI is displaying it.";
          addMessage("System", "Gallery opened. Image selected:", pickerResult.assets[0].uri);
        } else {
          result = "User closed the gallery without selecting an image.";
        }
        break;
      case 'get_market_price':
        const asset = (functionCall.args.asset || '').toLowerCase();
        let price = "$0.00";
        if (asset.includes('gold')) price = "₹72,500 per 10g";
        else if (asset.includes('silver')) price = "₹85,000 per kg";
        else price = "$180"; // Mock stock
        result = `The current live price for ${asset} is ${price}.`;
        break;
      case 'calculate_math':
        try {
          // eslint-disable-next-line no-eval
          const answer = eval(functionCall.args.expression);
          result = `The answer is ${answer}.`;
        } catch (e) {
          result = "Error calculating expression.";
        }
        break;
      case 'schedule_reminder':
        const { title, body, seconds_from_now } = functionCall.args;
        try {
          await Notifications.scheduleNotificationAsync({
            content: { title, body, sound: true },
            trigger: { seconds: seconds_from_now },
          });
          result = `Successfully scheduled reminder "${title}" to trigger in ${seconds_from_now} seconds.`;
          Speech.speak(`Okay, I've scheduled your reminder for ${title}.`);
        } catch (e) {
          result = "Failed to schedule reminder. " + e.message;
        }
        break;
      case 'read_clipboard':
        const hasString = await Clipboard.hasStringAsync();
        if (hasString) {
          const text = await Clipboard.getStringAsync();
          result = `Clipboard contents: "${text}"`;
        } else {
          result = "The clipboard is empty or does not contain text.";
        }
        break;
      case 'get_location':
        try {
          const loc = await Location.getCurrentPositionAsync({});
          result = `User's current coordinates: Latitude ${loc.coords.latitude}, Longitude ${loc.coords.longitude}.`;
          speakText("Checking your location now.");
        } catch (e) {
          result = "Could not access location data. " + e.message;
        }
        break;
      case 'get_calendar_events':
        try {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];
          if (!defaultCalendar) {
             result = "No calendars found on the device.";
             break;
          }
          const startDate = new Date();
          startDate.setHours(0,0,0,0);
          const endDate = new Date();
          endDate.setHours(23,59,59,999);
          const events = await Calendar.getEventsAsync([defaultCalendar.id], startDate, endDate);
          result = `Today's events: ${JSON.stringify(events.map(e => ({title: e.title, start: e.startDate, end: e.endDate})))}`;
        } catch (e) {
          result = "Failed to fetch calendar. " + e.message;
        }
        break;
      case 'create_calendar_event':
        try {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];
          const newEventId = await Calendar.createEventAsync(defaultCalendar.id, {
            title: functionCall.args.title,
            startDate: new Date(functionCall.args.startDateISO),
            endDate: new Date(functionCall.args.endDateISO),
          });
          result = `Successfully created event "${functionCall.args.title}".`;
          speakText(`I have scheduled ${functionCall.args.title} on your calendar.`);
        } catch (e) {
          result = "Failed to create event. " + e.message;
        }
        break;
      case 'save_memory':
        try {
          await AsyncStorage.setItem(functionCall.args.key, functionCall.args.value);
          result = `Successfully remembered ${functionCall.args.key} as ${functionCall.args.value}.`;
          speakText("Got it. I'll remember that for you.");
        } catch (e) {
          result = "Failed to save memory. " + e.message;
        }
        break;
      case 'recall_memory':
        try {
          const val = await AsyncStorage.getItem(functionCall.args.key);
          result = val ? `Memory found: ${val}` : `No memory found for key ${functionCall.args.key}`;
        } catch (e) {
          result = "Failed to recall memory. " + e.message;
        }
        break;
      default:
        result = "Function not recognized.";
    }

    return result;
  };

  const handleVoiceCommand = async (command) => {
    await processGeminiMessage(command);
  };

  const sendMessageText = async () => {
    if (!inputText.trim()) return;
    const msg = inputText;
    setInputText('');
    await processGeminiMessage(msg);
  };

  const processGeminiMessage = async (msg) => {
    addMessage("User", msg);

    if (!apiKey) {
      addMessage("AI", "Please paste your Gemini API Key in the top box first so I can think!");
      return;
    }

    setIsProcessing(true);
    setContinuousMode(false); // Pause auto-listening while processing
    ExpoSpeechRecognitionModule.stop();

    try {
      const result = await chatSession.current.sendMessage(msg);
      const call = result.response.functionCalls()?.[0];

      let aiResponseText = "";
      if (call) {
        addMessage("AI", `[Triggering Native Tool: ${call.name}]`);
        const funcResult = await handleFunctions(call);
        
        // Return function callback to Gemini for finalized answer
        const toolResp = await chatSession.current.sendMessage([{
          functionResponse: { name: call.name, response: { result: funcResult } }
        }]);
        aiResponseText = toolResp.response.text();
        addMessage("AI", aiResponseText);
      } else {
        aiResponseText = result.response.text();
        addMessage("AI", aiResponseText);
      }
      
      // Auto resume listening if we had it completely toggled on via a preference
      // For now, let's keep it safe: they tap to speak or toggle it again
    } catch (e) {
      addMessage("AI", "Network or API Error: " + e.message);
    }
    setIsProcessing(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.header}>AI Voice Assistant</Text>
      
      {!apiKey && (
         <TextInput 
           style={styles.keyInput} 
           placeholder="Paste Gemini API Key here to activate..." 
           placeholderTextColor="#888"
           onChangeText={setApiKey} 
           secureTextEntry 
         />
      )}

      <View style={styles.voiceControlBar}>
        <TouchableOpacity 
          style={[styles.listenBtn, isListening ? styles.listeningBtnActive : null]}
          onPress={isListening ? stopListening : () => { setContinuousMode(false); startListening(); }}
        >
          {isListening && volume > 0 && (
             <Animated.View
               style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}
             />
          )}
          <Text style={styles.listenBtnText}>{isListening ? "Listening..." : "Tap to Speak"}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toggleBtn, continuousMode ? styles.toggleBtnActive : null]}
          onPress={toggleContinuousMode}
        >
          <Text style={styles.toggleBtnText}>{continuousMode ? "'Hey Assistant' ON" : "'Hey Assistant' OFF"}</Text>
        </TouchableOpacity>
      </View>

      {transcript ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptText}>"{transcript}"</Text>
        </View>
      ) : null}

      <ScrollView 
        style={styles.chatArea}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.role === 'User' ? styles.userBubble : styles.aiBubble]}>
            <Text style={styles.roleText}>{m.role}</Text>
            {m.text ? <Text style={styles.messageText}>{m.text}</Text> : null}
            {m.imageUri && <Image source={{ uri: m.imageUri }} style={styles.previewImage} />}
          </View>
        ))}
        {isProcessing && <ActivityIndicator size="small" color="#00ff00" style={{ margin: 20 }}/>}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Or type a message..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessageText}>
          <Text style={styles.btnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingTop: 60, paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: '800', color: '#FFF', textAlign: 'center', marginBottom: 20 },
  keyInput: { backgroundColor: '#1A1A1A', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  voiceControlBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  listenBtn: { backgroundColor: '#2563EB', flex: 1, marginRight: 10, padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  listeningBtnActive: { backgroundColor: '#DC2626' },
  listenBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, zIndex: 2 },
  pulseRing: { position: 'absolute', width: '100%', height: '100%', backgroundColor: '#EF4444', borderRadius: 12, zIndex: 1 },
  toggleBtn: { backgroundColor: '#1F2937', padding: 16, borderRadius: 12, justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: '#10B981' },
  toggleBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  transcriptBox: { backgroundColor: '#1A1A1A', padding: 12, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  transcriptText: { color: '#9CA3AF', fontStyle: 'italic' },
  chatArea: { flex: 1, marginBottom: 15 },
  bubble: { padding: 16, borderRadius: 18, marginBottom: 15, maxWidth: '85%' },
  userBubble: { backgroundColor: '#2563EB', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#27272A', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  roleText: { color: '#A1A1AA', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' },
  messageText: { color: '#FAFAFA', fontSize: 16, lineHeight: 24 },
  previewImage: { width: 220, height: 220, borderRadius: 12, marginTop: 10 },
  inputArea: { flexDirection: 'row', marginBottom: 30 },
  input: { flex: 1, backgroundColor: '#1A1A1A', color: '#fff', padding: 16, borderRadius: 24, marginRight: 10, borderWidth: 1, borderColor: '#27272A' },
  sendBtn: { backgroundColor: '#10B981', justifyContent: 'center', paddingHorizontal: 24, borderRadius: 24 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
