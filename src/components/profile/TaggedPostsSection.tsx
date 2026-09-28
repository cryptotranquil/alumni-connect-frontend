import { useCallback, useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { EmptyState, Spinner } from "../shared";
import type { Post } from "../../types";
import { getTaggedPostsApi } from "../../api/profileApi";
import { PostCard } from "./PostCard";

interface TaggedPostsSectionProps {
  userId?: string;
  onActivityChanged: () => void;
}

export function TaggedPostsSection({
  userId,
  onActivityChanged,
}: TaggedPostsSectionProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    getTaggedPostsApi(userId)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-accent/60 px-4 py-3 text-sm text-foreground/80">
        <span className="font-semibold text-foreground">Tagged posts</span> — posts
        where this member has been{" "}
        <span className="rounded bg-brand-primary/10 px-1 font-medium text-brand-primary">
          @mentioned
        </span>{" "}
        by the community.
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No tagged posts yet"
          description="Posts mentioning this member will appear here."
          compact
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPosted={() => onActivityChanged()}
            />
          ))}
        </div>
      )}
    </div>
  );
}