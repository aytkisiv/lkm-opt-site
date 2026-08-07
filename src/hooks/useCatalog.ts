import { useEffect, useState } from 'react';
import { CATEGORIES, type ProductCategory } from '../data/products';
import { supabase } from '../lib/supabase';

/**
 * Прайс из базы. Если база не подключена, недоступна или пуста —
 * возвращаем встроенный прайс из кода: пустой каталог посетитель
 * не увидит ни при каких обстоятельствах.
 */
export function useCatalog(): ProductCategory[] {
  const [categories, setCategories] = useState<ProductCategory[]>(CATEGORIES);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;

    supabase
      .from('products')
      .select('category,name,note,price,sort')
      .order('sort')
      .then(({ data, error }) => {
        if (!alive || error || !data || data.length === 0) return;
        setCategories(
          CATEGORIES.map((c) => ({
            ...c,
            products: data
              .filter((p) => p.category === c.slug)
              .map((p) => ({
                name: p.name,
                note: p.note ?? undefined,
                price: p.price,
              })),
          }))
        );
      });

    return () => {
      alive = false;
    };
  }, []);

  return categories;
}
