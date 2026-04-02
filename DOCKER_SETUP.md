# 🚀 EcoTrack - Infrastructure Locale

Ce guide explique comment démarrer l'infrastructure locale (Kafka, Redis, PostgreSQL) pour développer les microservices EcoTrack.

## 📋 Prérequis

- **Docker Desktop** (Windows/Mac) ou **Docker Engine + Docker Compose** (Linux)
- **GNU Make** (optionnel mais recommandé pour les commandes raccourcies)

### Installation Make sur Windows
```bash
# Avec Chocolatey
choco install make

# Ou avec scoop
scoop install make
```

## 🚀 Démarrage Rapide

### Option 1 : Avec Make (recommandé)
```bash
# Démarrer tous les services
make docker-up

# Vérifier le statut
make docker-ps

# Voir les logs
make docker-logs
```

### Option 2 : Avec Docker Compose directement
```bash
# Démarrer
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Logs
docker-compose logs -f
```

## 🔧 Services Disponibles

| Service | Port | Interface Web | Description |
|---------|------|---------------|-------------|
| **Kafka** | 9092 | http://localhost:8080 | Message broker |
| **Zookeeper** | 2181 | - | Coordination Kafka |
| **Redis** | 6379 | http://localhost:8081 | Cache distribué |
| **PostgreSQL** | 5432 | - | Base de données |
| **Kafka UI** | 8080 | ✅ | Dashboard Kafka |
| **Redis Commander** | 8081 | ✅ | Dashboard Redis |

## 📊 Accès aux Outils Web

- **Kafka UI**: http://localhost:8080
  - Visualiser les topics
  - Voir les messages
  - Gérer les partitions

- **Redis Commander**: http://localhost:8081
  - Naviguer dans les clés Redis
  - Éditer les valeurs
  - Monitorer en temps réel

## 🔐 Identifiants de Connexion

### PostgreSQL
```
Host: localhost
Port: 5432
User: ecotrack
Password: ecotrack_password
Database: ecotrack_db
```

### Redis
```
Host: localhost
Port: 6379
Password: redis_password
```

### Kafka
```
Brokers: localhost:9092
```

## 💻 Commandes Utiles

### Avec Make
```bash
# Démarrer tous les services
make docker-up

# Arrêter tous les services
make docker-down

# Redémarrer tous les services
make docker-restart

# Voir les logs en temps réel
make docker-logs

# Liste des conteneurs
make docker-ps

# Entrer dans Redis CLI
make redis-cli

# Lister les topics Kafka
make kafka-topics

# Créer les topics Kafka pour EcoTrack
make kafka-create-topics

# Entrer dans PostgreSQL
make postgres-cli

# Vérifier la santé des services
make health-check

# Afficher toutes les commandes disponibles
make help
```

### Sans Make (Docker Compose direct)

#### Démarrage/Arrêt
```bash
# Démarrer en arrière-plan
docker-compose up -d

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

#### Accès aux Services
```bash
# Redis CLI
docker-compose exec redis redis-cli -a redis_password

# PostgreSQL
docker-compose exec postgres psql -U ecotrack -d ecotrack_db

# Kafka - Lister les topics
docker-compose exec kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# Kafka - Créer un topic
docker-compose exec kafka kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic my-topic \
  --partitions 3 \
  --replication-factor 1
```

#### Logs
```bash
# Tous les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f kafka
docker-compose logs -f redis
docker-compose logs -f postgres
```

## 📝 Configuration des Services Backend

Chaque service backend doit avoir un fichier `.env` avec les variables d'environnement correctes.

### Exemple pour `backend/service-users/.env`
```bash
# Base de données
DATABASE_URL=postgresql://ecotrack:ecotrack_password@localhost:5432/ecotrack_db

# Redis
REDIS_URL=redis://:redis_password@localhost:6379

# Kafka
KAFKA_BROKERS=kafka:9092

# Service
SERVICE_NAME=service-users
PORT=3002
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here

# API Gateway
API_GATEWAY_URL=http://localhost:3000
```

> 💡 **Note** : Utilisez `postgres` au lieu de `localhost` pour DATABASE_URL si vous lancez les services backend dans Docker aussi. Utilisez `localhost` si vous les lancez localement.

## 🛠️ Maintenance

### Nettoyer tout (réinitialiser complètement)
```bash
make clean
# ou
docker-compose down -v
```

### Reconstruire les images
```bash
make docker-build
# ou
docker-compose build --no-cache
```

### Vérifier la santé des services
```bash
make health-check
# ou
docker-compose ps
```

## 🐛 Dépannage

### Kafka ne démarre pas
```bash
# Vérifier les logs
docker-compose logs kafka

# Vérifier que Zookeeper est actif
docker-compose logs zookeeper

# Redémarrer Kafka
docker-compose restart kafka
```

### Redis ne répond pas
```bash
# Tester la connexion
docker-compose exec redis redis-cli -a redis_password ping

# Redémarrer Redis
docker-compose restart redis
```

### PostgreSQL ne démarre pas
```bash
# Vérifier les logs
docker-compose logs postgres

# Redémarrer
docker-compose restart postgres
```

### Port déjà en utilisation
```bash
# Trouver le process utilisant le port
lsof -i :9092  # Kafka
lsof -i :6379  # Redis
lsof -i :5432  # PostgreSQL

# Ou dans docker-compose.yml, changer les ports mappés
# Exemple: "19092:9092" pour Kafka
```

## 📚 Documentation Additionnelle

- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Redis Documentation](https://redis.io/documentation)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Kafka UI Docs](https://docs.kafkaui.provectus.io/)

## 🔗 Workflow Complet

```bash
# 1. Démarrer l'infrastructure
make docker-up

# 2. Créer les topics Kafka
make kafka-create-topics

# 3. Vérifier que tout fonctionne
make docker-ps
make health-check

# 4. Consulter les dashboards
# - http://localhost:8080 (Kafka UI)
# - http://localhost:8081 (Redis Commander)

# 5. Démarrer les services backend
# (dans des terminaux séparés)
cd backend/service-users && npm run dev
cd backend/service-containers && npm run dev
# etc.

# 6. Pour arrêter complètement
make docker-down
```

---

✅ **C'est tout !** Vous pouvez maintenant développer avec Kafka et Redis en local.
