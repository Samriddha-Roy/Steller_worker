export interface GithubRepoInfo {
  name: string;
  description: string;
  stars: number;
  language: string;
  owner: string;
}

export class GithubService {
  /**
   * Fetches repository information from GitHub API
   * Uses unauthenticated requests (rate limited) or simulated response
   */
  async getRepoInfo(target: string): Promise<GithubRepoInfo | null> {
    try {
      // Expecting target like "owner/repo" or a full URL
      let repoPath = target;
      if (target.includes('github.com/')) {
        repoPath = target.split('github.com/')[1];
      }

      console.log(`[GithubService] Fetching info for ${repoPath}...`);

      const response = await fetch(`https://api.github.com/repos/${repoPath}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Pay-as-you-go-AI-Hacker'
        }
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json() as any;

      return {
        name: data.name,
        description: data.description,
        stars: data.stargazers_count,
        language: data.language,
        owner: data.owner.login
      };
    } catch (error) {
      console.error('[GithubService] Error fetching repo info:', error);
      // Fallback for demo if API fails or rate limited
      if (target.includes('github')) {
        return {
          name: 'mock-repo',
          description: 'A mock repository for demo purposes.',
          stars: 42,
          language: 'TypeScript',
          owner: 'demo-user'
        };
      }
      return null;
    }
  }
}
