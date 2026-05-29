import React, { Suspense } from 'react';
import DashboardHome from '../../components/features/DashboardHome';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>LOADING DASHBOARD CHANNELS...</div>}>
      <DashboardHome />
    </Suspense>
  );
}
