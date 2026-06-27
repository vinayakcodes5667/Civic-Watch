# 🌐 Civic-Watch: Hyperlocal Community Problem Solver

Civic-Watch is an intelligent, hyperlocal civic resolution platform built for the **Vibe2Ship Hackathon** (Community Hero Track). It bridges the gap between everyday citizens, municipal authorities (PWD), and law enforcement through automated AI triage, spatial verification, and real-time operational transparency.

## 🚨 The Challenge
Community reporting for public hazards (potholes, water leaks, broken streetlights) is traditionally fragmented, opaque, and plagued by "Black Hole Syndrome"—where citizens submit complaints that disappear without status updates or accountability.

## 💡 Our Solution & Core Architecture
Civic-Watch eliminates friction by establishing a **Universal Triple-Persona Ecosystem** governed by Role-Based Access Control (RBAC):

1. **🧑 Citizen Persona (Gamified Intake & Verification):**
   - **Asynchronous Location Gate:** Enforces spatial accuracy by verifying if the user is physically on-scene (`[📍 I am here right now]`) or reporting remotely.
   - **Mandatory Spatial Photography:** Requires 3 distinct spatial angles (Hazard Close-up, Street Context, Landmark Angle) to eliminate fraudulent or unresolvable reports.
   - **Gamification Loop:** Citizens earn Social Points (+5 for submitting, +2 for cross-verifying neighborhood reports) and compete on a local 👑 Leaderboard.

2. **👮 Police Persona (Physical Verification & Archive Loop):**
   - **Zero-Friction Dispatch:** Officers review flagged public safety hazards and utilize native OS Google Maps turn-by-turn routing to drive directly to coordinates.
   - **Dual-Tab Gratification:** Solves bureaucratic fatigue by instantly moving verified hazards out of the active feed and into a dedicated `[✓ Successfully Validated]` archive.

3. **🏗️ PWD / Municipal Persona (Actionable Triage & Resolution):**
   - **AI Triage Engine:** Automatically synthesizes hazard categories and assigns dynamic severity scores (`CRITICAL 92%`, `HIGH`, `MODERATE`) with AI reasoning.
   - **Universal Filter Bar:** Allows dispatchers to slice data by Category, AI Severity, or simulated walking distance (`📍 Near Me`).
   - **Live Pipeline Tracking:** Seamlessly transitions public infrastructure tickets from `Pending` -> `Validated` -> `Resolving` -> `Fixed`.

## 🗺️ Native OS Deep Linking
To ensure field utility without API key vulnerabilities, Civic-Watch implements universal deep linking. Clicking `[Directions]` on any card dynamically extracts GPS coordinates or encoded text addresses and launches `https://www.google.com/maps/dir/?api=1&destination=...`, initiating live turn-by-turn navigation from the user's current device location.

## 🛠️ Technology Stack
- **Frontend / UI:** React, Tailwind CSS, Lucide Icons, Glassmorphic Design System
- **State Management:** Reactive Client State / LocalStorage Persistence
- **AI Triage:** Simulated Multimodal Priority Synthesis
- **Mapping:** Google Maps Universal Directions API
- **Cloud Deployment:** Google Cloud (via Google AI Studio)
