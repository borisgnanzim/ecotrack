module.exports = async (prisma) => {
  // Find some users to attach notifications to
  const alice = await prisma.user.findUnique({ where: { email: 'alice@mail.com' } });
  const bob = await prisma.user.findUnique({ where: { email: 'bob@mail.com' } });

  await prisma.notification.createMany({
    data: [
      {
        userId: alice ? alice.id : null,
        title: 'Bienvenue',
        message: 'Bienvenue sur Ecotrack, Alice !',
        type: 'info'
      },
      {
        userId: bob ? bob.id : null,
        title: 'Mise à jour du profil',
        message: "Votre profil a été mis à jour avec succès.",
        type: 'success'
      },
      {
        userId: alice ? alice.id : null,
        title: 'Maintenance planifiée',
        message: "Une maintenance est prévue ce soir à minuit.",
        type: 'warning'
      }
    ]
  });
};