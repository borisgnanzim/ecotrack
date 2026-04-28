/**
 * Service de détection d'anomalies
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AnomalyService {
    /**
     * Lister les anomalies
     */
    async listAnomalies({ type, severity, isResolved, limit = 50, offset = 0 }) {
        const where = {};
        
        if (type) where.type = type;
        if (severity) where.severity = severity;
        if (isResolved !== undefined) where.is_resolved = isResolved;

        const anomalies = await prisma.anomaly.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });

        const total = await prisma.anomaly.count({ where });

        return {
            data: anomalies,
            total,
            limit,
            offset
        };
    }

    /**
     * Récupérer une anomalie par ID
     */
    async getAnomalyById(id) {
        return await prisma.anomaly.findUnique({
            where: { id: parseInt(id) }
        });
    }

    /**
     * Détecter les anomalies automatiquement
     */
    async detectAnomalies(containerIds, date = new Date()) {
        const anomalies = [];
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        for (const containerId of containerIds) {
            // Vérifier les données du conteneur
            const metrics = await prisma.containerMetrics.findFirst({
                where: {
                    container_id: containerId,
                    date: startOfDay
                }
            });

            if (!metrics) continue;

            // Détecter un taux de remplissage anormal
            if (metrics.max_fill_level > 95) {
                const existingAnomaly = await prisma.anomaly.findFirst({
                    where: {
                        container_id: containerId,
                        type: 'abnormal_fill_rate',
                        createdAt: {
                            gte: startOfDay
                        }
                    }
                });

                if (!existingAnomaly) {
                    const anomaly = await prisma.anomaly.create({
                        data: {
                            type: 'abnormal_fill_rate',
                            severity: metrics.max_fill_level >= 90 ? 'critical' : 'high',
                            container_id: containerId,
                            description: `Taux de remplissage anormal: ${metrics.max_fill_level}%`,
                            details: {
                                fillLevel: metrics.max_fill_level,
                                avgFillLevel: metrics.avg_fill_level,
                                date: startOfDay
                            }
                        }
                    });
                    anomalies.push(anomaly);
                }
            }

            // Détecter les conteneurs non collectés depuis longtemps
            const lastCollection = await prisma.fillHistory.findFirst({
                where: {
                    conteneurId: containerId
                },
                orderBy: { recordedAt: 'desc' }
            });

            if (lastCollection) {
                const daysSinceLastCollection = Math.floor(
                    (new Date() - new Date(lastCollection.recordedAt)) / (1000 * 60 * 60 * 24)
                );
                
                if (daysSinceLastCollection > 3 && metrics.max_fill_level > 70) {
                    const existingAnomaly = await prisma.anomaly.findFirst({
                        where: {
                            container_id: containerId,
                            type: 'missed_collection',
                            createdAt: {
                                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                            }
                        }
                    });

                    if (!existingAnomaly) {
                        const anomaly = await prisma.anomaly.create({
                            data: {
                                type: 'missed_collection',
                                severity: daysSinceLastCollection > 5 ? 'critical' : 'medium',
                                container_id: containerId,
                                description: `Conteneur non collecté depuis ${daysSinceLastCollection} jours`,
                                details: {
                                    daysSinceLastCollection,
                                    fillLevel: metrics.max_fill_level,
                                    lastCollectionDate: lastCollection.recordedAt
                                }
                            }
                        });
                        anomalies.push(anomaly);
                    }
                }
            }
        }

        return anomalies;
    }

    /**
     * Résoudre une anomalie
     */
    async resolveAnomaly(id, resolution) {
        return await prisma.anomaly.update({
            where: { id: parseInt(id) },
            data: {
                is_resolved: true,
                resolved_at: new Date(),
                details: {
                    resolution
                }
            }
        });
    }

    /**
     * Récupérer les statistiques d'anomalies
     */
    async getAnomalyStats(startDate, endDate) {
        const where = {};
        
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const total = await prisma.anomaly.count({ where });
        
        const byType = await prisma.anomaly.groupBy({
            by: ['type'],
            where,
            _count: true
        });

        const bySeverity = await prisma.anomaly.groupBy({
            by: ['severity'],
            where,
            _count: true
        });

        const resolved = await prisma.anomaly.count({
            where: { ...where, is_resolved: true }
        });

        return {
            total,
            resolved,
            unresolved: total - resolved,
            byType: byType.map(t => ({ type: t.type, count: t._count })),
            bySeverity: bySeverity.map(s => ({ severity: s.severity, count: s._count }))
        };
    }

    /**
     * Détecter les capteurs défectueux
     */
    async detectFaultySensors() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Trouver les conteneurs sans données aujourd'hui
        const containersWithData = await prisma.containerMetrics.findMany({
            where: { date: today },
            select: { container_id: true }
        });

        const allContainers = await prisma.conteneur.findMany({
            select: { id_conteneur: true }
        });

        const containersWithoutData = allContainers.filter(
            c => !containersWithData.some(d => d.container_id === c.id_conteneur)
        );

        // Créer des anomalies pour les capteurs défectueux
        const sensors = [];
        for (const container of containersWithoutData) {
            const existingAnomaly = await prisma.anomaly.findFirst({
                where: {
                    container_id: container.id_conteneur,
                    type: 'sensor_failure',
                    is_resolved: false
                }
            });

            if (!existingAnomaly) {
                const anomaly = await prisma.anomaly.create({
                    data: {
                        type: 'sensor_failure',
                        severity: 'medium',
                        container_id: container.id_conteneur,
                        description: `Capteur du conteneur ${container.id_conteneur} sans données`,
                        details: {
                            lastDataDate: null
                        }
                    }
                });
                sensors.push({
                    containerId: container.id_conteneur,
                    anomaly
                });
            } else {
                sensors.push({
                    containerId: container.id_conteneur,
                    anomaly: existingAnomaly
                });
            }
        }

        return sensors;
    }
}

module.exports = new AnomalyService();