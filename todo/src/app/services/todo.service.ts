// src/app/services/todo.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/Task';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  constructor(private socketService: SocketService) {}

  getTasks(): Observable<Task[]> {
    return this.socketService.tasks$;
  }

  addTask(task: Task): void {
    this.socketService.addTask(task);
  }

  removeTask(id: string): void {
    this.socketService.removeTask(id);
  }

  toggleComplete(id: string): void {
    this.socketService.toggleComplete(id);
  }

  updateTask(task: Task): void {
    this.socketService.updateTask(task);
  }

  disconnectSocket(): void {
    this.socketService.disconnect();
  }
}
