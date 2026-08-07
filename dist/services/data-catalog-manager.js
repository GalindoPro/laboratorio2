/**
 * Repositorio Genérico de Datos (Generic Data Catalog Manager)
 * Patrón Repository tipado y desacoplado para cualquier entidad que extienda { id: string | number }.
 *
 * Cumple con los requerimientos de la Tarea 4:
 * - Colecciones en memoria totalmente tipadas sin duplicar código.
 * - Operaciones polimórficas (búsqueda, filtrado, inserción, eliminación).
 * - Actualización parcial segura mediante el utility type Partial<T>.
 */
export class DataCatalogManager {
    items = new Map();
    constructor(initialItems = []) {
        if (Array.isArray(initialItems)) {
            this.addMany(initialItems);
        }
    }
    /**
     * Agrega un nuevo ítem al catálogo en memoria
     */
    add(item) {
        if (!item || item.id === undefined || item.id === null) {
            throw new Error('[DataCatalogManager] No se puede insertar un elemento sin un identificador válido.');
        }
        this.items.set(item.id, { ...item });
    }
    /**
     * Agrega una colección de ítems al catálogo
     */
    addMany(items) {
        items.forEach(item => this.add(item));
    }
    /**
     * Obtiene una entidad por su identificador único
     */
    getById(id) {
        const found = this.items.get(id);
        return found ? { ...found } : undefined;
    }
    /**
     * Retorna todos los ítems almacenados en el catálogo
     */
    getAll() {
        return Array.from(this.items.values()).map(item => ({ ...item }));
    }
    /**
     * Filtra los ítems aplicando un predicado de selección fuertemente tipado
     */
    filter(predicate) {
        return this.getAll().filter(predicate);
    }
    /**
     * Búsqueda dinámica polimórfica en campos especificados
     */
    search(query, fields) {
        const cleanQuery = query.trim().toLowerCase();
        if (!cleanQuery)
            return this.getAll();
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
    update(id, changes) {
        const existing = this.items.get(id);
        if (!existing) {
            return undefined;
        }
        // Combinación limpia conservando la identidad del objeto
        const updatedItem = {
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
    delete(id) {
        return this.items.delete(id);
    }
    /**
     * Limpia completamente el catálogo
     */
    clear() {
        this.items.clear();
    }
    /**
     * Obtiene el recuento total de elementos en el catálogo
     */
    count() {
        return this.items.size;
    }
    /**
     * Obtiene una lista de resúmenes recortados del catálogo usando Pick<T, K>
     */
    getSummaries(keys) {
        return this.getAll().map(item => {
            const summary = {};
            keys.forEach(k => {
                summary[k] = item[k];
            });
            return summary;
        });
    }
}
