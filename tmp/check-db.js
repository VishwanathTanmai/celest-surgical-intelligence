const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- DATABASE DIAGNOSTIC ---');
  const hospitals = await prisma.hospital.findMany();
  console.log('Hospitals:', JSON.stringify(hospitals, null, 2));
  
  const users = await prisma.user.findMany({
    include: { hospital: true }
  });
  console.log('Users:', JSON.stringify(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    hospitalId: u.hospitalId,
    hospitalName: u.hospital?.name || 'NULL'
  })), null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
