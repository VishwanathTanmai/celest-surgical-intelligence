require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  try {
    const job = await p.job.create({
      data: { status: 'PENDING', progress: 0, filename: 'test.mp4', videoUrl: '/test' }
    });
    console.log('SUCCESS:', JSON.stringify(job));
    await p.job.delete({ where: { id: job.id } });
    console.log('CLEANUP DONE');
  } catch(e) {
    console.log('ERROR:', e.message);
  } finally {
    await p.$disconnect();
  }
}
main();
