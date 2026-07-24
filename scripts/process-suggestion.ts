import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { queryReposBatch, mapGraphData, RepoRecord } from '../src/lib/github';

const DATA_FILE = 'src/data/repos.json';
const HISTORY_FILE = 'src/data/history.json';

function parseField(body: string, label: string): string {
  const lines = body.split('\n');
  let result: string[] = [];
  let capture = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      const currentLabel = trimmed.replace('### ', '').trim();
      if (currentLabel.toLowerCase() === label.toLowerCase()) {
        capture = true;
      } else {
        capture = false;
      }
      continue;
    }
    if (capture) {
      result.push(line);
    }
  }
  return result.join('\n').trim();
}

async function main() {
  const token = process.env.GH_TOKEN;
  const issueBody = process.env.ISSUE_BODY;
  const issueNumberStr = process.env.ISSUE_NUMBER;

  if (!token) {
    console.error('GH_TOKEN environment variable is required');
    process.exit(1);
  }
  if (!issueBody) {
    console.error('ISSUE_BODY environment variable is required');
    process.exit(1);
  }
  if (!issueNumberStr) {
    console.error('ISSUE_NUMBER environment variable is required');
    process.exit(1);
  }

  const issueNumber = parseInt(issueNumberStr, 10);

  // Extract fields
  const repoUrl = parseField(issueBody, 'Project Repository');
  const category = parseField(issueBody, 'Category');
  const selfHostableStr = parseField(issueBody, 'Self-Hostable');
  const alternatives = parseField(issueBody, 'Alternatives to');

  if (!repoUrl) {
    console.error('No project repository URL found in the issue body.');
    process.exit(1);
  }

  // Parse repo URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
  if (!match) {
    console.error(`Invalid or unsupported repository URL: ${repoUrl}`);
    process.exit(1);
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  // Read current repos
  const repos: RepoRecord[] = JSON.parse(await readFile(DATA_FILE, 'utf8'));

  // Check if it already exists
  const exists = repos.some(
    (r) =>
      r.owner.toLowerCase() === owner.toLowerCase() &&
      r.repo.toLowerCase() === repo.toLowerCase()
  );

  if (exists) {
    console.log(`Repository ${owner}/${repo} already exists in ${DATA_FILE}.`);
    
    // Comment and close the issue
    execSync(`gh issue comment ${issueNumber} --body "Thank you for the suggestion! The repository [${owner}/${repo}](https://github.com/${owner}/${repo}) is already tracked in FossRadar."`, { stdio: 'inherit' });
    execSync(`gh issue close ${issueNumber} --reason "not planned"`, { stdio: 'inherit' });
    return;
  }

  console.log(`Repository ${owner}/${repo} is new. Fetching metadata...`);

  // Query GraphQL metadata
  const draft: RepoRecord = {
    name: repo,
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
    category: category || 'Other lists of free / open source software',
    self_hostable: selfHostableStr.toLowerCase() === 'yes',
    alternatives: alternatives || undefined
  };

  let nodeData: any;
  try {
    const res = await queryReposBatch([draft], token);
    nodeData = res.r0;
  } catch (error) {
    console.error(`Failed to fetch metadata from GitHub for ${owner}/${repo}:`, error);
    process.exit(1);
  }

  if (!nodeData) {
    console.error(`Could not retrieve metadata for ${owner}/${repo}. Please check if the repository exists and is public.`);
    process.exit(1);
  }

  const now = new Date().toISOString();
  const refreshed = { ...mapGraphData(draft, nodeData), lastSynced: now };

  // Append to repos.json
  const updatedRepos = [...repos, refreshed];

  // Initialize star history
  let history: Record<string, { date: string; stars: number }[]> = {};
  try {
    history = JSON.parse(await readFile(HISTORY_FILE, 'utf8'));
  } catch {
    history = {};
  }

  const key = `${refreshed.owner}/${refreshed.repo}`;
  history[key] = [{ date: now, stars: refreshed.stars || 0 }];

  // Save files
  await writeFile(DATA_FILE, `${JSON.stringify(updatedRepos, null, 2)}\n`);
  await writeFile(HISTORY_FILE, `${JSON.stringify(history, null, 2)}\n`);

  console.log(`Successfully added ${owner}/${repo} to data files.`);

  // Create PR
  try {
    console.log('Setting up git config...');
    execSync('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });

    const branchName = `suggest/add-${owner}-${repo}`.toLowerCase();
    console.log(`Creating branch ${branchName}...`);
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });

    console.log('Committing changes...');
    execSync('git add src/data/repos.json src/data/history.json', { stdio: 'inherit' });
    execSync(`git commit -m "feat(data): add suggested project ${owner}/${repo}"`, { stdio: 'inherit' });

    console.log('Pushing branch...');
    execSync(`git push origin ${branchName}`, { stdio: 'inherit' });

    console.log('Creating pull request...');
    execSync(
      `gh pr create --title "[ADD PROJECT]: ${owner}/${repo}" --body "Closes #${issueNumber}\n\nSuggested via issue form." --head ${branchName} --base main`,
      { stdio: 'inherit' }
    );

    console.log('Auto PR created successfully!');
  } catch (gitError) {
    console.error('Failed to create PR automatically:', gitError);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
