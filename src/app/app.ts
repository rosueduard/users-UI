import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from './user.service';
import { User, UserRole } from './user.model';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

      :host {
        font-family: 'DM Sans', sans-serif;
      }

      h1,
      h2,
      h3,
      .font-display {
        font-family: 'Syne', sans-serif;
      }

      .glass {
        background: rgba(255, 255, 255, 0.07);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(255, 255, 255, 0.13);
      }

      .glass-form {
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      .card-hover {
        transition:
          transform 0.25s cubic-bezier(0.22, 0.68, 0, 1.2),
          box-shadow 0.25s ease;
      }
      .card-hover:hover {
        transform: translateY(-4px) scale(1.01);
        box-shadow: 0 16px 48px rgba(99, 102, 241, 0.25);
      }

      .btn-primary {
        background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
        transition:
          opacity 0.2s,
          transform 0.15s;
      }
      .btn-primary:hover {
        opacity: 0.9;
        transform: scale(1.03);
      }
      .btn-primary:active {
        transform: scale(0.97);
      }

      .btn-edit {
        background: rgba(99, 102, 241, 0.18);
        border: 1px solid rgba(99, 102, 241, 0.35);
        color: #a5b4fc;
        transition:
          background 0.2s,
          transform 0.15s;
      }
      .btn-edit:hover {
        background: rgba(99, 102, 241, 0.32);
        transform: scale(1.05);
      }

      .btn-delete {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #fca5a5;
        transition:
          background 0.2s,
          transform 0.15s;
      }
      .btn-delete:hover {
        background: rgba(239, 68, 68, 0.28);
        transform: scale(1.05);
      }

      .mesh-bg {
        background:
          radial-gradient(ellipse 80% 60% at 10% 20%, rgba(99, 102, 241, 0.28) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 90% 80%, rgba(6, 182, 212, 0.22) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 50% 50%, rgba(139, 92, 246, 0.12) 0%, transparent 70%),
          #0a0d1a;
      }

      .input-field {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #e2e8f0;
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
        outline: none;
      }
      .input-field:focus {
        border-color: rgba(99, 102, 241, 0.65);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
      }
      .input-field::placeholder {
        color: rgba(148, 163, 184, 0.5);
      }

      .toast-enter {
        animation: slideIn 0.35s cubic-bezier(0.22, 0.68, 0, 1.15) forwards;
      }
      @keyframes slideIn {
        from {
          transform: translateX(120%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .spinner {
        border: 3px solid rgba(99, 102, 241, 0.2);
        border-top-color: #6366f1;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .badge {
        background: rgba(6, 182, 212, 0.15);
        border: 1px solid rgba(6, 182, 212, 0.3);
        color: #67e8f9;
        font-size: 0.7rem;
        padding: 2px 10px;
        border-radius: 999px;
        font-family: 'Syne', sans-serif;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .confirm-overlay {
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(6px);
      }

      .gradient-text {
        background: linear-gradient(135deg, #818cf8, #22d3ee);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .section-line {
        height: 2px;
        background: linear-gradient(90deg, #6366f1, #06b6d4, transparent);
        border: none;
      }

      .user-card-animate {
        animation: fadeUp 0.4s ease both;
      }
      @keyframes fadeUp {
        from {
          opacity: 0;
          transform: translateY(18px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
  template: `
    <!-- Toast Container -->
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div
          class="toast-enter pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl glass"
          [class]="
            toast.type === 'success' ? 'border-l-4 border-emerald-400' : 'border-l-4 border-red-400'
          "
          style="min-width:280px"
        >
          <span class="text-lg">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
          <span class="text-slate-200 text-sm font-medium">{{ toast.message }}</span>
        </div>
      }
    </div>

    <!-- Delete Confirm Modal -->
    @if (confirmDeleteId() !== null) {
      <div
        class="confirm-overlay fixed inset-0 z-40 flex items-center justify-center"
        (click)="cancelDelete()"
      >
        <div
          class="glass rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
          (click)="$event.stopPropagation()"
        >
          <div class="text-4xl mb-4">⚠️</div>
          <h3 class="font-display text-xl font-bold text-white mb-2">Confirmi ștergerea?</h3>
          <p class="text-slate-400 text-sm mb-6">Această acțiune este ireversibilă.</p>
          <div class="flex gap-3 justify-center">
            <button
              class="btn-edit px-5 py-2 rounded-lg text-sm font-medium"
              (click)="cancelDelete()"
            >
              Anulează
            </button>
            <button
              class="btn-delete px-5 py-2 rounded-lg text-sm font-medium"
              (click)="confirmDelete()"
            >
              Șterge
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Main Layout -->
    <div class="min-h-screen mesh-bg text-slate-100">
      <div class="max-w-6xl mx-auto px-4 py-12">
        <!-- Header -->
        <div class="mb-12 text-center">
          <p class="text-xs uppercase tracking-widest text-cyan-400 mb-3 font-display">
            Admin Panel
          </p>
          <h1 class="font-display text-5xl font-extrabold gradient-text mb-3">User Manager</h1>
          <hr class="section-line w-32 mx-auto mt-4" />
        </div>

        <!-- Form Card -->
        <div class="glass-form rounded-2xl p-8 mb-10 shadow-xl">
          <h2 class="font-display text-xl font-bold text-white mb-6">
            {{ editingUser() ? '✏️ Editează Utilizator' : '＋ Adaugă Utilizator' }}
          </h2>
          <form
            [formGroup]="userForm"
            (ngSubmit)="onSubmit()"
            class="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <div>
              <label class="block text-xs text-slate-400 mb-2 uppercase tracking-wider"
                >First Name</label
              >
              <input
                formControlName="firstName"
                class="input-field w-full px-4 py-3 rounded-xl text-sm"
                placeholder="ex: Ion"
              />
              @if (userForm.get('firstName')?.invalid && userForm.get('firstName')?.touched) {
                <p class="text-red-400 text-xs mt-1">Prenumele este obligatoriu.</p>
              }
            </div>

            <div>
              <label class="block text-xs text-slate-400 mb-2 uppercase tracking-wider"
                >Last Name</label
              >
              <input
                formControlName="lastName"
                class="input-field w-full px-4 py-3 rounded-xl text-sm"
                placeholder="ex: Popescu"
              />
              @if (userForm.get('lastName')?.invalid && userForm.get('lastName')?.touched) {
                <p class="text-red-400 text-xs mt-1">Numele este obligatoriu.</p>
              }
            </div>

            <div>
              <label class="block text-xs text-slate-400 mb-2 uppercase tracking-wider"
                >Email</label
              >
              <input
                formControlName="email"
                class="input-field w-full px-4 py-3 rounded-xl text-sm"
                placeholder="ex: ion@example.com"
              />
              @if (userForm.get('email')?.invalid && userForm.get('email')?.touched) {
                <p class="text-red-400 text-xs mt-1">Email valid obligatoriu.</p>
              }
            </div>

            <div>
              <label class="block text-xs text-slate-400 mb-2 uppercase tracking-wider">Rol</label>
              <select
                formControlName="role"
                class="input-field w-full px-4 py-3 rounded-xl text-sm cursor-pointer"
              >
                @for (r of userRoles; track r) {
                  <option [value]="r" class="bg-slate-900 text-slate-100">{{ r }}</option>
                }
              </select>
              @if (userForm.get('role')?.invalid && userForm.get('role')?.touched) {
                <p class="text-red-400 text-xs mt-1">Rolul este obligatoriu.</p>
              }
            </div>

            <div class="md:col-span-3 flex gap-3 pt-2">
              <button
                type="submit"
                [disabled]="userForm.invalid || isSaving()"
                class="btn-primary px-7 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                @if (isSaving()) {
                  <span
                    class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"
                  ></span>
                }
                {{ editingUser() ? 'Salvează Modificările' : 'Adaugă Utilizator' }}
              </button>

              @if (editingUser()) {
                <button
                  type="button"
                  class="btn-edit px-6 py-3 rounded-xl text-sm font-medium"
                  (click)="cancelEdit()"
                >
                  Anulează
                </button>
              }
            </div>
          </form>
        </div>

        <!-- Users List -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-display text-2xl font-bold text-white">
              Utilizatori
              <span class="ml-2 text-base font-normal text-slate-500">({{ users().length }})</span>
            </h2>
          </div>

          <!-- Loading -->
          @if (isLoading()) {
            <div class="flex flex-col items-center justify-center py-20 gap-4">
              <div class="spinner"></div>
              <p class="text-slate-500 text-sm">Se încarcă utilizatorii...</p>
            </div>
          }

          <!-- Empty -->
          @if (!isLoading() && users().length === 0) {
            <div class="glass rounded-2xl p-16 text-center">
              <div class="text-5xl mb-4">👤</div>
              <p class="text-slate-400">Niciun utilizator găsit. Adaugă primul!</p>
            </div>
          }

          <!-- Cards Grid -->
          @if (!isLoading() && users().length > 0) {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (user of users(); track user.id; let i = $index) {
                <div
                  class="glass rounded-2xl p-6 card-hover user-card-animate"
                  [style.animation-delay]="i * 60 + 'ms'"
                >
                  <!-- Avatar -->
                  <div class="flex items-start gap-4 mb-4">
                    <div
                      class="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-display flex-shrink-0"
                      style="background: linear-gradient(135deg, #6366f1, #06b6d4)"
                    >
                      {{ getInitials(user.firstName) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3
                        class="font-display font-bold text-white text-base leading-tight truncate"
                      >
                        {{ user.lastName }} {{ user.firstName }}
                      </h3>
                      <p class="text-slate-400 text-xs truncate mt-0.5">{{ user.email }}</p>
                    </div>
                  </div>

                  @if (user.role) {
                    <div class="mb-4">
                      <span class="badge">{{ user.role }}</span>
                    </div>
                  }

                  <!-- Actions -->
                  <div class="flex gap-2 pt-3 border-t border-white/5">
                    <button
                      class="btn-edit flex-1 py-2 rounded-lg text-xs font-semibold"
                      (click)="startEdit(user)"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      class="btn-delete flex-1 py-2 rounded-lg text-xs font-semibold"
                      (click)="askDelete(user.id!)"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class App implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  readonly userRoles = Object.values(UserRole);

  users = signal<User[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  editingUser = signal<User | null>(null);
  confirmDeleteId = signal<string | number | null>(null);
  toasts = signal<Toast[]>([]);
  private toastCounter = 0;

  userForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: [UserRole.User, Validators.required],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.showToast('Eroare la încărcarea utilizatorilor.', 'error');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const editing = this.editingUser();
    this.isSaving.set(true);

    if (editing) {
      this.userService.updateUser(editing.id!, this.userForm.value).subscribe({
        next: (updated) => {
          this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
          this.showToast('Utilizator actualizat cu succes!', 'success');
          this.cancelEdit();
          this.isSaving.set(false);
        },
        error: () => {
          this.showToast('Eroare la actualizare.', 'error');
          this.isSaving.set(false);
        },
      });
    } else {
      this.userService.createUser(this.userForm.value).subscribe({
        next: (created) => {
          this.users.update((list) => [...list, created]);
          this.showToast('Utilizator adăugat cu succes!', 'success');
          this.userForm.reset();
          this.isSaving.set(false);
        },
        error: () => {
          this.showToast('Eroare la creare.', 'error');
          this.isSaving.set(false);
        },
      });
    }
  }

  startEdit(user: User): void {
    this.editingUser.set(user);

    this.userForm.setValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role ?? UserRole.User,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editingUser.set(null);
    this.userForm.reset();
  }

  askDelete(id: string | number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (id === null) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== id));
        this.showToast('Utilizator șters.', 'success');
        this.confirmDeleteId.set(null);
      },
      error: () => {
        this.showToast('Eroare la ștergere.', 'error');
        this.confirmDeleteId.set(null);
      },
    });
  }

  getInitials(name: string): string {
    return (
      name
        ?.split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() ?? '?'
    );
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const id = ++this.toastCounter;
    this.toasts.update((t) => [...t, { id, message, type }]);
    setTimeout(() => this.toasts.update((t) => t.filter((x) => x.id !== id)), 3500);
  }
}
