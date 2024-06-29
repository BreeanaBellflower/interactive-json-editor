import React from 'react';
import { render, fireEvent, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InteractiveJsonEditor, useJsonEditor } from '../src';

describe('InteractiveJsonEditor', () => {
    it('renders without crashing', () => {
        render(<InteractiveJsonEditor />);
        expect(screen.getByText('Interactive JSON Editor')).toBeInTheDocument();
    });

    it('allows changing top-level type', () => {
        render(<InteractiveJsonEditor />);
        const typeSelect = screen.getByRole('combobox');
        fireEvent.change(typeSelect, { target: { value: 'array' } });
        expect(typeSelect).toHaveValue('array');
    });

    it('adds and removes properties', () => {
        render(<InteractiveJsonEditor />);

        const addButton = screen.getByText('Add Property');
        fireEvent.click(addButton);

        const inputs = screen.getAllByRole('textbox');
        const initialInputCount = inputs.length;
        expect(initialInputCount).toBeGreaterThan(0);

        const propertyContainers = screen.getAllByTestId('property-container');
        const lastPropertyContainer = propertyContainers[propertyContainers.length - 1];

        const removeButton = within(lastPropertyContainer).getByRole('button', {
            name: /remove/i
        });

        if (!removeButton) {
            throw new Error('Remove button not found within the last property container.');
        }

        fireEvent.click(removeButton);

        try {
            screen.getAllByRole('textbox');
            throw new Error("This should never be reached");
        } catch (e: any) {
            expect(e.message.includes("Unable to find an accessible element with the role \"textbox\"")).toBe(true);
        }
    });

    it('prevents type change when properties are present', () => {
        render(<InteractiveJsonEditor />);
        const addButton = screen.getByText('Add Property');
        fireEvent.click(addButton);

        const typeSelects = screen.getAllByRole('combobox');
        const topLevelTypeSelect = typeSelects[0];

        fireEvent.change(topLevelTypeSelect, { target: { value: 'string' } });

        expect(topLevelTypeSelect).toHaveValue('object');
    });

    it('allows type change when properties are present and allowParentDeletion is true', () => {
        render(<InteractiveJsonEditor allowParentDeletion={true} />);
        const addButton = screen.getByText('Add Property');
        fireEvent.click(addButton);

        const typeSelects = screen.getAllByRole('combobox');
        const topLevelTypeSelect = typeSelects[0];

        fireEvent.change(topLevelTypeSelect, { target: { value: 'array' } });

        expect(topLevelTypeSelect).toHaveValue('array');
    });

    it('extracts JSON correctly', () => {
        render(<InteractiveJsonEditor />);
        console.log(screen.debug());

        const addButton = screen.getByText('Add Property');
        fireEvent.click(addButton);

        console.log(screen.debug());

        const inputs = screen.getAllByRole('textbox');

        if (inputs.length < 2) {
            throw new Error(`Expected at least 2 textbox inputs, but found ${inputs.length}`);
        }

        const keyInput = inputs[0];
        const valueInput = inputs[1];

        fireEvent.change(keyInput, { target: { value: 'testKey' } });

        fireEvent.change(valueInput, { target: { value: 'testValue' } });

        const extractButton = screen.getByText('Extract JSON');
        fireEvent.click(extractButton);

        const consoleLogSpy = jest.spyOn(console, 'log');

        setTimeout(() => {
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('"testKey":"testValue"'));
            consoleLogSpy.mockRestore();
        }, 0);
    });
});

describe('useJsonEditor', () => {
    it('initializes with default value', () => {
        const TestComponent = () => {
            const { json } = useJsonEditor();
            return <div data-testid="json">{JSON.stringify(json)}</div>;
        };

        render(<TestComponent />);
        expect(screen.getByTestId('json')).toHaveTextContent('{"type":"object","value":{}}');
    });

    it('updates json correctly', () => {
        const TestComponent = () => {
            const { json, setJson } = useJsonEditor();
            return (
                <div>
                    <div data-testid="json">{JSON.stringify(json)}</div>
                    <button onClick={() => setJson({ type: 'array', value: [] })}>Update</button>
                </div>
            );
        };

        render(<TestComponent />);
        fireEvent.click(screen.getByText('Update'));
        expect(screen.getByTestId('json')).toHaveTextContent('{"type":"array","value":[]}');
    });

    it('resets json correctly', () => {
        const TestComponent = () => {
            const { json, setJson, resetJson } = useJsonEditor();
            return (
                <div>
                    <div data-testid="json">{JSON.stringify(json)}</div>
                    <button onClick={() => setJson({ type: 'array', value: [{ type: 'string', value: 'test' }] })}>Update</button>
                    <button onClick={resetJson}>Reset</button>
                </div>
            );
        };

        render(<TestComponent />);
        fireEvent.click(screen.getByText('Update'));
        expect(screen.getByTestId('json')).toHaveTextContent('"type":"array"');
        fireEvent.click(screen.getByText('Reset'));
        expect(screen.getByTestId('json')).toHaveTextContent('{"type":"object","value":{}}');
    });

    it('extracts JSON correctly', () => {
        const TestComponent = () => {
            const { setJson, extractJson } = useJsonEditor();
            return (
                <div>
                    <button onClick={() => setJson({
                        type: 'object',
                        value: {
                            key1: { type: 'string', value: 'value1' },
                            key2: { type: 'array', value: [{ type: 'number', value: 42 }] }
                        }
                    })}>
                        Set Complex JSON
                    </button>
                    <button onClick={() => {
                        const json = extractJson();
                        document.body.setAttribute('data-json', json);
                    }}>
                        Extract JSON
                    </button>
                </div>
            );
        };

        render(<TestComponent />);
        fireEvent.click(screen.getByText('Set Complex JSON'));
        fireEvent.click(screen.getByText('Extract JSON'));
        const extractedJson = document.body.getAttribute('data-json');
        expect(JSON.parse(extractedJson || '')).toEqual({
            key1: 'value1',
            key2: [42]
        });
    });
});