import React, { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';

interface Todo {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	category?: string;
}

interface TodoItemProps {
	todo: Todo;
	categories: string[];
	onToggleTodo: (id: string) => void;
	onDeleteTodo: (id: string) => void;
	onUpdateTodoCategory: (id: string, category: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = React.memo(({ todo, categories, onToggleTodo, onDeleteTodo, onUpdateTodoCategory }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editedCategory, setEditedCategory] = useState<string>(todo.category || 'Нет категории');
	const [customEditedCategory, setCustomEditedCategory] = useState<string>('');

	const handleUpdateCategory = useCallback(() => {
		let category = editedCategory;
		if (editedCategory === 'new') {
			if (customEditedCategory.trim() === '') {
				alert('Введите название новой категории');
				return;
			}
			category = customEditedCategory.trim();
		}

		if (category === 'Нет категории') {
			category = 'Нет категории';
		}

		onUpdateTodoCategory(todo.id, category);
		setIsEditing(false);
		setEditedCategory('Нет категории');
		setCustomEditedCategory('');
	}, [editedCategory, customEditedCategory, onUpdateTodoCategory, todo.id]);

	const handleCancelEdit = useCallback(() => {
		setIsEditing(false);
		setEditedCategory(todo.category || 'Нет категории');
		setCustomEditedCategory('');
	}, [todo.category]);

	return (
		<div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
			<div>
				<h2>{todo.title}</h2>
				{/* Используем dangerouslySetInnerHTML для отображения HTML-описания */}
				<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(todo.description) }} />
				{todo.category && <span className="category">Категория: {todo.category}</span>}
			</div>
			<div className="todo-item-buttons">
				<button
					className="toggle-button"
					onClick={() => onToggleTodo(todo.id)}
				>
					{todo.completed ? 'Снять отметку' : 'Завершить'}
				</button>
				<button
					className="delete-button"
					onClick={() => onDeleteTodo(todo.id)}
				>
					Удалить
				</button>
				<button
					className="edit-button"
					onClick={() => {
						setIsEditing(true);
						setEditedCategory(todo.category || 'Нет категории');
					}}
				>
					Изменить категорию
				</button>
			</div>
			{isEditing && (
				<div className="edit-category">
					<select
						value={editedCategory}
						onChange={e => setEditedCategory(e.target.value)}
					>
						<option>Нет категории</option>
						{categories.filter(cat => cat !== 'Нет категории').map(category => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
						<option value="new">Добавить новую категорию</option>
					</select>
					{editedCategory === 'new' && (
						<input
							value={customEditedCategory}
							onChange={e => setCustomEditedCategory(e.target.value)}
							placeholder="Новая категория"
						/>
					)}
					<button onClick={handleUpdateCategory}>Сохранить</button>
					<button onClick={handleCancelEdit}>
						Отмена
					</button>
				</div>
			)}
		</div>
	);
});

export default TodoItem;
