---
title: On nanostores
date: '2023-07-31'
description: Intro to Astro global state management with nanostores
tags:
  - astro
  - nanostores
  - state
---

## Quick tutorial
[How to manage state in Astro applications?](https://www.youtube.com/watch?v=R3N_zg7Lz6Q)

1. Add nanostores for react to project: `npm i nanostores @nanostores/preact` (already have astro with preact up and running)
2. create 3 files: `src/pages/noteStore.js`, `src/components/noteAddButton.jsx`, `src/components/noteRender.jsx`
3. In noteStore.js:

```jsx
import { atom } from 'nanostores';

export const notes = atom([]); // for storing strings, numbers and arrays

// create function that expects a note
export function addNote(note) {
// call notes.set, destructure previous array by calling .get and add new note to it
notes.set([...notes.get(), note]);
}
```

4. noteAddButton.jsx

```jsx
import { useState } from "preact/hooks";
import { addNote } from "../scripts/noteStore";

export default function NoteAdder() {
    const [userNote, setUserNote] = useState('');

    return (
        <div class="noteTaker">
            <label htmlFor="note">Add a note:</label>
            <input type="text" name="note" id="note"
            // onChange calls setUserNote to update state whenever typing in box
            onChange={(e) => setUserNote(e.target.value)} />
            <button
            // onClick uses store to add userNote to addNote
            onClick={() => addNote(userNote)}>Add</button>
        </div>
    );
};
```

5. noteRender.jsx

```jsx
import { useStore } from '@nanostores/preact';
import { notes } from '../scripts/noteStore';

export default function NoteRender() {
    // accessing useStore is accessing shared state
    const $notes = useStore(notes);

    return (
    <ul>
    {
        $notes.map((note, index) => <li key={index}>{note}</li>)
    }
</ul>
)
}
```

This could (more) easily be done in a single file, but the point is to share state between components. These are both preact components, but it would be the same between any framework, or indeed mix of frameworks.
