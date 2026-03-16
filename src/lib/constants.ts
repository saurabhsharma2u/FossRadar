import ignored from '../data/ignored.json';

export const UPSTREAMS = [
  {
    url: 'https://raw.githubusercontent.com/sfermigier/awesome-foss-alternatives/refs/heads/main/README.md',
    isSelfHostable: false,
    format: 'list' as const
  },
  {
    url: 'https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md',
    isSelfHostable: true,
    format: 'list' as const
  },
  {
    url: 'https://raw.githubusercontent.com/RunaCapital/awesome-oss-alternatives/main/README.md',
    isSelfHostable: true,
    format: 'table' as const
  }
];

export const IGNORED_REPOS = ignored;
