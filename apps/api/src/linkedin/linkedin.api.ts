export interface LinkedInApi {
  createPost(
    token: string,
    text: string,
    linkedInId: string,
    urnFormat?: string,
  ): Promise<{ id: string }>;
}

export class HttpLinkedInApi implements LinkedInApi {
  async createPost(
    token: string,
    text: string,
    linkedInId: string,
    urnFormat: string = 'urn:li:member:',
  ): Promise<{ id: string }> {
    const body = {
      author: `${urnFormat}${linkedInId}`,
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

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return { id: data.id as string };
  }
}
