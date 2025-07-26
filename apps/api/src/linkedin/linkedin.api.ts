export interface LinkedInApi {
  createPost(token: string, text: string): Promise<{ id: string }>;
}

export class HttpLinkedInApi implements LinkedInApi {
  async createPost(token: string, text: string): Promise<{ id: string }> {
    const body = {
      author: 'urn:li:person:me',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { id: data.id as string };
  }
}
