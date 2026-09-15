import {
  equalTo,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { db } from "./firebase";

export type Note = {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  createdAt: number | null;
  updatedAt: number | null;
};

type NoteData = Omit<Note, "id">;

export function subscribeToNotes(
  ownerId: string,
  onChange: (notes: Note[]) => void,
  onError: (error: Error) => void,
) {
  const notesQuery = query(ref(db, "notes"), orderByChild("ownerId"), equalTo(ownerId));

  return onValue(
    notesQuery,
    (snapshot) => {
      const notes: Note[] = [];
      snapshot.forEach((childSnapshot) => {
        notes.push({ id: childSnapshot.key as string, ...childSnapshot.val() } as Note);
      });
      notes.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      onChange(notes);
    },
    (error) => onError(error),
  );
}

export async function createNote(ownerId: string, title: string, content: string) {
  const noteReference = push(ref(db, "notes"));
  const now = Date.now();
  const note: NoteData = {
    title,
    content,
    ownerId,
    createdAt: now,
    updatedAt: now,
  };
  await set(noteReference, note);
}

export async function updateNote(noteId: string, title: string, content: string) {
  await update(ref(db, `notes/${noteId}`), {
    title,
    content,
    updatedAt: Date.now(),
  });
}

export async function deleteNote(noteId: string) {
  await remove(ref(db, `notes/${noteId}`));
}
