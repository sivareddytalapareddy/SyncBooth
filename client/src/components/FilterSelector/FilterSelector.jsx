import React from 'react';
import { FILTERS } from '../../utils/filters.js';

export const FilterSelector = ({ activeFilterClass, onSelectFilter }) => {
    return (
        <div className="filters-scroll">
            {FILTERS.map((f) => {
                const isActive = activeFilterClass === f.class;
                return (
                    <button
                        key={f.class}
                        className={`filter-btn ${isActive ? 'active' : ''}`}
                        onClick={() => onSelectFilter(f)}
                        type="button"
                    >
                        {f.name}
                    </button>
                );
            })}
        </div>
    );
};
