import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Label } from "../ui/Input";

export function RenameModal({
  open,
  onClose,
  currentName,
  onRename,
}: {
  open: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (name: string) => void;
}) {
  const [value, setValue] = useState(currentName);

  useEffect(() => {
    if (open) setValue(currentName);
  }, [open, currentName]);

  return (
    <Modal open={open} onClose={onClose} title="Rename">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) {
            onRename(value.trim());
            onClose();
          }
        }}
      >
        <Label htmlFor="rename-input">New name</Label>
        <Input id="rename-input" autoFocus value={value} onChange={(e) => setValue(e.target.value)} />
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
