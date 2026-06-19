import { PrismaClient, StrainDifficulty, StrainType } from '@prisma/client';
import strains from './seeds/strains.json';

const prisma = new PrismaClient();

function toStrainType(value: string): StrainType {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'INDICA' || normalized === 'SATIVA' || normalized === 'HYBRID' || normalized === 'AUTO') {
    return normalized as StrainType;
  }

  throw new Error(`Invalid strain type: ${value}`);
}

function toStrainDifficulty(value: string): StrainDifficulty {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'EASY' || normalized === 'MEDIUM' || normalized === 'HARD') {
    return normalized as StrainDifficulty;
  }

  throw new Error(`Invalid strain difficulty: ${value}`);
}

async function main() {
  console.log('Seeding strains...');

  for (const strain of strains) {
    await prisma.strain.upsert({
      where: { id: strain.id },
      update: {},
      create: {
        id: strain.id,
        name: strain.name,
        type: toStrainType(strain.type),
        thcPercentage: strain.thc_percentage,
        difficulty: toStrainDifficulty(strain.difficulty),
        vegetativeDays: strain.vegetative_days,
        floweringDays: strain.flowering_days,
        description: strain.description,
      },
    });
  }

  console.log(`Seeded ${strains.length} strains.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
