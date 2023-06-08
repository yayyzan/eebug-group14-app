#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const char* ssid = "PixelJ";
const char* password = "12345678";

const char server1[] = "http://192.168.193.52/beacon/on";
const char server2[] = "http://192.168.193.52/beacon/off";

const char beacon_on[] = "on";
const char beacon_off[] = "off";

unsigned long last_time = 0;
const long Delay = 100; // 10 seconds

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long current_time = millis();
  if (current_time - last_time >= Delay) {
    last_time = current_time;
    if (Serial.available() > 0) {
      char command = Serial.read();
      if (command == '1') {
        sendBeaconRequest(server1);
      } else if (command == '2') {
        sendBeaconRequest(server2);
      }
    }
  }
}

void sendBeaconRequest(const char* server) {
  
  Serial.println("Sending request: " + String(server));
  if (WiFi.status() == WL_CONNECTED) {
    String status = HTTP_Request(server);
    Serial.println("Status: " + status);
  } else {
    Serial.println("WiFi got disconnected!");
  }
  
}

String HTTP_Request(const char* server_name) {
  WiFiClient client;
  HTTPClient http;
  http.begin(client, server_name);
  int httpResponseCode = http.GET();

  String payload = "--";

  if (httpResponseCode > 0) {
    Serial.println("HTTP Response code: ");
    Serial.println(httpResponseCode);
    payload = http.getString();
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  http.end();

  return payload;
}

