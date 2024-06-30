import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

const defaultTheme = {
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
};

const ThemeContext = React.createContext(defaultTheme);

const Alert = ({ children, variant, className }) => {
  const theme = React.useContext(ThemeContext);
  const style = {
    padding: '0.75rem',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: variant === 'warning' ? theme.warning : theme.error,
    color: variant === 'warning' ? theme.warningText : theme.errorText,
    display: 'flex',
    alignItems: 'center',
    width: 'fit-content',
  };
  return <div style={style} className={className}>{children}</div>;
};

const AlertDescription = ({ children }) => (
  <div style={{ marginLeft: '0.5rem' }}>{children}</div>
);

const JsonEditor = ({
  entity,
  onChange,
  onRemove,
  isTopLevel = false,
  nestingLevel = 0,
  maxWidth = undefined,
  maxHeight = undefined,
  minWidth = undefined,
  minHeight = undefined,
}) => {
  const theme = React.useContext(ThemeContext);
  const [duplicateKeyWarning, setDuplicateKeyWarning] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (entity.dtype === 'object') {
      const keys = entity.attributes.map(([key]) => key);
      const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
      if (duplicates.length > 0) {
        setDuplicateKeyWarning(`Duplicate keys found: ${duplicates.join(', ')}`);
      } else {
        setDuplicateKeyWarning(null);
      }
    }
  }, [entity]);

  const handleTypeChange = useCallback((newType) => {
    if (entity.attributes && entity.attributes.length > 0) {
      alert("Cannot change type when attributes are present.");
      return;
    }
    let newValue;
    switch (newType) {
      case 'object':
        newValue = { dtype: 'object', attributes: [] };
        break;
      case 'array':
        newValue = { dtype: 'array', attributes: [] };
        break;
      case 'string':
        newValue = { dtype: 'string', value: '' };
        break;
      case 'integer':
        newValue = { dtype: 'integer', value: 0 };
        break;
      case 'float':
        newValue = { dtype: 'float', value: 0.0 };
        break;
      case 'boolean':
        newValue = { dtype: 'boolean', value: false };
        break;
      default:
        newValue = entity;
    }
    onChange(newValue);
  }, [entity, onChange]);

  const handleValueChange = useCallback((newValue) => {
    onChange({ ...entity, value: newValue });
  }, [entity, onChange]);

  const handleAddAttribute = useCallback(() => {
    const newKey = entity.dtype === 'array' ? entity.attributes.length : '';
    const newAttributes = [...entity.attributes, [newKey, { dtype: 'string', value: '' }]];
    onChange({ ...entity, attributes: newAttributes });
  }, [entity, onChange]);

  const handleRemoveAttribute = useCallback((index) => {
    const newAttributes = entity.attributes.filter((_, i) => i !== index);
    onChange({ ...entity, attributes: newAttributes });
  }, [entity, onChange]);

  const handleAttributeChange = useCallback((index, newKey, newValue) => {
    const newAttributes = [...entity.attributes];
    newAttributes[index] = [newKey, newValue];
    onChange({ ...entity, attributes: newAttributes });
  }, [entity, onChange]);

  const renderValue = useCallback(() => {
    const inputStyle = {
      border: `1px solid ${theme.border}`,
      borderRadius: '0.25rem',
      padding: '0.25rem 0.5rem',
      margin: '0.5rem 0.5rem',
      marginLeft: '0.5rem',
      flexGrow: 1,
      backgroundColor: theme.background,
      color: theme.text,
      minWidth: 0,
    };

    const placeholderStyle = {
      '::placeholder': {
        color: theme.placeholder,
      },
    };

    switch (entity.dtype) {
      case 'string':
        return (
          <input
            type="text"
            value={entity.value}
            onChange={(e) => handleValueChange(e.target.value)}
            style={{ ...inputStyle, ...placeholderStyle }}
            placeholder="Enter string value"
          />
        );
      case 'integer':
        return (
          <input
            type="number"
            value={entity.value}
            onChange={(e) => handleValueChange(parseInt(e.target.value, 10))}
            style={{ ...inputStyle, ...placeholderStyle }}
            placeholder="Enter integer value"
          />
        );
      case 'float':
        return (
          <input
            type="number"
            step="0.1"
            value={entity.value}
            onChange={(e) => handleValueChange(parseFloat(e.target.value))}
            style={{ ...inputStyle, ...placeholderStyle }}
            placeholder="Enter float value"
          />
        );
      case 'boolean':
        return (
          <select
            value={entity.value.toString()}
            onChange={(e) => handleValueChange(e.target.value === 'true')}
            style={inputStyle}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        );
      default:
        return null;
    }
  }, [entity, handleValueChange, theme]);

  const containerStyle = {
    border: `1px solid ${duplicateKeyWarning ? theme.warningBorder : theme.border}`,
    borderRadius: '0.25rem',
    padding: '0.5rem',
    margin: '0.5rem 0',
    width: 'fit-content',
    backgroundColor: theme.background,
    color: theme.text,
    boxSizing: 'border-box',
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    overflow: "auto"
  };

  const buttonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: theme.text,
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const selectStyle = {
    border: `1px solid ${theme.border}`,
    borderRadius: '0.25rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: theme.background,
    color: theme.text,
    minWidth: '80px',
  };

  const hasChildren = entity.attributes && entity.attributes.length > 0;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        {(entity.dtype === 'object' || entity.dtype === 'array') && (
          <button onClick={() => setIsExpanded(!isExpanded)} style={buttonStyle}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        <select
          value={entity.dtype}
          onChange={(e) => handleTypeChange(e.target.value)}
          style={selectStyle}
          disabled={entity.attributes && entity.attributes.length > 0}
        >
          <option value="object">object</option>
          <option value="array">array</option>
          {!isTopLevel && (
            <>
              <option value="string">string</option>
              <option value="integer">integer</option>
              <option value="float">float</option>
              <option value="boolean">boolean</option>
            </>
          )}
        </select>
        <div style={{ minWidth: 0 }}>{renderValue()}</div>
        {onRemove && !isTopLevel && !hasChildren && (
          <button onClick={onRemove} style={{ ...buttonStyle, color: theme.error }}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
      {isExpanded && (entity.dtype === 'object' || entity.dtype === 'array') && (
        <>
          {duplicateKeyWarning && (
            <Alert variant="warning">
              <AlertTriangle size={16} />
              <AlertDescription>{duplicateKeyWarning}</AlertDescription>
            </Alert>
          )}
          <div style={{ marginLeft: '1rem', width: 'calc(100% - 1rem)' }}>
            {entity.attributes.map(([key, value], index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', margin: '0.5rem 0', width: '100%' }}>
                {entity.dtype === 'object' && (
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => handleAttributeChange(index, e.target.value, value)}
                    placeholder="Enter key"
                    style={{
                      ...selectStyle,
                      width: '180px',
                      maxWidth: '180px',
                      margin: '0.5rem',
                    }}
                  />
                )}
                <div style={{ flexGrow: 1, width: '90%', minWidth: 0 }}>
                  <JsonEditor
                    entity={value}
                    onChange={(newValue) => handleAttributeChange(index, key, newValue)}
                    onRemove={() => handleRemoveAttribute(index)}
                    nestingLevel={nestingLevel + 1}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={handleAddAttribute}
              style={{
                ...buttonStyle,
                display: 'flex',
                alignItems: 'center',
                color: theme.button,
                marginTop: '0.5rem',
              }}
            >
              <PlusCircle size={16} style={{ marginRight: '0.25rem' }} /> Add Attribute
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const jsonToEntity = (json) => {
  if (Array.isArray(json)) {
    return {
      dtype: 'array',
      attributes: json.map((value, index) => [index.toString(), jsonToEntity(value)])
    };
  } else if (typeof json === 'object' && json !== null) {
    return {
      dtype: 'object',
      attributes: Object.entries(json).map(([key, value]) => [key, jsonToEntity(value)])
    };
  } else if (typeof json === 'string') {
    return { dtype: 'string', value: json };
  } else if (typeof json === 'number') {
    return { dtype: Number.isInteger(json) ? 'integer' : 'float', value: json };
  } else if (typeof json === 'boolean') {
    return { dtype: 'boolean', value: json };
  }
  // Handle other types as needed
  return { dtype: 'string', value: JSON.stringify(json) };
};

const extractJson = (entity) => {
  const convertToJson = (oop) => {
    if (oop.dtype === 'object') {
      const keys = oop.attributes.map(([key]) => key);
      const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
      if (duplicates.length > 0) {
        throw new Error(`Duplicate keys found: ${duplicates.join(', ')}`);
      }
      return Object.fromEntries(oop.attributes.map(([key, value]) => [key, convertToJson(value)]));
    } else if (oop.dtype === 'array') {
      return oop.attributes.map(([_, value]) => convertToJson(value));
    } else {
      return oop.value;
    }
  };

  try {
    const jsonObject = convertToJson(entity);
    return { json: JSON.stringify(jsonObject, null, 2), error: null };
  } catch (err) {
    return { json: null, error: err.message };
  }
};

const InteractiveJsonEditor = ({
  initialEntity = { dtype: 'object', attributes: [] },
  onChange,
  onExtract,
  theme = undefined,
  maxWidth = undefined,
  maxHeight = undefined,
  minWidth = undefined,
  minHeight = undefined,
}) => {
  const [entity, setEntity] = useState(initialEntity);

  const handleChange = (newEntity) => {
    setEntity(newEntity);
    if (onChange) {
      onChange(newEntity);
    }
  };

  const handleExtract = useCallback(() => {
    const { json, error } = extractJson(entity);
    if (onExtract) {
      onExtract(json, error);
    }
  }, [entity, onExtract]);

  useEffect(() => {
    handleExtract();
  }, [entity, handleExtract]);

  useEffect(() => {
    if (typeof initialEntity === 'string') {
      try {
        const parsedJson = JSON.parse(initialEntity);
        const newEntity = jsonToEntity(parsedJson);
        setEntity(newEntity);
      } catch (error) {
        console.error("Invalid JSON string provided as initialEntity:", error);
      }
    } else if (typeof initialEntity === 'object' && initialEntity !== null) {
      // If initialEntity is already an object (possibly our entity format or a plain JSON object)
      if ('dtype' in initialEntity) {
        // It's already in our entity format
        setEntity(initialEntity);
      } else {
        // It's a plain JSON object, convert it to our entity format
        const newEntity = jsonToEntity(initialEntity);
        setEntity(newEntity);
      }
    }
  }, [initialEntity]);

  return (
    <ThemeContext.Provider value={theme ? {...defaultTheme, ...theme} : defaultTheme}>
      <div>
        <JsonEditor
          entity={entity}
          onChange={handleChange}
          isTopLevel={true}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          minWidth={minWidth}
          minHeight={minHeight}
        />
      </div>
    </ThemeContext.Provider>
  );
};

export { InteractiveJsonEditor, jsonToEntity };