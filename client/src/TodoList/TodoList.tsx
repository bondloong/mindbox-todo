import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './TodoList.css';
import CategoryFilter from './CategoryFilter/CategoryFilter';
import TodoForm from './TodoForm/TodoForm';
import TodoItem from './TodoItem/TodoItem';
import { Title } from '../components/tltle/Title';
import Filter from '../components/Filter/Filter';

export interface ITodo {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	category?: string;
}

export type FilterStatusType = 'all' | 'completed' | 'incomplete';

const TodoList: React.FC = () => {
	const [todos, setTodos] = useState<ITodo[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string>('Нет категории');
	const [filterStatus, setFilterStatus] = useState<FilterStatusType>('all');

	const fetchTodos = useCallback(async () => {
		try {
			const params = selectedCategory && selectedCategory !== 'Нет категории' ? { category: selectedCategory } : {};
			const response = await axios.get<ITodo[]>('/api/todos', { params });
			setTodos(response.data);
		} catch (error) {
			console.error('Ошибка при получении задач', error);
		}
	}, [selectedCategory]);

	const fetchCategories = useCallback(async () => {
		try {
			const response = await axios.get<string[]>('/api/categories');
			setCategories(response.data);

			// Проверяем, существует ли выбранная категория
			if (!response.data.includes(selectedCategory)) {
				setSelectedCategory('Нет категории');
			}
		} catch (error) {
			console.error('Ошибка при получении категорий', error);
		}
	}, [selectedCategory]);

	useEffect(() => {
		fetchTodos();
	}, [fetchTodos]);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	useEffect(() => {
		if (!categories.includes(selectedCategory)) {
			setSelectedCategory('Нет категории');
		}
	}, [categories, selectedCategory]);

	const addTodo = useCallback(async (newTodoData: { title: string; description: string; category?: string }) => {
		try {
			await axios.post('/api/todos', newTodoData);
			fetchTodos();
			fetchCategories();
		} catch (error) {
			console.error('Ошибка при добавлении задачи', error);
		}
	}, [fetchTodos, fetchCategories]);

	const toggleTodo = useCallback(async (id: string) => {
		try {
			await axios.patch(`/api/todos/${id}/toggle`);
			fetchTodos();
			fetchCategories();
		} catch (error) {
			console.error('Ошибка при изменении статуса задачи', error);
		}
	}, [fetchTodos, fetchCategories]);

	const deleteTodo = useCallback(async (id: string) => {
		try {
			await axios.delete(`/api/todos/${id}`);
			fetchTodos();
			fetchCategories();
		} catch (error) {
			console.error('Ошибка при удалении задачи', error);
		}
	}, [fetchTodos, fetchCategories]);

	const updateTodoCategory = useCallback(async (id: string, category: string) => {
		try {
			await axios.patch(`/api/todos/${id}/category`, { category });
			fetchTodos();
			fetchCategories();
		} catch (error) {
			console.error('Ошибка при обновлении категории задачи', error);
		}
	}, [fetchTodos, fetchCategories]);

	const deleteCompletedTodos = useCallback(async () => {
		try {
			await axios.delete('/api/todos/completed');
			fetchTodos();
			fetchCategories();
		} catch (error) {
			console.error('Ошибка при удалении завершенных задач', error);
		}
	}, [fetchTodos, fetchCategories]);

	const deleteCategoryTasks = useCallback(async () => {
		const confirmDelete = window.confirm(
			`Вы уверены, что хотите удалить все задачи категории "${selectedCategory}"?`
		);
		if (!confirmDelete) return;

		try {
			await axios.delete(`/api/todos/category/${encodeURIComponent(selectedCategory)}/completed`);
			setSelectedCategory('Нет категории');
			fetchTodos();
			fetchCategories();
			alert(`Нет категории задачи категории "${selectedCategory}" были удалены.`);
		} catch (error) {
			console.error('Ошибка при удалении задач категории', error);
			alert('Произошла ошибка при удалении задач категории.');
		}
	}, [selectedCategory, fetchTodos, fetchCategories]);

	const handleSelectCategory = useCallback((category: string) => {
		setSelectedCategory(category);
	}, []);

	const filteredTodos = useMemo(() => {
		switch (filterStatus) {
			case 'completed':
				return todos.filter(todo => todo.completed);
			case 'incomplete':
				return todos.filter(todo => !todo.completed);
			default:
				return todos;
		}
	}, [todos, filterStatus]);

	return (
		<div className="todo-list">
			<Title>todos</Title>
			<TodoForm
				categories={categories}
				onAddTodo={addTodo}
			/>
			
			<CategoryFilter
				categories={categories}
				selectedCategory={selectedCategory}
				onSelectCategory={handleSelectCategory}
			/>
			<Filter filterStatus={filterStatus} setFilterStatus={setFilterStatus}>
				<div>
					Невыполненых {filteredTodos.filter(todo => !todo.completed).length}
				</div>
			</Filter>

			<div className="todo-items">
				<div className="todo-items">
					{filteredTodos.map(todo => (
						<TodoItem
							key={todo.id}
							todo={todo}
							categories={categories}
							onToggleTodo={toggleTodo}
							onDeleteTodo={deleteTodo}
							onUpdateTodoCategory={updateTodoCategory}
						/>
					))}
				</div>
			</div>

			<div className="buttons-container">
				<button className="delete-completed-button" onClick={deleteCompletedTodos}>
					Удалить завершенные задачи
				</button>
				{selectedCategory !== 'Нет категории' && (
					<button className="delete-category-tasks-button" onClick={deleteCategoryTasks}>
						Удалить выполненные задачи категории
					</button>
				)}
			</div>
		</div>
	);
};

export default TodoList;
