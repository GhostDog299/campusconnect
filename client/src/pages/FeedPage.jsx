import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Avatar, Btn, timeAgo, avatarColor } from "../components/Shared";

export default function FeedPage() {
  const { user, apiFetch } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    apiFetch("/posts").then(setPosts).finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!content.trim()) return;
    setPosting(true);
    const post = await apiFetch("/posts", { method: "POST", body: JSON.stringify({ content }) });
    setPosts((p) => [post, ...p]);
    setContent("");
    setPosting(false);
  };

  const like = async (id) => {
    const { likes } = await apiFetch(`/posts/${id}/like`, { method: "POST" });
    setPosts((p) => p.map((post) => (post.id === id ? { ...post, likes } : post)));
  };

  const comment = async (id) => {
    const text = commentText[id];
    if (!text?.trim()) return;
    const c = await apiFetch(`/posts/${id}/comment`, { method: "POST", body: JSON.stringify({ text }) });
    setPosts((p) => p.map((post) => post.id === id ? { ...post, comments: [...post.comments, c] } : post));
    setCommentText((t) => ({ ...t, [id]: "" }));
  };

  if (loading) return <div className="main-content"><p style={{ color: "var(--ink-3)" }}>Loading feed…</p></div>;

  return (
    <div className="main-content fade-in">
      <div className="page-header">
        <h2>{user.major} Feed</h2>
        <p>Posts from your cohort and professors</p>
      </div>

      <div className="feed">
        {/* Compose */}
        <div className="card post-compose" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Avatar name={user.name} color={avatarColor(user.name)} />
            <div style={{ flex: 1 }}>
              <textarea
                className="form-input"
                placeholder={`Share something with ${user.major}…`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                style={{ width: "100%", resize: "none" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <Btn variant="primary" size="sm" onClick={submit} disabled={posting || !content.trim()}>
                  {posting ? "Posting…" : "Post"}
                </Btn>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        {posts.map((post) => {
          const liked = post.likes.includes(user.id);
          return (
            <div key={post.id} className="card post-card fade-in">
              <div className="post-header">
                <Avatar name={post.author?.name} color={avatarColor(post.author?.name)} />
                <div className="post-meta">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="post-author">{post.author?.name}</span>
                    {post.author?.role === "professor" && <span className="badge green">Professor</span>}
                    <span className="rep-badge">⬡ {post.author?.reputation}</span>
                  </div>
                  <div className="post-time">{post.author?.major} · {timeAgo(post.timestamp)}</div>
                </div>
              </div>

              <p className="post-content">{post.content}</p>

              <div className="post-actions">
                <button
                  className={`btn btn-ghost btn-sm`}
                  style={{ color: liked ? "var(--accent)" : undefined }}
                  onClick={() => like(post.id)}
                >
                  {liked ? "♥" : "♡"} {post.likes.length}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowComments((s) => ({ ...s, [post.id]: !s[post.id] }))}
                >
                  ◻ {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
                </button>
              </div>

              {showComments[post.id] && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  {post.comments.map((c) => (
                    <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <Avatar name={c.author?.name || c.authorId} size="sm" color={avatarColor(c.author?.name)} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{c.author?.name || "User"}</span>
                        <span style={{ fontSize: 13, color: "var(--ink-2)", marginLeft: 8 }}>{c.text}</span>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <input
                      className="form-input"
                      style={{ flex: 1, padding: "7px 12px" }}
                      placeholder="Add a comment…"
                      value={commentText[post.id] || ""}
                      onChange={(e) => setCommentText((t) => ({ ...t, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && comment(post.id)}
                    />
                    <Btn variant="secondary" size="sm" onClick={() => comment(post.id)}>Post</Btn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
