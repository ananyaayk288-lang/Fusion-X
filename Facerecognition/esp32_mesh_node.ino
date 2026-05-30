/*
 * =========================================================================
 * CAMPUSOS - ESP32 QUAD-MESH LIGHTING CONTROLLER (ArduinoJson v6/v7 Compatible)
 * =========================================================================
 * This sketch runs on the Gateway ESP32 node connected to the Python tracking 
 * server via USB Serial. It receives JSON tracking payloads, toggles 
 * physical relay pins locally, and broadcasts the states to remote mesh nodes.
 * 
 * Required Arduino Libraries:
 *  1. ArduinoJson (by Benoit Blanchon) - Supports BOTH v6 and v7
 *  2. painlessMesh (by devinmacy / arkhipenko)
 *  3. TaskScheduler (automatically installed with painlessMesh)
 * =========================================================================
 */

#include "painlessMesh.h"
#include <ArduinoJson.h>

// --- USER CONFIGURABLE PARAMETERS ---
#define MESH_PREFIX     "CampusOSMesh"
#define MESH_PASSWORD   "CampusOSPass123"
#define MESH_PORT       5555

// Set to 1 for Active-Low relays (0 = Relay ON, 1 = Relay OFF)
// Set to 0 for Active-High relays (1 = Relay ON, 0 = Relay OFF)
#define ACTIVE_LOW_RELAYS 1 

// --- PHYSICAL GPIO RELAY PINS ---
#define RELAY_Q1  25  // Top-Left corner lights (Q1) - Safe (Non-strapping)
#define RELAY_Q2  26  // Top-Right corner lights (Q2) - Safe (Non-strapping)
#define RELAY_Q3  27  // Bottom-Left corner lights (Q3) - Safe (Non-strapping)
#define RELAY_Q4  32  // Bottom-Right corner lights (Q4) - Safe (Non-strapping)

// --- RELAY CONSTANTS RESOLVER ---
#define RELAY_ON  (ACTIVE_LOW_RELAYS ? LOW : HIGH)
#define RELAY_OFF (ACTIVE_LOW_RELAYS ? HIGH : LOW)

Scheduler     userScheduler; // mesh task scheduler

// Meyers Singleton pattern to prevent Static Initialization Order Fiasco (early boot crashes)
painlessMesh& getMesh() {
  static painlessMesh meshInstance;
  return meshInstance;
}
#define mesh getMesh()

// Buffer to accumulate serial characters
String inputBuffer = "";
const unsigned int MAX_BUFFER_SIZE = 512; // Buffer overflow protection

// Function declarations
void processSerialPacket(String packet);
void setRelayStates(int q1, int q2, int q3, int q4);

// Callback when a mesh message is received (from other nodes)
void receivedCallback(uint32_t from, String &msg) {
  Serial.printf("[MESH MSG] Received from Node %u: %s\n", from, msg.c_str());
  
  // Resolve compatibility differences between ArduinoJson v6 and v7
  #if ARDUINOJSON_VERSION_MAJOR >= 7
    JsonDocument doc;
  #else
    StaticJsonDocument<256> doc;
  #endif
  
  DeserializationError error = deserializeJson(doc, msg);
  
  if (error) {
    Serial.printf("[JSON MESH ERROR] Deserialization failed: %s\n", error.c_str());
    return;
  }
  
  if (doc.containsKey("quads")) {
    int q1 = doc["quads"]["Q1"];
    int q2 = doc["quads"]["Q2"];
    int q3 = doc["quads"]["Q3"];
    int q4 = doc["quads"]["Q4"];
    
    Serial.println("[MESH ACTION] Synchronizing local relays with incoming mesh state...");
    setRelayStates(q1, q2, q3, q4);
  }
}

void newConnectionCallback(uint32_t nodeId) {
  Serial.printf("[MESH INFO] New connection established with Node ID: %u\n", nodeId);
  Serial.printf("[MESH INFO] Total mesh nodes currently online: %u\n", mesh.getNodeList().size() + 1);
}

void setup() {
  Serial.begin(115200);
  delay(500); // Allow hardware serial unit to stabilize
  
  Serial.println("\n=============================================");
  Serial.println("  CAMPUSOS IoT MESH GRID LIGHTING INITIALIZING ");
  Serial.println("=============================================");

  // Initialize Relay control GPIOs as OUTPUT
  pinMode(RELAY_Q1, OUTPUT);
  pinMode(RELAY_Q2, OUTPUT);
  pinMode(RELAY_Q3, OUTPUT);
  pinMode(RELAY_Q4, OUTPUT);
  
  // Set default state: all relays disengaged (Lights OFF)
  digitalWrite(RELAY_Q1, RELAY_OFF);
  digitalWrite(RELAY_Q2, RELAY_OFF);
  digitalWrite(RELAY_Q3, RELAY_OFF);
  digitalWrite(RELAY_Q4, RELAY_OFF);
  Serial.println("[GPIO CONFIG] Relay pins set to OUTPUT. Initial state: OFF.");

  // Initialize painlessMesh
  mesh.setDebugMsgTypes(ERROR | STARTUP); 
  mesh.init(MESH_PREFIX, MESH_PASSWORD, &userScheduler, MESH_PORT);
  mesh.onReceive(&receivedCallback);
  mesh.onNewConnection(&newConnectionCallback);

  Serial.printf("[WIFI MESH INIT] Prefix: \"%s\" | Port: %d\n", MESH_PREFIX, MESH_PORT);
  Serial.printf("[WIFI MESH INIT] Node ID for this device: %u\n", mesh.getNodeId());
  Serial.println("[ESP32 MESH SYSTEM READY] Standing by for serial packets...");
  Serial.println("=============================================\n");
}

void loop() {
  // Update painlessMesh engine tasks
  mesh.update();

  // Read data from the Python OpenCV Tracking Gateway via USB Serial
  while (Serial.available() > 0) {
    char inChar = (char)Serial.read();
    
    // Check for packet delimiter
    if (inChar == '\n') {
      if (inputBuffer.length() > 0) {
        processSerialPacket(inputBuffer);
        inputBuffer = ""; // Reset buffer after processing
      }
    } else {
      // Buffer safety check: prevent memory exhaustion from noise/runaway serial streams
      if (inputBuffer.length() < MAX_BUFFER_SIZE) {
        inputBuffer += inChar;
      } else {
        Serial.println("[SERIAL WARNING] Buffer overflow! Resetting line buffer.");
        inputBuffer = "";
      }
    }
  }
}

// Function to process incoming tracking payload from gateway
void processSerialPacket(String packet) {
  #if ARDUINOJSON_VERSION_MAJOR >= 7
    JsonDocument doc;
  #else
    StaticJsonDocument<256> doc;
  #endif
  
  DeserializationError error = deserializeJson(doc, packet);

  if (error) {
    Serial.printf("[SERIAL JSON ERROR] Parsing failed: %s\n", error.c_str());
    return;
  }

  // Check if packet contains quad states
  if (doc.containsKey("quads")) {
    int q1 = doc["quads"]["Q1"];
    int q2 = doc["quads"]["Q2"];
    int q3 = doc["quads"]["Q3"];
    int q4 = doc["quads"]["Q4"];

    // 1. Update local relays immediately
    setRelayStates(q1, q2, q3, q4);

    // 2. Broadcast the tracking state wirelessly to all other mesh nodes
    mesh.sendBroadcast(packet);
    
    // Debug print confirmation
    Serial.printf("[GATEWAY SERIAL TX] Q1:%s | Q2:%s | Q3:%s | Q4:%s (State Broadcasted)\n",
                  (q1 == 0 ? "ON" : "OFF"), (q2 == 0 ? "ON" : "OFF"), 
                  (q3 == 0 ? "ON" : "OFF"), (q4 == 0 ? "ON" : "OFF"));
  }
}

// Helper function to drive relay output pins
void setRelayStates(int q1, int q2, int q3, int q4) {
  // Drive relays based on value. Recall: Python uses 0 for occupied (ON), 1 for empty (OFF)
  digitalWrite(RELAY_Q1, (q1 == 0) ? RELAY_ON : RELAY_OFF);
  digitalWrite(RELAY_Q2, (q2 == 0) ? RELAY_ON : RELAY_OFF);
  digitalWrite(RELAY_Q3, (q3 == 0) ? RELAY_ON : RELAY_OFF);
  digitalWrite(RELAY_Q4, (q4 == 0) ? RELAY_ON : RELAY_OFF);
}
