import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import {
  Trophy,
  Calendar,
  CalendarClock,
  Users,
  Activity,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  Crown,
  Medal,
  Zap,
  Wifi,
  WifiOff,
  Loader2,
  Info,
  Sparkles,
  Trash2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  writeBatch,
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';

/**
 * Pickle2Fit League 2026
 * A modern, responsive web app for managing the pickleball league.
 * Now with Firebase Persistence for real-time collaboration.
 */

// --- Firebase Configuration ---
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4YtbRd0qYBq9jZQrYB0QgEQK07Q_jHRc",
  authDomain: "pickle2fit-league-2026.firebaseapp.com",
  projectId: "pickle2fit-league-2026",
  storageBucket: "pickle2fit-league-2026.firebasestorage.app",
  messagingSenderId: "676617297490",
  appId: "1:676617297490:web:ad961312fb725c3c4b898b",
  measurementId: "G-FELZ7KLY3S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = import.meta.env.VITE_APP_ID || 'pickle2fit-league-2026';

// --- Initial Data ---

// Player registry with unique IDs
const INITIAL_PLAYERS = {
  player_1: { id: 'player_1', name: 'Azeem Muhammad' },
  player_2: { id: 'player_2', name: 'Iqbal Qasim' },
  player_3: { id: 'player_3', name: 'Wasef' },
  player_4: { id: 'player_4', name: 'Qavi' },
  player_5: { id: 'player_5', name: 'Ikram' },
  player_6: { id: 'player_6', name: 'Sabih' },
  player_7: { id: 'player_7', name: 'Taha R' },
  player_8: { id: 'player_8', name: 'Anas' },
  player_9: { id: 'player_9', name: 'Junaid A' },
  player_10: { id: 'player_10', name: 'Qhyam' },
  player_11: { id: 'player_11', name: 'Adil' },
  player_12: { id: 'player_12', name: 'Fateh' },
  player_13: { id: 'player_13', name: 'Taha M' },
  player_14: { id: 'player_14', name: 'Shahrukh' },
  player_15: { id: 'player_15', name: 'Nasheet' },
  player_16: { id: 'player_16', name: 'Naseer' },
  player_17: { id: 'player_17', name: 'Junaid M' },
  player_18: { id: 'player_18', name: 'Saleem' },
  player_19: { id: 'player_19', name: 'Owais' },
  player_20: { id: 'player_20', name: 'MJ' },
  player_21: { id: 'player_21', name: 'Madni' },
  player_22: { id: 'player_22', name: 'Salman' },
  player_23: { id: 'player_23', name: 'Yaseer' },
  player_24: { id: 'player_24', name: 'Pomi' },
  player_25: { id: 'player_25', name: 'Jabir Bhai' },
  player_26: { id: 'player_26', name: 'Yousaf' },
  player_27: { id: 'player_27', name: 'Zafar' },
  player_28: { id: 'player_28', name: 'Naveed' },
  player_29: { id: 'player_29', name: 'Javed C' },
  player_30: { id: 'player_30', name: 'Raza D' },
  player_31: { id: 'player_31', name: 'Rafey' },
  player_32: { id: 'player_32', name: 'Danial S' }
};

const INITIAL_TEAMS = [
  {
    id: 'team1',
    name: 'Naan-Stop Picklers',
    captain: 'player_1',
    players: ['player_1', 'player_2', 'player_3', 'player_4', 'player_5', 'player_6', 'player_7', 'player_8'],
    color: 'from-blue-500 to-cyan-400',
    logo: '/logos/naan-stop-picklers.png'
  },
  {
    id: 'team2',
    name: 'Striking Falcons',
    captain: 'player_9',
    players: ['player_9', 'player_10', 'player_11', 'player_12', 'player_13', 'player_14', 'player_15', 'player_16'],
    color: 'from-red-500 to-orange-400',
    logo: '/logos/striking-falcons.png'
  },
  {
    id: 'team3',
    name: 'Pickle Warriors',
    captain: 'player_17',
    players: ['player_17', 'player_18', 'player_19', 'player_20', 'player_21', 'player_22', 'player_23', 'player_24'],
    color: 'from-emerald-500 to-lime-400',
    logo: '/logos/pickle-warriors.png'
  },
  {
    id: 'team4',
    name: 'BadMashers',
    captain: 'player_25',
    players: ['player_25', 'player_26', 'player_27', 'player_28', 'player_29', 'player_30', 'player_31', 'player_32'],
    color: 'from-purple-500 to-pink-400',
    logo: '/logos/badmashers.png'
  }
];

// Complete schedule of all 96 games
const SEEDED_MATCHES = [
  { id: 1, teamA: 'team1', pA1: 'player_1', pA2: 'player_8', teamB: 'team3', pB1: 'player_17', pB2: 'player_24', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 2, teamA: 'team1', pA1: 'player_2', pA2: 'player_7', teamB: 'team3', pB1: 'player_18', pB2: 'player_23', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 3, teamA: 'team1', pA1: 'player_3', pA2: 'player_6', teamB: 'team3', pB1: 'player_19', pB2: 'player_22', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 4, teamA: 'team1', pA1: 'player_4', pA2: 'player_5', teamB: 'team3', pB1: 'player_20', pB2: 'player_21', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 5, teamA: 'team1', pA1: 'player_1', pA2: 'player_7', teamB: 'team4', pB1: 'player_25', pB2: 'player_32', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 6, teamA: 'team1', pA1: 'player_8', pA2: 'player_6', teamB: 'team4', pB1: 'player_26', pB2: 'player_31', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 7, teamA: 'team1', pA1: 'player_2', pA2: 'player_5', teamB: 'team4', pB1: 'player_27', pB2: 'player_30', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 8, teamA: 'team1', pA1: 'player_3', pA2: 'player_4', teamB: 'team4', pB1: 'player_28', pB2: 'player_29', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 9, teamA: 'team2', pA1: 'player_9', pA2: 'player_16', teamB: 'team4', pB1: 'player_25', pB2: 'player_31', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 10, teamA: 'team2', pA1: 'player_10', pA2: 'player_15', teamB: 'team4', pB1: 'player_32', pB2: 'player_30', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 11, teamA: 'team2', pA1: 'player_11', pA2: 'player_14', teamB: 'team4', pB1: 'player_26', pB2: 'player_29', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 12, teamA: 'team2', pA1: 'player_12', pA2: 'player_13', teamB: 'team4', pB1: 'player_27', pB2: 'player_28', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 13, teamA: 'team2', pA1: 'player_9', pA2: 'player_15', teamB: 'team3', pB1: 'player_17', pB2: 'player_23', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 14, teamA: 'team2', pA1: 'player_16', pA2: 'player_14', teamB: 'team3', pB1: 'player_24', pB2: 'player_22', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 15, teamA: 'team2', pA1: 'player_10', pA2: 'player_13', teamB: 'team3', pB1: 'player_18', pB2: 'player_21', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 16, teamA: 'team2', pA1: 'player_11', pA2: 'player_12', teamB: 'team3', pB1: 'player_19', pB2: 'player_20', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 17, teamA: 'team1', pA1: 'player_1', pA2: 'player_6', teamB: 'team2', pB1: 'player_9', pB2: 'player_14', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 18, teamA: 'team1', pA1: 'player_7', pA2: 'player_5', teamB: 'team2', pB1: 'player_15', pB2: 'player_13', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 19, teamA: 'team1', pA1: 'player_8', pA2: 'player_4', teamB: 'team2', pB1: 'player_16', pB2: 'player_12', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 20, teamA: 'team1', pA1: 'player_2', pA2: 'player_3', teamB: 'team2', pB1: 'player_10', pB2: 'player_11', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 21, teamA: 'team3', pA1: 'player_17', pA2: 'player_22', teamB: 'team4', pB1: 'player_25', pB2: 'player_30', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 22, teamA: 'team3', pA1: 'player_23', pA2: 'player_21', teamB: 'team4', pB1: 'player_31', pB2: 'player_29', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 23, teamA: 'team3', pA1: 'player_24', pA2: 'player_20', teamB: 'team4', pB1: 'player_32', pB2: 'player_28', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 24, teamA: 'team3', pA1: 'player_18', pA2: 'player_19', teamB: 'team4', pB1: 'player_26', pB2: 'player_27', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 25, teamA: 'team2', pA1: 'player_9', pA2: 'player_13', teamB: 'team4', pB1: 'player_25', pB2: 'player_29', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 26, teamA: 'team2', pA1: 'player_14', pA2: 'player_12', teamB: 'team4', pB1: 'player_30', pB2: 'player_28', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 27, teamA: 'team2', pA1: 'player_15', pA2: 'player_11', teamB: 'team4', pB1: 'player_31', pB2: 'player_27', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 28, teamA: 'team2', pA1: 'player_16', pA2: 'player_10', teamB: 'team4', pB1: 'player_32', pB2: 'player_26', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 29, teamA: 'team1', pA1: 'player_1', pA2: 'player_5', teamB: 'team3', pB1: 'player_17', pB2: 'player_21', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 30, teamA: 'team1', pA1: 'player_6', pA2: 'player_4', teamB: 'team3', pB1: 'player_22', pB2: 'player_20', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 31, teamA: 'team1', pA1: 'player_7', pA2: 'player_3', teamB: 'team3', pB1: 'player_23', pB2: 'player_19', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 32, teamA: 'team1', pA1: 'player_8', pA2: 'player_2', teamB: 'team3', pB1: 'player_24', pB2: 'player_18', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 33, teamA: 'team1', pA1: 'player_1', pA2: 'player_4', teamB: 'team2', pB1: 'player_9', pB2: 'player_12', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 34, teamA: 'team1', pA1: 'player_5', pA2: 'player_3', teamB: 'team2', pB1: 'player_13', pB2: 'player_11', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 35, teamA: 'team1', pA1: 'player_6', pA2: 'player_2', teamB: 'team2', pB1: 'player_14', pB2: 'player_10', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 36, teamA: 'team1', pA1: 'player_7', pA2: 'player_8', teamB: 'team2', pB1: 'player_15', pB2: 'player_16', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 37, teamA: 'team2', pA1: 'player_9', pA2: 'player_11', teamB: 'team3', pB1: 'player_17', pB2: 'player_20', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 38, teamA: 'team2', pA1: 'player_12', pA2: 'player_10', teamB: 'team3', pB1: 'player_21', pB2: 'player_19', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 39, teamA: 'team2', pA1: 'player_13', pA2: 'player_16', teamB: 'team3', pB1: 'player_22', pB2: 'player_18', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 40, teamA: 'team2', pA1: 'player_14', pA2: 'player_15', teamB: 'team3', pB1: 'player_23', pB2: 'player_24', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 41, teamA: 'team1', pA1: 'player_1', pA2: 'player_3', teamB: 'team4', pB1: 'player_25', pB2: 'player_28', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 42, teamA: 'team1', pA1: 'player_4', pA2: 'player_2', teamB: 'team4', pB1: 'player_29', pB2: 'player_27', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 43, teamA: 'team1', pA1: 'player_5', pA2: 'player_8', teamB: 'team4', pB1: 'player_30', pB2: 'player_26', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 44, teamA: 'team1', pA1: 'player_6', pA2: 'player_7', teamB: 'team4', pB1: 'player_31', pB2: 'player_32', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 45, teamA: 'team3', pA1: 'player_17', pA2: 'player_19', teamB: 'team4', pB1: 'player_25', pB2: 'player_27', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 46, teamA: 'team3', pA1: 'player_20', pA2: 'player_18', teamB: 'team4', pB1: 'player_28', pB2: 'player_26', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 47, teamA: 'team3', pA1: 'player_21', pA2: 'player_24', teamB: 'team4', pB1: 'player_29', pB2: 'player_32', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 48, teamA: 'team3', pA1: 'player_22', pA2: 'player_23', teamB: 'team4', pB1: 'player_30', pB2: 'player_31', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 49, teamA: 'team1', pA1: 'player_1', pA2: 'player_2', teamB: 'team4', pB1: 'player_25', pB2: 'player_26', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 50, teamA: 'team1', pA1: 'player_3', pA2: 'player_8', teamB: 'team4', pB1: 'player_27', pB2: 'player_32', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 51, teamA: 'team1', pA1: 'player_4', pA2: 'player_7', teamB: 'team4', pB1: 'player_28', pB2: 'player_31', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 52, teamA: 'team1', pA1: 'player_5', pA2: 'player_6', teamB: 'team4', pB1: 'player_29', pB2: 'player_30', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 53, teamA: 'team1', pA1: 'player_1', pA2: 'player_8', teamB: 'team2', pB1: 'player_9', pB2: 'player_10', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 54, teamA: 'team1', pA1: 'player_2', pA2: 'player_7', teamB: 'team2', pB1: 'player_11', pB2: 'player_16', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 55, teamA: 'team1', pA1: 'player_3', pA2: 'player_6', teamB: 'team2', pB1: 'player_12', pB2: 'player_15', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 56, teamA: 'team1', pA1: 'player_4', pA2: 'player_5', teamB: 'team2', pB1: 'player_13', pB2: 'player_14', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 57, teamA: 'team2', pA1: 'player_9', pA2: 'player_16', teamB: 'team3', pB1: 'player_17', pB2: 'player_18', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 58, teamA: 'team2', pA1: 'player_10', pA2: 'player_15', teamB: 'team3', pB1: 'player_19', pB2: 'player_24', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 59, teamA: 'team2', pA1: 'player_11', pA2: 'player_14', teamB: 'team3', pB1: 'player_20', pB2: 'player_23', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 60, teamA: 'team2', pA1: 'player_12', pA2: 'player_13', teamB: 'team3', pB1: 'player_21', pB2: 'player_22', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 61, teamA: 'team2', pA1: 'player_9', pA2: 'player_15', teamB: 'team4', pB1: 'player_25', pB2: 'player_32', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 62, teamA: 'team2', pA1: 'player_16', pA2: 'player_14', teamB: 'team4', pB1: 'player_26', pB2: 'player_31', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 63, teamA: 'team2', pA1: 'player_10', pA2: 'player_13', teamB: 'team4', pB1: 'player_27', pB2: 'player_30', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 64, teamA: 'team2', pA1: 'player_11', pA2: 'player_12', teamB: 'team4', pB1: 'player_28', pB2: 'player_29', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 65, teamA: 'team3', pA1: 'player_17', pA2: 'player_24', teamB: 'team4', pB1: 'player_25', pB2: 'player_31', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 66, teamA: 'team3', pA1: 'player_18', pA2: 'player_23', teamB: 'team4', pB1: 'player_32', pB2: 'player_30', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 67, teamA: 'team3', pA1: 'player_19', pA2: 'player_22', teamB: 'team4', pB1: 'player_26', pB2: 'player_29', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 68, teamA: 'team3', pA1: 'player_20', pA2: 'player_21', teamB: 'team4', pB1: 'player_27', pB2: 'player_28', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 69, teamA: 'team1', pA1: 'player_1', pA2: 'player_7', teamB: 'team3', pB1: 'player_17', pB2: 'player_23', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 70, teamA: 'team1', pA1: 'player_8', pA2: 'player_6', teamB: 'team3', pB1: 'player_24', pB2: 'player_22', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 71, teamA: 'team1', pA1: 'player_2', pA2: 'player_5', teamB: 'team3', pB1: 'player_18', pB2: 'player_21', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 72, teamA: 'team1', pA1: 'player_3', pA2: 'player_4', teamB: 'team3', pB1: 'player_19', pB2: 'player_20', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 73, teamA: 'team2', pA1: 'player_9', pA2: 'player_14', teamB: 'team3', pB1: 'player_17', pB2: 'player_22', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 74, teamA: 'team2', pA1: 'player_15', pA2: 'player_13', teamB: 'team3', pB1: 'player_23', pB2: 'player_21', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 75, teamA: 'team2', pA1: 'player_16', pA2: 'player_12', teamB: 'team3', pB1: 'player_24', pB2: 'player_20', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 76, teamA: 'team2', pA1: 'player_10', pA2: 'player_11', teamB: 'team3', pB1: 'player_18', pB2: 'player_19', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 77, teamA: 'team1', pA1: 'player_1', pA2: 'player_6', teamB: 'team3', pB1: 'player_17', pB2: 'player_21', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 78, teamA: 'team1', pA1: 'player_7', pA2: 'player_5', teamB: 'team3', pB1: 'player_22', pB2: 'player_20', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 79, teamA: 'team1', pA1: 'player_8', pA2: 'player_4', teamB: 'team3', pB1: 'player_23', pB2: 'player_19', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 80, teamA: 'team1', pA1: 'player_2', pA2: 'player_3', teamB: 'team3', pB1: 'player_24', pB2: 'player_18', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 81, teamA: 'team1', pA1: 'player_1', pA2: 'player_5', teamB: 'team4', pB1: 'player_25', pB2: 'player_30', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 82, teamA: 'team1', pA1: 'player_6', pA2: 'player_4', teamB: 'team4', pB1: 'player_31', pB2: 'player_29', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 83, teamA: 'team1', pA1: 'player_7', pA2: 'player_3', teamB: 'team4', pB1: 'player_32', pB2: 'player_28', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 84, teamA: 'team1', pA1: 'player_8', pA2: 'player_2', teamB: 'team4', pB1: 'player_26', pB2: 'player_27', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 85, teamA: 'team3', pA1: 'player_17', pA2: 'player_20', teamB: 'team4', pB1: 'player_25', pB2: 'player_29', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 86, teamA: 'team3', pA1: 'player_21', pA2: 'player_19', teamB: 'team4', pB1: 'player_30', pB2: 'player_28', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 87, teamA: 'team3', pA1: 'player_22', pA2: 'player_18', teamB: 'team4', pB1: 'player_31', pB2: 'player_27', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 88, teamA: 'team3', pA1: 'player_23', pA2: 'player_24', teamB: 'team4', pB1: 'player_32', pB2: 'player_26', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 89, teamA: 'team1', pA1: 'player_1', pA2: 'player_4', teamB: 'team2', pB1: 'player_9', pB2: 'player_13', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 90, teamA: 'team1', pA1: 'player_5', pA2: 'player_3', teamB: 'team2', pB1: 'player_14', pB2: 'player_12', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 91, teamA: 'team1', pA1: 'player_6', pA2: 'player_2', teamB: 'team2', pB1: 'player_15', pB2: 'player_11', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 92, teamA: 'team1', pA1: 'player_7', pA2: 'player_8', teamB: 'team2', pB1: 'player_16', pB2: 'player_10', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 93, teamA: 'team2', pA1: 'player_9', pA2: 'player_12', teamB: 'team4', pB1: 'player_25', pB2: 'player_28', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 94, teamA: 'team2', pA1: 'player_13', pA2: 'player_11', teamB: 'team4', pB1: 'player_29', pB2: 'player_27', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 95, teamA: 'team2', pA1: 'player_14', pA2: 'player_10', teamB: 'team4', pB1: 'player_30', pB2: 'player_26', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
  { id: 96, teamA: 'team2', pA1: 'player_15', pA2: 'player_16', teamB: 'team4', pB1: 'player_31', pB2: 'player_32', winner: null, score: '', isFlex: false, scheduledDate: null, reportedDate: null, reportedBy: null, reportedById: null, history: [] },
];

const LEAGUE_RULES = {
  totalGames: 96,
  flexLimit: 10
};

// --- Players Context ---

const PlayersContext = createContext(null);

export const usePlayers = () => {
  const context = useContext(PlayersContext);
  if (!context) {
    throw new Error('usePlayers must be used within PlayersProvider');
  }
  return context;
};

const PlayersProvider = ({ children, user }) => {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const playersInitialized = useRef(false);

  // Real-time Players Sync
  useEffect(() => {
    if (!user) return;

    const playersRef = collection(db, 'artifacts', appId, 'public', 'data', 'players');

    const unsubscribe = onSnapshot(playersRef, async (snapshot) => {
      // Auto-Seed Players if empty
      if (snapshot.empty && !playersInitialized.current) {
        playersInitialized.current = true;
        // Batch write the initial players
        const batch = writeBatch(db);
        Object.values(INITIAL_PLAYERS).forEach(player => {
          const ref = doc(db, 'artifacts', appId, 'public', 'data', 'players', player.id);
          batch.set(ref, player);
        });
        await batch.commit();
        return;
      }

      // Load players from Firestore
      const loadedPlayers = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        loadedPlayers[data.id] = data;
      });
      setPlayers(loadedPlayers);
    }, (error) => {
      console.error("Players sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const updatePlayer = async (playerId, newName) => {
    if (!user) return;
    try {
      const playerRef = doc(db, 'artifacts', appId, 'public', 'data', 'players', playerId);
      await setDoc(playerRef, { id: playerId, name: newName }, { merge: true });
    } catch (e) {
      console.error("Error updating player:", e);
    }
  };

  const getPlayerName = (playerId, full = false) => {
    const fullName = players[playerId]?.name || playerId;

    if (full) return fullName;

    // Return abbreviated by default (e.g., "Azeem Muhammad" -> "Azeem M.")
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastInitial = parts[parts.length - 1][0];
      return `${firstName} ${lastInitial}.`;
    }
    return fullName;
  };

  const value = {
    players,
    updatePlayer,
    getPlayerName
  };

  return (
    <PlayersContext.Provider value={value}>
      {children}
    </PlayersContext.Provider>
  );
};

// --- Time Slots Context ---

const TimeSlotsContext = createContext(null);

export const useTimeSlots = () => {
  const context = useContext(TimeSlotsContext);
  if (!context) {
    throw new Error('useTimeSlots must be used within TimeSlotsProvider');
  }
  return context;
};

const TimeSlotsProvider = ({ children, user }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const timeSlotsInitialized = useRef(false);
  const rsvpsInitialized = useRef(false);

  // Real-time Time Slots Sync
  useEffect(() => {
    if (!user) return;

    const timeSlotsRef = collection(db, 'artifacts', appId, 'public', 'data', 'timeSlots');

    const unsubscribe = onSnapshot(timeSlotsRef, (snapshot) => {
      if (snapshot.empty && !timeSlotsInitialized.current) {
        timeSlotsInitialized.current = true;
        setTimeSlots([]);
        return;
      }

      const loadedTimeSlots = snapshot.docs.map(doc => doc.data());
      // Sort by dateTime (upcoming first)
      loadedTimeSlots.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      setTimeSlots(loadedTimeSlots);
    }, (error) => {
      console.error("Time slots sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time RSVPs Sync
  useEffect(() => {
    if (!user) return;

    const rsvpsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');

    const unsubscribe = onSnapshot(rsvpsRef, (snapshot) => {
      if (snapshot.empty && !rsvpsInitialized.current) {
        rsvpsInitialized.current = true;
        setRsvps([]);
        return;
      }

      const loadedRsvps = snapshot.docs.map(doc => doc.data());
      setRsvps(loadedRsvps);
    }, (error) => {
      console.error("RSVPs sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const proposeTimeSlot = async (dateTime, location, notes) => {
    if (!user) return;
    try {
      const timeSlotRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'timeSlots'));
      const timeSlotData = {
        id: timeSlotRef.id,
        dateTime: new Date(dateTime).toISOString(),
        location: location || '',
        proposedBy: user.displayName || user.email || 'Unknown',
        proposedById: user.uid,
        proposedAt: new Date().toISOString(),
        status: 'active',
        notes: notes || '',
        linkedMatches: [],
        history: [{
          timestamp: new Date().toISOString(),
          userId: user.uid,
          userName: user.displayName || user.email || 'Unknown',
          action: 'proposed',
          changes: { status: 'active' }
        }]
      };
      await setDoc(timeSlotRef, timeSlotData);
      return timeSlotRef.id;
    } catch (e) {
      console.error("Error proposing time slot:", e);
      throw e;
    }
  };

  const cancelTimeSlot = async (timeSlotId) => {
    if (!user) return;
    try {
      const timeSlotRef = doc(db, 'artifacts', appId, 'public', 'data', 'timeSlots', timeSlotId);
      const timeSlotSnap = await getDoc(timeSlotRef);
      if (!timeSlotSnap.exists()) return;

      const timeSlotData = timeSlotSnap.data();
      const historyEntry = {
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.displayName || user.email || 'Unknown',
        action: 'cancelled',
        changes: { status: 'cancelled' }
      };

      await setDoc(timeSlotRef, {
        ...timeSlotData,
        status: 'cancelled',
        history: [...(timeSlotData.history || []), historyEntry]
      });
    } catch (e) {
      console.error("Error cancelling time slot:", e);
      throw e;
    }
  };

  const updateTimeSlot = async (timeSlotId, dateTime, location, notes) => {
    if (!user) return;
    try {
      const timeSlotRef = doc(db, 'artifacts', appId, 'public', 'data', 'timeSlots', timeSlotId);
      const timeSlotSnap = await getDoc(timeSlotRef);
      if (!timeSlotSnap.exists()) return;

      const timeSlotData = timeSlotSnap.data();

      // Track what changed
      const changes = {};
      if (dateTime && new Date(dateTime).toISOString() !== timeSlotData.dateTime) {
        changes.dateTime = { from: timeSlotData.dateTime, to: new Date(dateTime).toISOString() };
      }
      if (location !== timeSlotData.location) {
        changes.location = { from: timeSlotData.location, to: location };
      }
      if (notes !== timeSlotData.notes) {
        changes.notes = { from: timeSlotData.notes, to: notes };
      }

      const historyEntry = {
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.displayName || user.email || 'Unknown',
        action: 'updated',
        changes
      };

      await setDoc(timeSlotRef, {
        ...timeSlotData,
        dateTime: dateTime ? new Date(dateTime).toISOString() : timeSlotData.dateTime,
        location: location || '',
        notes: notes || '',
        history: [...(timeSlotData.history || []), historyEntry]
      });
    } catch (e) {
      console.error("Error updating time slot:", e);
      throw e;
    }
  };

  const deleteTimeSlot = async (timeSlotId) => {
    if (!user) return;
    try {
      const timeSlotRef = doc(db, 'artifacts', appId, 'public', 'data', 'timeSlots', timeSlotId);
      await deleteDoc(timeSlotRef);

      // Also delete associated RSVPs
      const rsvpsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');
      const q = query(rsvpsRef, where('timeSlotId', '==', timeSlotId));
      const rsvpSnaps = await getDocs(q);

      const deletePromises = rsvpSnaps.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (e) {
      console.error("Error deleting time slot:", e);
      throw e;
    }
  };

  const submitRSVP = async (timeSlotId, playerId, status, notes, onBehalfOf = false) => {
    if (!user) return;
    try {
      // Check if RSVP already exists for this player and time slot
      const existingRSVP = rsvps.find(r => r.timeSlotId === timeSlotId && r.playerId === playerId);

      if (existingRSVP) {
        // Update existing RSVP
        const rsvpRef = doc(db, 'artifacts', appId, 'public', 'data', 'rsvps', existingRSVP.id);
        const rsvpSnap = await getDoc(rsvpRef);
        if (!rsvpSnap.exists()) return;

        const rsvpData = rsvpSnap.data();
        const historyEntry = {
          timestamp: new Date().toISOString(),
          userId: user.uid,
          userName: user.displayName || user.email || 'Unknown',
          previousStatus: rsvpData.status,
          newStatus: status
        };

        await setDoc(rsvpRef, {
          ...rsvpData,
          status,
          respondedBy: user.displayName || user.email || 'Unknown',
          respondedById: user.uid,
          onBehalfOf,
          respondedAt: new Date().toISOString(),
          notes: notes || '',
          history: [...(rsvpData.history || []), historyEntry]
        });
      } else {
        // Create new RSVP
        const rsvpRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'rsvps'));
        const rsvpData = {
          id: rsvpRef.id,
          timeSlotId,
          playerId,
          status,
          respondedBy: user.displayName || user.email || 'Unknown',
          respondedById: user.uid,
          onBehalfOf,
          respondedAt: new Date().toISOString(),
          notes: notes || '',
          history: [{
            timestamp: new Date().toISOString(),
            userId: user.uid,
            userName: user.displayName || user.email || 'Unknown',
            previousStatus: null,
            newStatus: status
          }]
        };
        await setDoc(rsvpRef, rsvpData);
      }
    } catch (e) {
      console.error("Error submitting RSVP:", e);
      throw e;
    }
  };

  const linkMatchToTimeSlot = async (timeSlotId, matchId, shouldLink = true) => {
    if (!user) return;
    try {
      const timeSlotRef = doc(db, 'artifacts', appId, 'public', 'data', 'timeSlots', timeSlotId);
      const timeSlotSnap = await getDoc(timeSlotRef);
      if (!timeSlotSnap.exists()) return;

      const timeSlotData = timeSlotSnap.data();
      const linkedMatches = timeSlotData.linkedMatches || [];

      const updatedMatches = shouldLink
        ? [...new Set([...linkedMatches, matchId])] // Add match, ensure unique
        : linkedMatches.filter(id => id !== matchId); // Remove match

      const historyEntry = {
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.displayName || user.email || 'Unknown',
        action: shouldLink ? 'match_linked' : 'match_unlinked',
        changes: { matchId }
      };

      await setDoc(timeSlotRef, {
        ...timeSlotData,
        linkedMatches: updatedMatches,
        history: [...(timeSlotData.history || []), historyEntry]
      });

      // Update match's scheduledDate
      const matchRef = doc(db, 'artifacts', appId, 'public', 'data', 'matches', matchId.toString());
      const matchSnap = await getDoc(matchRef);
      if (matchSnap.exists()) {
        const matchData = matchSnap.data();
        if (shouldLink) {
          // Set scheduledDate when linking
          await setDoc(matchRef, {
            ...matchData,
            scheduledDate: timeSlotData.dateTime
          });
        } else {
          // Remove scheduledDate when unlinking
          const { scheduledDate, ...matchDataWithoutSchedule } = matchData;
          await setDoc(matchRef, matchDataWithoutSchedule);
        }
      }
    } catch (e) {
      console.error("Error linking match to time slot:", e);
      throw e;
    }
  };

  const getRSVPsForTimeSlot = (timeSlotId) => {
    return rsvps.filter(r => r.timeSlotId === timeSlotId);
  };

  const getPlayerRSVP = (timeSlotId, playerId) => {
    return rsvps.find(r => r.timeSlotId === timeSlotId && r.playerId === playerId);
  };

  const value = {
    timeSlots,
    rsvps,
    user,
    proposeTimeSlot,
    cancelTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    submitRSVP,
    linkMatchToTimeSlot,
    getRSVPsForTimeSlot,
    getPlayerRSVP
  };

  return (
    <TimeSlotsContext.Provider value={value}>
      {children}
    </TimeSlotsContext.Provider>
  );
};

// --- Components ---

const Badge = ({ children, className }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${className}`}>
    {children}
  </span>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState(null);
  const [showPlayerIdentification, setShowPlayerIdentification] = useState(false);
  const [playerName, setPlayerName] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [matchesFilter, setMatchesFilter] = useState('all');
  const initialized = useRef(false);

  // --- Auth & Init ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed. User:", user);
      setUser(user);
      if (user) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Google Sign-In handler
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      // Fallback to anonymous auth if user cancels or error occurs
      try {
        await signInAnonymously(auth);
      } catch (fallbackErr) {
        console.error("Anonymous auth also failed:", fallbackErr);
      }
    }
  };

  // --- Check User Identification ---
  useEffect(() => {
    if (!user) return;

    const checkPlayerIdentification = async () => {
      try {
        const userPlayerRef = doc(db, 'artifacts', appId, 'public', 'data', 'userPlayers', user.uid);
        const userPlayerDoc = await getDoc(userPlayerRef);

        if (userPlayerDoc.exists()) {
          setPlayerName(userPlayerDoc.data().playerName);
          setShowPlayerIdentification(false);
        } else if (user.displayName) {
          // Automatically use Google display name
          await setDoc(userPlayerRef, {
            playerName: user.displayName,
            userId: user.uid,
            email: user.email,
            photoURL: user.photoURL,
            identifiedAt: new Date().toISOString()
          });
          setPlayerName(user.displayName);
          setShowPlayerIdentification(false);
        } else {
          setShowPlayerIdentification(true);
        }
      } catch (err) {
        console.error("Error checking player identification:", err);
        // Use display name as fallback even if Firestore fails
        if (user.displayName) {
          setPlayerName(user.displayName);
          setShowPlayerIdentification(false);
        } else {
          setShowPlayerIdentification(true);
        }
      }
    };

    checkPlayerIdentification();
  }, [user]);

  // Handler for player identification
  const handlePlayerIdentify = async (selectedPlayer) => {
    if (!user) return;

    try {
      const userPlayerRef = doc(db, 'artifacts', appId, 'public', 'data', 'userPlayers', user.uid);
      await setDoc(userPlayerRef, {
        playerName: selectedPlayer,
        userId: user.uid,
        identifiedAt: new Date().toISOString()
      });

      setPlayerName(selectedPlayer);
      setShowPlayerIdentification(false);
    } catch (err) {
      console.error("Error saving player identification:", err);
    }
  };

  // --- Real-time Data Sync ---
  useEffect(() => {
    if (!user) return;

    const matchesRef = collection(db, 'artifacts', appId, 'public', 'data', 'matches');

    const unsubscribe = onSnapshot(matchesRef, async (snapshot) => {
      setLoading(true);
      
      // Auto-Seed Database if empty
      if (snapshot.empty && !initialized.current) {
        initialized.current = true;
        // Batch write the initial seed data
        const batch = writeBatch(db);
        SEEDED_MATCHES.forEach(match => {
          const ref = doc(db, 'artifacts', appId, 'public', 'data', 'matches', match.id.toString());
          batch.set(ref, match);
        });
        await batch.commit();
        setLoading(false);
        return;
      }

      const loadedMatches = snapshot.docs.map(doc => doc.data());
      // Sort in memory (Rule 2: Avoid complex queries)
      loadedMatches.sort((a, b) => a.id - b.id);
      
      setMatches(loadedMatches);
      setLoading(false);
    }, (error) => {
      console.error("Sync error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Recalculate standings whenever matches change
  useEffect(() => {
    calculateStandings();
  }, [matches]);

  const calculateStandings = () => {
    const stats = {};
    INITIAL_TEAMS.forEach(t => {
      stats[t.id] = { id: t.id, name: t.name, wins: 0, losses: 0, flexUsed: 0, played: 0 };
    });

    matches.forEach(m => {
      if (m.winner) {
        if(stats[m.teamA]) stats[m.teamA].played += 1;
        if(stats[m.teamB]) stats[m.teamB].played += 1;

        if (m.winner === m.teamA && stats[m.teamA]) {
          stats[m.teamA].wins += 1;
          if(stats[m.teamB]) stats[m.teamB].losses += 1;
        } else if(stats[m.teamB]) {
          stats[m.teamB].wins += 1;
          if(stats[m.teamA]) stats[m.teamA].losses += 1;
        }

        // Flex Logic
        if (m.isFlexA && stats[m.teamA]) stats[m.teamA].flexUsed += 1;
        if (m.isFlexB && stats[m.teamB]) stats[m.teamB].flexUsed += 1;
      }
    });

    // Sort by Wins, then win %
    const sorted = Object.values(stats).sort((a, b) => b.wins - a.wins);
    setStandings(sorted);
  };

  const updateMatch = async (id, data) => {
    if (!user) return;
    try {
      const matchRef = doc(db, 'artifacts', appId, 'public', 'data', 'matches', id.toString());
      await setDoc(matchRef, data, { merge: true });
    } catch (e) {
      console.error("Error updating match:", e);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === 'matches') {
      // Reset filter to 'all' when manually navigating to matches tab
      setMatchesFilter('all');
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (loading && matches.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-lime-400 animate-spin" />
          <p className="text-slate-400 text-sm">Syncing League Data...</p>
        </div>
      );
    }

    switch(activeTab) {
      case 'dashboard': return <Dashboard standings={standings} matches={matches} teams={INITIAL_TEAMS} onMatchClick={setEditingMatch} onViewAllMatches={() => { setMatchesFilter('completed'); setActiveTab('matches'); }} />;
      case 'matches': return <MatchSchedule matches={matches} updateMatch={updateMatch} teams={INITIAL_TEAMS} user={user} playerName={playerName} initialFilter={matchesFilter} />;
      case 'schedule': return <TimeSlotScheduler matches={matches} />;
      case 'teams': return <TeamsList teams={INITIAL_TEAMS} />;
      case 'rules': return <RulesPage />;
      default: return <Dashboard standings={standings} matches={matches} teams={INITIAL_TEAMS} onMatchClick={setEditingMatch} onViewAllMatches={() => { setMatchesFilter('completed'); setActiveTab('matches'); }} />;
    }
  };

  // Show login screen if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-lime-400 to-emerald-500 p-4 rounded-2xl shadow-2xl">
                <Trophy className="w-16 h-16 text-slate-950" />
              </div>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Pickle2Fit
            </h1>
            <p className="text-slate-400 text-lg mb-8">League 2026</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 group"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <p className="text-slate-500 text-sm mt-4">
            Quick and secure access to the league dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <PlayersProvider user={user}>
    <TimeSlotsProvider user={user}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-lime-400 selection:text-slate-900 pb-20 md:pb-0">
        {editingMatch && (
          <ReportModal
            match={editingMatch}
            teams={INITIAL_TEAMS}
            user={user}
            playerName={playerName}
            onClose={() => setEditingMatch(null)}
            onSave={(id, data) => {
              updateMatch(id, data);
              setEditingMatch(null);
            }}
          />
        )}

        {showPlayerIdentification && (
          <PlayerIdentificationModal
            teams={INITIAL_TEAMS}
            onIdentify={handlePlayerIdentify}
          />
        )}

      {showAppInfo && (
        <AppInfoModal onClose={() => setShowAppInfo(false)} />
      )}

      {/* Mobile-first Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-lime-400 to-green-600 p-2 rounded-lg shadow-lg shadow-lime-500/20">
              <Trophy className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Pickle2Fit
              </h1>
              <p className="text-[10px] text-lime-400 font-bold tracking-widest uppercase flex items-center gap-1">
                {loading ? <Loader2 size={10} className="animate-spin" /> : <Wifi size={10} />}
                League 2026
              </p>
            </div>
          </div>

          {/* Navigation + User Profile */}
          <div className="flex items-center gap-3">
            {/* Live Info Badge */}
            <button
              onClick={() => setShowAppInfo(true)}
              className="relative flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-full px-3 py-1.5 transition-all duration-200 group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <Info className="w-4 h-4 text-red-400 group-hover:text-red-300" />
              <span className="text-xs font-semibold text-red-400 group-hover:text-red-300 hidden sm:inline">
                LIVE
              </span>
            </button>

            <div className="hidden md:flex gap-6 text-sm font-medium">
              <NavBtn active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} icon={<Activity />}>Dashboard</NavBtn>
              <NavBtn active={activeTab === 'matches'} onClick={() => handleTabChange('matches')} icon={<Calendar />}>Matches</NavBtn>
              <NavBtn active={activeTab === 'schedule'} onClick={() => handleTabChange('schedule')} icon={<CalendarClock />}>Schedule</NavBtn>
              <NavBtn active={activeTab === 'teams'} onClick={() => handleTabChange('teams')} icon={<Users />}>Teams</NavBtn>
              <NavBtn active={activeTab === 'rules'} onClick={() => handleTabChange('rules')} icon={<Zap />}>Rules</NavBtn>
            </div>

            {/* User Profile */}
            {user && (
              <div className="relative group">
                <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors rounded-full pl-1 pr-3 py-1 border border-white/10 shrink-0 cursor-pointer">
                  {user.photoURL && !imageError ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      onError={() => setImageError(true)}
                      className="w-8 h-8 rounded-full ring-2 ring-lime-400/50 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-slate-900 font-bold text-sm ring-2 ring-lime-400/50">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white hidden md:inline-block max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>

                {/* Tooltip */}
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 min-w-[240px]">
                    <div className="flex items-center gap-3 mb-3">
                      {user.photoURL && !imageError ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-12 h-12 rounded-full ring-2 ring-lime-400/50 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-slate-900 font-bold text-lg ring-2 ring-lime-400/50">
                          {(user.displayName || user.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">
                          {user.displayName || 'User'}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {user.email || 'No email'}
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-700 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-slate-400">Signed in with Google</span>
                      </div>
                      {playerName && (
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="w-3 h-3 text-lime-400" />
                          <span className="text-slate-400">Playing as: <span className="text-white font-medium">{playerName}</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/5 flex justify-around p-3 pb-safe z-50">
        <MobileNavBtn active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} icon={<Activity size={20} />} label="Dash" />
        <MobileNavBtn active={activeTab === 'matches'} onClick={() => handleTabChange('matches')} icon={<Calendar size={20} />} label="Matches" />
        <MobileNavBtn active={activeTab === 'schedule'} onClick={() => handleTabChange('schedule')} icon={<CalendarClock size={20} />} label="Schedule" />
        <MobileNavBtn active={activeTab === 'teams'} onClick={() => handleTabChange('teams')} icon={<Users size={20} />} label="Teams" />
        <MobileNavBtn active={activeTab === 'rules'} onClick={() => handleTabChange('rules')} icon={<Medal size={20} />} label="Playoffs" />
      </nav>
    </div>
    </TimeSlotsProvider>
    </PlayersProvider>
  );
}

// --- Sub Components ---

const NavBtn = ({ active, onClick, icon, children }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
      active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    {React.cloneElement(icon, { size: 16 })}
    {children}
  </button>
);

const MobileNavBtn = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-16 transition-colors ${
      active ? 'text-lime-400' : 'text-slate-500 hover:text-slate-300'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

// --- DASHBOARD ---

const Dashboard = ({ standings, matches, teams, onMatchClick, onViewAllMatches }) => {
  const { getPlayerName } = usePlayers();

  // Sort upcoming matches by date (matches with dates first, then by date, then by ID)
  const upcomingMatches = matches
    .filter(m => !m.winner)
    .sort((a, b) => {
      if (a.scheduledDate && !b.scheduledDate) return -1;
      if (!a.scheduledDate && b.scheduledDate) return 1;
      if (a.scheduledDate && b.scheduledDate) {
        return new Date(a.scheduledDate) - new Date(b.scheduledDate);
      }
      return a.id - b.id;
    })
    .slice(0, 3);

  // Sort recent matches by reported date (most recent first), fallback to ID
  const recentMatches = matches
    .filter(m => m.winner && m.score) // Only show matches with valid results
    .sort((a, b) => {
      if (a.reportedDate && b.reportedDate) {
        return new Date(b.reportedDate) - new Date(a.reportedDate);
      }
      return b.id - a.id;
    })
    .slice(0, 3);

  // Helper to get team name from ID
  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || teamId;

  // Helper to format date with time in local timezone
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // Format time in local timezone
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: date.getMinutes() !== 0 ? '2-digit' : undefined,
      hour12: true
    });

    if (compareDate.getTime() === today.getTime()) return `Today at ${timeStr}`;
    if (compareDate.getTime() === tomorrow.getTime()) return `Tomorrow at ${timeStr}`;

    // For other dates, show date and time
    const dateOnlyStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dateOnlyStr} at ${timeStr}`;
  };

  // Calculate top team (only if games have been played)
  const topTeam = standings.length > 0 && standings[0].played > 0 ? standings[0] : null;

  return (
    <div className="space-y-6">
      {/* Hero Section with Team Logos */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <Badge className="bg-white/20 text-white backdrop-blur-sm mb-3 inline-block">{topTeam ? 'Current Leader' : 'League 2026'}</Badge>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-1">
                {topTeam ? topTeam.name : 'Pickle2Fit League'}
              </h2>
              <p className="text-white/80 font-medium">
                {topTeam ? `${topTeam.wins} Wins • ${(topTeam.wins / (topTeam.played || 1) * 100).toFixed(0)}% WR` : '4 Teams Battle for Glory'}
              </p>
            </div>

            {/* Team Logos Grid */}
            <div className="grid grid-cols-4 gap-3 md:gap-4">
              {teams.map(team => (
                <div
                  key={team.id}
                  className={`relative group ${team.id === topTeam?.id && topTeam?.played > 0 ? 'scale-110' : ''}`}
                  title={team.name}
                >
                  {team.logo && (
                    <>
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white p-2 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {team.id === topTeam?.id && topTeam?.played > 0 && (
                        <div className="absolute -top-2 -right-2 animate-bounce">
                          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full p-1.5 shadow-lg ring-2 ring-yellow-300/50">
                            <Crown className="w-4 h-4 text-yellow-900" fill="currentColor" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <Card>
        <div className="p-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-lime-400" /> Standings
          </h3>
          <span className="text-xs text-slate-400">Top 4 to Playoffs</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-slate-400 font-medium uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">L</th>
                <th className="px-4 py-3 text-center">Flex</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.map((team, idx) => (
                <tr key={team.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-500">#{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-white">{team.name}</td>
                  <td className="px-4 py-3 text-center text-lime-400 font-bold">{team.wins}</td>
                  <td className="px-4 py-3 text-center text-slate-400">{team.losses}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 rounded ${team.flexUsed >= 8 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                      {team.flexUsed}/10
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Upcoming */}
        <Card>
          <div className="p-4 border-b border-white/5">
             <h3 className="font-bold text-slate-200">Upcoming Matches</h3>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingMatches.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No matches scheduled</div>
            ) : upcomingMatches.map(m => (
              <div key={m.id} className="p-4 hover:bg-white/5 transition-colors">
                 <div className="flex items-start gap-3">
                   <div className="text-xs text-slate-500 font-mono">#{m.id}</div>
                   <div className="flex-1 space-y-2">
                      {m.scheduledDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-lime-400" />
                          <span className="text-xs font-medium text-lime-400">{formatDate(m.scheduledDate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">{getTeamName(m.teamA)}</span>
                        <span className="text-xs text-slate-400">vs</span>
                        <span className="font-semibold text-sm text-right">{getTeamName(m.teamB)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                         <span
                           className="truncate w-24"
                           title={`${getPlayerName(m.pA1)} / ${getPlayerName(m.pA2, true)}`}
                         >
                           {getPlayerName(m.pA1)}/{getPlayerName(m.pA2)}
                         </span>
                         <span
                           className="truncate w-24 text-right"
                           title={`${getPlayerName(m.pB1)} / ${getPlayerName(m.pB2, true)}`}
                         >
                           {getPlayerName(m.pB1)}/{getPlayerName(m.pB2)}
                         </span>
                      </div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Results */}
        <Card>
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
             <h3 className="font-bold text-slate-200">Recent Results</h3>
             {recentMatches.length > 0 && (
               <button
                 onClick={onViewAllMatches}
                 className="text-xs text-lime-400 hover:text-lime-300 transition-colors flex items-center gap-1"
               >
                 View All
                 <ChevronRight className="w-3 h-3" />
               </button>
             )}
          </div>
          <div className="divide-y divide-white/5">
             {recentMatches.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">No games played yet</div>
            ) : recentMatches.map(m => (
              <div
                key={m.id}
                onClick={() => onMatchClick(m)}
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-xs text-slate-500 font-mono">#{m.id}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex-1">
                        <div className={`font-semibold text-sm ${m.winner === m.teamA ? 'text-lime-400' : 'text-slate-400'}`}>
                          {getTeamName(m.teamA)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {getPlayerName(m.pA1)}/{getPlayerName(m.pA2)}
                        </div>
                      </div>
                      <div className="text-center px-2">
                        <div className="font-mono font-bold text-base text-white">{m.score}</div>
                        {m.games && m.games.length > 0 && (
                          <div className="text-[9px] text-slate-600 space-x-1">
                            {m.games.filter(g => g.scoreA && g.scoreB).map((game, i) => (
                              <span key={i}>{game.scoreA}-{game.scoreB}</span>
                            ))}
                          </div>
                        )}
                        {m.reportedDate && (
                          <div className="text-[9px] text-slate-600 mt-0.5">
                            {formatDate(m.reportedDate)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-right">
                        <div className={`font-semibold text-sm ${m.winner === m.teamB ? 'text-lime-400' : 'text-slate-400'}`}>
                          {getTeamName(m.teamB)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {getPlayerName(m.pB1)}/{getPlayerName(m.pB2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- MATCH SCHEDULE & REPORTING ---

const MatchSchedule = ({ matches, updateMatch, teams, user, playerName, initialFilter = 'all' }) => {
  const { getPlayerName } = usePlayers();
  const [filterTeam, setFilterTeam] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [editingMatch, setEditingMatch] = useState(null);
  const [sortBy, setSortBy] = useState('id'); // 'id', 'date', 'status'
  const [completionFilter, setCompletionFilter] = useState(initialFilter); // 'all', 'completed', 'upcoming'

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.player-search-container')) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get all unique players, filtered by team if selected
  const allPlayers = useMemo(() => {
    if (filterTeam === 'All') {
      // Get all players from all teams
      return [...new Set(teams.flatMap(t => t.players))];
    } else {
      // Get players only from selected team
      const team = teams.find(t => t.id === filterTeam);
      return team ? [...team.players] : [];
    }
  }, [teams, filterTeam]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allPlayers
      .filter(playerId => getPlayerName(playerId).toLowerCase().includes(query))
      .slice(0, 8);
  }, [allPlayers, searchQuery, getPlayerName]);

  // Filter and sort matches by team and/or player
  const filteredMatches = matches
    .filter(m => {
      // Completion filter
      if (completionFilter === 'completed' && !m.winner) return false;
      if (completionFilter === 'upcoming' && m.winner) return false;

      // Team filter
      const teamMatch = filterTeam === 'All' || m.teamA === filterTeam || m.teamB === filterTeam;

      // Player filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const playerMatch =
          getPlayerName(m.pA1).toLowerCase().includes(query) ||
          getPlayerName(m.pA2).toLowerCase().includes(query) ||
          getPlayerName(m.pB1).toLowerCase().includes(query) ||
          getPlayerName(m.pB2).toLowerCase().includes(query);
        return teamMatch && playerMatch;
      }

      return teamMatch;
    })
    .sort((a, b) => {
      // When showing completed matches, sort by reported date descending
      if (completionFilter === 'completed') {
        if (a.reportedDate && b.reportedDate) {
          return new Date(b.reportedDate) - new Date(a.reportedDate);
        }
        return b.id - a.id;
      }

      if (sortBy === 'date') {
        // Sort by date: scheduled dates first (ascending), then unscheduled by ID
        if (a.scheduledDate && !b.scheduledDate) return -1;
        if (!a.scheduledDate && b.scheduledDate) return 1;
        if (a.scheduledDate && b.scheduledDate) {
          return new Date(a.scheduledDate) - new Date(b.scheduledDate);
        }
        return a.id - b.id;
      } else if (sortBy === 'status') {
        // Sort by status: upcoming first, then completed
        const aCompleted = !!a.winner;
        const bCompleted = !!b.winner;
        if (aCompleted !== bCompleted) {
          return aCompleted ? 1 : -1;
        }
        return a.id - b.id;
      } else {
        // Default: sort by ID
        return a.id - b.id;
      }
    });

  const handlePlayerSelect = (player) => {
    setSearchQuery(player);
    setShowAutocomplete(false);
    setSelectedIndex(-1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowAutocomplete(false);
    setSelectedIndex(-1);
  };

  const handleTeamFilter = (teamId) => {
    setFilterTeam(teamId);
    setSearchQuery(''); // Clear search when switching teams
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showAutocomplete || filteredPlayers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < filteredPlayers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handlePlayerSelect(filteredPlayers[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Team Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => handleTeamFilter('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterTeam === 'All' ? 'bg-lime-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
        >
          All Games
        </button>
        {teams.map(t => (
          <button
            key={t.id}
            onClick={() => handleTeamFilter(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterTeam === t.id ? 'bg-lime-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Completion Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Show:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setCompletionFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${completionFilter === 'all' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
          >
            All Matches
          </button>
          <button
            onClick={() => setCompletionFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${completionFilter === 'completed' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
          >
            Completed
          </button>
          <button
            onClick={() => setCompletionFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${completionFilter === 'upcoming' ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* Sort Options - Hidden when viewing completed matches */}
      {completionFilter !== 'completed' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('id')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === 'id' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
            >
              Game #
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${sortBy === 'date' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
            >
              <Calendar className="w-3 h-3" />
              Date
            </button>
            <button
              onClick={() => setSortBy('status')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === 'status' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
            >
              Status
            </button>
          </div>
        </div>
      )}

      {/* Player Search with Autocomplete */}
      <div className="relative player-search-container">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Search players${filterTeam !== 'All' ? ` in ${teams.find(t => t.id === filterTeam)?.name}` : ''}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAutocomplete(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowAutocomplete(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:border-lime-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {showAutocomplete && filteredPlayers.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-64 overflow-y-auto">
              {filteredPlayers.map((playerId, idx) => {
                const playerName = getPlayerName(playerId);
                const query = searchQuery.toLowerCase();
                const playerLower = playerName.toLowerCase();
                const matchIndex = playerLower.indexOf(query);

                return (
                  <button
                    key={playerId}
                    onClick={() => handlePlayerSelect(playerName)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-4 py-3 text-left text-sm text-white transition-colors flex items-center gap-3 ${
                      idx === selectedIndex
                        ? 'bg-lime-500/20 border-l-2 border-lime-500'
                        : 'hover:bg-lime-500/10'
                    } ${idx !== filteredPlayers.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <Users className={`w-4 h-4 flex-shrink-0 ${idx === selectedIndex ? 'text-lime-300' : 'text-lime-400'}`} />
                    <span className={`font-medium ${idx === selectedIndex ? 'text-lime-200' : ''}`}>
                      {matchIndex >= 0 ? (
                        <>
                          {playerName.substring(0, matchIndex)}
                          <span className="bg-lime-400/30 text-lime-100 px-0.5 rounded">
                            {playerName.substring(matchIndex, matchIndex + query.length)}
                          </span>
                          {playerName.substring(matchIndex + query.length)}
                        </>
                      ) : (
                        playerName
                      )}
                    </span>
                    {filterTeam !== 'All' && (
                      <span className="ml-auto text-xs text-slate-400 flex-shrink-0">
                        {teams.find(t => t.id === filterTeam)?.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {(searchQuery || filterTeam !== 'All' || completionFilter !== 'all') && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Filter className="w-3 h-3" />
          <span>
            Showing {filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'}
            {searchQuery && ` for "${searchQuery}"`}
            {completionFilter === 'completed' && ' (sorted by most recent)'}
          </span>
        </div>
      )}

      {/* Match List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-500 mb-2">No matches found</div>
            <button
              onClick={() => {
                setFilterTeam('All');
                setSearchQuery('');
                setCompletionFilter('all');
              }}
              className="text-sm text-lime-400 hover:text-lime-300 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredMatches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              teams={teams}
              searchQuery={searchQuery}
              onEdit={() => setEditingMatch(match)}
            />
          ))
        )}
      </div>

      {editingMatch && (
        <ReportModal
          match={editingMatch}
          teams={teams}
          user={user}
          playerName={playerName}
          onClose={() => setEditingMatch(null)}
          onSave={(id, data) => {
            updateMatch(id, data);
            setEditingMatch(null);
          }}
        />
      )}
    </div>
  );
};

const MatchCard = ({ match, teams, searchQuery = '', onEdit }) => {
  const { getPlayerName } = usePlayers();
  const isPlayed = !!match.winner;
  const teamAData = teams.find(t => t.id === match.teamA);
  const teamBData = teams.find(t => t.id === match.teamB);

  // Determine match status
  const getMatchStatus = () => {
    if (isPlayed) {
      return { label: 'Completed', className: 'bg-green-500/20 text-green-400' };
    } else if (match.scheduledDate) {
      return { label: 'Scheduled', className: 'bg-blue-500/20 text-blue-400' };
    } else {
      return { label: 'Unscheduled', className: 'bg-slate-700 text-slate-400' };
    }
  };

  const matchStatus = getMatchStatus();

  // Helper to highlight matching text
  const highlightText = (text) => {
    if (!searchQuery.trim()) return text;

    const query = searchQuery.toLowerCase();
    const textLower = text.toLowerCase();
    const matchIndex = textLower.indexOf(query);

    if (matchIndex === -1) return text;

    return (
      <>
        {text.substring(0, matchIndex)}
        <span className="bg-lime-400/30 text-lime-100 px-0.5 rounded">
          {text.substring(matchIndex, matchIndex + query.length)}
        </span>
        {text.substring(matchIndex + query.length)}
      </>
    );
  };

  // Format scheduled date with time in local timezone
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // Format time in local timezone
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: date.getMinutes() !== 0 ? '2-digit' : undefined,
      hour12: true
    });

    if (compareDate.getTime() === today.getTime()) return `Today at ${timeStr}`;
    if (compareDate.getTime() === tomorrow.getTime()) return `Tomorrow at ${timeStr}`;

    const dateOnlyStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
    return `${dateOnlyStr} at ${timeStr}`;
  };

  return (
    <div
      onClick={onEdit}
      className={`relative group bg-slate-800/50 border border-white/5 rounded-xl p-4 transition-all hover:bg-slate-800 hover:border-lime-500/30 cursor-pointer ${isPlayed ? 'opacity-70 hover:opacity-100' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          <Badge className={`${matchStatus.className} self-start`}>
            {matchStatus.label}
          </Badge>
          {isPlayed && match.reportedDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(match.reportedDate)}</span>
            </div>
          )}
          {!isPlayed && match.scheduledDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(match.scheduledDate)}</span>
            </div>
          )}
        </div>
        <span className="text-xs font-mono text-slate-500">Game #{match.id}</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Team A */}
        <div className="flex-1">
          <div className={`font-bold text-lg ${match.winner === match.teamA ? 'text-lime-400' : 'text-white'}`}>
            {teamAData?.name || match.teamA}
          </div>
          <div className="text-xs text-slate-400 flex flex-col mt-1">
            <span>{highlightText(getPlayerName(match.pA1))}</span>
            <span>{highlightText(getPlayerName(match.pA2))}</span>
          </div>
          {match.isFlexA && <span className="text-[10px] text-pink-400 border border-pink-500/30 px-1 rounded mt-1 inline-block">Flex Used</span>}
        </div>

        {/* VS / Score */}
        <div className="px-4 text-center">
          {isPlayed ? (
            <div className="flex flex-col gap-1">
              <div className="bg-slate-900 rounded-lg px-3 py-1 font-mono font-bold text-xl border border-white/10">
                {match.score}
              </div>
              {match.games && match.games.length > 0 && (
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  {match.games.filter(g => g.scoreA && g.scoreB).map((game, i) => (
                    <div key={i} className="font-mono">
                      {game.scoreA}-{game.scoreB}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-600 font-bold text-sm bg-slate-900/50 w-8 h-8 rounded-full flex items-center justify-center">
              VS
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="flex-1 text-right">
          <div className={`font-bold text-lg ${match.winner === match.teamB ? 'text-lime-400' : 'text-white'}`}>
            {teamBData?.name || match.teamB}
          </div>
          <div className="text-xs text-slate-400 flex flex-col items-end mt-1">
            <span>{highlightText(getPlayerName(match.pB1))}</span>
            <span>{highlightText(getPlayerName(match.pB2))}</span>
          </div>
          {match.isFlexB && <span className="text-[10px] text-pink-400 border border-pink-500/30 px-1 rounded mt-1 inline-block">Flex Used</span>}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/60 backdrop-blur-[1px] rounded-xl">
        <button className="bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold py-2 px-6 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2">
          <Edit3 size={16} /> {isPlayed ? 'View Details' : 'Edit Match'}
        </button>
      </div>
    </div>
  );
};

// App Info Modal
const AppInfoModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-red-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-red-500/20 p-2.5 rounded-xl border border-red-500/30">
                <Sparkles className="w-6 h-6 text-red-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-white">Live League Dashboard</h3>
              <p className="text-xs text-slate-400">Real-time pickleball league management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* What is This */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-lime-400" />
              What is Pickle2Fit League?
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              Welcome to the Pickle2Fit League 2026! This is a live, real-time pickleball tournament platform where players compete across 4 teams in a full round-robin format with 96 total matches.
            </p>
            <div className="bg-gradient-to-r from-lime-500/10 to-green-500/10 border border-lime-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-lime-500/20 p-2 rounded-lg flex-shrink-0">
                  <Trophy className="w-5 h-5 text-lime-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-lime-400 mb-1">Live Sync Enabled</div>
                  <div className="text-xs text-slate-300">
                    All changes sync instantly across all devices. When anyone reports a match result, everyone sees it in real-time!
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-lime-400" />
              How It Works
            </h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-sm">
                  1
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Sign In with Google</div>
                  <div className="text-xs text-slate-400">Quick authentication - your name is automatically recognized</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-sm">
                  2
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">View Live Dashboard</div>
                  <div className="text-xs text-slate-400">See real-time standings, upcoming matches, and team stats</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-sm">
                  3
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Report Match Results</div>
                  <div className="text-xs text-slate-400">After playing, click any match to report the score and winner</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-sm">
                  4
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Watch Standings Update</div>
                  <div className="text-xs text-slate-400">Standings automatically recalculate as results come in</div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-lime-400" />
              Key Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Wifi className="w-4 h-4 text-lime-400" />
                  <div className="font-semibold text-sm text-white">Real-Time Sync</div>
                </div>
                <div className="text-xs text-slate-400">Instant updates across all devices</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-lime-400" />
                  <div className="font-semibold text-sm text-white">Player Tracking</div>
                </div>
                <div className="text-xs text-slate-400">Know who reported each result</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-lime-400" />
                  <div className="font-semibold text-sm text-white">Match History</div>
                </div>
                <div className="text-xs text-slate-400">Track changes and edits over time</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-lime-400" />
                  <div className="font-semibold text-sm text-white">Auto Standings</div>
                </div>
                <div className="text-xs text-slate-400">Rankings update automatically</div>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-lime-400" />
              Powered By
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium text-blue-400">
                React
              </span>
              <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs font-medium text-orange-400">
                Firebase
              </span>
              <span className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs font-medium text-cyan-400">
                Tailwind CSS
              </span>
              <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-medium text-purple-400">
                Firestore
              </span>
              <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-medium text-green-400">
                Google Auth
              </span>
            </div>
          </section>

          {/* Help Section */}
          <section>
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-lime-400" />
              Need Help?
            </h4>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Can't see matches?</span> Make sure you're signed in and check your internet connection.
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Results not updating?</span> The app uses real-time sync - refresh if needed.
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Wrong score reported?</span> Click the match again to edit - your changes are tracked!
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-400 hover:to-green-400 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all duration-200 active:scale-95"
          >
            Got it, let's play!
          </button>
        </div>
      </div>
    </div>
  );
};

// Player Identification Modal with Autocomplete
const PlayerIdentificationModal = ({ teams, onIdentify }) => {
  const { getPlayerName } = usePlayers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Get all unique players from all teams
  const allPlayers = useMemo(() => {
    return [...new Set(teams.flatMap(t => t.players))];
  }, [teams]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return allPlayers.slice(0, 10); // Show first 10 if no query
    const query = searchQuery.toLowerCase();
    return allPlayers.filter(playerId => getPlayerName(playerId).toLowerCase().includes(query)).slice(0, 10);
  }, [allPlayers, searchQuery, getPlayerName]);

  const handlePlayerSelect = (player) => {
    onIdentify(player);
  };

  const handleKeyDown = (e) => {
    if (filteredPlayers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < filteredPlayers.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredPlayers.length - 1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handlePlayerSelect(filteredPlayers[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-lime-500/20 to-green-500/20 border-b border-lime-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-lime-500/20 p-2.5 rounded-full">
              <Users className="w-5 h-5 text-lime-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Who are you?</h2>
          </div>
          <p className="text-sm text-slate-300 ml-11">Select your name from the player list</p>
        </div>

        {/* Search Input */}
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search for your name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
            />
          </div>

          {/* Player List */}
          <div className="max-h-80 overflow-y-auto bg-slate-800/30 rounded-xl border border-white/5">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((playerId, idx) => {
                const playerName = getPlayerName(playerId);
                const query = searchQuery.toLowerCase();
                const playerLower = playerName.toLowerCase();
                const matchIndex = query ? playerLower.indexOf(query) : -1;

                return (
                  <button
                    key={playerId}
                    onClick={() => handlePlayerSelect(playerName)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-4 py-3 text-left text-sm text-white transition-all flex items-center gap-3 ${
                      idx === selectedIndex
                        ? 'bg-lime-500/20 border-l-2 border-lime-500'
                        : 'hover:bg-lime-500/10'
                    } ${idx !== filteredPlayers.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <Users className={`w-4 h-4 flex-shrink-0 ${idx === selectedIndex ? 'text-lime-300' : 'text-lime-400'}`} />
                    <span className={`font-medium ${idx === selectedIndex ? 'text-lime-200' : ''}`}>
                      {matchIndex >= 0 ? (
                        <>
                          {playerName.substring(0, matchIndex)}
                          <span className="bg-lime-400/30 text-lime-100 px-0.5 rounded">
                            {playerName.substring(matchIndex, matchIndex + query.length)}
                          </span>
                          {playerName.substring(matchIndex + query.length)}
                        </>
                      ) : (
                        playerName
                      )}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No players found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportModal = ({ match, onClose, onSave, teams, user, playerName }) => {
  const { getPlayerName } = usePlayers();
  // Initialize games from match.games or create 3 empty games
  const [games, setGames] = useState(match.games || [
    { scoreA: '', scoreB: '' },
    { scoreA: '', scoreB: '' },
    { scoreA: '', scoreB: '' }
  ]);
  const [winner, setWinner] = useState(match.winner || match.teamA);
  const [scheduledDate, setScheduledDate] = useState(match.scheduledDate || '');
  const [showHistory, setShowHistory] = useState(false);
  const [showPlayers, setShowPlayers] = useState(true);

  // Player editing state
  const teamAData = teams.find(t => t.id === match.teamA);
  const teamBData = teams.find(t => t.id === match.teamB);

  const [pA1, setPA1] = useState(match.pA1);
  const [pA2, setPA2] = useState(match.pA2);
  const [pB1, setPB1] = useState(match.pB1);
  const [pB2, setPB2] = useState(match.pB2);

  // Check Flex Status
  const isFlexA = (pA1 !== match.pA1 && pA1 !== match.pA2) || (pA2 !== match.pA1 && pA2 !== match.pA2);
  // Simplified check: If current selection is different from original scheduled players
  const checkFlexA = (match.pA1 !== pA1 || match.pA2 !== pA2);
  const checkFlexB = (match.pB1 !== pB1 || match.pB2 !== pB2);

  // Get user display name from player identification
  const getUserDisplayName = () => {
    if (playerName) return playerName;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Anonymous';
  };

  const handleSave = () => {
    const updateData = {
      pA1, pA2, pB1, pB2,
      isFlexA: checkFlexA,
      isFlexB: checkFlexB,
      scheduledDate: scheduledDate || null
    };

    const displayName = getUserDisplayName();
    const userId = user?.uid || 'unknown';

    // Create history entry for this change
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userName: displayName,
      userId: userId,
      changes: {}
    };

    // Track what changed
    if (match.scheduledDate !== (scheduledDate || null)) {
      historyEntry.changes.scheduledDate = { from: match.scheduledDate, to: scheduledDate || null };
    }
    if (match.pA1 !== pA1 || match.pA2 !== pA2) {
      historyEntry.changes.teamAPlayers = { from: `${match.pA1}, ${match.pA2}`, to: `${pA1}, ${pA2}` };
    }
    if (match.pB1 !== pB1 || match.pB2 !== pB2) {
      historyEntry.changes.teamBPlayers = { from: `${match.pB1}, ${match.pB2}`, to: `${pB1}, ${pB2}` };
    }

    // Calculate match winner based on games (best of 3)
    const validGames = games.filter(g => g.scoreA && g.scoreB);

    if (validGames.length > 0) {
      // Calculate who won each game
      let teamAWins = 0;
      let teamBWins = 0;

      validGames.forEach(game => {
        const scoreA = parseInt(game.scoreA);
        const scoreB = parseInt(game.scoreB);
        if (scoreA > scoreB) {
          teamAWins++;
        } else if (scoreB > scoreA) {
          teamBWins++;
        }
      });

      // Determine match winner (best of 3)
      const matchWinner = teamAWins > teamBWins ? match.teamA : match.teamB;
      const matchScore = `${teamAWins}-${teamBWins}`;

      updateData.games = games;
      updateData.score = matchScore;
      updateData.winner = matchWinner;
      updateData.reportedDate = new Date().toISOString();
      updateData.reportedBy = displayName;
      updateData.reportedById = userId;

      // Format games for history
      const gamesStr = validGames.map((g, i) => `Game ${i + 1}: ${g.scoreA}-${g.scoreB}`).join(', ');
      historyEntry.changes.games = { from: match.games ? 'Previous games' : 'Not set', to: gamesStr };
      historyEntry.changes.score = { from: match.score || 'Not set', to: matchScore };
      historyEntry.changes.winner = { from: match.winner || 'Not set', to: matchWinner };
    }

    // Add history entry if there are changes
    if (Object.keys(historyEntry.changes).length > 0) {
      const existingHistory = match.history || [];
      updateData.history = [...existingHistory, historyEntry];
    }

    onSave(match.id, updateData);
  };

  const handleClear = () => {
    if (!match.score) return; // Nothing to clear

    const displayName = getUserDisplayName();
    const userId = user?.uid || 'unknown';

    const updateData = {
      score: '',
      winner: null,
      games: null,
      reportedDate: null,
      reportedBy: null,
      reportedById: null
    };

    // Add history entry
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userName: displayName,
      userId: userId,
      changes: {
        score: { from: match.score, to: 'Cleared' },
        winner: { from: match.winner || 'Not set', to: 'Cleared' },
        games: { from: 'Previous games', to: 'Cleared' }
      }
    };

    const existingHistory = match.history || [];
    updateData.history = [...existingHistory, historyEntry];

    onSave(match.id, updateData);
  };

  // Format scheduled date with time in local timezone
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    // Format time in local timezone
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: date.getMinutes() !== 0 ? '2-digit' : undefined,
      hour12: true
    });

    if (compareDate.getTime() === today.getTime()) return `Today at ${timeStr}`;
    if (compareDate.getTime() === tomorrow.getTime()) return `Tomorrow at ${timeStr}`;

    const dateOnlyStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
    return `${dateOnlyStr} at ${timeStr}`;
  };

  // Format history timestamp
  const formatHistoryDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 md:p-5 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-800/80 to-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="bg-lime-500/10 p-2 rounded-lg">
              <Edit3 className="w-5 h-5 text-lime-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Game #{match.id}</h3>
              <p className="text-xs text-slate-400">Match Details & Scoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-4 md:p-6 space-y-5">
            {/* Reported By Info */}
            {match.reportedBy && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2.5 rounded-full flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-blue-400 font-bold mb-1">Reported By</div>
                    <div className="group relative inline-block">
                      <div className="text-base font-semibold text-white cursor-help">{match.reportedBy}</div>
                      {match.reportedById && (
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 whitespace-nowrap pointer-events-none">
                          <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
                            <div className="text-[10px] text-slate-400 mb-0.5">User ID</div>
                            <div className="text-xs font-mono text-white">{match.reportedById}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    {match.reportedDate && (
                      <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatHistoryDate(match.reportedDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Scheduled Date & Time */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wide text-slate-400 font-bold flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Scheduled Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3.5 text-sm text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
                value={scheduledDate ? (() => {
                  const d = new Date(scheduledDate);
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  const hours = String(d.getHours()).padStart(2, '0');
                  const minutes = String(d.getMinutes()).padStart(2, '0');
                  return `${year}-${month}-${day}T${hours}:${minutes}`;
                })() : ''}
                onChange={e => setScheduledDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
              />
              {scheduledDate && (
                <p className="text-xs text-slate-500 italic">
                  Displays as: {formatDate(scheduledDate)}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center">
                <button
                  onClick={() => setShowPlayers(!showPlayers)}
                  className="bg-slate-900 px-3 text-xs text-slate-400 hover:text-slate-300 uppercase tracking-wide flex items-center gap-2 transition-colors"
                >
                  <span>Player Details</span>
                  {showPlayers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {showPlayers && (
              <>
            {/* Team Players Section */}
            <div className="grid grid-cols-2 gap-4">
              {/* Team A */}
              <div className="space-y-3 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${teamAData?.color || 'from-lime-400 to-green-500'}`}></div>
                    <span className="font-bold text-sm text-white">{teamAData?.name || match.teamA}</span>
                  </div>
                  {checkFlexA && <Badge className="bg-pink-500/20 text-pink-400 text-[10px]">Flex</Badge>}
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-medium">Player 1</label>
                    <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all" value={pA1} onChange={e => setPA1(e.target.value)}>
                      {teamAData?.players.map(p => <option key={p} value={p}>{getPlayerName(p, true)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-medium">Player 2</label>
                    <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all" value={pA2} onChange={e => setPA2(e.target.value)}>
                      {teamAData?.players.map(p => <option key={p} value={p}>{getPlayerName(p, true)}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Team B */}
              <div className="space-y-3 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${teamBData?.color || 'from-orange-400 to-red-500'}`}></div>
                    <span className="font-bold text-sm text-white">{teamBData?.name || match.teamB}</span>
                  </div>
                  {checkFlexB && <Badge className="bg-pink-500/20 text-pink-400 text-[10px]">Flex</Badge>}
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-medium">Player 1</label>
                    <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all" value={pB1} onChange={e => setPB1(e.target.value)}>
                      {teamBData?.players.map(p => <option key={p} value={p}>{getPlayerName(p, true)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-medium">Player 2</label>
                    <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-xs text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all" value={pB2} onChange={e => setPB2(e.target.value)}>
                      {teamBData?.players.map(p => <option key={p} value={p}>{getPlayerName(p, true)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Best of 3 Games Scores */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-lime-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Best of 3 Games</h4>
              </div>

              {games.map((game, index) => (
                <div key={index} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <span className="text-xs font-bold text-slate-400">Game {index + 1}</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        placeholder="0"
                        value={game.scoreA}
                        onChange={(e) => {
                          const newGames = [...games];
                          newGames[index].scoreA = e.target.value;
                          setGames(newGames);
                        }}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-center font-mono text-xl text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
                      />
                      <div className="text-center text-slate-500 font-bold text-sm">-</div>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        placeholder="0"
                        value={game.scoreB}
                        onChange={(e) => {
                          const newGames = [...games];
                          newGames[index].scoreB = e.target.value;
                          setGames(newGames);
                        }}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-center font-mono text-xl text-white focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}

            {/* History Toggle - Moved to bottom */}
            {match.history && match.history.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                    <span className="text-sm font-medium text-slate-300">{showHistory ? 'Hide' : 'Show'} Change History</span>
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{match.history.length}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                </button>

                {showHistory && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {[...match.history].reverse().map((entry, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                              <Users className="w-3 h-3 text-purple-400" />
                            </div>
                            <div className="group relative inline-block">
                              <span className="text-sm font-medium text-white cursor-help">{entry.userName || 'Unknown'}</span>
                              {entry.userId && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 whitespace-nowrap pointer-events-none">
                                  <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
                                    <div className="text-[10px] text-slate-400 mb-0.5">User ID</div>
                                    <div className="text-xs font-mono text-white">{entry.userId}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <div className="space-y-1.5 pl-8">
                          {Object.entries(entry.changes).map(([key, value]) => {
                            // Convert team IDs to team names
                            let fromValue = value.from;
                            let toValue = value.to;

                            if (key === 'winner' && fromValue !== 'Not set' && fromValue !== 'Cleared') {
                              const fromTeam = teams.find(t => t.id === fromValue);
                              fromValue = fromTeam?.name || fromValue;
                            }
                            if (key === 'winner' && toValue !== 'Not set' && toValue !== 'Cleared') {
                              const toTeam = teams.find(t => t.id === toValue);
                              toValue = toTeam?.name || toValue;
                            }

                            // Format scheduled date if present
                            if (key === 'scheduledDate') {
                              fromValue = fromValue ? formatDate(fromValue) : 'Not set';
                              toValue = toValue ? formatDate(toValue) : 'Not set';
                            }

                            return (
                              <div key={key} className="text-xs">
                                <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-red-400/70 line-through">{fromValue}</span>
                                  <span className="text-slate-600">→</span>
                                  <span className="text-lime-400 font-medium">{toValue}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-all active:scale-95 flex items-center justify-center"
            title="Cancel"
          >
            <X size={20} />
          </button>
          {match.score && (
            <button
              onClick={handleClear}
              className="px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all active:scale-95 flex items-center justify-center"
              title="Clear match result"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-400 hover:to-green-400 text-slate-900 px-6 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center shadow-lg shadow-lime-500/20 transition-all active:scale-95"
            title={games.some(g => g.scoreA && g.scoreB) ? 'Save Result' : 'Save Changes'}
          >
            <Save size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- TEAMS ---

const EditTeamModal = ({ team, onClose }) => {
  const { players, updatePlayer } = usePlayers();
  const [editedPlayers, setEditedPlayers] = useState({});

  const handlePlayerNameChange = (playerId, newName) => {
    setEditedPlayers(prev => ({ ...prev, [playerId]: newName }));
  };

  const handleSave = async () => {
    // Update all edited players
    for (const [playerId, newName] of Object.entries(editedPlayers)) {
      if (newName.trim() && newName !== players[playerId]?.name) {
        await updatePlayer(playerId, newName.trim());
      }
    }
    onClose();
  };

  const getPlayerName = (playerId) => {
    return editedPlayers[playerId] !== undefined
      ? editedPlayers[playerId]
      : players[playerId]?.name || playerId;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Edit3 size={24} className="text-lime-400" />
              Edit {team.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {team.players.map(playerId => (
              <div key={playerId} className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  {playerId === team.captain && <Crown size={14} className="text-yellow-400" />}
                  {playerId === team.captain ? 'Captain' : 'Player'}
                </label>
                <input
                  type="text"
                  value={getPlayerName(playerId)}
                  onChange={(e) => handlePlayerNameChange(playerId, e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="Player name"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-lime-500 to-green-500 hover:from-lime-400 hover:to-green-400 text-slate-900 px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-lime-500/20 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamsList = ({ teams }) => {
  const { getPlayerName } = usePlayers();
  const [editingTeam, setEditingTeam] = useState(null);

  return (
    <>
      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
        />
      )}
      <div className="grid gap-6">
        {teams.map(team => (
          <div key={team.id} className="relative overflow-hidden rounded-2xl bg-slate-800/60 border border-white/5 shadow-xl">
            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${team.color}`} />
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                {team.logo && (
                  <div className="flex-shrink-0">
                    <img
                      src={team.logo}
                      alt={`${team.name} logo`}
                      className="w-20 h-20 object-contain rounded-xl bg-white/5 p-2"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-white">{team.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{team.players.length} Players</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTeam(team)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors group"
                    title="Edit team players"
                  >
                    <Edit3 size={18} className="text-slate-500 group-hover:text-lime-400 transition-colors" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                  <div className="bg-yellow-500/20 p-2 rounded-full">
                    <Crown size={18} className="text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500">Captain</div>
                    <div className="font-bold text-slate-200">{getPlayerName(team.captain, true)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {team.players.filter(p => p !== team.captain).map(playerId => (
                    <div key={playerId} className="bg-slate-700/30 p-2 rounded-lg text-sm text-slate-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      {getPlayerName(playerId, true)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// --- TIME SLOT SCHEDULING ---

const TimeSlotScheduler = ({ matches }) => {
  const { timeSlots, proposeTimeSlot, updateTimeSlot, deleteTimeSlot } = useTimeSlots();
  const { getPlayerName } = usePlayers();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showPastSlots, setShowPastSlots] = useState(false);

  // Filter active time slots and separate by past/upcoming
  const now = new Date();
  const activeSlots = timeSlots.filter(slot => slot.status === 'active');
  const upcomingSlots = activeSlots.filter(slot => new Date(slot.dateTime) >= now);
  const pastSlots = activeSlots.filter(slot => new Date(slot.dateTime) < now);

  const slotsToDisplay = showPastSlots ? activeSlots : upcomingSlots;

  return (
    <>
      {showProposalModal && (
        <TimeSlotProposalModal
          onClose={() => setShowProposalModal(false)}
          onSubmit={proposeTimeSlot}
        />
      )}

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <CalendarClock className="text-lime-400" size={28} />
              Schedule
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Propose play times and RSVP for matches
            </p>
          </div>
          <button
            onClick={() => setShowProposalModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-lime-500/20 transition-all duration-200 flex items-center gap-2"
          >
            <CalendarClock size={18} />
            Propose Time
          </button>
        </div>

        {/* Filter Toggle */}
        {pastSlots.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPastSlots(!showPastSlots)}
              className="text-sm text-slate-400 hover:text-lime-400 transition-colors flex items-center gap-2"
            >
              <Filter size={16} />
              {showPastSlots ? 'Hide' : 'Show'} Past Slots ({pastSlots.length})
            </button>
          </div>
        )}

        {/* Time Slots List */}
        {slotsToDisplay.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarClock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">
              No {showPastSlots ? '' : 'Upcoming '}Time Slots
            </h3>
            <p className="text-slate-500 mb-6">
              Propose a play time to get started
            </p>
            <button
              onClick={() => setShowProposalModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-slate-900 font-bold rounded-xl shadow-lg transition-all duration-200"
            >
              Propose First Time Slot
            </button>
          </Card>
        ) : (
          <div className="space-y-4">
            {slotsToDisplay.map(slot => (
              <TimeSlotCard
                key={slot.id}
                timeSlot={slot}
                matches={matches}
                getPlayerName={getPlayerName}
                updateTimeSlot={updateTimeSlot}
                deleteTimeSlot={deleteTimeSlot}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const TimeSlotProposalModal = ({ onClose, onSubmit }) => {
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dateTime) {
      setError('Please select a date and time');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSubmit(dateTime, location, notes);
      onClose();
    } catch (err) {
      console.error('Error proposing time slot:', err);
      setError('Failed to propose time slot. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <CalendarClock className="text-lime-400" size={24} />
            Propose Time Slot
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Downtown Courts, Main Facility"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about this play time..."
              rows={3}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Proposing...
                </>
              ) : (
                'Propose'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TimeSlotEditModal = ({ timeSlot, onClose, onSubmit }) => {
  const formatDateTimeLocal = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [dateTime, setDateTime] = useState(formatDateTimeLocal(timeSlot.dateTime));
  const [location, setLocation] = useState(timeSlot.location || '');
  const [notes, setNotes] = useState(timeSlot.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dateTime) {
      setError('Please select a date and time');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSubmit(timeSlot.id, dateTime, location, notes);
      onClose();
    } catch (err) {
      console.error('Error updating time slot:', err);
      setError('Failed to update time slot. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Edit3 className="text-blue-400" size={24} />
            Edit Time Slot
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Downtown Courts, Main Facility"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about this play time..."
              rows={3}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ onClose, onConfirm, timeSlot }) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Error deleting:', err);
      setDeleting(false);
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800/95 backdrop-blur-md border border-red-500/20 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Trash2 className="text-red-400" size={24} />
            Delete Time Slot
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete this time slot?
          </p>

          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
            <div className="text-lime-400 font-bold mb-1">
              {formatDateTime(timeSlot.dateTime)}
            </div>
            {timeSlot.location && (
              <div className="text-slate-400 text-sm">
                📍 {timeSlot.location}
              </div>
            )}
          </div>

          <p className="text-red-400 text-sm">
            This action cannot be undone. All RSVPs for this time slot will also be deleted.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeSlotCard = ({ timeSlot, matches, getPlayerName, updateTimeSlot, deleteTimeSlot }) => {
  const { getRSVPsForTimeSlot, user } = useTimeSlots();
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const rsvps = getRSVPsForTimeSlot(timeSlot.id);
  const comingRsvps = rsvps.filter(r => r.status === 'coming');
  const attendingPlayerIds = comingRsvps.map(r => r.playerId);

  // Calculate playable matches
  const playableMatches = calculatePlayableMatches(matches, attendingPlayerIds);

  // Calculate missing player impact
  const missingPlayers = calculateMissingPlayerImpact(matches, attendingPlayerIds, getPlayerName);

  // Format date/time
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const isPast = new Date(timeSlot.dateTime) < new Date();
  const canEdit = user && user.uid === timeSlot.proposedById;

  const handleDelete = async () => {
    try {
      await deleteTimeSlot(timeSlot.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting time slot:', err);
    }
  };

  return (
    <>
      {showRSVPModal && (
        <RSVPModal
          timeSlot={timeSlot}
          onClose={() => setShowRSVPModal(false)}
        />
      )}

      {showEditModal && (
        <TimeSlotEditModal
          timeSlot={timeSlot}
          onClose={() => setShowEditModal(false)}
          onSubmit={updateTimeSlot}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          timeSlot={timeSlot}
        />
      )}

      <Card className={`overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-lime-400 font-bold text-lg mb-1">
                <Calendar size={20} />
                {formatDateTime(timeSlot.dateTime)}
              </div>
              {timeSlot.location && (
                <div className="text-slate-400 text-sm flex items-center gap-2">
                  📍 {timeSlot.location}
                </div>
              )}
              <div className="text-slate-500 text-xs mt-2">
                Proposed by {timeSlot.proposedBy}
              </div>
            </div>
            {isPast && (
              <Badge className="bg-slate-700/50 text-slate-400">Past</Badge>
            )}
          </div>

          {timeSlot.notes && (
            <div className="text-slate-300 text-sm bg-slate-900/50 rounded-lg p-3 border border-white/5">
              {timeSlot.notes}
            </div>
          )}

          {/* RSVP Summary */}
          <RSVPSummary
            rsvps={rsvps}
            comingRsvps={comingRsvps}
            getPlayerName={getPlayerName}
          />

          {/* Playable Matches */}
          <PlayableMatchesSection
            playableMatches={playableMatches}
            timeSlot={timeSlot}
            totalRsvps={comingRsvps.length}
          />

          {/* Missing Players */}
          {missingPlayers.length > 0 && (
            <MissingPlayersSection
              missingPlayers={missingPlayers}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowRSVPModal(true)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-slate-900 font-bold rounded-xl shadow-lg transition-all duration-200"
            >
              RSVP
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              Details
            </button>
            {canEdit && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 font-medium rounded-xl transition-colors flex items-center gap-2"
                  title="Edit time slot"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-medium rounded-xl transition-colors flex items-center gap-2"
                  title="Delete time slot"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};

// Helper function to calculate playable matches
const calculatePlayableMatches = (matches, attendingPlayerIds) => {
  const attendingSet = new Set(attendingPlayerIds);

  return matches
    .filter(m => !m.winner) // Unplayed matches only
    .filter(m =>
      attendingSet.has(m.pA1) &&
      attendingSet.has(m.pA2) &&
      attendingSet.has(m.pB1) &&
      attendingSet.has(m.pB2)
    )
    .sort((a, b) => a.id - b.id);
};

// Helper function to calculate missing player impact
const calculateMissingPlayerImpact = (matches, attendingPlayerIds, getPlayerName) => {
  const attendingSet = new Set(attendingPlayerIds);
  const unplayedMatches = matches.filter(m => !m.winner);

  const playerImpact = {};

  unplayedMatches.forEach(match => {
    const requiredPlayers = [match.pA1, match.pA2, match.pB1, match.pB2];
    const missingPlayers = requiredPlayers.filter(p => !attendingSet.has(p));

    // Only consider if 1-2 players missing (realistic to recruit)
    if (missingPlayers.length > 0 && missingPlayers.length <= 2) {
      missingPlayers.forEach(playerId => {
        if (!playerImpact[playerId]) {
          // Find player's team
          const team = INITIAL_TEAMS.find(t => t.players.includes(playerId));

          playerImpact[playerId] = {
            playerId,
            playerName: getPlayerName(playerId, true),
            team: team || null,
            matchCount: 0,
            matches: []
          };
        }
        playerImpact[playerId].matchCount++;
        playerImpact[playerId].matches.push(match.id);
      });
    }
  });

  return Object.values(playerImpact)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 5);
};

const RSVPSummary = ({ rsvps, comingRsvps, getPlayerName }) => {
  if (rsvps.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 text-center">
        <p className="text-slate-400 text-sm">No RSVPs yet. Be the first!</p>
      </div>
    );
  }

  // Group coming players by team
  const playersByTeam = useMemo(() => {
    const grouped = {};

    comingRsvps.forEach(rsvp => {
      const team = INITIAL_TEAMS.find(t => t.players.includes(rsvp.playerId));
      if (team) {
        if (!grouped[team.id]) {
          grouped[team.id] = {
            team,
            players: []
          };
        }
        grouped[team.id].players.push(rsvp);
      }
    });

    return Object.values(grouped);
  }, [comingRsvps]);

  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Users className="text-lime-400" size={18} />
        <span className="font-bold text-white">
          {comingRsvps.length} Coming
        </span>
      </div>
      {comingRsvps.length > 0 && (
        <div className="space-y-3">
          {playersByTeam.map(({ team, players }) => (
            <div key={team.id} className="space-y-2">
              {/* Team Header */}
              <div className="flex items-center gap-2">
                {team.logo && (
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-5 h-5 object-contain"
                  />
                )}
                <div className={`text-xs font-bold bg-gradient-to-r ${team.color} bg-clip-text text-transparent`}>
                  {team.name}
                </div>
                <div className="text-xs text-slate-500">({players.length})</div>
              </div>

              {/* Team Players */}
              <div className="flex flex-wrap gap-2 pl-1">
                {players.map(rsvp => (
                  <div
                    key={rsvp.id}
                    className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm flex items-center gap-2"
                    title={rsvp.onBehalfOf ? `RSVP by ${rsvp.respondedBy}` : ''}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-300 font-medium">
                      {getPlayerName(rsvp.playerId)}
                    </span>
                    {rsvp.onBehalfOf && (
                      <span className="text-green-500/60 text-xs">👤</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PlayableMatchesSection = ({ playableMatches, timeSlot, totalRsvps }) => {
  const { linkMatchToTimeSlot } = useTimeSlots();
  const { getPlayerName } = usePlayers();
  const [linking, setLinking] = useState({});

  const handleLinkMatch = async (matchId, shouldLink) => {
    setLinking({ ...linking, [matchId]: true });
    try {
      await linkMatchToTimeSlot(timeSlot.id, matchId, shouldLink);
    } catch (err) {
      console.error('Error linking match:', err);
    } finally {
      setLinking({ ...linking, [matchId]: false });
    }
  };

  // Sort matches: linked ones first, then unlinked
  const sortedMatches = useMemo(() => {
    return [...playableMatches].sort((a, b) => {
      const aLinked = timeSlot.linkedMatches?.includes(a.id);
      const bLinked = timeSlot.linkedMatches?.includes(b.id);
      if (aLinked && !bLinked) return -1;
      if (!aLinked && bLinked) return 1;
      return a.id - b.id;
    });
  }, [playableMatches, timeSlot.linkedMatches]);

  const linkedCount = timeSlot.linkedMatches?.length || 0;

  return (
    <div className={`${playableMatches.length > 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900/50 border-white/10'} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className={playableMatches.length > 0 ? 'text-green-400' : 'text-slate-500'} size={18} />
        <span className={`font-bold ${playableMatches.length > 0 ? 'text-green-300' : 'text-slate-400'}`}>
          {playableMatches.length > 0
            ? `Can Play ${playableMatches.length} Match${playableMatches.length !== 1 ? 'es' : ''}`
            : 'Playable Matches'
          }
        </span>
        {linkedCount > 0 && (
          <span className="text-xs text-lime-400 bg-lime-500/20 px-2 py-0.5 rounded-full">
            {linkedCount} linked
          </span>
        )}
      </div>

      {playableMatches.length === 0 ? (
        <div className="text-sm text-slate-400">
          {totalRsvps === 0 ? (
            <>No RSVPs yet. Add RSVPs to see which matches can be played.</>
          ) : totalRsvps < 4 ? (
            <>Need at least 4 players to play a match. Currently {totalRsvps} player{totalRsvps !== 1 ? 's' : ''} coming.</>
          ) : (
            <>No complete matches yet. Need all 4 players from the same match to RSVP "coming".</>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedMatches.map(match => {
            const isLinked = timeSlot.linkedMatches?.includes(match.id);

            // Find teams for this match
            const teamA = INITIAL_TEAMS.find(t => t.players.includes(match.pA1));
            const teamB = INITIAL_TEAMS.find(t => t.players.includes(match.pB1));

            return (
              <div
                key={match.id}
                className={`bg-slate-900/50 rounded-lg p-3 flex items-center justify-between gap-3 ${
                  isLinked ? 'ring-1 ring-lime-500/30' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    Match #{match.id}
                    {isLinked && (
                      <span className="text-[10px] text-lime-400">📌</span>
                    )}
                    {/* Team indicators */}
                    {teamA && teamB && (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          {teamA.logo && (
                            <img
                              src={teamA.logo}
                              alt={teamA.name}
                              className="w-3.5 h-3.5 object-contain opacity-60"
                              title={teamA.name}
                            />
                          )}
                          <span className={`text-[9px] font-bold bg-gradient-to-r ${teamA.color} bg-clip-text text-transparent opacity-70`}>
                            {teamA.name.split(' ').map(w => w[0]).join('')}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-600">vs</span>
                        <div className="flex items-center gap-0.5">
                          {teamB.logo && (
                            <img
                              src={teamB.logo}
                              alt={teamB.name}
                              className="w-3.5 h-3.5 object-contain opacity-60"
                              title={teamB.name}
                            />
                          )}
                          <span className={`text-[9px] font-bold bg-gradient-to-r ${teamB.color} bg-clip-text text-transparent opacity-70`}>
                            {teamB.name.split(' ').map(w => w[0]).join('')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {getPlayerName(match.pA1)} & {getPlayerName(match.pA2)} vs{' '}
                    {getPlayerName(match.pB1)} & {getPlayerName(match.pB2)}
                  </div>
                </div>
                <button
                  onClick={() => handleLinkMatch(match.id, !isLinked)}
                  disabled={linking[match.id]}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    isLinked
                      ? 'bg-lime-500/20 text-lime-400 hover:bg-lime-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {linking[match.id] ? '...' : isLinked ? 'Linked' : 'Link'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MissingPlayersSection = ({ missingPlayers, expanded }) => {
  if (missingPlayers.length === 0) return null;

  const getPriorityStars = (count) => {
    if (count >= 5) return '⭐⭐⭐';
    if (count >= 3) return '⭐⭐';
    return '⭐';
  };

  return (
    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="text-orange-400" size={18} />
        <span className="font-bold text-orange-300">
          Key Missing Players
        </span>
      </div>
      <div className="space-y-2">
        {missingPlayers.map((player, idx) => (
          <div
            key={player.playerId}
            className="bg-slate-900/50 rounded-lg p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  <span className="text-orange-400">{idx + 1}.</span>
                  {player.playerName}
                  {player.team && (
                    <div className="flex items-center gap-1">
                      {player.team.logo && (
                        <img
                          src={player.team.logo}
                          alt={player.team.name}
                          className="w-4 h-4 object-contain opacity-70"
                          title={player.team.name}
                        />
                      )}
                      <span className={`text-[10px] font-bold bg-gradient-to-r ${player.team.color} bg-clip-text text-transparent opacity-80`}>
                        {player.team.name.split(' ').map(w => w[0]).join('')}
                      </span>
                    </div>
                  )}
                  <span className="text-xs">{getPriorityStars(player.matchCount)}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Would unlock {player.matchCount} match{player.matchCount !== 1 ? 'es' : ''}
                </div>
              </div>
            </div>
            {expanded && (
              <div className="mt-2 text-xs text-slate-500">
                Matches: {player.matches.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const RSVPModal = ({ timeSlot, onClose }) => {
  const { submitRSVP, getPlayerRSVP } = useTimeSlots();
  const { players } = usePlayers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [status, setStatus] = useState('coming');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.player-search-container')) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return Object.values(players).slice(0, 8);
    const query = searchQuery.toLowerCase();
    return Object.values(players)
      .filter(player => player.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [players, searchQuery]);

  // Get current RSVP for selected player
  const currentRSVP = selectedPlayer ? getPlayerRSVP(timeSlot.id, selectedPlayer) : null;

  useEffect(() => {
    if (currentRSVP) {
      setStatus(currentRSVP.status);
      setNotes(currentRSVP.notes || '');
    } else {
      setStatus('coming');
      setNotes('');
    }
  }, [selectedPlayer, currentRSVP]);

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player.id);
    setSearchQuery(player.name);
    setShowAutocomplete(false);
    setSelectedIndex(-1);
  };

  const handleClearPlayer = () => {
    setSelectedPlayer('');
    setSearchQuery('');
    setShowAutocomplete(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showAutocomplete || filteredPlayers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < filteredPlayers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handlePlayerSelect(filteredPlayers[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setSelectedIndex(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPlayer) {
      setError('Please select a player');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const onBehalfOf = false;
      await submitRSVP(timeSlot.id, selectedPlayer, status, notes, onBehalfOf);
      onClose();
    } catch (err) {
      console.error('Error submitting RSVP:', err);
      setError('Failed to submit RSVP. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-lime-400" size={24} />
            RSVP
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Player Search with Autocomplete */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Player *
            </label>
            <div className="relative player-search-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search for a player..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowAutocomplete(true);
                    setSelectedIndex(-1);
                    if (!e.target.value) {
                      setSelectedPlayer('');
                    }
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-10 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearPlayer}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showAutocomplete && filteredPlayers.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-64 overflow-y-auto">
                    {filteredPlayers.map((player, idx) => {
                      const query = searchQuery.toLowerCase();
                      const playerLower = player.name.toLowerCase();
                      const matchIndex = playerLower.indexOf(query);

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => handlePlayerSelect(player)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full px-4 py-3 text-left text-sm text-white transition-colors flex items-center gap-3 ${
                            idx === selectedIndex
                              ? 'bg-lime-500/20 border-l-2 border-lime-500'
                              : 'hover:bg-lime-500/10'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-slate-900 font-bold text-sm">
                            {player.name[0].toUpperCase()}
                          </div>
                          <span>
                            {matchIndex >= 0 && query ? (
                              <>
                                {player.name.substring(0, matchIndex)}
                                <span className="bg-lime-400/30 text-lime-300 font-semibold">
                                  {player.name.substring(matchIndex, matchIndex + query.length)}
                                </span>
                                {player.name.substring(matchIndex + query.length)}
                              </>
                            ) : (
                              player.name
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {currentRSVP && (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3 text-sm text-slate-300">
              Current RSVP: <span className={`font-bold ${currentRSVP.status === 'coming' ? 'text-green-400' : 'text-red-400'}`}>
                {currentRSVP.status === 'coming' ? 'Coming' : 'Not Coming'}
              </span>
              <div className="text-xs text-slate-500 mt-1">
                Responded by {currentRSVP.respondedBy}
              </div>
            </div>
          )}

          {/* Status Toggle Buttons */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Are you coming? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('coming')}
                className={`relative px-6 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${
                  status === 'coming'
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105'
                    : 'bg-slate-900/50 text-slate-400 border border-white/10 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`text-3xl ${status === 'coming' ? 'animate-bounce' : ''}`}>✅</div>
                  <span>Coming</span>
                </div>
                {status === 'coming' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400/20 to-transparent animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setStatus('not_coming')}
                className={`relative px-6 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${
                  status === 'not_coming'
                    ? 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30 scale-105'
                    : 'bg-slate-900/50 text-slate-400 border border-white/10 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">❌</div>
                  <span>Not Coming</span>
                </div>
                {status === 'not_coming' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-400/20 to-transparent animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50 transition-all resize-none"
            />
          </div>

          {/* History */}
          {currentRSVP && currentRSVP.history && currentRSVP.history.length > 0 && (
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3">
              <div className="text-xs font-medium text-slate-400 mb-2">History</div>
              <div className="space-y-1 text-xs text-slate-500">
                {currentRSVP.history.slice(-3).reverse().map((entry, idx) => (
                  <div key={idx}>
                    {entry.userName} changed to {entry.newStatus} • {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedPlayer}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit RSVP'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- RULES & PLAYOFFS ---

const RulesPage = () => (
  <div className="space-y-6">
    <Card className="p-6 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="text-yellow-400" size={28} />
        <h2 className="text-2xl font-black text-white">Playoff Format</h2>
      </div>
      <div className="space-y-6">
        <div className="relative pl-6 border-l-2 border-lime-500">
           <h3 className="font-bold text-lime-400 text-lg">🥇 Championship Match</h3>
           <p className="text-slate-300 text-sm mt-1">1st Place vs 2nd Place</p>
           <p className="text-slate-400 text-xs mt-1">Best of 5 Matches. First to 3 wins takes the crown.</p>
        </div>
        <div className="relative pl-6 border-l-2 border-orange-500">
           <h3 className="font-bold text-orange-400 text-lg">🥉 Third-Place Match</h3>
           <p className="text-slate-300 text-sm mt-1">3rd Place vs 4th Place</p>
           <p className="text-slate-400 text-xs mt-1">Best of 5 Matches.</p>
        </div>
      </div>
    </Card>

    <Card className="p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Zap className="text-pink-400" /> Flex Game Rule
      </h3>
      <ul className="space-y-3 text-sm text-slate-300">
        <li className="flex gap-2">
          <span className="text-pink-400 font-bold">•</span>
          Each team gets 10 Flex Games during the season.
        </li>
        <li className="flex gap-2">
          <span className="text-pink-400 font-bold">•</span>
          Switch player combinations freely during flex games.
        </li>
        <li className="flex gap-2">
          <span className="text-pink-400 font-bold">•</span>
          Once 10 flex games are used, you must return to standard pairings.
        </li>
      </ul>
    </Card>
    
    <Card className="p-6">
       <h3 className="font-bold text-lg mb-4 text-red-400">🔥 Tie-Breaker (Game 5)</h3>
       <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm">
         <p className="mb-2 font-bold text-red-300">If playoff match reaches 2-2:</p>
         <ul className="list-disc list-inside space-y-1 text-slate-300">
           <li>Played to 21 points</li>
           <li>Reshuffle partners every 5 points (5, 10, 15)</li>
           <li>Avoid repeating partners if possible</li>
         </ul>
       </div>
    </Card>
  </div>
);