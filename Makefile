.PHONY: help docker-up docker-down docker-logs docker-ps redis-cli kafka-topics postgres-cli clean docker-build docker-restart

help:
	@echo "╔════════════════════════════════════════╗"
	@echo "║        EcoTrack Infrastructure         ║"
	@echo "╚════════════════════════════════════════╝"
	@echo ""
	@echo "🐳 Docker Compose Commands:"
	@echo "  make docker-up           - Démarrer tous les services (Kafka, Redis, PostgreSQL)"
	@echo "  make docker-down         - Arrêter tous les services"
	@echo "  make docker-restart      - Redémarrer tous les services"
	@echo "  make docker-logs         - Afficher les logs en temps réel"
	@echo "  make docker-ps           - Liste des conteneurs actifs"
	@echo "  make docker-build        - Reconstruire les images"
	@echo ""
	@echo "🔧 Outils de Gestion:"
	@echo "  make redis-cli           - Accéder à Redis CLI"
	@echo "  make kafka-topics        - Lister les topics Kafka"
	@echo "  make postgres-cli        - Accéder à PostgreSQL CLI"
	@echo ""
	@echo "🧹 Maintenance:"
	@echo "  make clean               - Supprimer les conteneurs et volumes"
	@echo ""
	@echo "📊 Web Interfaces:"
	@echo "  - Kafka UI: http://localhost:8080"
	@echo "  - Redis Commander: http://localhost:8081"
	@echo ""

up:
	@echo "🚀 Démarrage des services..."
	docker-compose up -d
	@echo ""
	@echo "✅ Services démarrés!"
	@echo ""
	@echo "📊 Interfaces Web:"
	@echo "  - Kafka UI: http://localhost:8080"
	@echo "  - Redis Commander: http://localhost:8081"
	@echo ""
	@echo "🗄️  Connexions:"
	@echo "  - PostgreSQL: localhost:5432 (user: ecotrack, password: ecotrack_password)"
	@echo "  - Redis: localhost:6379 (password: redis_password)"
	@echo "  - Kafka: localhost:9092"
	@echo ""

down:
	@echo "⏹️  Arrêt des services..."
	docker-compose down
	@echo "✅ Services arrêtés"

restart: docker-down docker-up
	@echo "✅ Services redémarrés"

logs:
	docker-compose logs -f

ps:
	@echo "📋 Conteneurs actifs:"
	@docker-compose ps

build:
	@echo "🔨 Reconstruction des images..."
	docker-compose build --no-cache
	@echo "✅ Images reconstruites"

redis-cli:
	@echo "🔴 Connexion à Redis..."
	docker-compose exec redis redis-cli -a redis_password

kafka-topics:
	@echo "📨 Topics Kafka:"
	docker-compose exec kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

kafka-create-topics:
	@echo "📨 Création des topics Kafka..."
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic container-created --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic container-updated --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic container-deleted --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic container-status-changed --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic container-fill-level --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic user-created --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic user-updated --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic user-deleted --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic user-role-changed --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic route-created --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic route-updated --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic route-deleted --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic route-completed --partitions 3 --replication-factor 1 --if-not-exists
	docker-compose exec kafka kafka-topics.sh --create --bootstrap-server localhost:9092 --topic system-event --partitions 3 --replication-factor 1 --if-not-exists
	@echo "✅ Topics créés"

postgres-cli:
	@echo "🟦 Connexion à PostgreSQL..."
	docker-compose exec postgres psql -U ecotrack -d ecotrack_db

clean:
	@echo "🧹 Nettoyage des conteneurs et volumes..."
	docker-compose down -v
	@echo "✅ Nettoyage terminé"

# Status de santé des services
health-check:
	@echo "🏥 Vérification de la santé des services..."
	@docker-compose ps --format "table {{.Service}}\t{{.Status}}"

# Variables d'environnement requises
env-check:
	@echo "📝 Variables d'environnement par défaut:"
	@echo "  DATABASE_URL: postgresql://ecotrack:ecotrack_password@localhost:5432/ecotrack_db"
	@echo "  REDIS_URL: redis://:redis_password@localhost:6379"
	@echo "  KAFKA_BROKERS: kafka:9092"
	@echo ""
	@echo "💡 À ajouter dans vos fichiers .env des services backend"
