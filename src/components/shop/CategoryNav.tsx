import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ShopCategory } from '../../types';

const categories: ShopCategory[] = [
  {
    id: 'electronics',
    name: 'Électronique',
    slug: 'electronique',
    description: 'Produits électroniques et high-tech',
    subcategories: [
      {
        id: 'smartphones',
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Téléphones mobiles et accessoires',
        parentId: 'electronics'
      },
      {
        id: 'laptops',
        name: 'Ordinateurs portables',
        slug: 'ordinateurs-portables',
        description: 'Laptops et accessoires',
        parentId: 'electronics'
      },
      {
        id: 'tablets',
        name: 'Tablettes',
        slug: 'tablettes',
        description: 'Tablettes tactiles et accessoires',
        parentId: 'electronics'
      }
    ]
  },
  {
    id: 'fashion',
    name: 'Mode',
    slug: 'mode',
    description: 'Vêtements et accessoires',
    subcategories: [
      {
        id: 'mens',
        name: 'Homme',
        slug: 'homme',
        description: 'Mode masculine',
        parentId: 'fashion'
      },
      {
        id: 'womens',
        name: 'Femme',
        slug: 'femme',
        description: 'Mode féminine',
        parentId: 'fashion'
      },
      {
        id: 'accessories',
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Accessoires de mode',
        parentId: 'fashion'
      }
    ]
  },
  {
    id: 'home',
    name: 'Maison',
    slug: 'maison',
    description: 'Décoration et ameublement',
    subcategories: [
      {
        id: 'furniture',
        name: 'Meubles',
        slug: 'meubles',
        description: 'Meubles et rangements',
        parentId: 'home'
      },
      {
        id: 'decoration',
        name: 'Décoration',
        slug: 'decoration',
        description: 'Articles de décoration',
        parentId: 'home'
      },
      {
        id: 'kitchen',
        name: 'Cuisine',
        slug: 'cuisine',
        description: 'Équipement de cuisine',
        parentId: 'home'
      }
    ]
  },
  {
    id: 'sports',
    name: 'Sport & Loisirs',
    slug: 'sport-loisirs',
    description: 'Équipement sportif et loisirs',
    subcategories: [
      {
        id: 'fitness',
        name: 'Fitness',
        slug: 'fitness',
        description: 'Équipement de fitness',
        parentId: 'sports'
      },
      {
        id: 'outdoor',
        name: 'Plein air',
        slug: 'plein-air',
        description: 'Sports et activités outdoor',
        parentId: 'sports'
      },
      {
        id: 'cycling',
        name: 'Cyclisme',
        slug: 'cyclisme',
        description: 'Vélos et accessoires',
        parentId: 'sports'
      }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauté & Santé',
    slug: 'beaute-sante',
    description: 'Produits de beauté et bien-être',
    subcategories: [
      {
        id: 'skincare',
        name: 'Soin du visage',
        slug: 'soin-visage',
        description: 'Produits de soin pour le visage',
        parentId: 'beauty'
      },
      {
        id: 'haircare',
        name: 'Soin des cheveux',
        slug: 'soin-cheveux',
        description: 'Produits capillaires',
        parentId: 'beauty'
      },
      {
        id: 'makeup',
        name: 'Maquillage',
        slug: 'maquillage',
        description: 'Produits de maquillage',
        parentId: 'beauty'
      }
    ]
  }
];

const CategoryNav: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <nav className="w-64 bg-white dark:bg-gray-900 shadow-lg rounded-lg" role="navigation" aria-label="Navigation des catégories">
      <ul className="py-2">
        {categories.map(category => (
          <li key={category.id} className="relative">
            <div className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
              <button
                onClick={() => toggleCategory(category.id)}
                className="p-1 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-expanded={expandedCategories.includes(category.id)}
                aria-controls={`subcategories-${category.id}`}
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown size={16} aria-hidden="true" />
                ) : (
                  <ChevronRight size={16} aria-hidden="true" />
                )}
              </button>
              <Link
                to={`/categorie/${category.slug}`}
                className="flex-1 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                aria-label={`Voir tous les produits ${category.name}`}
              >
                {category.name}
              </Link>
            </div>
            {expandedCategories.includes(category.id) && (
              <ul
                id={`subcategories-${category.id}`}
                className="pl-8 py-1 bg-gray-50 dark:bg-gray-800/50"
                role="group"
                aria-label={`Sous-catégories de ${category.name}`}
              >
                {category.subcategories.map(subcategory => (
                  <li key={subcategory.id}>
                    <Link
                      to={`/categorie/${category.slug}/${subcategory.slug}`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      aria-label={`Voir les produits ${subcategory.name} dans ${category.name}`}
                    >
                      {subcategory.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNav;