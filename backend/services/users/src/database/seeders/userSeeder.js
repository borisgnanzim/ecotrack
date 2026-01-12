const bcrypt = require("bcryptjs");

//const password = await bcrypt.hash("password", 10); 

module.exports = async (prisma) => {
  const password = await bcrypt.hash("password", 10);
  await prisma.user.deleteMany();
  await prisma.user.createMany({
    data: [
    {
        name: "Alice", 
        username: "alice123",
        email: "alice@mail.com", 
        password: password,
        role: "citizen"
    },
    {
        name: "Bob", 
        username: "bob123",
        email: "bob@mail.com",
        password: password,
        role: "citizen"
    },
    {
        name: "citizen1",
        username: "citizen1",
        email: "citizen1@example.com",
        password: password,
        role: "citizen"
    },
    {
        name: "agent1",
        username: "agent1",
        email: "agent1@example.com",
        password: password,
        role: "agent"
    },
    {
        name: "manager1",
        username: "manager1",
        email: "manager1@example.com",
        password: password,
        role: "manager"
    },
    {
        name: "admin1",
        username: "admin1",
        email: "admin1@example.com",
        password: password,
        role: "admin"
    }
    ]
  });
};
