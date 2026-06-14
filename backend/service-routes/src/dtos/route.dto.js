const { z } = require('zod');
const { ROUTE_STATUS } = require('../constants/route.constants');

const CreateRouteDto = z.object({
  date: z.string().min(1, 'La date est requise'),
  status: z.enum(ROUTE_STATUS).default('planned'),
  agentId: z.string().uuid().nullable().optional(),
  containerIds: z.array(z.string().uuid()).default([]),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  totalDistance: z.number().positive().nullable().optional(),
  estimatedTime: z.number().int().positive().nullable().optional(),
});

const UpdateRouteDto = CreateRouteDto.partial();

const AssignAgentDto = z.object({
  agentId: z.string().uuid().nullable(),
});

module.exports = { CreateRouteDto, UpdateRouteDto, AssignAgentDto };
