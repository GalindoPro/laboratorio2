/**
 * Repositorio Genérico de Datos (Generic Data Catalog Manager)
 * Patrón Repository tipado y desacoplado para cualquier entidad que extienda { id: string | number }.
 * 
 * Cumple con los requerimientos de la Tarea 4:
 * - Colecciones en memoria totalmente tipadas sin duplicar código.
 * - Operaciones polimórficas (búsqueda, filtrado, inserción, eliminación).
 * - Actualización parcial segura mediante el utility type Partial<T>.
 */

export class DataCatalogManager<T extends { id: string | number }> {
    private items: Map<string | number, T> = new Map();

    constructor(initialItems: T[] = []) {
        if (Array.isArray(initialItems)) {
            this.addMany(initialItems);
        }
    }

    /**
     * Agrega un nuevo ítem al catálogo en memoria
     */
    public add(item: T): void {
        if (!item || item.id === undefined || item.id === null) {
            throw new Error('[DataCatalogManager] No se puede insertar un elemento sin un identificador válido.');
        }
        this.items.set(item.id, { ...item });
    }

    /**
     * Agrega una colección de ítems al catálogo
     */
    public addMany(items: T[]): void {
        items.forEach(item => this.add(item));
    }

    /**
     * Obtiene una entidad por su identificador único.
     * Normaliza automáticamente el tipo: si el id es un string que representa
     * un número, prueba también la clave numérica (necesario para IDs de TMDB
     * que se guardan como number pero se leen como string desde atributos HTML).
     */
    public getById(id: string | number): T | undefined {
        // 1. Intento directo con el valor tal como viene
        let found = this.items.get(id);
        if (found) return { ...found };

        // 2. Si es string y parece número, intenta con la clave numérica
        if (typeof id === 'string') {
            const asNumber = Number(id);
            if (!isNaN(asNumber) && id.trim() !== '') {
                found = this.items.get(asNumber);
                if (found) return { ...found };
            }
        }

        // 3. Si es número, intenta con la clave string
        if (typeof id === 'number') {
            found = this.items.get(String(id));
            if (found) return { ...found };
        }

        return undefined;
    }

    /**
     * Retorna todos los ítems almacenados en el catálogo
     */
    public getAll(): T[] {
        return Array.from(this.items.values()).map(item => ({ ...item }));
    }

    /**
     * Filtra los ítems aplicando un predicado de selección fuertemente tipado
     */
    public filter(predicate: (item: T) => boolean): T[] {
        return this.getAll().filter(predicate);
    }

    /**
     * Búsqueda dinámica polimórfica en campos especificados
     */
    public search(query: string, fields: (keyof T)[]): T[] {
        const cleanQuery = query.trim().toLowerCase();
        if (!cleanQuery) return this.getAll();

        return this.filter(item => {
            return fields.some(field => {
                const val = item[field];
                if (typeof val === 'string') {
                    return val.toLowerCase().includes(cleanQuery);
                }
                if (typeof val === 'number') {
                    return val.toString().includes(cleanQuery);
                }
                return false;
            });
        });
    }

    /**
     * Actualiza un ítem existente utilizando Partial<T> para permitir mutaciones parciales seguras.
     * Preserva la integridad del objeto aplicando saneamiento en los valores provistos.
     */
    public update(id: string | number, changes: Partial<T>): T | undefined {
        const existing = this.items.get(id);
        if (!existing) {
            return undefined;
        }

        // Combinación limpia conservando la identidad del objeto
        const updatedItem: T = {
            ...existing,
            ...changes,
            id: existing.id // El identificador no se puede sobrescribir
        };

        this.items.set(id, updatedItem);
        return { ...updatedItem };
    }

    /**
     * Elimina un ítem del catálogo según su id
     */
    public delete(id: string | number): boolean {
        return this.items.delete(id);
    }

    /**
     * Limpia completamente el catálogo
     */
    public clear(): void {
        this.items.clear();
    }

    /**
     * Obtiene el recuento total de elementos en el catálogo
     */
    public count(): number {
        return this.items.size;
    }

    /**
     * Obtiene una lista de resúmenes recortados del catálogo usando Pick<T, K>
     */
    public getSummaries<K extends keyof T>(keys: K[]): Pick<T, K>[] {
        return this.getAll().map(item => {
            const summary = {} as Pick<T, K>;
            keys.forEach(k => {
                summary[k] = item[k];
            });
            return summary;
        });
    }
}
