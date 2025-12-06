import { PropsWithChildren } from 'react';
import { prisma } from '@/lib/prisma';

async function isDatabaseConnected() {
  try {
    await prisma.$connect();
    return true;
  } catch (e) {
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function DatabaseConnection({
  children,
}: PropsWithChildren) {
  const isConnected = await isDatabaseConnected();

  if (!isConnected) {
    return (
      <div
        style={{
          height: '10-dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1>500</h1>
          <p>No database detected</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}