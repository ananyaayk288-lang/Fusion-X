import cv2
import json
import serial
import time

# Configure system serial port (Change COM3/USB0 depending on system)
SERIAL_PORT = "/dev/ttyUSB0" 
BAUD_RATE = 115200

try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"[MESH SUCCESS] Connected to ESP32 Mesh Gateway on {SERIAL_PORT}")
except Exception as e:
    print(f"[EMULATION MODE] Serial channel offline: {e}. Running simulation overlay.")
    ser = None

camera = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

print("\n--- CampusOS Quad-Mesh Tracking Initiated ---")
print("Press 'q' to terminate the video pipeline.\n")

while True:
    ret, frame = camera.read()
    if not ret:
        print("[CAMERA ERROR] Failed to grab frame.")
        break

    # Get frame dimensions to divide into 4 Quadrants
    h, w, _ = frame.shape
    mid_x, mid_y = w // 2, h // 2

    # Active-Low Relay Rule Baseline: 
    # 1 = Relay Disengaged (Light OFF), 0 = Relay Engaged (Light ON)
    quad_states = {"Q1": 1, "Q2": 1, "Q3": 1, "Q4": 1}

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray, 
        scaleFactor=1.1, 
        minNeighbors=6, 
        minSize=(30, 30)
    )

    for (x, y, w_box, h_box) in faces:
        # Calculate bounding box midpoint
        cx, cy = x + (w_box // 2), y + (h_box // 2)
        cv2.rectangle(frame, (x, y), (x+w_box, y+h_box), (139, 92, 246), 2)

        # 2x2 Boundary Grid Sorting Logic
        if cx < mid_x and cy < mid_y:
            quad_states["Q1"] = 0  # Top-Left Active (Relay ON)
            cv2.putText(frame, "Q1 Active", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        elif cx >= mid_x and cy < mid_y:
            quad_states["Q2"] = 0  # Top-Right Active (Relay ON)
            cv2.putText(frame, "Q2 Active", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        elif cx < mid_x and cy >= mid_y:
            quad_states["Q3"] = 0  # Bottom-Left Active (Relay ON)
            cv2.putText(frame, "Q3 Active", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        else:
            quad_states["Q4"] = 0  # Bottom-Right Active (Relay ON)
            cv2.putText(frame, "Q4 Active", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Render visual feedback overlays for hackathon presentation
    # A. Midpoint split grid lines
    cv2.line(frame, (mid_x, 0), (mid_x, h), (100, 100, 100), 1)
    cv2.line(frame, (0, mid_y), (w, mid_y), (100, 100, 100), 1)

    # B. Render quadrant text overlays
    cv2.putText(frame, f"Q1 (TL): {'ON' if quad_states['Q1'] == 0 else 'OFF'}", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (10, 200, 10) if quad_states['Q1'] == 0 else (100, 100, 100), 2)
    cv2.putText(frame, f"Q2 (TR): {'ON' if quad_states['Q2'] == 0 else 'OFF'}", (w - 140, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (10, 200, 10) if quad_states['Q2'] == 0 else (100, 100, 100), 2)
    cv2.putText(frame, f"Q3 (BL): {'ON' if quad_states['Q3'] == 0 else 'OFF'}", (20, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (10, 200, 10) if quad_states['Q3'] == 0 else (100, 100, 100), 2)
    cv2.putText(frame, f"Q4 (BR): {'ON' if quad_states['Q4'] == 0 else 'OFF'}", (w - 140, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (10, 200, 10) if quad_states['Q4'] == 0 else (100, 100, 100), 2)
    
    cv2.imshow("CampusOS Quad-Mesh Tracking Console", frame)

    # Send state payload to the ESP32 Gateway
    if ser and ser.is_open:
        packet = json.dumps({"quads": quad_states}) + "\n"
        ser.write(packet.encode('utf-8'))

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

camera.release()
cv2.destroyAllWindows()
if ser:
    ser.close()
print("[INFO] Mesh tracking terminated.")
