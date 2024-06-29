import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { ThemeProvider } from 'styled-components';

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

const defaultTheme: Theme = {
  primaryColor: '#3498db',
  secondaryColor: '#2ecc71',
  backgroundColor: '#ffffff',
  textColor: '#333333',
};

export interface JsonValue {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  value: any;
}

interface JsonEditorProps {
  json: JsonValue;
  onChange: (newValue: JsonValue) => void;
  onRemove?: () => void;
  isTopLevel?: boolean;
  theme?: Theme;
  allowParentDeletion?: boolean;
}

const Alert: React.FC<{ children: React.ReactNode; variant: string; className?: string }> = ({ children, variant, className }) => (
  <div className={`p-4 mb-4 rounded-lg ${variant === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'} ${className || ''}`}>
    {children}
  </div>
);

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="ml-3">{children}</div>
);

const JsonEditor: React.FC<JsonEditorProps> = ({
  json,
  onChange,
  onRemove,
  isTopLevel = false,
  theme = defaultTheme,
  allowParentDeletion = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [duplicateKeyWarning, setDuplicateKeyWarning] = useState<string | null>(null);

  useEffect(() => {
    if (json.type === 'object') {
      const keys = Object.keys(json.value);
      const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
      if (duplicates.length > 0) {
        setDuplicateKeyWarning(`Duplicate keys found: ${duplicates.join(', ')}`);
      } else {
        setDuplicateKeyWarning(null);
      }
    }
  }, [json]);

  const handleTypeChange = (newType: JsonValue['type']) => {
    if ((json.type === 'object' || json.type === 'array') && 
        Object.keys(json.value).length > 0 && 
        !allowParentDeletion) {
      alert("Cannot change type when children are present.");
      return;
    }
    let newValue: any;
    switch (newType) {
      case 'object':
        newValue = {};
        break;
      case 'array':
        newValue = [];
        break;
      case 'string':
        newValue = '';
        break;
      case 'number':
        newValue = 0;
        break;
      case 'boolean':
        newValue = false;
        break;
      case 'null':
        newValue = null;
        break;
      default:
        newValue = json.value;
    }
    onChange({ type: newType, value: newValue });
  };

  const handleValueChange = (newValue: any) => {
    onChange({ ...json, value: newValue });
  };

  const handleAddProperty = () => {
    if (json.type === 'object') {
      const newKey = `key${Object.keys(json.value).length + 1}`;
      onChange({
        ...json,
        value: { ...json.value, [newKey]: { type: 'string', value: '' } }
      });
    } else if (json.type === 'array') {
      onChange({
        ...json,
        value: [...json.value, { type: 'string', value: '' }]
      });
    }
  };

  const handleRemoveProperty = (key: string | number) => {
    if (json.type === 'object') {
      const { [key as string]: _, ...rest } = json.value;
      onChange({ ...json, value: rest });
    } else if (json.type === 'array') {
      onChange({
        ...json,
        value: json.value.filter((_: any, index: number) => index !== key)
      });
    }
  };

  const handlePropertyChange = (key: string | number, newValue: JsonValue) => {
    if (json.type === 'object') {
      onChange({
        ...json,
        value: { ...json.value, [key]: newValue }
      });
    } else if (json.type === 'array') {
      const newArray = [...json.value];
      newArray[key as number] = newValue;
      onChange({ ...json, value: newArray });
    }
  };

  const renderValue = () => {
    switch (json.type) {
      case 'string':
        return (
          <input
            type="text"
            value={json.value}
            onChange={(e) => handleValueChange(e.target.value)}
            className="border rounded px-2 py-1 ml-2 flex-grow"
            style={{ color: theme.textColor, backgroundColor: theme.backgroundColor }}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={json.value}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            className="border rounded px-2 py-1 ml-2 flex-grow"
            style={{ color: theme.textColor, backgroundColor: theme.backgroundColor }}
          />
        );
      case 'boolean':
        return (
          <select
            value={json.value.toString()}
            onChange={(e) => handleValueChange(e.target.value === 'true')}
            className="border rounded px-2 py-1 ml-2 flex-grow"
            style={{ color: theme.textColor, backgroundColor: theme.backgroundColor }}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );
      case 'null':
        return <span className="ml-2">null</span>;
      default:
        return null;
    }
  };

  return (
    <div className="border rounded p-2 my-2 w-full" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
      <div className="flex items-center">
        <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <select
          value={json.type}
          onChange={(e) => handleTypeChange(e.target.value as JsonValue['type'])}
          className="border rounded px-2 py-1"
          style={{ color: theme.textColor, backgroundColor: theme.backgroundColor }}
          disabled={!isTopLevel && (json.type === 'object' || json.type === 'array') && Object.keys(json.value).length > 0 && !allowParentDeletion}
        >
          <option value="object">object</option>
          <option value="array">array</option>
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="null">null</option>
        </select>
        {renderValue()}
        {onRemove && !isTopLevel && (
          <button aria-label="Remove property" onClick={onRemove} className="ml-2 text-red-500">
            <Trash2 size={16} />
          </button>
        )}
      </div>
      {duplicateKeyWarning && (
        <Alert variant="warning" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{duplicateKeyWarning}</AlertDescription>
        </Alert>
      )}
      {isExpanded && (json.type === 'object' || json.type === 'array') && (
        <div className="ml-4 w-full">
          {Object.entries(json.value).map(([key, value]) => (
            <div key={key} data-testid="property-container" className="flex items-center my-1 w-full">
              {json.type === 'object' && (
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    const { [key]: value, ...rest } = json.value;
                    onChange({
                      ...json,
                      value: { ...rest, [newKey]: value }
                    });
                  }}
                  className="border rounded px-2 py-1 w-24 mr-2"
                  style={{ color: theme.textColor, backgroundColor: theme.backgroundColor }}
                />
              )}
              <JsonEditor
                json={value as JsonValue}
                onChange={(newValue) => handlePropertyChange(key, newValue)}
                onRemove={() => handleRemoveProperty(key)}
                theme={theme}
                allowParentDeletion={allowParentDeletion}
              />
            </div>
          ))}
          <button
            onClick={handleAddProperty}
            className="flex items-center text-green-500 mt-2"
            style={{ color: theme.secondaryColor }}
          >
            <PlusCircle size={16} className="mr-1" /> Add Property
          </button>
        </div>
      )}
    </div>
  );
};

export interface InteractiveJsonEditorProps {
  initialValue?: JsonValue;
  theme?: Theme;
  allowParentDeletion?: boolean;
}

export const useJsonEditor = (initialValue: JsonValue = { type: 'object', value: {} }) => {
  const [json, setJson] = useState<JsonValue>(initialValue);

  const resetJson = useCallback(() => {
    setJson({ type: 'object', value: {} });
  }, []);

  const extractJson = useCallback(() => {
    const convertToPlainJson = (jsonValue: JsonValue): any => {
      if (jsonValue.type === 'object') {
        return Object.fromEntries(
          Object.entries(jsonValue.value).map(([key, value]) => [key, convertToPlainJson(value as JsonValue)])
        );
      } else if (jsonValue.type === 'array') {
        return jsonValue.value.map((item: JsonValue) => convertToPlainJson(item));
      } else {
        return jsonValue.value;
      }
    };

    return JSON.stringify(convertToPlainJson(json), null, 2);
  }, [json]);

  return { json, setJson, resetJson, extractJson };
};

export const InteractiveJsonEditor: React.FC<InteractiveJsonEditorProps> = ({
  initialValue = { type: 'object', value: {} },
  theme = defaultTheme,
  allowParentDeletion = false,
}) => {
  const { json, setJson, resetJson, extractJson } = useJsonEditor(initialValue);

  return (
    <ThemeProvider theme={theme}>
      <div className="p-4 w-[95%] mx-auto" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
        <h1 className="text-2xl font-bold mb-4">Interactive JSON Editor</h1>
        <JsonEditor
          json={json}
          onChange={setJson}
          isTopLevel={true}
          theme={theme}
          allowParentDeletion={allowParentDeletion}
        />
        <div className="mt-4 space-x-2">
          <button
            onClick={() => console.log(extractJson())}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            style={{ backgroundColor: theme.primaryColor }}
          >
            Extract JSON
          </button>
          <button
            onClick={resetJson}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            style={{ backgroundColor: theme.secondaryColor }}
          >
            Reset
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default InteractiveJsonEditor;