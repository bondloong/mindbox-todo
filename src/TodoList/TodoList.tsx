import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const LOCAL_STORAGE_TODOS_KEY = 'todos';
const LOCAL_STORAGE_CATEGORIES_KEY = 'categories';

const TodoList: React.FC = () => {
	const [todos, setTodos] = useState<ITodo[]>([]);
	const [categories, setCategories] = useState<string[]>(['Нет категории']);
	const [selectedCategory, setSelectedCategory] = useState<string>('Нет категории');
	const [filterStatus, setFilterStatus] = useState<FilterStatusType>('all');

	// Функция для загрузки задач и категорий из localStorage
	const loadFromLocalStorage = () => {
		const storedTodos = localStorage.getItem(LOCAL_STORAGE_TODOS_KEY);
		const storedCategories = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);

		setTodos(storedTodos ? JSON.parse(storedTodos) : []);
		setCategories(storedCategories ? JSON.parse(storedCategories) : ['Нет категории']);
	};

	// Функция для сохранения задач и категорий в localStorage
	const saveToLocalStorage = (updatedTodos: ITodo[], updatedCategories: string[]) => {
		localStorage.setItem(LOCAL_STORAGE_TODOS_KEY, JSON.stringify(updatedTodos));
		localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(updatedCategories));
	};

	useEffect(() => {
		loadFromLocalStorage();
	}, []);

	const addTodo = useCallback((newTodoData: { title: string; description: string; category?: string }) => {
		const newTodo: ITodo = {
			id: Date.now().toString(),
			title: newTodoData.title,
			description: newTodoData.description,
			completed: false,
			category: newTodoData.category && newTodoData.category !== 'Нет категории' ? newTodoData.category : undefined,
		};

		const updatedTodos = [...todos, newTodo];
		setTodos(updatedTodos);

		if (newTodo.category && !categories.includes(newTodo.category)) {
			const updatedCategories = [...categories, newTodo.category];
			setCategories(updatedCategories);
			saveToLocalStorage(updatedTodos, updatedCategories);
		} else {
			saveToLocalStorage(updatedTodos, categories);
		}
	}, [todos, categories]);

	const toggleTodo = useCallback((id: string) => {
		const updatedTodos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
		setTodos(updatedTodos);
		saveToLocalStorage(updatedTodos, categories);
	}, [todos, categories]);

	const deleteTodo = useCallback((id: string) => {
		const updatedTodos = todos.filter(todo => todo.id !== id);
		setTodos(updatedTodos);
		saveToLocalStorage(updatedTodos, categories);
	}, [todos, categories]);

	const updateTodoCategory = useCallback((id: string, category: string) => {
		const updatedTodos = todos.map(todo => todo.id === id ? { ...todo, category } : todo);
		setTodos(updatedTodos);

		if (category && !categories.includes(category)) {
			const updatedCategories = [...categories, category];
			setCategories(updatedCategories);
			saveToLocalStorage(updatedTodos, updatedCategories);
		} else {
			saveToLocalStorage(updatedTodos, categories);
		}
	}, [todos, categories]);

	const deleteCompletedTodos = useCallback(() => {
		const updatedTodos = todos.filter(todo => !todo.completed);
		setTodos(updatedTodos);
		saveToLocalStorage(updatedTodos, categories);
	}, [todos, categories]);

	const deleteCategoryTasks = useCallback(() => {
		const confirmDelete = window.confirm(`Вы уверены, что хотите удалить все задачи категории "${selectedCategory}"?`);
		if (!confirmDelete) return;

		const updatedTodos = todos.filter(todo => todo.category !== selectedCategory || !todo.completed);
		setTodos(updatedTodos);

		const remainingTasksInCategory = updatedTodos.some(todo => todo.category === selectedCategory);
		if (!remainingTasksInCategory && selectedCategory !== 'Нет категории') {
			const updatedCategories = categories.filter(cat => cat !== selectedCategory);
			setCategories(updatedCategories);
			setSelectedCategory('Нет категории');
			saveToLocalStorage(updatedTodos, updatedCategories);
		} else {
			saveToLocalStorage(updatedTodos, categories);
		}
	}, [todos, categories, selectedCategory]);

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
