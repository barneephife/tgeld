const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initializeDefaultData() {
  // Check if any users exist
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    console.log('No users found. Creating default data...');
    
    try {
      // Create default user
      const defaultUser = await prisma.user.create({
        data: {
          name: 'Example User',
          icon: '👤',
          birthday: new Date(),
        },
      });

      // Create piggy bank account for the user
      const piggyBankAccount = await prisma.piggybankAccount.create({
        data: {
          account_number: '1000000001',
          balance: 0,
          user_id: defaultUser.user_id,
        },
      });

      // Update user with the piggy bank account
      await prisma.user.update({
        where: { user_id: defaultUser.user_id },
        data: { piggybank_account_id: piggyBankAccount.account_id },
      });

      // Create one example task
      await prisma.task.create({
        data: {
          title: 'Example Task',
          description: 'This is an example task. You can edit or delete it, and create new tasks as needed.',
          icon_name: '📝',
          payout_value: 1.00,
        },
      });

      console.log('Default user and task created successfully!');
    } catch (error) {
      console.error('Error creating default data:', error);
    }
  } else {
    console.log('Users already exist. Skipping default data creation.');
  }
}

initializeDefaultData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
