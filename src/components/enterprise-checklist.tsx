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
    <div className="card" style={{ width: '100%', maxWidth: '650px', padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
        Enterprise Ready
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {items.map((item) => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: item.active ? 1 : 0.4 }}>
            {item.active ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            <span style={{ fontWeight: item.active ? 500 : 400, fontSize: '0.875rem', color: 'var(--text)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
