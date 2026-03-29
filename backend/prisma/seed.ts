import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set.');
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.cardMember.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.label.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.member.deleteMany();

  // Create members
  const members = await Promise.all([
    prisma.member.create({ data: { name: 'Alice Johnson', email: 'alice@example.com', color: '#0079bf' } }),
    prisma.member.create({ data: { name: 'Bob Smith', email: 'bob@example.com', color: '#61bd4f' } }),
    prisma.member.create({ data: { name: 'Carol White', email: 'carol@example.com', color: '#eb5a46' } }),
    prisma.member.create({ data: { name: 'Dave Brown', email: 'dave@example.com', color: '#c377e0' } }),
  ]);

  // Create board
  const board = await prisma.board.create({
    data: { title: 'My Project Board', bgColor: '#0079bf' }
  });

  // Create lists
  const [todoList, inProgressList, reviewList, doneList] = await Promise.all([
    prisma.list.create({ data: { title: 'To Do', position: 1, boardId: board.id } }),
    prisma.list.create({ data: { title: 'In Progress', position: 2, boardId: board.id } }),
    prisma.list.create({ data: { title: 'In Review', position: 3, boardId: board.id } }),
    prisma.list.create({ data: { title: 'Done', position: 4, boardId: board.id } }),
  ]);

  // Create cards with labels, members, checklists
  const card1 = await prisma.card.create({
    data: {
      title: 'Design homepage mockup',
      description: 'Create wireframes and high-fidelity designs for the new homepage.',
      position: 1,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      listId: todoList.id,
      labels: { create: [{ color: '#0079bf', text: 'Design' }] },
      members: { create: [{ memberId: members[0].id }] },
    }
  });

  const card2 = await prisma.card.create({
    data: {
      title: 'Set up PostgreSQL database',
      description: 'Install and configure PostgreSQL. Set up Prisma ORM and run initial migrations.',
      position: 2,
      listId: todoList.id,
      labels: { create: [{ color: '#61bd4f', text: 'Backend' }] },
      checklists: {
        create: [{
          title: 'Setup Checklist',
          items: {
            create: [
              { text: 'Install PostgreSQL', isComplete: true },
              { text: 'Configure Prisma', isComplete: true },
              { text: 'Run migrations', isComplete: false },
              { text: 'Seed sample data', isComplete: false },
            ]
          }
        }]
      }
    }
  });

  const card3 = await prisma.card.create({
    data: {
      title: 'Implement drag and drop',
      description: 'Use @dnd-kit to implement drag and drop for lists and cards.',
      position: 1,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      listId: inProgressList.id,
      labels: { create: [{ color: '#f2d600', text: 'Frontend' }] },
      members: {
        create: [{ memberId: members[1].id }, { memberId: members[2].id }]
      },
    }
  });

  const card4 = await prisma.card.create({
    data: {
      title: 'Write unit tests',
      position: 2,
      listId: inProgressList.id,
      labels: { create: [{ color: '#eb5a46', text: 'Testing' }] },
      checklists: {
        create: [{
          title: 'Test Coverage',
          items: {
            create: [
              { text: 'API route tests', isComplete: false },
              { text: 'Component tests', isComplete: false },
              { text: 'E2E tests', isComplete: false },
            ]
          }
        }]
      }
    }
  });

  const card5 = await prisma.card.create({
    data: {
      title: 'Fix login bug',
      description: 'Users are getting 401 errors when using special characters in passwords.',
      position: 1,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // overdue
      listId: reviewList.id,
      labels: { create: [{ color: '#eb5a46', text: 'Bug' }] },
      members: { create: [{ memberId: members[3].id }] },
    }
  });

  const card6 = await prisma.card.create({
    data: {
      title: 'Review PR #42',
      position: 2,
      listId: reviewList.id,
      labels: { create: [{ color: '#c377e0', text: 'Review' }] },
    }
  });

  const card7 = await prisma.card.create({
    data: {
      title: 'Deploy to staging',
      description: 'Deploy latest build to the staging environment and run smoke tests.',
      position: 1,
      listId: doneList.id,
      labels: { create: [{ color: '#61bd4f', text: 'DevOps' }] },
      members: { create: [{ memberId: members[0].id }] },
    }
  });

  const card8 = await prisma.card.create({
    data: {
      title: 'Update README documentation',
      position: 2,
      listId: doneList.id,
      labels: { create: [{ color: '#ff9f1a', text: 'Docs' }] },
    }
  });

  await prisma.attachment.createMany({
    data: [
      {
        cardId: card1.id,
        name: 'Homepage inspiration board',
        url: 'https://www.behance.net',
      },
      {
        cardId: card3.id,
        name: 'DnD library docs',
        url: 'https://docs.dndkit.com',
      },
    ],
  });

  await prisma.comment.createMany({
    data: [
      {
        cardId: card5.id,
        authorName: members[3].name,
        text: 'Bug reproduced on login form with special characters.',
      },
      {
        cardId: card7.id,
        authorName: members[0].name,
        text: 'Deployment done. Smoke tests passed on staging.',
      },
    ],
  });

  await prisma.activity.createMany({
    data: [
      {
        cardId: card1.id,
        action: 'Card created',
        details: 'Initial design planning card added',
      },
      {
        cardId: card3.id,
        action: 'Checklist started',
        details: 'Drag and drop implementation in progress',
      },
      {
        cardId: card7.id,
        action: 'Card completed',
        details: 'Staging deployment complete',
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Board: ${board.title} (id: ${board.id})`);
  console.log(`Members: ${members.map(m => m.name).join(', ')}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
