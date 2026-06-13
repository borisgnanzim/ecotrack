import { publishMessage } from '../kafkaClient.js';
import { KAFKA_TOPICS } from '../topics.js';

export class ZonePublisher {
  static async publishZoneCreated(zone) {
    return publishMessage(KAFKA_TOPICS.ZONE_CREATED, {
      zoneId: zone.id,
      name: zone.name,
      city: zone.city,
      district: zone.district,
      hasPolygon: !!zone.polygon,
      createdAt: zone.createdAt,
    }, `zone-${zone.id}`);
  }

  static async publishZoneUpdated(zone) {
    return publishMessage(KAFKA_TOPICS.ZONE_UPDATED, {
      zoneId: zone.id,
      name: zone.name,
      city: zone.city,
      isActive: zone.isActive,
      updatedAt: zone.updatedAt,
    }, `zone-${zone.id}`);
  }

  static async publishZoneDeleted(zoneId) {
    return publishMessage(KAFKA_TOPICS.ZONE_DELETED, {
      zoneId,
      deletedAt: new Date(),
    }, `zone-${zoneId}`);
  }

  static async publishContainersAssigned(zoneId, containerIds, count) {
    return publishMessage(KAFKA_TOPICS.ZONE_CONTAINERS_ASSIGNED, {
      zoneId,
      containerIds,
      count,
      assignedAt: new Date(),
    }, `zone-${zoneId}`);
  }
}
