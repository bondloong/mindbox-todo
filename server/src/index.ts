import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface Todo {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	category?: string;
}

interface CategoryParams {
	categoryName: string;
}

const app = express();
const port = 5000;
const apiRouter: Router = express.Router();

app.use(cors());
app.use(express.json());

let todos: Todo[] = [
	{ id: "1", title: 'Пример задачи 1', description: 'Таким образом, реализация намеченных плановых заданий предполагает независимые способы реализации инновационных методов управления процессами. Следует отметить, что высокое качество позиционных исследований представляет собой интересный эксперимент проверки новых принципов формирования материально-технической и кадровой базы. А также некоторые особенности внутренней политики, инициированные исключительно синтетически, функционально разнесены на независимые элементы.', completed: false, category: 'Работа' },
	{ id: "2", title: 'Пример задачи 2', description: 'Таким образом, реализация намеченных плановых заданий предполагает независимые способы реализации инновационных методов управления процессами. Следует отметить, что высокое качество позиционных исследований представляет собой интересный эксперимент проверки новых принципов формирования материально-технической и кадровой базы. А также некоторые особенности внутренней политики, инициированные исключительно синтетически, функционально разнесены на независимые элементы. Таким образом, реализация намеченных плановых заданий предполагает независимые способы реализации инновационных методов управления процессами. Следует отметить, что высокое качество позиционных исследований представляет собой интересный эксперимент проверки новых принципов формирования материально-технической и кадровой базы. А также некоторые особенности внутренней политики, инициированные исключительно синтетически, функционально разнесены на независимые элементы.', completed: true, category: 'Покупки' },
];

let categories: string[] = ['Нет категории', 'Работа', 'Покупки'];

// Маршрут для получения списка категорий
apiRouter.get('/categories', (req, res) => {
	res.json(categories);
});

// Обновление категории задачи
apiRouter.patch('/todos/:id/category', (req, res) => {
	const id = req.params.id;
	const { category } = req.body;

	const todo = todos.find(t => t.id === id);
	if (todo) {
		const oldCategory = todo.category;
		todo.category = category && category !== 'Нет категории' ? category : undefined;

		// Добавляем новую категорию в список, если её ещё нет
		if (todo.category && !categories.includes(todo.category)) {
			categories.push(todo.category);
		}

		// Проверяем, есть ли ещё задачи со старой категорией
		if (oldCategory && !todos.some(t => t.category === oldCategory)) {
			categories = categories.filter(cat => cat !== oldCategory);
		}

		res.json(todo);
	} else {
		res.status(404).send('Задача не найдена');
	}
});

// Удаление всех задач определённой категории
apiRouter.delete('/todos/category/:categoryName', (req: Request<CategoryParams>, res: Response) => {
	const categoryName = req.params.categoryName;

	// Проверяем, есть ли задачи с указанной категорией
	const tasksToDelete = todos.filter(todo => todo.category === categoryName && todo.completed);
	if (tasksToDelete.length === 0) {
		res.status(404).json({ message: 'Нет задач с указанной категорией' });
		return;
	}

	// Удаляем задачи с указанной категорией
	todos = todos.filter(todo => todo.category !== categoryName);

	// Удаляем категорию из списка, если она больше не используется
	categories = categories.filter(category => category !== categoryName);

	res.json({ message: `Все задачи категории "${categoryName}" удалены` });
});

// Удаление всех завершённых задач в определённой категории
apiRouter.delete('/todos/category/:categoryName/completed', (req: Request<CategoryParams>, res: Response) => {
	const categoryName = req.params.categoryName;

	// Проверяем, есть ли задачи с указанной категорией
	const completedTasks = todos.filter(todo => todo.category === categoryName && todo.completed);
	if (completedTasks.length === 0) {
		res.status(404).json({ message: `Нет завершённых задач в категории "${categoryName}"` });
		return;
	}

	// Удаляем завершённые задачи из категории
	todos = todos.filter(todo => !(todo.category === categoryName && todo.completed));

	// Проверяем, если в категории не осталось задач
	const remainingTasksInCategory = todos.some(todo => todo.category === categoryName);

	if (!remainingTasksInCategory) {
		// Если задач больше не осталось, удаляем категорию
		categories = categories.filter(cat => cat !== categoryName);
	}

	res.json({ message: `Все завершённые задачи в категории "${categoryName}" удалены` });
});

// Получение всех задач или задач по категории
apiRouter.get('/todos', (req, res) => {
	const category = req.query.category as string;
	if (category && category !== 'Нет категории') {
		res.json(todos.filter(todo => todo.category === category));
	} else {
		res.json(todos);
	}
});

// Удаление всех завершенных задач
apiRouter.delete('/todos/completed', (req, res) => {
	// Получаем список категорий завершенных задач
	const completedCategories = new Set(
		todos.filter(todo => todo.completed && todo.category).map(todo => todo.category)
	);

	// Удаляем завершенные задачи
	todos = todos.filter(todo => !todo.completed);

	// Удаляем категории, которые больше не используются
	completedCategories.forEach(category => {
		if (category && !todos.some(t => t.category === category)) {
			categories = categories.filter(cat => cat !== category);
		}
	});

	res.json({ message: 'Все завершенные задачи удалены' });
});

// Добавление новой задачи
apiRouter.post('/todos', (req, res) => {
	const { title, description, category } = req.body;
	const newTodo: Todo = {
		id: uuidv4(), // Используем UUID для уникального идентификатора
		title,
		description,
		completed: false,
		category: category && category !== 'Нет категории' ? category : undefined,
	};

	todos.push(newTodo);

	// Добавляем категорию в список, если её ещё нет
	if (category && !categories.includes(category) && category !== 'Нет категории') {
		categories.push(category);
	}

	res.json(newTodo);
});

// Удаление задачи по ID
apiRouter.delete('/todos/:id', (req, res) => {
	const id = req.params.id;
	const todoIndex = todos.findIndex(t => t.id === id);
	if (todoIndex !== -1) {
		const deletedTodo = todos.splice(todoIndex, 1)[0];

		// Проверяем, есть ли ещё задачи с этой категорией
		if (deletedTodo.category && !todos.some(t => t.category === deletedTodo.category)) {
			// Удаляем категорию из списка
			categories = categories.filter(category => category !== deletedTodo.category);
		}

		res.json({ message: 'Задача удалена' });
	} else {
		res.status(404).send('Задача не найдена');
	}
});

// Переключение статуса completed
apiRouter.patch('/todos/:id/toggle', (req, res) => {
	const id = req.params.id;
	const todo = todos.find(t => t.id === id);
	if (todo) {
		todo.completed = !todo.completed;
		res.json(todo);
	} else {
		res.status(404).send('Задача не найдена');
	}
});

app.use('/api', apiRouter);

// Раздача статических файлов (только для продакшена)
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '../../client/build')));

	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
	});
}

app.listen(port, () => {
	console.log(`Сервер запущен на порту ${port}`);
});
