export class SimpleYAMLParser {
    parse(yamlText) {
        const lines = yamlText.split('\n');
        const result = {};
        const stack = [{ obj: result, indent: -1, key: null }];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            const indent = line.search(/\S/);
            const isListItem = trimmed.startsWith('- ');
            
            // Pop stack until we find the right level
            while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
                stack.pop();
            }
            
            const current = stack[stack.length - 1];
            
            if (isListItem) {
                const value = trimmed.substring(2).trim();
                
                // Ensure current.obj[current.key] is an array
                if (current.key && !Array.isArray(current.obj[current.key])) {
                    current.obj[current.key] = [];
                }
                
                if (value.includes(':')) {
                    // Complex object item
                    const item = {};
                    if (current.key) {
                        current.obj[current.key].push(item);
                    }
                    
                    const [firstKey, ...valueParts] = value.split(':');
                    const firstValue = valueParts.join(':').trim();
                    if (firstValue) {
                        item[firstKey.trim()] = this.parseValue(firstValue);
                    } else {
                        item[firstKey.trim()] = null;
                    }
                    
                    stack.push({ obj: item, indent, key: firstKey.trim() });
                } else if (value) {
                    // Simple value item
                    if (current.key) {
                        current.obj[current.key].push(this.parseValue(value));
                    }
                } else {
                    // Empty list item, prepare for nested content
                    const item = {};
                    if (current.key) {
                        current.obj[current.key].push(item);
                    }
                    stack.push({ obj: item, indent, key: null });
                }
            } else if (trimmed.includes(':')) {
                const colonIndex = trimmed.indexOf(':');
                const key = trimmed.substring(0, colonIndex).trim();
                const value = trimmed.substring(colonIndex + 1).trim();
                
                if (!value) {
                    // Key with nested content
                    current.obj[key] = {};
                    stack.push({ obj: current.obj[key], indent, key });
                } else {
                    // Key-value pair
                    current.obj[key] = this.parseValue(value);
                }
            } else if (stack.length > 1) {
                // Continuation of a list item or nested content
                const parentKey = stack[stack.length - 1].key;
                if (parentKey && !stack[stack.length - 1].obj[parentKey]) {
                    stack[stack.length - 1].obj[parentKey] = trimmed;
                }
            }
        }
        
        return result;
    }

    parseValue(value) {
        if (!value) return '';
        
        // Handle quoted strings
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        
        // Handle boolean values
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value === 'null' || value === '~') return null;
        
        // Handle numbers
        if (/^-?\d+$/.test(value)) {
            return parseInt(value, 10);
        }
        
        if (/^-?\d*\.\d+$/.test(value)) {
            return parseFloat(value);
        }
        
        return value;
    }
}