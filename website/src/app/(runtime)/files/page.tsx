"use client";

import { useState } from "react";
import FilterButton from "./filterButton";

enum FilterType {
    ALL,
    PROJECT,
}

export default function FilesPage() {
    const [filterType, setFilterType] = useState(FilterType.ALL);

    return (
        <>
            <div className="flex mb-6">
                <FilterButton
                    isActive={filterType === FilterType.ALL}
                    onClick={() => setFilterType(FilterType.ALL)}
                >
                    All
                </FilterButton>
                <FilterButton
                    isActive={filterType === FilterType.PROJECT}
                    onClick={() => setFilterType(FilterType.PROJECT)}
                >
                    Project
                </FilterButton>
            </div>

            {filterType !== FilterType.PROJECT && (
                <div className="border-2 rounded-2xl p-8 mb-6">
                    <h1 className="text-5xl font-bold">Recents</h1>
                </div>
            )}
            <div className="border-2 rounded-2xl p-8">
                <h1 className="text-5xl font-bold">Projects</h1>
            </div>
        </>
    );
}
