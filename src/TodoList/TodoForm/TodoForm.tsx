import React, { useState, useCallback } from 'react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import './TodoForm.css'


interface TodoFormProps {
	categories: string[];
	onAddTodo: (todo: { title: string; description: string; category?: string }) => void;
}

const TodoForm: React.FC<TodoFormProps> = React.memo(({ categories, onAddTodo }) => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [newCategory, setNewCategory] = useState<string>('Нет категории');
	const [customCategory, setCustomCategory] = useState<string>('');

	const handleAddTodo = useCallback(() => {
		if (title.trim() === '' || description.trim() === '') {
			alert('Пожалуйста, заполните все поля');
			return;
		}

		let category = newCategory;
		if (newCategory === 'new') {
			if (customCategory.trim() === '') {
				alert('Введите название новой категории');
				return;
			}
			category = customCategory.trim();
		}

		if (category === 'Нет категории') {
			category = 'Все';
		}

		onAddTodo({ title, description, category });
		setTitle('');
		setDescription('');
		setNewCategory('Нет категории');
		setCustomCategory('');
	}, [title, description, newCategory, customCategory, onAddTodo]);

	// Настройки панели инструментов
	const modules = {
		toolbar: [
			[{ header: [1, 2, 3, false] }],
			['bold', 'italic', 'underline', 'strike'],
			[{ list: 'ordered' }, { list: 'bullet' }],
			['link', 'image'],
			['clean'],
		],
	};

	return (
		<div className="add-todo-form">
			<input
				value={title}
				onChange={e => setTitle(e.target.value)}
				placeholder="Название"
			/>
			<ReactQuill
				value={description}
				onChange={setDescription}
				modules={modules}
				placeholder="Описание"
			/>
			<select
				value={newCategory}
				onChange={e => setNewCategory(e.target.value)}
			>
				<option>Нет категории</option>
				{categories.filter(cat => cat !== 'Все').map(category => (
					<option key={category} value={category}>
						{category}
					</option>
				))}
				<option value="new">Добавить новую категорию</option>
			</select>
			{newCategory === 'new' && (
				<input
					value={customCategory}
					onChange={e => setCustomCategory(e.target.value)}
					placeholder="Новая категория"
				/>
			)}
			<button onClick={handleAddTodo}>Добавить задачу</button>
		</div>
	);
});

export default TodoForm;
