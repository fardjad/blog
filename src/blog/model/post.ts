export interface PostData {
  gistId: string;
  htmlUrl: string;
  contentUrl: string;
  content: string;
  title: string;
  description: string;
  tags: Set<string>;
  createdAt: Date;
  updatedAt: Date;
  ownerId: number;
  public: boolean;
  slug: string;
  slugCounter: number;
  contentHash: string;
}

export interface Post extends PostData {}

export class Post implements Post {
  constructor(data: PostData) {
    Object.assign(this, data);
  }
}
