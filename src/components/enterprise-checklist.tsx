import React from 'react';
import { Repo } from '@/lib/types';

export function EnterpriseChecklist({ repo }: { repo: Repo }) {
  if (!repo.enterpriseReady) return null;

  const { sso, auditLogs, sla, support } = repo.enterpriseReady;
  
  const hasAnyFeature = sso || auditLogs || sla || support;
  if (!hasAnyFeature) return null;

  const items = [
    { key: 'sso', label: 'SSO / SAML', active: !!sso },
    { key: 'auditLogs', label: 'Audit Logs', active: !!auditLogs },
    { key: 'sla', label: 'SLA Availability', active: !!sla },
    { key: 'support', label: 'Professional Support', active: !!support }
  ];

  return (
    <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '1.5rem', background: '#f8fafc', borderColor: '#bae6fd' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🏢</span> Enterprise Ready
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {items.map((item) => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: item.active ? 1 : 0.4 }}>
            <span style={{ fontSize: '1.2rem' }}>{item.active ? '✅' : '❌'}</span>
            <span style={{ fontWeight: item.active ? 800 : 500, fontSize: '0.9rem' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
