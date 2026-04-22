import type {
  XClient,
  XConfigureStreamRulesResult,
  XCreatedPost,
  XCreatePostOptions,
  XFilteredStreamRule,
  XPost,
  XStreamConnectOptions,
  XStreamHandler,
  XUser
} from "./types";

export interface MockXClientOptions {
  posts?: XPost[];
  users?: XUser[];
  postingEnabled?: boolean;
}

export class MockXClient implements XClient {
  private readonly posts = new Map<string, XPost>();
  private readonly users = new Map<string, XUser>();
  private readonly createdPosts: XCreatedPost[] = [];
  private rules: XFilteredStreamRule[] = [];
  private readonly postingEnabled: boolean;

  constructor(options: MockXClientOptions = {}) {
    for (const post of options.posts ?? []) {
      this.posts.set(post.id, post);
    }

    for (const user of options.users ?? []) {
      this.users.set(user.username.toLowerCase(), user);
    }

    this.postingEnabled = options.postingEnabled ?? true;
  }

  async getPostById(id: string): Promise<XPost | null> {
    return this.posts.get(id) ?? null;
  }

  async getUserByUsername(username: string): Promise<XUser | null> {
    return this.users.get(username.toLowerCase()) ?? null;
  }

  async createPost(text: string, options: XCreatePostOptions = {}): Promise<XCreatedPost> {
    if (!this.postingEnabled) {
      throw new Error("Mock X posting disabled");
    }

    const created = {
      id: `mock-${this.createdPosts.length + 1}`,
      text,
      raw: options
    };
    this.createdPosts.push(created);
    return created;
  }

  async createReply(text: string, replyToPostId: string): Promise<XCreatedPost> {
    return this.createPost(text, { replyToPostId });
  }

  async configureFilteredStreamRules(rules: XFilteredStreamRule[]): Promise<XConfigureStreamRulesResult> {
    this.rules = [...rules];
    return {
      added: [...this.rules],
      deletedRuleIds: []
    };
  }

  async connectFilteredStream(onPost: XStreamHandler, _options?: XStreamConnectOptions): Promise<void> {
    for (const post of this.posts.values()) {
      await onPost(post);
    }
  }

  getConfiguredRules(): XFilteredStreamRule[] {
    return [...this.rules];
  }

  getCreatedPosts(): XCreatedPost[] {
    return [...this.createdPosts];
  }
}
