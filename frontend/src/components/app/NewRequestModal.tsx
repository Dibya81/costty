import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Label, Textarea } from "../ui/Input";
import { createRequest } from "../../services/communityService";
import type { CommunityRequest } from "../../services/communityService";
import { useToast } from "../ui/Toast";

export function NewRequestModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (request: CommunityRequest) => void;
}) {
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setTags("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const request = await createRequest({
        title: title.trim(),
        description: description.trim() || "No further details provided.",
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 4),
      });
      onCreated(request);
      push("Request posted");
      reset();
      onClose();
    } catch (err) {
      push(err instanceof Error ? err.message : "Failed to post request", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New document request" width="28rem">
      <div className="space-y-4">
        <div>
          <Label htmlFor="req-title">What do you need?</Label>
          <Input
            id="req-title"
            placeholder="e.g. Need Python Notes for Machine Learning"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="req-desc">Details</Label>
          <Textarea
            id="req-desc"
            rows={3}
            placeholder="Any specifics — topics, syllabus, format…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="req-tags">Tags (comma separated)</Label>
          <Input
            id="req-tags"
            placeholder="Python, Machine Learning, Semester 6"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={handleSubmit} disabled={submitting || !title.trim()}>
          {submitting ? "Posting…" : "Post request"}
        </Button>
      </div>
    </Modal>
  );
}
