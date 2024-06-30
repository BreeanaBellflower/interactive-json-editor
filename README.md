# Interactive JSON Editor

An interactive React component for editing JSON Components.

## Installation

```bash
npm install interactive-json-editor
```

## Usage

```jsx
import React, { useState } from 'react';
import { InteractiveJsonEditor, jsonToEntity } from 'interactive-json-editor';

const TestApp = () => {
  // State Management
  const [entity, setEntity] = useState(jsonToEntity({}));
  
  // Output Management
  const [extractedJson, setExtractedJson] = useState('');
  const [error, setError] = useState(null);

  // Retrieve the JSON Object from the component
  const handleExtract = useCallback((json, error) => {
    setExtractedJson(json || '');
    setError(error);
  }, []);

  // Update the Entity State from changes within the Editor
  const handleChange = useCallback((newEntity) => {
    setEntity(newEntity);
  }, []);

  // Update the Entity State from external changes (i.e. textArea)
  const handleTextareaChange = useCallback((event) => {
    const newJsonString = event.target.value;
    setExtractedJson(newJsonString);

    try {
      const parsedJson = JSON.parse(newJsonString);
      // Convert parsed JSON back to the entity format
      const newEntity = jsonToEntity(parsedJson);
      setEntity(newEntity);
      setError(null);
    } catch (err) {
      setError("Invalid JSON: " + err.message);
    }
  }, []);

  // Customize the Theme
  const theme = {
    background: '#ffffff',
    text: '#333333',
    border: '#cccccc',
    button: '#4a90e2',
    buttonText: '#ffffff',
    warning: '#ffeeba',
    warningBorder: '#ff7100',
    warningText: '#856404',
    error: '#da3a49',
    errorText: '#721c24',
    placeholder: '#999999',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <InteractiveJsonEditor
          initialEntity={entity}
          theme={theme}
          onChange={handleChange}
          onExtract={handleExtract}
          minWidth={300}
          minHeight={300}
          maxWidth={1000}
          maxHeight={1000}
        />
        <textarea
          value={extractedJson}
          onChange={handleTextareaChange}
          style={{ 
            width: '400px', 
            height: '400px', 
            resize: 'vertical',
            backgroundColor: theme === 'light' ? '#f8f8f8' : '#2a2a2a',
            color: theme === 'light' ? '#333333' : '#ffffff',
            border: `1px solid ${theme === 'light' ? '#cccccc' : '#555555'}`,
          }}
        />
      </div>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
};

export default TestApp;
```