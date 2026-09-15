"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import {
  createNote,
  deleteNote,
  subscribeToNotes,
  updateNote,
  type Note,
} from "@/lib/notes";

type AuthMode = "login" | "register";
type FormState = { title: string; content: string };

const emptyForm: FormState = { title: "", content: "" };

function readableError(error: unknown) {
  if (error instanceof FirebaseError) {
    const messages: Record<string, string> = {
      "auth/invalid-credential": "Email hoặc mật khẩu chưa chính xác.",
      "auth/email-already-in-use": "Email này đã được đăng ký.",
      "auth/invalid-email": "Email không hợp lệ.",
      "auth/weak-password": "Mật khẩu cần có ít nhất 6 ký tự.",
      "auth/too-many-requests": "Có quá nhiều lần thử. Vui lòng thử lại sau.",
    };
    return messages[error.code] ?? "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
}

function validateForm(form: FormState) {
  const title = form.title.trim();
  const content = form.content.trim();
  if (!title) return "Vui lòng nhập tiêu đề.";
  if (title.length > 120) return "Tiêu đề không được dài quá 120 ký tự.";
  if (!content) return "Vui lòng nhập nội dung.";
  if (content.length > 5000) return "Nội dung không được dài quá 5.000 ký tự.";
  return null;
}

function formatDate(note: Note) {
  const timestamp = note.updatedAt ?? note.createdAt;
  const date = timestamp ? new Date(timestamp) : null;
  return date
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date)
    : "Vừa tạo";
}

export default function NotesApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setAuthReady(true);
  }), []);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setNotesLoading(false);
      return;
    }
    setNotesLoading(true);
    setNotesError("");
    return subscribeToNotes(user.uid, (nextNotes) => {
      setNotes(nextNotes);
      setNotesLoading(false);
    }, (error) => {
      setNotesError(readableError(error));
      setNotesLoading(false);
    });
  }, [user]);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    if (!email.trim() || password.length < 6) {
      setAuthError("Vui lòng nhập email và mật khẩu (ít nhất 6 ký tự).");
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === "login") await signInWithEmailAndPassword(auth, email.trim(), password);
      else await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setAuthError(readableError(error));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateForm(form);
    if (error || !user) {
      setFormError(error ?? "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editingId) await updateNote(editingId, form.title.trim(), form.content.trim());
      else await createNote(user.uid, form.title.trim(), form.content.trim());
      setForm(emptyForm);
      setEditingId(null);
    } catch (saveError) {
      setFormError(readableError(saveError));
    } finally {
      setSaving(false);
    }
  }

  function startEditing(note: Note) {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(noteId: string) {
    if (!window.confirm("Bạn có chắc muốn xóa ghi chú này không?")) return;
    setDeletingId(noteId);
    try {
      await deleteNote(noteId);
    } catch (error) {
      setNotesError(readableError(error));
    } finally {
      setDeletingId(null);
    }
  }

  if (!authReady) return <main className="center-screen"><div className="loader" aria-label="Đang tải" /></main>;

  if (!user) {
    return (
      <main className="auth-shell">
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="brand-mark" aria-hidden="true">✦</div>
          <p className="eyebrow">KHÔNG GIAN RIÊNG TƯ</p>
          <h1 id="auth-title">Ghi chú, thật nhẹ nhàng.</h1>
          <p className="muted">Lưu lại những điều quan trọng, theo cách của riêng bạn.</p>
          <div className="tabs" role="tablist" aria-label="Tùy chọn tài khoản">
            <button className={authMode === "login" ? "tab active" : "tab"} onClick={() => setAuthMode("login")} role="tab" aria-selected={authMode === "login"}>Đăng nhập</button>
            <button className={authMode === "register" ? "tab active" : "tab"} onClick={() => setAuthMode("register")} role="tab" aria-selected={authMode === "register"}>Tạo tài khoản</button>
          </div>
          <form onSubmit={handleAuth} className="stack">
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ban@example.com" autoComplete="email" required /></label>
            <label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Ít nhất 6 ký tự" autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength={6} required /></label>
            {authError && <p className="form-error" role="alert">{authError}</p>}
            <button className="primary-button" disabled={authLoading}>{authLoading ? "Đang xử lý…" : authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
          </form>
          <p className="fine-print">Dữ liệu của bạn được lưu riêng theo tài khoản.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark small" aria-hidden="true">✦</span><span>Ghi chú</span></div>
        <div className="account"><span className="account-email">{user.email}</span><button className="ghost-button" onClick={() => signOut(auth)}>Đăng xuất</button></div>
      </header>
      <div className="content">
        <section className="hero"><p className="eyebrow">XIN CHÀO, {user.email?.split("@")[0]?.toUpperCase()}</p><h1>Hôm nay bạn muốn<br /><em>ghi lại điều gì?</em></h1></section>
        <section className="note-editor" aria-labelledby="editor-title">
          <div className="section-heading"><div><p className="eyebrow">{isEditing ? "CHỈNH SỬA" : "GHI CHÚ MỚI"}</p><h2 id="editor-title">{isEditing ? "Cập nhật ghi chú" : "Bắt đầu viết"}</h2></div>{isEditing && <button className="text-button" onClick={() => { setEditingId(null); setForm(emptyForm); setFormError(""); }}>Hủy chỉnh sửa</button>}</div>
          <form onSubmit={handleNoteSubmit} className="stack">
            <input className="title-input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Tiêu đề ghi chú…" maxLength={120} aria-label="Tiêu đề ghi chú" />
            <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Viết điều bạn đang nghĩ…" maxLength={5000} rows={4} aria-label="Nội dung ghi chú" />
            <div className="editor-footer"><span className="counter">{form.content.length.toLocaleString("vi-VN")} / 5.000</span><button className="primary-button compact" disabled={saving}>{saving ? "Đang lưu…" : isEditing ? "Lưu thay đổi" : "Lưu ghi chú"}</button></div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
          </form>
        </section>
        <section className="notes-section" aria-labelledby="notes-title">
          <div className="section-heading"><div><p className="eyebrow">KHO LƯU TRỮ</p><h2 id="notes-title">Ghi chú của bạn <span className="count">{notes.length}</span></h2></div></div>
          {notesLoading && <div className="state-card"><div className="loader" /><span>Đang tải ghi chú…</span></div>}
          {!notesLoading && notesError && <div className="state-card error-state" role="alert"><strong>Không thể tải ghi chú</strong><span>{notesError}</span></div>}
          {!notesLoading && !notesError && notes.length === 0 && <div className="state-card empty-state"><span className="empty-icon" aria-hidden="true">○</span><strong>Chưa có ghi chú nào</strong><span>Những ý tưởng đầu tiên của bạn sẽ xuất hiện ở đây.</span></div>}
          <div className="notes-grid">{notes.map((note) => <article className="note-card" key={note.id}><div><p className="note-date">{formatDate(note)}</p><h3>{note.title}</h3><p className="note-content">{note.content}</p></div><div className="note-actions"><button className="icon-button" onClick={() => startEditing(note)} aria-label={`Chỉnh sửa ${note.title}`}>Sửa</button><button className="icon-button danger" onClick={() => handleDelete(note.id)} disabled={deletingId === note.id} aria-label={`Xóa ${note.title}`}>{deletingId === note.id ? "…" : "Xóa"}</button></div></article>)}</div>
        </section>
      </div>
    </main>
  );
}
