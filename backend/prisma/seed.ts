import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 開始種子資料建立...');

  // 創建管理員用戶
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: '管理員系統',
      email: 'admin@petadoption.com',
      passwordHash: adminPassword,
      role: 'admin',
      profileCompleted: true,
    },
  });

  console.log('👤 管理員帳戶已創建');

  // 創建一般用戶
  const userPassword = await bcrypt.hash('user123', 10);
  const user1 = await prisma.user.create({
    data: {
      name: '測試用戶',
      email: 'user1@example.com',
      passwordHash: userPassword,
      role: 'adopter',
      profileCompleted: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: '愛心領養人',
      email: 'user2@example.com',
      passwordHash: userPassword,
      role: 'adopter',
      profileCompleted: true,
    },
  });

  console.log('👥 一般用戶帳戶已創建');

  // 創建寵物清單
  const pet1 = await prisma.animalListing.create({
    data: {
      ownerId: admin.id,
      species: 'dog',
      breed: '柴犬',
      ageEstimate: 2,
      gender: 'male',
      spayedNeutered: true,
      description: '小白是一隻非常活潑可愛的柴犬，喜歡和人互動，很適合有小孩的家庭。',
      location: '台北市中山區',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500']),
      healthStatus: '健康狀況良好，已完成所有疫苗接種',
      vaccinationRecords: JSON.stringify({
        rabies: '2024-01-15',
        dhpp: '2024-01-15',
        lastCheckup: '2024-10-01'
      }),
      status: 'active',
    },
  });

  const pet2 = await prisma.animalListing.create({
    data: {
      ownerId: admin.id,
      species: 'cat',
      breed: '混種貓',
      ageEstimate: 1,
      gender: 'female',
      spayedNeutered: true,
      description: '小花是一隻溫柔親人的小貓咪，喜歡被撫摸和抱抱。非常適合首次養貓的家庭。',
      location: '新北市板橋區',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500']),
      healthStatus: '健康狀況優良，已結紮並完成疫苗',
      vaccinationRecords: JSON.stringify({
        fvrcp: '2024-02-01',
        rabies: '2024-02-01',
        lastCheckup: '2024-09-15'
      }),
      status: 'active',
    },
  });

  const pet3 = await prisma.animalListing.create({
    data: {
      ownerId: admin.id,
      species: 'dog',
      breed: '黃金獵犬',
      ageEstimate: 3,
      gender: 'male',
      spayedNeutered: true,
      description: '大雄是一隻成熟穩重的黃金獵犬，非常聽話且忠誠。適合有經驗的飼主。',
      location: '桃園市中壢區',
      photos: JSON.stringify(['https://images.unsplash.com/photo-1552053831-71594a27632d?w=500']),
      healthStatus: '定期健檢，關節狀況良好',
      status: 'active',
    },
  });

  console.log('🐾 寵物清單已創建');

  // 創建一些領養申請
  const application1 = await prisma.adoptionApplication.create({
    data: {
      listingId: pet1.id,
      applicantId: user1.id,
      answers: JSON.stringify({
        personalInfo: {
          name: '測試用戶',
          age: 28,
          occupation: '軟體工程師',
          address: '台北市信義區信義路100號',
        },
        livingSituation: {
          housingType: 'apartment',
          hasYard: false,
          hasOtherPets: false,
        },
        experience: {
          hasPreviousExperience: true,
          experienceDetails: '之前養過一隻貓咪三年',
        },
        motivation: {
          reason: '希望有一隻狗狗陪伴，工作之餘可以一起運動',
          timeCommitment: '每天可以花2-3小時陪伴',
        },
      }),
      status: 'submitted',
    },
  });

  const application2 = await prisma.adoptionApplication.create({
    data: {
      listingId: pet2.id,
      applicantId: user2.id,
      answers: JSON.stringify({
        personalInfo: {
          name: '愛心領養人',
          age: 35,
          occupation: '教師',
          address: '新北市板橋區中山路200號',
        },
        livingSituation: {
          housingType: 'house',
          hasYard: true,
          hasOtherPets: false,
        },
        experience: {
          hasPreviousExperience: true,
          experienceDetails: '家裡養過多隻貓狗',
        },
        motivation: {
          reason: '想要給流浪貓一個溫暖的家',
          timeCommitment: '全天候照顧',
        },
      }),
      status: 'approved',
      reviewedAt: new Date(),
      reviewerId: admin.id,
    },
  });

  console.log('📋 領養申請已創建');

  // 創建審計日誌
  await prisma.auditLog.create({
    data: {
      action: 'APPLICATION_APPROVED',
      actorId: admin.id,
      targetType: 'AdoptionApplication',
      targetId: application2.id,
      notes: '申請人經驗豐富，居住環境適合，批准領養。',
    },
  });

  console.log('📝 審計日誌已創建');

  console.log('✅ 種子資料建立完成！');
  console.log('');
  console.log('🔑 測試帳戶:');
  console.log('管理員: admin@petadoption.com / admin123');
  console.log('用戶1: user1@example.com / user123');
  console.log('用戶2: user2@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ 種子資料建立失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });