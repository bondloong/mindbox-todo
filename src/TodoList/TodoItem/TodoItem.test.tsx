import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TodoItem from './TodoItem';

test('renders TodoItem and handles actions', () => {
	const todo = {
		id: '1',
		title: 'Test Todo',
		description: 'Description',
		completed: false,
		category: 'Work',
	};

	const categories = ['Нет категории', 'Work', 'Personal'];
	const onToggleTodo = jest.fn();
	const onDeleteTodo = jest.fn();
	const onUpdateTodoCategory = jest.fn();

	const { getByText } = render(
		<TodoItem
			todo={todo}
			categories={categories}
			onToggleTodo={onToggleTodo}
			onDeleteTodo={onDeleteTodo}
			onUpdateTodoCategory={onUpdateTodoCategory}
		/>
	);

	// Проверка отображения названия задачи
	expect(getByText('Test Todo')).toBeInTheDocument();

	// Нажатие на кнопку "Завершить"
	fireEvent.click(getByText('Завершить'));
	expect(onToggleTodo).toHaveBeenCalledWith('1');

	// Нажатие на кнопку "Удалить"
	fireEvent.click(getByText('Удалить'));
	expect(onDeleteTodo).toHaveBeenCalledWith('1');
});
