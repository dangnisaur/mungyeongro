"use client";

// Firebase 클라이언트 SDK (Auth 전용 — Firestore 접근은 전부 서버 경유).
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from "firebase/auth";

const EMULATOR = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1";

function config() {
  if (EMULATOR) {
    return {
      apiKey: "demo-api-key",
      authDomain: "localhost",
      projectId: "demo-munggyeongro",
    };
  }
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  };
}

let clientApp: FirebaseApp | null = null;
let emulatorConnected = false;

export function firebaseAuth(): Auth {
  if (!clientApp) {
    clientApp = getApps()[0] ?? initializeApp(config());
  }
  const auth = getAuth(clientApp);
  if (EMULATOR && !emulatorConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    emulatorConnected = true;
  }
  return auth;
}

export const googleProvider = new GoogleAuthProvider();
