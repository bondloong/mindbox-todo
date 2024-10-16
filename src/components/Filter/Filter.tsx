import React from 'react'
import { FilterStatusType } from '../../TodoList/TodoList'
import './Filter.css'

type FilterProps = {
	filterStatus: FilterStatusType;
	setFilterStatus: React.Dispatch<React.SetStateAction<FilterStatusType>>;
	children: React.ReactNode;
}

const Filter = ({ filterStatus, setFilterStatus, children }: FilterProps) => {
  return (
	  <div className='filter-buttons-container'>
		  <div className="filter-buttons">
			  <button
				  className={filterStatus === 'all' ? 'active' : ''}
				  onClick={() => setFilterStatus('all')}
			  >
				  Нет категории
			  </button>
			  <button
				  className={filterStatus === 'completed' ? 'active' : ''}
				  onClick={() => setFilterStatus('completed')}
			  >
				  Выполненные
			  </button>
			  <button
				  className={filterStatus === 'incomplete' ? 'active' : ''}
				  onClick={() => setFilterStatus('incomplete')}
			  >
				  Невыполненные
			  </button>
		  </div>
		  {
			children
		  }
	  </div>
  )
}

export default Filter