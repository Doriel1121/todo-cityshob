export interface TaskResponse{
    _id: string ;
    name: string ;
    isEditing: boolean ;
    completed: boolean ;
    priority: 'low' | 'medium' | 'high';
    dueDate: Date;
}