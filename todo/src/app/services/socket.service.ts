// src/app/services/socket.service.ts
import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../environmets/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../models/Task';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private tasks = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasks.asObservable();

  constructor(private authService: AuthService) {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.connect();
      }
    });
  }

  connect(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No token found, cannot establish WebSocket connection.');
      return;
    }

    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
      auth: { token },
    });

    this.setupSocketListeners();
    this.fetchTasks();
  }

  setupSocketListeners(): void {
    this.socket.on('updateTasks', (tasks: Task[]) => {
      this.tasks.next(tasks);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.fetchTasks();
    });
  }

  fetchTasks(): void {
    this.socket.emit('getTasks');
  }

  addTask(task: Task): void {
    this.socket.emit('addTask', { task });
  }

  removeTask(id: string): void {
    this.socket.emit('removeTask', id);
  }

  toggleComplete(id: string): void {
    this.socket.emit('toggleComplete', id);
  }

  updateTask(task: Task): void {
    this.socket.emit('updateTask', task);
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}
