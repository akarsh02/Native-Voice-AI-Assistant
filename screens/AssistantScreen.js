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
import { startWakeWordService, stopWakeWordService } from '../WakeWordService';
import { Sparkles, Mic, MicOff, Send, MessageSquare, Terminal } from 'lucide-react-native';

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
  },
  {
    name: "create_task",
    description: "Creates a new to-do task and saves it persistently. Use when the user says 'add a task', 'remind me to do', 'create a to-do', etc.",
    parameters: {
      type: "object",
      properties: {
        task: { type: "string", description: "The task description to save" }
      },
      required: ["task"],
    },
  },
  {
    name: "list_tasks",
    description: "Lists all pending to-do tasks the user has created.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "complete_task",
    description: "Marks a specific task as done and removes it from the list.",
    parameters: {
      type: "object",
      properties: {
        task_index: { type: "number", description: "The index (1-based) of the task to mark as complete" }
      },
      required: ["task_index"],
    },
  },
  {
    name: "set_daily_reminder",
    description: "Schedules a recurring daily notification at a specific time (e.g., 'remind me every day at 8:30 AM').",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Title of the daily reminder" },
        hour: { type: "number", description: "Hour of the day (0-23)" },
        minute: { type: "number", description: "Minute of the hour (0-59)" }
      },
      required: ["title", "hour", "minute"],
    },
  },
];

export default function AssistantScreen() {
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
    startWakeWordService();
    return () => stopWakeWordService();
  }, []);

  useEffect(() => {
    if (apiKey) {
      const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
        model: "gemini-1.5-flash",
        tools: [{ functionDeclarations }],
        systemInstruction: "You are a helpful mobile AI assistant named Assistant. Your primary goal is to help the user manage their life through voice. \n\n1. For general knowledge, answer directly and concisely.\n2. For device actions (Open App, Gallery, GPS, Calendar, Math, Clipboard), use the specific tools provided.\n3. For management (Tasks, Memories, Daily Routines), use the appropriate storage tools. Proactively offer to 'save to memory' or 'add a task' if the user mentions something important. For daily routines, use 'set_daily_reminder' to ensure they get notified every day at the right time.\n\nKeep responses short and clear for voice output.",
      });
      chatSession.current = model.startChat({});
      if (messages.length === 0) {
        addMessage("AI", "Hello! I am your Native Mobile Agent. I can now manage your tasks, remember your preferences, and schedule your daily routine reminders. Try saying 'Hey Mobile, remind me every day at 7 AM to drink water'!");
      }
    }
  }, [apiKey]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS !== 'web') {
        const { status: notifStatus } = await Notifications.requestPermissionsAsync();
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        const { status: calStatus } = await Calendar.requestCalendarPermissionsAsync();
      }

      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const preferred = ['samantha', 'female', 'karen', 'moira', 'victoria', 'siri'];
        let selected = null;
        for (const name of preferred) {
          const found = voices.find(v => (v.name && v.name.toLowerCase().includes(name)) || (v.identifier && v.identifier.toLowerCase().includes(name)));
          if (found) { selected = found.identifier; break; }
        }
        if (selected) setSweetVoiceId(selected);
      } catch (e) {
        console.warn('Error fetching voices:', e);
      }
    };
    requestPermissions();
  }, []);

  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
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
    const lower = currentTranscript.toLowerCase();
    const wakeWord = 'hey mobile';
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
        ExpoSpeechRecognitionModule.stop();
        setTranscript('');
        handleVoiceCommand(currentTranscript);
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (event.error === 'no-speech' && continuousMode && !isProcessing) {
      setTimeout(() => startListening(), 1000);
    }
  });

  const startListening = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) return;
    Speech.stop();
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: continuousMode,
      requiresOnDeviceRecognition: false,
      iosCategory: {
        category: "playAndRecord",
        categoryOptions: ["defaultToSpeaker", "allowBluetooth"],
        mode: "voiceChat",
      },
      iosVoiceProcessingEnabled: true,
      volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
      androidIntentOptions: { EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 3000 }
    });
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
    setContinuousMode(false);
  };

  const toggleContinuousMode = () => {
    const newMode = !continuousMode;
    setContinuousMode(newMode);
    if (newMode) startListening();
    else stopListening();
  };

  const speakText = (text) => {
    const options = { language: 'en-US', pitch: 1.1, rate: 0.95 };
    if (sweetVoiceId) options.voice = sweetVoiceId;
    Speech.speak(text.replace(/<[^>]*>?/gm, ''), options);
  };

  const addMessage = (role, text, imageUri = null) => {
    setMessages(prev => [...prev, { role, text, imageUri, id: Date.now().toString() + Math.random() }]);
    if (role === "AI" && text) speakText(text);
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
        
        if (url) {
          speakText(`Opening ${appName}`);
          try { await Linking.openURL(url); result = `Successfully launched ${appName}.`; } 
          catch (e) { result = `Failed to open ${appName}. App not installed on device.`; }
        } else { result = `I do not know how to open ${appName} yet.`; }
        break;
      case 'open_gallery':
        speakText("Opening your gallery now!");
        let pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
        if (!pickerResult.canceled) {
          result = "User successfully opened gallery and selected an image. The UI is displaying it.";
          addMessage("System", "Gallery opened. Image selected:", pickerResult.assets[0].uri);
        } else result = "User closed the gallery without selecting an image.";
        break;
      case 'get_market_price':
        const asset = (functionCall.args.asset || '').toLowerCase();
        let price = asset.includes('gold') ? "₹72,500 per 10g" : (asset.includes('silver') ? "₹85,000 per kg" : "$180");
        result = `The current live price for ${asset} is ${price}.`;
        break;
      case 'calculate_math':
        try { const answer = eval(functionCall.args.expression); result = `The answer is ${answer}.`; } 
        catch (e) { result = "Error calculating expression."; }
        break;
      case 'schedule_reminder':
        const { title, body, seconds_from_now } = functionCall.args;
        try {
          await Notifications.scheduleNotificationAsync({ content: { title, body, sound: true }, trigger: { seconds: seconds_from_now } });
          result = `Successfully scheduled reminder "${title}" to trigger in ${seconds_from_now} seconds.`;
          speakText(`Okay, I've scheduled your reminder for ${title}.`);
        } catch (e) { result = "Failed to schedule reminder. " + e.message; }
        break;
      case 'read_clipboard':
        const hasString = await Clipboard.hasStringAsync();
        result = hasString ? `Clipboard contents: "${await Clipboard.getStringAsync()}"` : "The clipboard is empty.";
        break;
      case 'get_location':
        try {
          const loc = await Location.getCurrentPositionAsync({});
          result = `User's current coordinates: Latitude ${loc.coords.latitude}, Longitude ${loc.coords.longitude}.`;
          speakText("Checking your location now.");
        } catch (e) { result = "Could not access location data. " + e.message; }
        break;
      case 'get_calendar_events':
        try {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];
          if (!defaultCalendar) { result = "No calendars found."; break; }
          const startDate = new Date(); startDate.setHours(0,0,0,0);
          const endDate = new Date(); endDate.setHours(23,59,59,999);
          const events = await Calendar.getEventsAsync([defaultCalendar.id], startDate, endDate);
          result = `Today's events: ${JSON.stringify(events.map(e => ({title: e.title, start: e.startDate, end: e.endDate})))}`;
        } catch (e) { result = "Failed to fetch calendar. " + e.message; }
        break;
      case 'create_calendar_event':
        try {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];
          await Calendar.createEventAsync(defaultCalendar.id, { title: functionCall.args.title, startDate: new Date(functionCall.args.startDateISO), endDate: new Date(functionCall.args.endDateISO) });
          result = `Successfully created event "${functionCall.args.title}".`;
          speakText(`I have scheduled ${functionCall.args.title} on your calendar.`);
        } catch (e) { result = "Failed to create event. " + e.message; }
        break;
      case 'save_memory':
        try { await AsyncStorage.setItem(functionCall.args.key, functionCall.args.value); result = `Successfully remembered ${functionCall.args.key}.`; speakText("Got it. I'll remember that."); } 
        catch (e) { result = "Failed to save memory. " + e.message; }
        break;
      case 'recall_memory':
        try { const val = await AsyncStorage.getItem(functionCall.args.key); result = val ? `Memory found: ${val}` : `No memory found for key ${functionCall.args.key}`; } 
        catch (e) { result = "Failed to recall memory. " + e.message; }
        break;
      case 'create_task':
        try {
          const raw = await AsyncStorage.getItem('user_tasks');
          const tasks = raw ? JSON.parse(raw) : [];
          tasks.push({ task: functionCall.args.task, done: false, createdAt: new Date().toISOString() });
          await AsyncStorage.setItem('user_tasks', JSON.stringify(tasks));
          result = `Task "${functionCall.args.task}" added.`;
          speakText(`Added to your task list.`);
        } catch (e) { result = "Failed to create task. " + e.message; }
        break;
      case 'list_tasks':
        try {
          const raw = await AsyncStorage.getItem('user_tasks');
          const tasks = raw ? JSON.parse(raw) : [];
          const pending = tasks.filter(t => !t.done);
          result = pending.length === 0 ? "No pending tasks." : `You have ${pending.length} tasks: ` + pending.map((t, i) => `${i + 1}. ${t.task}`).join(', ');
        } catch (e) { result = "Failed to list tasks. " + e.message; }
        break;
      case 'complete_task':
        try {
          const raw = await AsyncStorage.getItem('user_tasks');
          const tasks = raw ? JSON.parse(raw) : [];
          const pending = tasks.filter(t => !t.done);
          const idx = functionCall.args.task_index - 1;
          if (idx >= 0 && idx < pending.length) {
            const completed = pending[idx];
            tasks.find(t => t.task === completed.task && !t.done).done = true;
            await AsyncStorage.setItem('user_tasks', JSON.stringify(tasks));
            result = `Task "${completed.task}" complete.`;
            speakText(`Marked as complete.`);
          } else result = "Task not found.";
        } catch (e) { result = "Failed to complete task. " + e.message; }
        break;
      case 'set_daily_reminder':
        try {
          const { title: dTitle, hour, minute } = functionCall.args;
          await Notifications.scheduleNotificationAsync({ content: { title: dTitle, body: `Daily: ${dTitle}`, sound: true }, trigger: { hour, minute, repeats: true } });
          const timeStr = `${hour}:${minute}`;
          result = `Scheduled daily reminder for ${timeStr}.`;
          speakText(`Set for ${timeStr} every day.`);
        } catch (e) { result = "Failed to schedule daily reminder. " + e.message; }
        break;
      default: result = "Function not recognized.";
    }
    return result;
  };

  const handleVoiceCommand = async (command) => { await processGeminiMessage(command); };
  const sendMessageText = async () => { if (!inputText.trim()) return; const msg = inputText; setInputText(''); await processGeminiMessage(msg); };

  const processGeminiMessage = async (msg) => {
    addMessage("User", msg);
    if (!apiKey) { addMessage("AI", "API Key required."); return; }
    setIsProcessing(true); setContinuousMode(false); ExpoSpeechRecognitionModule.stop(); stopWakeWordService();
    try {
      const result = await chatSession.current.sendMessage(msg);
      const call = result.response.functionCalls()?.[0];
      if (call) {
        addMessage("AI", `[Trigger: ${call.name}]`);
        const funcResult = await handleFunctions(call);
        const toolResp = await chatSession.current.sendMessage([{ functionResponse: { name: call.name, response: { result: funcResult } } }]);
        addMessage("AI", toolResp.response.text());
      } else { addMessage("AI", result.response.text()); }
    } catch (e) { addMessage("AI", "Error: " + e.message); }
    setIsProcessing(false); startWakeWordService();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerRow}>
        <Sparkles size={24} color="#00FF41" />
        <Text style={styles.header}>Radar AI</Text>
      </View>
      
      <View style={styles.voiceControlBar}>
        <TouchableOpacity 
          style={[styles.listenBtn, isListening ? styles.listeningBtnActive : null]}
          onPress={isListening ? stopListening : () => { setContinuousMode(false); startListening(); }}
        >
          {isListening && volume > 0 && <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {isListening ? <MicOff size={20} color="#FFF" /> : <Mic size={20} color="#FFF" />}
            <Text style={styles.listenBtnText}>{isListening ? "Listening..." : "Speak Command"}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toggleBtn, continuousMode ? styles.toggleBtnActive : null]}
          onPress={toggleContinuousMode}
        >
          <Terminal size={18} color="#FFF" />
          <Text style={styles.toggleBtnText}>{continuousMode ? "WAKE: ON" : "WAKE: OFF"}</Text>
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
        {isProcessing && <ActivityIndicator size="small" color="#00FF41" style={{ margin: 20 }}/>}
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type command..."
          placeholderTextColor="#666"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessageText}>
           <Send size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', paddingTop: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center', marginBottom: 20 },
  header: { fontSize: 24, fontWeight: '900', color: '#FFF', tracking: -1 },
  voiceControlBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 10 },
  listenBtn: { backgroundColor: '#2563EB', flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  listeningBtnActive: { backgroundColor: '#DC2626' },
  listenBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14, textTransform: 'uppercase' },
  pulseRing: { position: 'absolute', width: '200%', height: '200%', backgroundColor: '#EF4444', opacity: 0.3, borderRadius: 100 },
  toggleBtn: { backgroundColor: '#1A1A1A', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, borderWidth: 1, borderColor: '#333' },
  toggleBtnActive: { backgroundColor: '#00FF41', borderColor: '#00FF41' },
  toggleBtnText: { color: '#FFF', fontWeight: '800', fontSize: 10 },
  transcriptBox: { backgroundColor: '#111', padding: 12, borderRadius: 12, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#00FF41' },
  transcriptText: { color: '#888', fontStyle: 'italic', fontSize: 13 },
  chatArea: { flex: 1, marginBottom: 15 },
  bubble: { padding: 16, borderRadius: 20, marginBottom: 15, maxWidth: '85%' },
  userBubble: { backgroundColor: '#2563EB', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#1A1A1A', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#333' },
  roleText: { color: '#666', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '900' },
  messageText: { color: '#EEE', fontSize: 15, lineHeight: 22 },
  previewImage: { width: 200, height: 200, borderRadius: 12, marginTop: 10 },
  inputArea: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  input: { flex: 1, backgroundColor: '#111', color: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#222' },
  sendBtn: { backgroundColor: '#00FF41', justifyContent: 'center', alignItems: 'center', width: 56, height: 56, borderRadius: 16 },
});
