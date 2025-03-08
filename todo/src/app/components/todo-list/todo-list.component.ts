import { Component, OnInit, OnDestroy } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Task } from '../../models/Task';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DatePipe,
  ],
  animations: [
    trigger('taskState', [
      state('active', style({ opacity: 1, transform: 'translateY(0)' })),
      state('completed', style({ opacity: 0.5 })),
      transition('active <=> completed', animate('300ms ease-in-out')),
    ]),
  ],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
})
export class TodoListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  newTask: string = '';
  newTaskPriority: 'medium' | 'low' | 'high' = 'medium';
  newTaskDueDate: Date = new Date();
  username: string | null = null;
  private tasksSubscription: Subscription | undefined;

  constructor(
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.tasksSubscription = this.todoService.getTasks().subscribe((tasks) => {
      this.tasks = tasks;
    });
    this.username = this.authService.getUsername();
  }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  addTask() {
    if (this.newTask.trim()) {
      const newTask: Task = {
        name: this.newTask,
        completed: false,
        priority: this.newTaskPriority,
        dueDate: this.newTaskDueDate,
        isEditing: false,
      };
      this.todoService.addTask(newTask);
      this.newTask = '';
    }
  }

  removeTask(id: string) {
    this.todoService.removeTask(id);
    this.snackBar.open('Task removed!', 'Close', { duration: 2000 });
  }

  toggleComplete(id: string) {
    this.todoService.toggleComplete(id);
  }

  editTask(task: Task) {
    task.isEditing = true;
  }

  saveTask(task: Task) {
    task.isEditing = false;
    this.todoService.updateTask(task);
  }
}
