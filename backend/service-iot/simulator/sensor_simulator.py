#!/usr/bin/env python3
"""
EcoTrack — Simulateur de capteurs IoT
Simule N conteneurs qui publient leurs données MQTT toutes les 5 minutes.
"""

import json
import random
import time
import signal
import sys
import argparse
from datetime import datetime

import paho.mqtt.client as mqtt

# ── Configuration ─────────────────────────────────────────────────────────────

MQTT_HOST     = "localhost"
MQTT_PORT     = 1883
INTERVAL_SEC  = 300       # 5 minutes (configurable via --interval)
TOPIC_PATTERN = "containers/{container_id}/data"

# Conteneurs réels de service-containers (UUIDs valides)
# Remplacer par les vrais IDs si besoin
DEFAULT_CONTAINERS = [
    "9a1df64b-03d7-479b-9c28-62b50d3e7f9f",
    "2d7b976c-efe6-4a08-aeca-89942df354fb",
    # Ajouter d'autres UUIDs ici
]

# ── Simulation des données capteurs ───────────────────────────────────────────

# État persistant par conteneur (simule une montée progressive du remplissage)
sensor_state = {}

def init_sensor(container_id):
    """Initialise l'état d'un capteur."""
    sensor_state[container_id] = {
        "fillLevel":   random.randint(10, 50),
        "temperature": random.uniform(15, 30),
        "humidity":    random.uniform(40, 70),
        "faulty":      random.random() < 0.05,  # 5% de capteurs défaillants
    }

def generate_reading(container_id):
    """
    Génère une mesure réaliste :
    - Le remplissage monte progressivement (+0 à +5% par cycle)
    - La température varie légèrement
    - Les capteurs défaillants envoient des valeurs aberrantes
    """
    state = sensor_state[container_id]

    if state["faulty"]:
        # Capteur défaillant : valeurs hors plage ou aléatoires
        return {
            "containerId": container_id,
            "fillLevel":   random.randint(0, 100),
            "temperature": random.choice([random.uniform(-20, -15), random.uniform(65, 90)]),
            "humidity":    random.uniform(95, 100),
        }

    # Montée progressive du remplissage (reset si plein)
    state["fillLevel"] = min(100, state["fillLevel"] + random.randint(0, 5))
    if state["fillLevel"] >= 100:
        state["fillLevel"] = random.randint(5, 15)  # vidé

    # Variation légère température / humidité
    state["temperature"] = round(state["temperature"] + random.uniform(-1, 1), 1)
    state["temperature"] = max(5, min(45, state["temperature"]))
    state["humidity"]    = round(state["humidity"] + random.uniform(-2, 2), 1)
    state["humidity"]    = max(20, min(90, state["humidity"]))

    return {
        "containerId": container_id,
        "fillLevel":   state["fillLevel"],
        "temperature": state["temperature"],
        "humidity":    state["humidity"],
    }

# ── MQTT ──────────────────────────────────────────────────────────────────────

running = True

def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        print(f"[{ts()}] ✅ Connecté au broker MQTT {MQTT_HOST}:{MQTT_PORT}")
    else:
        print(f"[{ts()}] ❌ Connexion échouée (code {reason_code})")

def on_disconnect(client, userdata, disconnect_flags, reason_code, properties=None):
    print(f"[{ts()}] ⚠️  Déconnecté du broker MQTT")

def ts():
    return datetime.now().strftime("%H:%M:%S")

def publish_all(client, container_ids):
    """Publie une mesure pour chaque conteneur."""
    published = 0
    for cid in container_ids:
        payload = generate_reading(cid)
        topic   = TOPIC_PATTERN.format(container_id=cid[:8])  # topic lisible
        msg     = json.dumps(payload)
        result  = client.publish(topic, msg, qos=1)

        status = "✅" if result.rc == 0 else "❌"
        faulty = " [DÉFAILLANT]" if sensor_state[cid]["faulty"] else ""
        print(
            f"[{ts()}] {status} {topic[:30]:<30} "
            f"fill={payload['fillLevel']:>3}%  "
            f"temp={payload['temperature']:>5.1f}°C  "
            f"hum={payload['humidity']:>4.1f}%"
            f"{faulty}"
        )
        published += 1

    print(f"[{ts()}] 📤 {published} mesure(s) publiée(s)\n")

def signal_handler(sig, frame):
    global running
    print(f"\n[{ts()}] 🛑 Arrêt du simulateur...")
    running = False

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Simulateur capteurs IoT EcoTrack")
    parser.add_argument("--host",       default=MQTT_HOST,   help="Broker MQTT host")
    parser.add_argument("--port",       default=MQTT_PORT,   type=int, help="Broker MQTT port")
    parser.add_argument("--interval",   default=INTERVAL_SEC, type=int, help="Intervalle en secondes (défaut: 300 = 5min)")
    parser.add_argument("--containers", nargs="+", default=DEFAULT_CONTAINERS, help="UUIDs des conteneurs à simuler")
    parser.add_argument("--count",      default=None, type=int, help="Générer N UUIDs aléatoires de conteneurs")
    args = parser.parse_args()

    # Générer des UUIDs aléatoires si --count fourni
    if args.count:
        import uuid
        args.containers = [str(uuid.uuid4()) for _ in range(args.count)]

    container_ids = args.containers

    # Initialiser l'état de chaque capteur
    for cid in container_ids:
        init_sensor(cid)

    faulty_count = sum(1 for cid in container_ids if sensor_state[cid]["faulty"])
    print(f"""
╔══════════════════════════════════════════════════╗
║     EcoTrack — Simulateur capteurs IoT           ║
╠══════════════════════════════════════════════════╣
║  Broker MQTT  : {args.host}:{args.port:<27}║
║  Conteneurs   : {len(container_ids):<34}║
║  Défaillants  : {faulty_count:<34}║
║  Intervalle   : {args.interval}s ({args.interval//60}min {args.interval%60}s){' '*15}║
╚══════════════════════════════════════════════════╝
""")

    # Connexion MQTT
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect    = on_connect
    client.on_disconnect = on_disconnect

    signal.signal(signal.SIGINT,  signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        client.connect(args.host, args.port, keepalive=60)
        client.loop_start()
        time.sleep(1)  # attendre la connexion

        cycle = 0
        while running:
            cycle += 1
            print(f"[{ts()}] 🔄 Cycle #{cycle}")
            publish_all(client, container_ids)

            # Attendre l'intervalle (interruptible)
            for _ in range(args.interval):
                if not running:
                    break
                time.sleep(1)

    except ConnectionRefusedError:
        print(f"❌ Impossible de se connecter au broker MQTT {args.host}:{args.port}")
        print("   Vérifiez que Mosquitto est démarré : mosquitto -d -p 1883")
        sys.exit(1)
    finally:
        client.loop_stop()
        client.disconnect()
        print(f"[{ts()}] 👋 Simulateur arrêté.")


if __name__ == "__main__":
    main()
