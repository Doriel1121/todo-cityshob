import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private socketService: SocketService
  ) {}

  login(): void {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        this.authService.setToken(response);
        this.socketService.connect();
        this.router.navigate(['/']);
      },
      error: (error) => {
        if (error.status === 400) {
          this.snackBar.open('Invalid username or password', 'Close', {
            duration: 3000,
          });
        } else {
          this.snackBar.open('Login failed. Please try again.', 'Close', {
            duration: 3000,
          });
        }
        console.error('Login failed', error);
      },
    });
  }

  register(): void {
    this.authService.register(this.credentials).subscribe({
      next: (response) => {
        this.snackBar.open('Registration successful!', 'Close', {
          duration: 3000,
        });
        this.errorMessage = null;
      },
      error: (error) => {
        if (error.status === 400) {
          this.errorMessage = 'Username already exists';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        console.error('Registration failed', error);
      },
    });
  }
}
