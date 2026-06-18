const { prisma } = require('../config/postgres');

// Points values for actions
const ACTION_POINTS = {
  report_container: 10,
  complete_challenge: 50,
  submit_feedback: 5,
  other: 0,
};

async function recordActionAndUpdatePoints({ userId, actionType, metadata }) {
  const points = ACTION_POINTS[actionType] ?? 0;

  return await prisma.$transaction(async (tx) => {
    // create user action
    const action = await tx.userAction.create({
      data: {
        userId,
        actionType,
        points,
      },
    });

    // upsert total points
    const total = await tx.userTotalPoints.upsert({
      where: { userId },
      create: { userId, totalPoints: points },
      update: { totalPoints: { increment: points } },
    });

    // fetch badges thresholds that are newly satisfied
    const earnedBadges = [];
    if (points > 0) {
      const badges = await tx.badge.findMany({ where: { pointsRequired: { lte: total.totalPoints } } });
      for (const badge of badges) {
        const exists = await tx.userBadge.findUnique({ where: { userId_badgeId: { userId, badgeId: badge.id } } }).catch(() => null);
        if (!exists) {
          const ub = await tx.userBadge.create({ data: { userId, badgeId: badge.id } });
          earnedBadges.push(badge);
        }
      }
    }

    return { action, totalPoints: total.totalPoints, earnedBadges };
  });
}

module.exports = { recordActionAndUpdatePoints };
