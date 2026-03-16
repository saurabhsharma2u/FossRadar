export type Repo = {
  name: string;
  owner: string;
  repo: string;
  url: string;
  category: string;
  description?: string;
  stars?: number;
  forks?: number;
  license?: string;
  topics?: string[];
  language?: string;
  lastCommit?: string;
  archived?: boolean;
  self_hostable?: boolean;
  alternatives?: string;
  replaces?: string[];
  latestRelease?: {
    tagName: string;
    publishedAt: string;
  };
  hasFunding?: boolean;
  platforms?: string[];
  securityAudit?: {
    hasAudit: boolean;
    reportUrl?: string;
  };
  enterpriseReady?: {
    sso?: boolean;
    auditLogs?: boolean;
    sla?: boolean;
    support?: boolean;
  };
};
