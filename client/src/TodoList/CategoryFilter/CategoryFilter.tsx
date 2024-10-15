import React, { useCallback } from 'react';
import './CategoryFilter.css'

interface CategoryFilterProps {
	categories: string[];
	selectedCategory: string;
	onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = React.memo(({ categories, selectedCategory, onSelectCategory }) => {
	const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		onSelectCategory(e.target.value);
	}, [onSelectCategory]);

	return (
		<div className="filter">
			<label>Фильтр по категории: </label>
			<select
				value={selectedCategory}
				onChange={handleChange}
			>
				{categories.map(category => (
					<option key={category} value={category}>
						{category === 'Нет категории' ? 'Все' : category }
					</option>
				))}
			</select>
		</div>
	);
});

export default CategoryFilter;
