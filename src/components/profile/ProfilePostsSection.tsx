import { useCallback, useEffect, useState } from "react";
import type { Post } from "../../types";
import {
  getProfilePostsApi,
} from "../../api/profileApi";
import { EmptyState, Spinner } from "../shared";
import { PenSquare } from "lucide-react";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";

interface ProfilePostsSectionProps {
  userId?: string;
  isOwn: boolean;
  onActivityChanged: () => void;
}

export function ProfilePostsSection({
  userId,
  isOwn,
  onActivityChanged,
}: ProfilePostsSectionProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(() => {
    getProfilePostsApi(userId)
      .then(setPosts)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load posts"))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className="space-y-4">
      {isOwn && (
        <PostComposer
          onPosted={() => {
            reload();
            onActivityChanged();
          }}
          onError={setError}
        />
      )}

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={PenSquare}
          title="No posts yet"
          description={
            isOwn
              ? "Share an update, achievement or milestone — your posts live here and on the community feed."
              : "This member hasn't posted anything yet."
          }
          compact
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              editable={isOwn}
              onPosted={reload}
              onError={setError}
            />
          ))}
        </div>
      )}
    </div>
  );
}