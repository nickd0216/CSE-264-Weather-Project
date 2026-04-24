"use client"

import { useState } from 'react';
// import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'; 
// import { motion } from 'framer-motion'; 

export default function VirtualGarden() {
    const [gardenPlots, setGardenPlots] = useState([]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">My Virtual Garden</h1>

            <div className="grid grid-cols-2 gap-8">
                <div className="bg-gray-100 p-4 rounded-lg min-h-[400px]">
                    <h2 className="text-xl font-semibold mb-4">Plant Directory</h2>
                    <div className="border-2 border-dashed border-gray-400 p-8 text-center text-gray-500">
                        ZOE: Drop Perenual API Search Results Here
                        <br />
                        CHRIS: Wrap results in dnd-kit `useDraggable`
                    </div>
                </div>

                <div className="bg-green-100 p-4 rounded-lg min-h-[400px]">
                    <h2 className="text-xl font-semibold mb-4">My Plots</h2>
                    <div className="border-2 border-dashed border-green-500 p-8 text-center text-green-700 h-full flex items-center justify-center">
                        CHRIS: Implement dnd-kit `useDroppable` area here.
                        <br />
                        Trigger Framer Motion animation when an item is dropped.
                        <br />
                        NICK: Save state to `/api/garden` endpoint on change.
                    </div>
                </div>
            </div>
        </div>
    );
}