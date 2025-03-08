export interface Task{
    _id?: string ;
    name: string ;
    isEditing: boolean ;
    completed: boolean ;
    priority: 'low' | 'medium' | 'high';
    dueDate: Date;
}