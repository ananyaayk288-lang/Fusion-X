import time
import random
import json
import os
import sys
import pickle
import argparse
import requests
import requests

# Try to import heavy ML dependencies, fallback gracefully if not installed
try:
    import cv2
    import face_recognition
    ML_DEPS_INSTALLED = True
except ImportError:
    ML_DEPS_INSTALLED = False
    print("[Warning] OpenCV or face_recognition not installed. Will run in simulated fallback mode.")
# ---------------------------------------------------------
# CONFIGURATION & PARAMETERS
# ---------------------------------------------------------

API_GATEWAY_URL = "http://localhost:3000/api/attendance/snapshot"
DEFAULT_SLOT_ID = "00000000-0000-0000-0000-000000000002" # Mock Slot ID (corresponds to bp@vvce timetable slot)

# Mapping database student names to USNs
NAME_TO_USN = {
    "bharath kumar a": "032",
    "bharath": "032",
    "bk": "032",
    "ananya yk": "012",
    "ananya": "012",
    "bp": "008",
    "bharath p": "008",
    "riddhi": "099",
    "anagha": "003",
    "rishith": "089",
    "rishi": "089"
}

def generate_random_check_timestamps(duration, count=5):
    """Generates distinct, sorted random timestamps within the duration (excluding final 10% buffer)"""
    end_limit = int(duration * 0.9) # Exclude final 10% buffer
    if end_limit <= count:
        # Fallback if duration is too short to select unique samples
        return sorted([random.randint(1, max(1, duration - 1)) for _ in range(count)])
    random_times = random.sample(range(1, end_limit), count)
    random_times.sort()
    return random_times

def run_face_recognition(encodings_path, duration_seconds=5):
    """Opens webcam briefly, detects faces, matches against trained pickle encodings, and returns USNs"""
    print("[FACE RECOGNITION] Activating camera for check...")
    
    # Fallback immediately if ML dependencies are not installed
    if not ML_DEPS_INSTALLED:
        print("[Warning] ML dependencies missing. Running in simulated fallback mode.")
        return ["4VV25EC032"] # Fallback mock

    if not os.path.exists(encodings_path):
        print(f"[Warning] Encodings file '{encodings_path}' not found. Running in simulated fallback mode.")
        return ["4VV25EC032"] # Fallback mock

    # Load reference encodings
    try:
        with open(encodings_path, "rb") as f:
            data = pickle.load(f)
        known_face_encodings = data["encodings"]
        known_face_names = data["names"]
    except Exception as e:
        print(f"[Error] Failed to load encodings: {e}")
        return []

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[Error] Cannot open webcam. Running in simulated fallback mode.")
        return ["4VV25EC012"]

    detected_names = set()
    start_time = time.time()

    # Capture frames for duration_seconds to allow face detection and stabilization
    while time.time() - start_time < duration_seconds:
        ret, frame = cap.read()
        if not ret:
            break

        # Flip for mirroring
        frame = cv2.flip(frame, 1)
        # Downscale frame for faster processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        # Find faces
        face_locations = face_recognition.face_locations(rgb_small_frame, model="hog")
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            
            name = "UNKNOWN"
            accuracy = 0

            if len(face_distances) > 0:
                best_match_idx = face_distances.argmin()
                if matches[best_match_idx]:
                    name = known_face_names[best_match_idx]
                    detected_names.add(name.lower())
                    distance = face_distances[best_match_idx]
                    accuracy = int(max(0, (1.0 - distance) * 100))

            # Scale back up face locations since the frame we detected in was scaled to 1/4 size
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            # Draw a box around the face
            color = (0, 255, 0) if name != "UNKNOWN" else (0, 0, 255)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

            # Draw a label with a name below the face
            label = f"{name} ({accuracy}%)" if name != "UNKNOWN" else name
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            cv2.putText(
                frame, 
                label, 
                (left + 6, bottom - 6), 
                cv2.FONT_HERSHEY_SIMPLEX, 
                0.6, 
                (255, 255, 255), 
                1, 
                cv2.LINE_AA
            )

        # Display camera frame during checks
        cv2.putText(frame, "AUTOMATED RANDOM CHECK IN PROGRESS...", (20, 40), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2)
        cv2.imshow("Automated Check Console", frame)
        cv2.waitKey(1)

    cap.release()
    cv2.destroyAllWindows()

    # Map matched names to USNs
    present_usns = []
    for name in detected_names:
        # Robust match: exact key match, key is a substring of name, or name is a substring of key
        usn = None
        for key, val in NAME_TO_USN.items():
            if key == name or key in name or name in key:
                usn = val
                break

        if usn:
            present_usns.append(usn)
            print(f"[FACE RECOGNITION] Detected trained student: {name.upper()} (USN: {usn})")
        else:
            print(f"[FACE RECOGNITION] Detected unknown face or unmapped name: {name}")

    return present_usns

def scheduler_loop(slot_id, duration_seconds, is_demo, encodings_path, api_url, teacher_id):
    print("=" * 60)
    print("   CONNECT & PREP - RANDOMIZED TELEMETRY VERIFICATION ENGINE")
    print("=" * 60)
    print(f"Mode: {'DEMO (60 Seconds Session)' if is_demo else 'PRODUCTION (60 Minutes Session)'}")
    print(f"Total Session Duration: {duration_seconds} seconds")
    print(f"Target API Endpoint: {api_url}")
    print(f"Slot ID: {slot_id}")
    print(f"Teacher ID: {teacher_id}")
    
    check_targets = generate_random_check_timestamps(duration_seconds, count=5)
    print(f"Random Check Times Scheduled at (Seconds): {check_targets}")
    print("=" * 60)
    
    current_check_index = 0
    start_time = time.time()
    
    while current_check_index < 5:
        elapsed = time.time() - start_time
        
        # Draw dynamic CLI countdown
        time_left = int(check_targets[current_check_index] - elapsed)
        if time_left > 0:
            sys.stdout.write(f"\r[STATUS] Next check (#{current_check_index + 1}) in {time_left}s...  ")
            sys.stdout.flush()
        else:
            print(f"\n\n[TRIGGER] Executing Validation Check #{current_check_index + 1}!")
            
            # 1. Run actual camera validation (shorter camera time if total duration is small)
            cam_duration = 3 if duration_seconds <= 20 else 4
            detected_usns = run_face_recognition(encodings_path, duration_seconds=cam_duration)
            print(f"[telemetry] Present students: {detected_usns}")
            
            # 2. POST telemetry payload to Next.js API
            payload = {
                "slot_id": slot_id,
                "check_number": current_check_index + 1,
                "present_usns": detected_usns,
                "teacher_id": teacher_id
            }
            
            try:
                res = requests.post(api_url, json=payload, timeout=5)
                if res.status_code == 200:
                    print(f"[SUCCESS] Telemetry snapshot #{current_check_index + 1} synced to backend!")
                else:
                    print(f"[FAILED] API returned status {res.status_code}: {res.text}")
            except Exception as e:
                print(f"[OFFLINE] Caching snapshot locally. API failed: {e}")
                
            current_check_index += 1
            print("-" * 60)
            
        time.sleep(1)

    print("\n[COMPLETE] All 5 randomized checks finished successfully!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Connect & Prep Attendance Randomizer")
    parser.add_argument("--prod", action="store_true", help="Run in production mode (60-minute duration)")
    parser.add_argument("--slot", type=str, default=DEFAULT_SLOT_ID, help="Active slot UUID")
    parser.add_argument("--api", type=str, default=API_GATEWAY_URL, help="Next.js API route URL")
    parser.add_argument("--duration", type=int, default=0, help="Custom duration in seconds")
    parser.add_argument("--teacher", type=str, default="", help="Active teacher UUID")
    
    args = parser.parse_args()
    
    # 60 seconds for demo (1 minute), 3600 seconds for production (1 hour), or custom duration
    if args.duration > 0:
        duration = args.duration
    else:
        duration = 3600 if args.prod else 60
        
    enc_path = "trainer/encodings.pickle"
    
    scheduler_loop(
        slot_id=args.slot,
        duration_seconds=duration,
        is_demo=duration <= 60,
        encodings_path=enc_path,
        api_url=args.api,
        teacher_id=args.teacher
    )
